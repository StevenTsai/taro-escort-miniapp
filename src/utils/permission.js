import Taro from '@tarojs/taro';

import useAuthStore from '../store/useAuthStore';

import { isLoggedIn } from './auth';

// 检查用户是否登录
export const checkLogin = () => {
  const { checkAuth } = useAuthStore.getState();
  return checkAuth();
};

// 显示登录提示
export const showLoginTip = () => {
  Taro.showModal({
    title: '登录提示',
    content: '请先登录后再操作',
    confirmText: '立即登录',
    cancelText: '稍后再说',
    success: res => {
      if (res.confirm) {
        Taro.switchTab({
          url: '/pages/profile/profile',
        });
      }
    },
  });
};
