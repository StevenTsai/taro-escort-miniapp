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
    const result = await post('/api/pay/productOrderPay', { outTradeNo });

    if (!result?.payParams) {
      const errorMsg = result?.msg || '预下单失败';
      if (onFail) onFail(new Error(errorMsg));
      return;
    }

    Taro.requestPayment({
      timeStamp: result.payParams.timeStamp,
      nonceStr: result.payParams.nonceStr,
      package: result.payParams.packageValue,
      signType: result.payParams.signType,
      paySign: result.payParams.paySign,
      success: async () => {
        // 支付成功后订阅消息
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
      fail: res => {
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
    const result = await post('/api/orders/create-order', orderData);

    if (result?.outTradeNo) {
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
        subscribeAfterPay: false,
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
