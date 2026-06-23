# 小程序请求层最佳实践：拦截器、缓存、Token 管理一次搞定

> 本文详细介绍如何设计一个完整的小程序请求层，包含请求拦截器、客户端缓存、Token 自动注入、文件上传等功能。

## 前言

在小程序开发中，`wx.request` 是最常用的 API。但直接使用它会遇到很多问题：

- Token 过期需要手动处理
- 重复请求浪费资源
- 没有客户端缓存机制
- 错误处理分散在各个调用处

本文将分享一个经过生产验证的请求层封装方案。

## 1. 痛点分析

### 原生 wx.request 的问题

```javascript
// ❌ 原生写法的问题
wx.request({
  url: 'https://api.example.com/users',
  header: {
    Authorization: wx.getStorageSync('token'), // 每次都要手动加
  },
  success: (res) => {
    if (res.statusCode === 401) {
      // 每个请求都要处理 401
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    if (res.statusCode !== 200) {
      // 每个请求都要处理错误
      wx.showToast({ title: '请求失败' });
      return;
    }
    // 处理数据...
  },
  fail: (err) => {
    // 每个请求都要处理网络错误
    wx.showToast({ title: '网络异常' });
  },
});
```

**问题总结：**

1. Token 注入重复代码
2. 错误处理分散
3. 无缓存机制
4. 回调地狱

## 2. 设计目标

```
✅ 统一的请求/响应拦截
✅ 自动 Token 注入和刷新
✅ 客户端缓存（减少不必要请求）
✅ 文件上传统一管理
✅ Promise 化，支持 async/await
✅ 类型安全（可选）
```

## 3. 核心实现

### 3.1 缓存管理器

首先实现一个基于 Storage 的缓存管理器：

