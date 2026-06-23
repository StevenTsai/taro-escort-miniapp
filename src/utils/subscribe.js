import Taro from '@tarojs/taro';

/**
 * 微信小程序订阅消息工具类
 */

// 模板ID — 请替换为你自己的微信订阅消息模板 ID
const TEMPLATE_IDS = {
  // 订单状态变更通知
  ORDER_STATUS_UPDATE: 'your-template-id-order-status',
  // 服务完成通知
  SERVICE_COMPLETE: 'your-template-id-service-complete',
  // 服务即将开始提醒
  SERVICE_REMINDER: 'your-template-id-service-reminder',
  // 服务预约成功通知
  SERVICE_BOOKING_SUCCESS: 'your-template-id-booking-success',
};

/**
 * 请求订阅消息权限
 * @param {Array} tmplIds - 需要订阅的消息模板ID数组
 * @returns {Promise} 订阅结果Promise
 */
export const requestSubscribeMessage = tmplIds => {
  // 检查是否在微信小程序环境
  if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
    console.warn('订阅消息功能仅在微信小程序环境下可用');
    return Promise.resolve({ errMsg: 'not in weapp environment' });
  }

  // 检查tmplIds参数
  if (!Array.isArray(tmplIds) || tmplIds.length === 0) {
    return Promise.reject(new Error('tmplIds must be a non-empty array'));
  }

  // 限制一次最多订阅3个模板消息
  if (tmplIds.length > 3) {
    console.warn('一次最多只能订阅3个模板消息，已自动截取前3个');
    tmplIds = tmplIds.slice(0, 3);
  }

  return new Promise((resolve, reject) => {
    Taro.requestSubscribeMessage({
      tmplIds,
      success: res => {
        resolve(res);
      },
      fail: err => {
        console.error('订阅消息授权失败', err);
        reject(err);
      },
    });
  });
};

/**
 * 请求订阅订单状态更新消息
 * @returns {Promise} 订阅结果Promise
 */
export const subscribeOrderStatusUpdate = () => {
  return requestSubscribeMessage([TEMPLATE_IDS.ORDER_STATUS_UPDATE]);
};

/**
 * 请求订阅服务预约成功消息
 * @returns {Promise} 订阅结果Promise
 */
export const subscribeServiceBookingSuccess = () => {
  return requestSubscribeMessage([TEMPLATE_IDS.SERVICE_BOOKING_SUCCESS]);
};

/**
 * 请求订阅服务提醒消息
 * @returns {Promise} 订阅结果Promise
 */
export const subscribeServiceReminder = () => {
  return requestSubscribeMessage([TEMPLATE_IDS.SERVICE_REMINDER]);
};

/**
 * 批量订阅常用消息
 * @returns {Promise} 订阅结果Promise
 */
export const subscribeCommonMessages = () => {
  return requestSubscribeMessage([
    TEMPLATE_IDS.ORDER_STATUS_UPDATE,
    TEMPLATE_IDS.SERVICE_COMPLETE,
    TEMPLATE_IDS.SERVICE_REMINDER,
  ]);
};

/**
 * 检查用户订阅设置
 * @returns {Promise} 用户订阅设置Promise
 */
export const checkSubscribeSetting = () => {
  // 检查是否在微信小程序环境
  if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
    return Promise.resolve({ errMsg: 'not in weapp environment' });
  }

  return new Promise((resolve, reject) => {
    Taro.getSetting({
      withSubscriptions: true,
      success: res => {
        resolve(res);
      },
      fail: err => {
        console.error('获取订阅设置失败', err);
        reject(err);
      },
    });
  });
};

export default {
  TEMPLATE_IDS,
  requestSubscribeMessage,
  subscribeOrderStatusUpdate,
  subscribeServiceBookingSuccess,
  subscribeServiceReminder,
  subscribeCommonMessages,
  checkSubscribeSetting,
};
