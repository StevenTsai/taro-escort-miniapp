# 微信小程序支付封装：统一下单到 Promise 化的完整方案

> 本文详细介绍如何封装微信小程序支付流程，实现声明式 API 调用，支持 Promise 和回调两种方式。

## 前言

微信支付是小程序电商的核心功能，但原生 API 使用起来有诸多不便：

- 回调嵌套（Callback Hell）
- 错误处理不统一
- 支付状态管理混乱
- 订阅消息触发时机不明确

本文将分享一个经过生产验证的支付封装方案。

## 1. 微信支付流程概述

### 完整流程

```
用户点击支付
    ↓
后端创建订单 → 返回 outTradeNo
    ↓
后端统一下单 → 返回 payParams
    ↓
前端调起支付 → wx.requestPayment
    ↓
支付成功 → 后端回调通知
    ↓
前端更新状态 + 订阅消息
```

### 流程图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   用户点击   │ ──→ │  创建订单   │ ──→ │  统一下单   │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ↓
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  订阅消息   │ ←── │  支付成功   │ ←── │  调起支付   │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 2. 常见问题

### 原生写法的问题

```javascript
// ❌ 回调地狱
wx.request({
  url: '/api/orders/create',
  success: (res) => {
    const { outTradeNo } = res.data;
    wx.request({
      url: '/api/pay/unifiedOrder',
      data: { outTradeNo },
      success: (payRes) => {
        wx.requestPayment({
          ...payRes.data.payParams,
          success: () => {
            wx.showToast({ title: '支付成功' });
            // 更新订单状态...
            // 订阅消息...
          },
          fail: (err) => {
            if (err.errMsg === 'requestPayment:fail cancel') {
              wx.showToast({ title: '已取消' });
            } else {
              wx.showToast({ title: '支付失败' });
            }
          },
        });
      },
      fail: (err) => {
        wx.showToast({ title: '下单失败' });
      },
    });
  },
  fail: (err) => {
    wx.showToast({ title: '网络错误' });
  },
});
```

**问题总结：**

1. 嵌套层级深，代码难维护
2. 错误处理重复
3. 支付成功后的逻辑（订阅消息、状态更新）与支付流程耦合

## 3. 封装设计

### 设计目标

```
✅ Promise 化，支持 async/await
✅ 声明式 API，一行代码完成支付
✅ 统一错误处理
✅ 支付成功后自动订阅消息
✅ 支持回调和 Promise 两种方式
```

### API 设计

```javascript
// 方式 1：纯支付（已有订单号）
await requestPayment({ outTradeNo: 'xxx' });

// 方式 2：创建订单 + 支付一体化
await createOrderAndPay({ orderData: { ... } });

// 方式 3：商品订单支付
await createProductOrderAndPay({ orderData: { ... } });
```

## 4. 核心实现

### 4.1 基础支付函数

```javascript
// src/utils/payment.js
import Taro from '@tarojs/taro';
import { subscribeServiceBookingSuccess, subscribeOrderStatusUpdate } from '@/utils/subscribe';
import { post } from '@/utils/request';

/**
 * 统一支付函数
 * @param {object} options
 * @param {string} options.outTradeNo - 商户订单号
 * @param {Function} [options.onSuccess] - 支付成功回调
 * @param {Function} [options.onFail] - 支付失败回调
 * @param {Function} [options.onCancel] - 支付取消回调
 * @param {boolean} [options.subscribeAfterPay=true] - 支付成功后是否订阅消息
 * @returns {Promise}
 */
export const requestPayment = async (options = {}) => {
  const { outTradeNo, onSuccess, onFail, onCancel, subscribeAfterPay = true } = options;

  try {
    // 1. 调用后端统一下单接口
    const result = await post('/api/pay/productOrderPay', { outTradeNo });

    if (!result?.payParams) {
      const errorMsg = result?.msg || '预下单失败';
      if (onFail) onFail(new Error(errorMsg));
      return;
    }

    // 2. 调起微信支付
    Taro.requestPayment({
      timeStamp: result.payParams.timeStamp,
      nonceStr: result.payParams.nonceStr,
      package: result.payParams.packageValue,
      signType: result.payParams.signType,
      paySign: result.payParams.paySign,
      success: async () => {
        // 3. 支付成功后订阅消息
        if (subscribeAfterPay) {
          try {
            await subscribeServiceBookingSuccess();
            await subscribeOrderStatusUpdate();
          } catch (_e) {
            // 订阅失败不影响支付流程
          }
        }
        if (onSuccess) onSuccess(result);
      },
      fail: (res) => {
        // 区分取消和失败
        if (res.errMsg === 'requestPayment:fail cancel') {
          if (onCancel) onCancel(res);
        } else {
          if (onFail) onFail(res);
        }
      },
    });
  } catch (error) {
    if (onFail) onFail(error);
    throw error;
  }
};
```

