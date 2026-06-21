import Taro from '@tarojs/taro';

import { create } from 'zustand';

import { getCachedImage } from '@/utils/imageUtils';

// 鉴权相关的存储 key
const AUTH_KEYS = ['token', 'userInfo', 'cached_avatar', 'cached_avatar_timestamp', 'user_avatar', 'user_avatar_timestamp'];

const useAuthStore = create((set, get) => ({
  // 状态
  token: Taro.getStorageSync('token') || '',
  userInfo: Taro.getStorageSync('userInfo') || null,

  // 初始化登录状态
  initAuth: () => {
    const token = Taro.getStorageSync('token');
    let userInfo = Taro.getStorageSync('userInfo');

    // 如果用户信息存在且有头像，检查是否有缓存的base64头像
    if (userInfo && userInfo.avatar) {
      const cachedAvatar = getCachedImage('user_avatar');
      if (cachedAvatar) {
        userInfo.avatar = cachedAvatar;
        // 更新storage中的用户信息
        Taro.setStorageSync('userInfo', userInfo);
      }
    }

    set({
      token,
      userInfo,
    });
  },

  // 设置token
  setToken: token => {
    Taro.setStorageSync('token', token);
    set({ token });
  },

  // 设置用户信息
  setUserInfo: userInfo => {
    Taro.setStorageSync('userInfo', userInfo);
    set({ userInfo });
  },

  // 登出 — 仅清除鉴权相关 key，不影响城市偏好等其他数据
  logout: () => {
    AUTH_KEYS.forEach(key => {
      try {
        Taro.removeStorageSync(key);
      } catch (_e) {
        // ignore
      }
    });
    set({
      token: '',
      userInfo: null,
    });
  },

  // 检查是否需要登录
  checkAuth: () => {
    const { token, userInfo } = get();
    if (!token || !userInfo) {
      Taro.switchTab({ url: '/pages/profile/profile' });
      return false;
    }
    return true;
  },
}));

// 派生 isLoggedIn — 始终从 token 和 userInfo 计算，避免状态不一致
export const useIsLoggedIn = () => {
  const token = useAuthStore(s => s.token);
  const userInfo = useAuthStore(s => s.userInfo);
  return !!(token && userInfo);
};

export default useAuthStore;
