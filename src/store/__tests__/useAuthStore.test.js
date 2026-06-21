// Mock Taro before importing the store (store reads storage at import time)
const mockTaro = {
  getStorageSync: jest.fn().mockReturnValue(null),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  switchTab: jest.fn(),
};

jest.mock('@tarojs/taro', () => mockTaro);

// Mock imageUtils to avoid side effects
jest.mock('@/utils/imageUtils', () => ({
  getCachedImage: jest.fn().mockReturnValue(null),
}));

describe('useAuthStore', () => {
  let useAuthStore;

  beforeEach(() => {
    // Clear all mock call history but keep implementations
    mockTaro.getStorageSync.mockClear();
    mockTaro.setStorageSync.mockClear();
    mockTaro.removeStorageSync.mockClear();
    mockTaro.switchTab.mockClear();
    mockTaro.getStorageSync.mockReturnValue(null);

    // Reset the module so zustand store re-initializes with clean state
    jest.isolateModules(() => {
      useAuthStore = require('../useAuthStore').default;
    });
  });

  describe('initAuth', () => {
    it('should read token and userInfo from storage and set state', () => {
      const mockToken = 'test-token-123';
      const mockUserInfo = { name: 'John', avatar: 'avatar.png' };

      mockTaro.getStorageSync.mockImplementation((key) => {
        if (key === 'token') return mockToken;
        if (key === 'userInfo') return mockUserInfo;
        return null;
      });

      // Re-require store so it picks up the new mockImplementation
      jest.isolateModules(() => {
        useAuthStore = require('../useAuthStore').default;
      });

      const state = useAuthStore.getState();
      expect(state.token).toBe(mockToken);
      expect(state.userInfo).toEqual(mockUserInfo);
    });

    it('should handle empty storage gracefully', () => {
      mockTaro.getStorageSync.mockReturnValue(null);

      jest.isolateModules(() => {
        useAuthStore = require('../useAuthStore').default;
      });

      const state = useAuthStore.getState();
      expect(state.token).toBe('');
      expect(state.userInfo).toBeNull();
    });

    it('should call initAuth to reload from storage', () => {
      // First load with nothing
      const state = useAuthStore.getState();
      expect(state.token).toBe('');

      // Now mock storage returning a token
      mockTaro.getStorageSync.mockImplementation((key) => {
        if (key === 'token') return 'reloaded-token';
        if (key === 'userInfo') return { name: 'Reloaded' };
        return null;
      });

      state.initAuth();

      const updated = useAuthStore.getState();
      expect(updated.token).toBe('reloaded-token');
      expect(updated.userInfo).toEqual({ name: 'Reloaded' });
    });
  });

  describe('setToken', () => {
    it('should set token in storage and state', () => {
      const newToken = 'new-token-456';

      useAuthStore.getState().setToken(newToken);

      expect(mockTaro.setStorageSync).toHaveBeenCalledWith('token', newToken);
      expect(useAuthStore.getState().token).toBe(newToken);
    });
  });

  describe('setUserInfo', () => {
    it('should set userInfo in storage and state', () => {
      const newUserInfo = { name: 'Jane', avatar: 'jane.png' };

      useAuthStore.getState().setUserInfo(newUserInfo);

      expect(mockTaro.setStorageSync).toHaveBeenCalledWith('userInfo', newUserInfo);
      expect(useAuthStore.getState().userInfo).toEqual(newUserInfo);
    });
  });

  describe('logout', () => {
    it('should clear all auth keys and reset state', () => {
      // First set some values
      useAuthStore.getState().setToken('some-token');
      useAuthStore.getState().setUserInfo({ name: 'test' });

      // Then logout
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.token).toBe('');
      expect(state.userInfo).toBeNull();

      // Should have removed each auth key
      const expectedKeys = [
        'token',
        'userInfo',
        'cached_avatar',
        'cached_avatar_timestamp',
        'user_avatar',
        'user_avatar_timestamp',
      ];
      expectedKeys.forEach((key) => {
        expect(mockTaro.removeStorageSync).toHaveBeenCalledWith(key);
      });
    });
  });

  describe('checkAuth', () => {
    it('should return true when token and userInfo exist', () => {
      useAuthStore.getState().setToken('valid-token');
      useAuthStore.getState().setUserInfo({ name: 'test' });

      const result = useAuthStore.getState().checkAuth();

      expect(result).toBe(true);
      expect(mockTaro.switchTab).not.toHaveBeenCalled();
    });

    it('should return false and redirect when token is missing', () => {
      useAuthStore.setState({ token: '', userInfo: null });

      const result = useAuthStore.getState().checkAuth();

      expect(result).toBe(false);
      expect(mockTaro.switchTab).toHaveBeenCalledWith({ url: '/pages/profile/profile' });
    });

    it('should return false and redirect when userInfo is missing', () => {
      useAuthStore.setState({ token: 'some-token', userInfo: null });

      const result = useAuthStore.getState().checkAuth();

      expect(result).toBe(false);
      expect(mockTaro.switchTab).toHaveBeenCalledWith({ url: '/pages/profile/profile' });
    });
  });
});
