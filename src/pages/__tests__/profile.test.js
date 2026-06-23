/**
 * Tests for profile page business logic
 * Tests pure functions and auth flow logic extracted from profile.jsx
 */

// ===== Mock setup =====

const mockTaro = {
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  switchTab: jest.fn(),
  navigateTo: jest.fn(),
  showModal: jest.fn(),
  showToast: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  login: jest.fn(),
  getSetting: jest.fn(),
  requestSubscribeMessage: jest.fn(),
  downloadFile: jest.fn(),
  openDocument: jest.fn(),
  showToast: jest.fn(),
  useShareAppMessage: jest.fn(),
  useShareTimeline: jest.fn(),
  getCurrentInstance: jest.fn(() => ({ page: { route: 'pages/profile/profile' } })),
  ENV_TYPE: { WEAPP: 'WEAPP', WEB: 'WEB' },
  getEnv: jest.fn().mockReturnValue('WEAPP'),
};

jest.mock('@tarojs/taro', () => mockTaro);

// ===== Pure functions extracted from profile page =====

/** 检查手机号授权结果 */
const handlePhoneNumberResult = (errMsg) => {
  if (errMsg === 'getPhoneNumber:ok') {
    return { action: 'proceed' };
  } else if (errMsg === 'getPhoneNumber:fail user deny') {
    return { action: 'show_error', message: '用户拒绝授权' };
  } else {
    return { action: 'show_error', message: '获取手机号失败' };
  }
};

/** 构建订阅模板 ID 列表 */
const getSubscribeTemplateIds = (role) => {
  if (role !== 2) {
    return [
      'your-template-id-booking-success',
      'your-template-id-user-notify',
    ];
  }
  return [
    'your-template-id-booking-success',
    'your-template-id-chaperon-notify',
    'your-template-id-service-reminder',
  ];
};

/** 根据角色决定显示的菜单项 */
const getMenuItems = (role, isLoggedIn) => {
  const items = [];

  if (role === 2) {
    items.push('我的陪诊', '我的收入', '编辑资料');
  } else {
    items.push('我的订单');
  }

  items.push('使用说明');

  if (isLoggedIn) {
    items.push('订阅服务进度', '退出登录');
  }

  return items;
};

/** 判断是否显示注册按钮 */
const shouldShowRegisterBtn = (isLoggedIn, role) => {
  return isLoggedIn && role !== 2;
};

// ===== Tests =====

describe('profile page logic', () => {
  describe('handlePhoneNumberResult', () => {
    it('should proceed when user grants phone number', () => {
      const result = handlePhoneNumberResult('getPhoneNumber:ok');
      expect(result.action).toBe('proceed');
    });

    it('should show error when user denies', () => {
      const result = handlePhoneNumberResult('getPhoneNumber:fail user deny');
      expect(result.action).toBe('show_error');
      expect(result.message).toBe('用户拒绝授权');
    });

    it('should show generic error for other failures', () => {
      const result = handlePhoneNumberResult('getPhoneNumber:fail system error');
      expect(result.action).toBe('show_error');
      expect(result.message).toBe('获取手机号失败');
    });
  });

  describe('getSubscribeTemplateIds', () => {
    it('should return 2 templates for regular user (role !== 2)', () => {
      const ids = getSubscribeTemplateIds(1);
      expect(ids).toHaveLength(2);
      expect(ids).toContain('your-template-id-booking-success');
      expect(ids).toContain('your-template-id-user-notify');
    });

    it('should return 3 templates for chaperon (role === 2)', () => {
      const ids = getSubscribeTemplateIds(2);
      expect(ids).toHaveLength(3);
      expect(ids).toContain('your-template-id-booking-success');
      expect(ids).toContain('your-template-id-chaperon-notify');
      expect(ids).toContain('your-template-id-service-reminder');
    });

    it('should return 2 templates for undefined role', () => {
      const ids = getSubscribeTemplateIds(undefined);
      expect(ids).toHaveLength(2);
    });
  });

  describe('getMenuItems', () => {
    it('should show order menu for regular user', () => {
      const items = getMenuItems(1, false);
      expect(items).toContain('我的订单');
      expect(items).not.toContain('我的陪诊');
      expect(items).not.toContain('我的收入');
      expect(items).not.toContain('编辑资料');
    });

    it('should show chaperon menu for chaperon', () => {
      const items = getMenuItems(2, false);
      expect(items).toContain('我的陪诊');
      expect(items).toContain('我的收入');
      expect(items).toContain('编辑资料');
      expect(items).not.toContain('我的订单');
    });

    it('should include login-required items when logged in', () => {
      const items = getMenuItems(1, true);
      expect(items).toContain('订阅服务进度');
      expect(items).toContain('退出登录');
    });

    it('should exclude login-required items when not logged in', () => {
      const items = getMenuItems(1, false);
      expect(items).not.toContain('订阅服务进度');
      expect(items).not.toContain('退出登录');
    });

    it('always includes usage guide', () => {
      expect(getMenuItems(1, false)).toContain('使用说明');
      expect(getMenuItems(2, true)).toContain('使用说明');
    });
  });

  describe('shouldShowRegisterBtn', () => {
    it('should show register btn for logged-in non-chaperon', () => {
      expect(shouldShowRegisterBtn(true, 1)).toBe(true);
    });

    it('should not show register btn for chaperon', () => {
      expect(shouldShowRegisterBtn(true, 2)).toBe(false);
    });

    it('should not show register btn when not logged in', () => {
      expect(shouldShowRegisterBtn(false, 1)).toBe(false);
      expect(shouldShowRegisterBtn(false, 2)).toBe(false);
    });
  });
});
