import Taro from '@tarojs/taro';
import type { ComponentType } from 'react';

/** 鉴权相关的存储 key */
export const AUTH_KEYS: readonly string[] = [
  'token',
  'userInfo',
  'cached_avatar',
  'cached_avatar_timestamp',
  'user_avatar',
  'user_avatar_timestamp',
] as const;

/**
 * 检查是否已登录
 * @returns 是否已登录
 */
export const isLoggedIn = (): boolean => {
  const token = Taro.getStorageSync('token');
  const userInfo = Taro.getStorageSync('userInfo');
  return !!(token && userInfo);
};

/**
 * 获取用户token
 * @returns token 字符串，未登录时返回空字符串
 */
export const getToken = (): string => {
  return Taro.getStorageSync('token') || '';
};

/**
 * 获取用户信息
 * @returns 用户信息对象，未登录或解析失败时返回 null
 */
export const getUserInfo = (): Record<string, any> | null => {
  try {
    const userInfo = Taro.getStorageSync('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (_error) {
    return null;
  }
};

/**
 * 设置用户登录信息
 * @param token - 用户 token
 * @param userInfo - 用户信息对象
 */
export const setLoginInfo = (token: string, userInfo: Record<string, any>): void => {
  if (typeof token !== 'string' || token.trim() === '') {
    throw new Error('setLoginInfo: token must be a non-empty string');
  }
  if (!userInfo || typeof userInfo !== 'object' || Array.isArray(userInfo)) {
    throw new Error('setLoginInfo: userInfo must be a non-null object');
  }
  Taro.setStorageSync('token', token);
  Taro.setStorageSync('userInfo', JSON.stringify(userInfo));
};

/**
 * 清除登录信息（仅清除鉴权相关 key，不影响城市偏好等其他数据）
 */
export const clearLoginInfo = (): void => {
  AUTH_KEYS.forEach((key) => {
    try {
      Taro.removeStorageSync(key);
    } catch (_e) {
      // ignore
    }
  });
};

/**
 * 跳转到登录页面
 */
export const redirectToLogin = (): void => {
  const currentPage = Taro.getCurrentPages().pop();
  const currentRoute: string = currentPage ? `/${currentPage.route}` : '/pages/index/index';

  Taro.switchTab({
    url: `/pages/profile/profile?redirect=${encodeURIComponent(currentRoute)}`,
  });
};

/**
 * 需要登录的页面装饰器
 * @param pageComponent - 页面组件
 * @returns 包装后的页面组件
 */
export const withAuth = (pageComponent: ComponentType<any>): ComponentType<any> => {
  return function AuthWrappedPage(props: any) {
    const checkAuthOnMount = (): boolean => {
      if (!isLoggedIn()) {
        redirectToLogin();
        return false;
      }
      return true;
    };

    // 在组件挂载时检查登录状态
    if (typeof window !== 'undefined') {
      setTimeout(checkAuthOnMount, 0);
    }

    return pageComponent(props);
  };
};