```javascript
// src/utils/request.js

/**
 * 递归排序对象键，确保相同逻辑参数生成相同的缓存 key
 * 解决 {a:1, b:2} 和 {b:2, a:1} 生成不同 key 的问题
 */
const stableStringify = (obj) => {
  if (obj === null || obj === undefined) return '';
  if (typeof obj !== 'object') return String(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map((key) => `${JSON.stringify(key)}:${stableStringify(obj[key])}`);
  return `{${pairs.join(',')}}`;
};

// 缓存管理器
const cacheManager = {
  // 获取缓存
  get: (key) => {
    try {
      const cached = Taro.getStorageSync(`cache_${key}`);
      if (!cached) return null;

      const { data, timestamp, expireTime } = JSON.parse(cached);

      // 检查是否过期
      if (expireTime && Date.now() > timestamp + expireTime) {
        Taro.removeStorageSync(`cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get cache error:', error);
      return null;
    }
  },

  // 设置缓存（默认 5 分钟过期）
  set: (key, data, expireTime = 5 * 60 * 1000) => {
    try {
      Taro.setStorageSync(
        `cache_${key}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
          expireTime,
        })
      );
      return true;
    } catch (error) {
      console.error('Set cache error:', error);
      return false;
    }
  },

  // 删除缓存
  remove: (key) => {
    try {
      Taro.removeStorageSync(`cache_${key}`);
      return true;
    } catch (error) {
      console.error('Remove cache error:', error);
      return false;
    }
  },

  // 清除所有缓存
  clear: () => {
    try {
      const keys = Taro.getStorageInfoSync().keys;
      keys.forEach((key) => {
        if (key.startsWith('cache_')) {
          Taro.removeStorageSync(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Clear cache error:', error);
      return false;
    }
  },
};
```

**关键设计：**

1. **stableStringify** — 递归排序对象键，确保 `{a:1, b:2}` 和 `{b:2, a:1}` 生成相同的缓存 key
2. **TTL 过期机制** — 支持自定义过期时间，默认 5 分钟
3. **异常处理** — 缓存读写失败不影响正常请求

### 3.2 请求拦截器

Taro 支持拦截器机制，可以在请求发出前和响应返回后统一处理：

```javascript
// 请求拦截器 — 处理 HTTP 状态码和鉴权
const interceptor = function (chain) {
  const requestParams = chain.requestParams;
  const { header } = requestParams;

  // 获取本地存储的 token
  const token = Taro.getStorageSync('token');

  // 仅在 token 存在时添加 Authorization 头
  requestParams.header = {
    ...header,
    'x-biz': 'medical-chaperon',
    ...(token ? { Authorization: token } : {}),
  };

  return chain.proceed(requestParams).then((res) => {
    const { statusCode, data } = res;

    // HTTP 状态码 2xx 表示成功
    if (statusCode >= 200 && statusCode < 300) {
      return data; // 解包响应体
    }

    // Token 过期处理
    if (statusCode === 401) {
      Taro.removeStorageSync('token');
      Taro.removeStorageSync('userInfo');
      Taro.navigateTo({ url: '/pages/profile/profile' });
      return Promise.reject(new Error('token已过期'));
    }

    return Promise.reject(new Error(data?.message || '请求失败'));
  });
};

// 添加拦截器
Taro.addInterceptor(interceptor);
```

**拦截器职责：**

1. **请求前** — 自动注入 Token、业务标识
2. **响应后** — 统一处理 HTTP 状态码、解包响应体
3. **401 处理** — 清除过期 Token，跳转登录页

### 3.3 基础请求函数

```javascript
/**
 * 基础请求方法
 * 拦截器已处理 HTTP 状态码，此函数处理业务状态码
 */
const request = async (options) => {
  const { url, method, data, header = {}, onSuccess, onError } = options;

  try {
    // 拦截器返回 HTTP 响应体（已解包 res.data）
    const result = await Taro.request({
      url: `${baseUrl}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
    });

    // result 是 HTTP 响应体，结构通常为 { code, data, msg }
    const responseData = result.data;

    // 根据业务 code 判断成功失败
    if (result.code === 200) {
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(responseData);
      }
      return responseData;
    } else {
      // 业务失败
      if (onError && typeof onError === 'function') {
        onError(result);
      }
      return Promise.reject(new Error(result?.msg || result?.message || '业务处理失败'));
    }
  } catch (error) {
    // 拦截器已处理 HTTP 错误（401 等），此处处理网络异常
    if (onError && typeof onError === 'function') {
      onError({ code: -1, msg: error.message || '网络请求失败' });
    }
    throw error;
  }
};
```

### 3.4 带缓存的 GET 请求

```javascript
/**
 * GET 请求（支持缓存）
 * @param {string} url - 请求地址
 * @param {object} params - 查询参数
 * @param {object} callbacks - 回调函数
 * @param {object} cacheOptions - 缓存配置
 * @param {boolean} cacheOptions.useCache - 是否启用缓存
 * @param {number} cacheOptions.expireTime - 缓存过期时间（毫秒）
 * @param {string} cacheOptions.cacheKey - 自定义缓存 key
 */
export const get = async (url, params = {}, callbacks = {}, cacheOptions = {}) => {
  const { useCache = true, expireTime = 5 * 60 * 1000, cacheKey = null } = cacheOptions;

  // 生成稳定的缓存 key
  const key = cacheKey || `${url}_${stableStringify(params)}`;

  // 如果启用缓存，尝试从缓存获取数据
  if (useCache) {
    const cachedData = cacheManager.get(key);
    if (cachedData) {
      if (callbacks.onSuccess && typeof callbacks.onSuccess === 'function') {
        callbacks.onSuccess(cachedData);
      }
      return cachedData;
    }
  }

  // 缓存未命中或未启用缓存，发起请求
  const result = await request({
    url,
    method: 'GET',
    data: params,
    ...callbacks,
  });

  // 请求成功后缓存数据
  if (useCache && result) {
    cacheManager.set(key, result, expireTime);
  }

  return result;
};
```

**缓存策略：**

- 默认启用 5 分钟缓存
- 支持自定义缓存 key
- 支持禁用缓存（`useCache: false`）

### 3.5 其他请求方法

```javascript
// POST 请求
export const post = async (url, data = {}, callbacks = {}) => {
  return await request({
    url,
    method: 'POST',
    data,
    ...callbacks,
  });
};

// PUT 请求
export const put = async (url, data = {}, callbacks = {}) => {
  return await request({
    url,
    method: 'PUT',
    data,
    ...callbacks,
  });
};

