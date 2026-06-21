import Taro from '@tarojs/taro';

const baseUrl = process.env.TARO_APP_API;

/**
 * 递归排序对象键，确保相同逻辑参数生成相同的缓存 key
 * @param {any} obj
 * @returns {string}
 */
const stableStringify = obj => {
  if (obj === null || obj === undefined) return '';
  if (typeof obj !== 'object') return String(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => `${JSON.stringify(key)}:${stableStringify(obj[key])}`);
  return `{${pairs.join(',')}}`;
};

// 缓存管理器
const cacheManager = {
  // 获取缓存
  get: key => {
    try {
      const cached = Taro.getStorageSync(`cache_${key}`);
      if (!cached) return null;

      let parsed;
      try {
        parsed = JSON.parse(cached);
      } catch (_e) {
        Taro.removeStorageSync(`cache_${key}`);
        return null;
      }

      const { data, timestamp, expireTime } = parsed;
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

  // 设置缓存
  set: (key, data, expireTime = 5 * 60 * 1000) => {
    // 默认缓存5分钟
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
  remove: key => {
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
      keys.forEach(key => {
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

// 请求拦截器 — 处理 HTTP 状态码和鉴权
const interceptor = function (chain) {
  const requestParams = chain.requestParams;
  const { header } = requestParams;

  // 获取本地存储的token
  const token = Taro.getStorageSync('token');

  // 仅在 token 存在时添加 Authorization 头
  requestParams.header = {
    ...header,
    'x-biz': 'medical-chaperon',
    ...(token ? { Authorization: token } : {}),
  };

  return chain.proceed(requestParams).then(res => {
    const { statusCode, data } = res;

    if (statusCode >= 200 && statusCode < 300) {
      return data;
    }

    // token过期处理
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

/**
 * 基础请求方法
 * 拦截器已处理 HTTP 状态码，此函数处理业务状态码
 */
const request = async options => {
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
    // 拦截器已处理 HTTP 错误（401 等），此处处理网络异常和业务错误
    if (onError && typeof onError === 'function') {
      onError({ code: -1, msg: error.message || '网络请求失败' });
    }
    throw error;
  }
};

// GET请求
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

  // 请求成功后缓存数据（request 成功返回即表示业务成功）
  if (useCache && result) {
    cacheManager.set(key, result, expireTime);
  }

  return result;
};

// POST请求
export const post = async (url, data = {}, callbacks = {}) => {
  return await request({
    url,
    method: 'POST',
    data,
    ...callbacks,
  });
};

// DELETE请求
export const del = async (url, data = {}, callbacks = {}) => {
  return await request({
    url,
    method: 'DELETE',
    data,
    ...callbacks,
  });
};

// PUT请求
export const put = async (url, data = {}, callbacks = {}) => {
  return await request({
    url,
    method: 'PUT',
    data,
    ...callbacks,
  });
};

// 文件上传
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

export default {
  get,
  post,
  del,
  put,
  upload,
};