**关键设计点：**

1. **统一入口** — 所有支付都走这个函数
2. **自动订阅** — 支付成功后自动触发订阅消息
3. **错误区分** — 区分"取消"和"失败"两种情况
4. **回调支持** — 支持 onSuccess/onFail/onCancel 回调

### 4.2 创建订单并支付

```javascript
/**
 * 创建订单并支付
 * @param {object} options
 * @param {object} options.orderData - 订单创建数据
 * @param {Function} [options.onSuccess] - 支付成功回调
 * @param {Function} [options.onFail] - 支付失败回调
 * @param {Function} [options.onCancel] - 支付取消回调
 * @returns {Promise}
 */
export const createOrderAndPay = async (options = {}) => {
  const { orderData, onSuccess, onFail, onCancel } = options;

  try {
    // 1. 创建订单
    const result = await post('/api/orders/create-order', orderData);

    if (result?.outTradeNo) {
      // 2. 调起支付
      await requestPayment({
        outTradeNo: result.outTradeNo,
        onSuccess,
        onFail,
        onCancel,
      });
    } else {
      const errorMsg = result?.msg || '下单失败';
      if (onFail) onFail(new Error(errorMsg));
    }
  } catch (error) {
    if (onFail) onFail(error);
    throw error;
  }
};
```

### 4.3 商品订单支付

```javascript
/**
 * 创建产品订单并支付（课程等）
 * @param {object} options
 * @param {object} options.orderData - 订单创建数据
 * @param {Function} [options.onSuccess] - 支付成功回调
 * @param {Function} [options.onFail] - 支付失败回调
 * @param {Function} [options.onCancel] - 支付取消回调
 * @returns {Promise}
 */
export const createProductOrderAndPay = async (options = {}) => {
  const { orderData, onSuccess, onFail, onCancel } = options;

  try {
    const result = await post('/api/orders/create-product-order', orderData);

    if (result?.outTradeNo) {
      await requestPayment({
        outTradeNo: result.outTradeNo,
        onSuccess,
        onFail,
        onCancel,
        subscribeAfterPay: false, // 商品订单不订阅服务消息
      });
    } else {
      const errorMsg = result?.msg || '下单失败';
      if (onFail) onFail(new Error(errorMsg));
    }
  } catch (error) {
    if (onFail) onFail(error);
    throw error;
  }
};
```

## 5. 使用示例

### 基础用法（async/await）

```jsx
import { createOrderAndPay } from '@/utils/payment';

const OrderPage = () => {
  const handlePay = async () => {
    try {
      await createOrderAndPay({
        orderData: {
          serviceId: 1,
          hospitalId: 100,
          date: '2024-01-15',
          time: '09:00',
        },
      });

      // 支付成功
      Taro.showToast({ title: '支付成功' });
      Taro.navigateTo({ url: '/pages/orderList/orderList' });
    } catch (error) {
      // 支付失败
      Taro.showToast({ title: error.message || '支付失败' });
    }
  };

  return <Button onClick={handlePay}>立即支付</Button>;
};
```

### 回调用法