// DELETE 请求
export const del = async (url, data = {}, callbacks = {}) => {
  return await request({
    url,
    method: 'DELETE',
    data,
    ...callbacks,
  });
};
```

### 3.6 文件上传

```javascript
/**
 * 文件上传
 * @param {string} url - 上传地址
 * @param {string} filePath - 文件路径
 * @param {object} formData - 额外表单数据
 */
export const upload = async (url, filePath, formData = {}) => {
  const token = Taro.getStorageSync('token');

  return await Taro.uploadFile({
    url: `${baseUrl}${url}`,
    filePath,
    name: 'file',
    formData,
    header: {
      'x-biz': 'medical-chaperon',
      ...(token ? { Authorization: token } : {}),
    },
  });
};
```

## 4. 使用示例

### 基础用法

```javascript
import { get, post } from '@/utils/request';

// GET 请求（带缓存）
const loadHospitals = async (cityId) => {
  const data = await get('/api/hospitals', { cityId });
  return data;
};

// POST 请求
const createOrder = async (orderData) => {
  const data = await post('/api/orders', orderData);
  return data;
};
```

### 带回调的用法

```javascript
const loadHospitals = async (cityId) => {
  await get(
    '/api/hospitals',
    { cityId },
    {
      onSuccess: (data) => {
        setHospitals(data);
      },
      onError: (error) => {
        Taro.showToast({ title: error.msg });
      },
    }
  );
};
```

### 自定义缓存配置

```javascript
// 禁用缓存
const loadData = async () => {
  const data = await get('/api/data', {}, {}, { useCache: false });
};

// 自定义缓存时间（10 分钟）
const loadCityList = async () => {
  const data = await get('/api/cities', {}, {}, { expireTime: 10 * 60 * 1000 });
};

// 自定义缓存 key
const loadUser = async (userId) => {
  const data = await get(`/api/users/${userId}`, {}, {}, { cacheKey: `user_${userId}` });
};
```

### 文件上传

```javascript
import { upload } from '@/utils/request';

const uploadAvatar = async (filePath) => {
  const result = await upload('/api/cos/upload', filePath, {
    type: 'avatar',
  });
  return result;
};
```

## 5. 设计思考

### 为什么不直接用 axios？

1. **小程序环境限制** — 小程序没有 XMLHttpRequest，axios 无法直接使用
2. **Taro 拦截器机制** — Taro 原生支持拦截器，无需额外依赖
3. **包体积** — axios 约 13KB，小程序需要轻量化

### 缓存策略的权衡

| 方案 | 优点 | 缺点 |
|------|------|------|
| 内存缓存 | 速度快 | 页面刷新丢失 |
| Storage 缓存 | 持久化 | 容量限制 10MB |
| 文件缓存 | 容量大 | 实现复杂 |

本方案选择 Storage 缓存，因为：
- 请求数据量小，不会撑爆 10MB
- 需要跨页面共享缓存
- 实现简单

### 可扩展性设计

```javascript
// 支持多个后端服务
const createRequest = (baseUrl) => {
  return {
    get: (url, params) => get(url, params, {}, { baseUrl }),
    post: (url, data) => post(url, data, {}, { baseUrl }),
  };
};

const api = createRequest('https://api.example.com');
const adminApi = createRequest('https://admin.example.com');
```

## 6. 总结

本文介绍的请求层方案解决了小程序开发中的常见痛点：

1. **拦截器** — 统一处理 Token 注入、错误处理
2. **缓存机制** — 减少重复请求，提升用户体验
3. **Promise 化** — 支持 async/await，告别回调地狱
4. **文件上传** — 统一的上传接口

完整代码已开源，欢迎 Star 和贡献。

## 相关文章

- [Taro 4 + React 18 实战：从零搭建医疗陪诊小程序](./01-taro-react18-medical-miniapp.md)
- [微信小程序支付封装：统一下单到 Promise 化](./03-wechat-payment-encapsulation.md)

## 开源项目

完整代码已开源：[医疗陪诊小程序](https://github.com/StevenTsai/taro-escort-miniapp)

---

> 作者：Steven
> 原文链接：https://juejin.cn/post/xxx
