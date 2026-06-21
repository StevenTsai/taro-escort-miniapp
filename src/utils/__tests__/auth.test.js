import Taro from '@tarojs/taro';

import { clearLoginInfo, getToken, getUserInfo, isLoggedIn, setLoginInfo } from '../auth';

// Mock Taro
jest.mock('@tarojs/taro');

describe('auth utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isLoggedIn', () => {
    it('should return true when token and userInfo exist', () => {
      Taro.getStorageSync.mockImplementation(key => {
        if (key === 'token') return 'test-token';
        if (key === 'userInfo') return { name: 'test' };
        return null;
      });
      expect(isLoggedIn()).toBe(true);
    });

    it('should return false when token is missing', () => {
      Taro.getStorageSync.mockImplementation(key => {
        if (key === 'token') return '';
        if (key === 'userInfo') return { name: 'test' };
        return null;
      });
      expect(isLoggedIn()).toBe(false);
    });

    it('should return false when userInfo is missing', () => {
      Taro.getStorageSync.mockImplementation(key => {
        if (key === 'token') return 'test-token';
        if (key === 'userInfo') return null;
        return null;
      });
      expect(isLoggedIn()).toBe(false);
    });

    it('should return false when both are missing', () => {
      Taro.getStorageSync.mockReturnValue(null);
      expect(isLoggedIn()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from storage', () => {
      Taro.getStorageSync.mockReturnValue('my-token');
      expect(getToken()).toBe('my-token');
    });

    it('should return empty string when no token', () => {
      Taro.getStorageSync.mockReturnValue(null);
      expect(getToken()).toBe('');
    });
  });

  describe('getUserInfo', () => {
    it('should parse and return user info', () => {
      const userInfo = { name: 'test', avatar: 'url' };
      Taro.getStorageSync.mockReturnValue(JSON.stringify(userInfo));
      expect(getUserInfo()).toEqual(userInfo);
    });

    it('should return null when no user info', () => {
      Taro.getStorageSync.mockReturnValue(null);
      expect(getUserInfo()).toBeNull();
    });

    it('should return null when JSON is corrupted', () => {
      Taro.getStorageSync.mockReturnValue('invalid-json{');
      expect(getUserInfo()).toBeNull();
    });
  });

  describe('setLoginInfo', () => {
    it('should store token and userInfo', () => {
      const userInfo = { name: 'test' };
      setLoginInfo('my-token', userInfo);

      expect(Taro.setStorageSync).toHaveBeenCalledWith('token', 'my-token');
      expect(Taro.setStorageSync).toHaveBeenCalledWith('userInfo', JSON.stringify(userInfo));
    });
  });

  describe('clearLoginInfo', () => {
    it('should remove auth-related keys', () => {
      clearLoginInfo();

      // Should call removeStorageSync for each auth key
      expect(Taro.removeStorageSync).toHaveBeenCalled();
      // Should NOT call clearStorageSync (the old behavior)
      expect(Taro.clearStorageSync).not.toHaveBeenCalled();
    });
  });
});