```jsx
const handlePay = () => {
  createOrderAndPay({
    orderData: { ... },
    onSuccess: (result) => {
      Taro.showToast({ title: '支付成功' });
      Taro.navigateTo({ url: '/pages/orderList/orderList' });
    },
    onFail: (error) => {
      Taro.showToast({ title: error.message || '支付失败' });
    },
    onCancel: () => {
      Taro.showToast({ title: '已取消支付' });
    },
  });
};
```

### 处理取消和失败

```jsx
const handlePay = async () => {
  try {
    await requestPayment({
      outTradeNo: 'xxx',
      onCancel: () => {
        // 用户取消支付，不提示错误
        console.log('用户取消支付');
      },
    });
  } catch (error) {
    // 真正的支付失败
    Taro.showModal({
      title: '支付失败',
      content: error.message,
      showCancel: true,
      confirmText: '重试',
    });
  }
};
```

## 6. 错误处理最佳实践

### 错误类型分类

```javascript
const handlePayError = (error) => {
  const message = error.message || '';

  if (message.includes('cancel')) {
    // 用户取消，静默处理
    return;
  }

  if (message.includes('network')) {
    // 网络错误，提示重试
    Taro.showModal({
      title: '网络异常',
      content: '请检查网络后重试',
      confirmText: '重试',
    });
    return;
  }

  if (message.includes('余额不足')) {
    // 余额不足，引导充值
    Taro.showModal({
      title: '余额不足',
      content: '请更换支付方式或充值后重试',
    });
    return;
  }

  // 其他错误
  Taro.showToast({ title: error.message || '支付失败' });
};
```

### 订单状态同步

```javascript
const handlePaySuccess = async (result) => {
  // 1. 更新本地订单状态
  const orderList = Taro.getStorageSync('orderList') || [];
  const updatedList = orderList.map((order) => {
    if (order.outTradeNo === result.outTradeNo) {
      return { ...order, status: 'paid' };
    }
    return order;
  });
  Taro.setStorageSync('orderList', updatedList);

  // 2. 跳转到订单详情
  Taro.navigateTo({
    url: `/pages/orderDetail/orderDetail?id=${result.orderId}`,
  });
};
```

## 7. 订阅消息集成

支付成功后自动订阅消息：

```javascript
// src/utils/subscribe.js

// 模板 ID（从微信公众平台获取）
const TEMPLATE_IDS = {
  ORDER_STATUS_UPDATE: 'xxx',
  SERVICE_BOOKING_SUCCESS: 'xxx',
};

/**
 * 请求订阅消息权限
 */
export const requestSubscribeMessage = (tmplIds) => {
  if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    Taro.requestSubscribeMessage({
      tmplIds,
      success: resolve,
      fail: reject,
    });
  });
};

/**
 * 订阅服务预约成功消息
 */
export const subscribeServiceBookingSuccess = () => {
  return requestSubscribeMessage([TEMPLATE_IDS.SERVICE_BOOKING_SUCCESS]);
};

/**
 * 订阅订单状态更新消息
 */
export const subscribeOrderStatusUpdate = () => {
  return requestSubscribeMessage([TEMPLATE_IDS.ORDER_STATUS_UPDATE]);
};
```

## 8. 总结

本文介绍的支付封装方案解决了以下问题：

1. **Promise 化** — 支持 async/await，代码更清晰
2. **声明式 API** — 一行代码完成支付流程
3. **统一错误处理** — 区分取消和失败
4. **自动订阅消息** — 支付成功后自动触发
5. **灵活调用** — 支持回调和 Promise 两种方式

完整代码已开源，欢迎 Star 和贡献。

## 相关文章

- [小程序请求层最佳实践：拦截器、缓存、Token 管理](./02-request-layer-best-practices.md)
- [微信订阅消息完整封装：从申请模板到用户授权](./06-wechat-subscribe-message.md)

## 开源项目

完整代码已开源：[医疗陪诊小程序](https://github.com/StevenTsai/taro-escort-miniapp)

---

> 作者：Steven
> 原文链接：https://juejin.cn/post/xxx
