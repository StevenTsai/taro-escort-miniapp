/**
 * Tests for permission utility
 */

const mockTaro = {
  showModal: jest.fn(),
  switchTab: jest.fn(),
  getStorageSync: jest.fn(),
};

const mockCheckAuth = jest.fn();

jest.mock('@tarojs/taro', () => mockTaro);

jest.mock('@/store/useAuthStore', () => ({
  getState: jest.fn(() => ({
    checkAuth: mockCheckAuth,
  })),
}));

const { checkLogin, showLoginTip } = require('../permission');

describe('permission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkLogin', () => {
    it('should return true when checkAuth returns true', () => {
      mockCheckAuth.mockReturnValue(true);
      const result = checkLogin();
      expect(result).toBe(true);
    });

    it('should return false when checkAuth returns false', () => {
      mockCheckAuth.mockReturnValue(false);
      const result = checkLogin();
      expect(result).toBe(false);
    });

    it('should call checkAuth from useAuthStore', () => {
      checkLogin();
      expect(mockCheckAuth).toHaveBeenCalled();
    });
  });

  describe('showLoginTip', () => {
    it('should show modal with login prompt', () => {
      showLoginTip();
      expect(mockTaro.showModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '登录提示',
          content: '请先登录后再操作',
          confirmText: '立即登录',
          cancelText: '稍后再说',
        })
      );
    });

    it('should navigate to profile when user confirms', () => {
      mockTaro.showModal.mockImplementation(opts => {
        opts.success({ confirm: true });
      });
      showLoginTip();
      expect(mockTaro.switchTab).toHaveBeenCalledWith({
        url: '/pages/profile/profile',
      });
    });

    it('should not navigate when user cancels', () => {
      mockTaro.showModal.mockImplementation(opts => {
        opts.success({ confirm: false });
      });
      showLoginTip();
      expect(mockTaro.switchTab).not.toHaveBeenCalled();
    });
  });
});
