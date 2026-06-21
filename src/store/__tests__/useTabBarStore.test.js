// Mock Taro for consistency with other store tests
const mockTaro = {
  getStorageSync: jest.fn().mockReturnValue(null),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
};

jest.mock('@tarojs/taro', () => mockTaro);

describe('useTabBarStore', () => {
  let useTabBarStore;

  beforeEach(() => {
    mockTaro.getStorageSync.mockClear();
    mockTaro.setStorageSync.mockClear();
    mockTaro.removeStorageSync.mockClear();
    mockTaro.getStorageSync.mockReturnValue(null);

    // Reset the module so zustand store re-initializes with clean state
    jest.isolateModules(() => {
      useTabBarStore = require('../useTabBarStore').default;
    });
  });

  describe('initial state', () => {
    it('should have selectedIndex set to 0', () => {
      const state = useTabBarStore.getState();
      expect(state.selectedIndex).toBe(0);
    });
  });

  describe('setSelectedIndex', () => {
    it('should update selectedIndex', () => {
      useTabBarStore.getState().setSelectedIndex(2);
      expect(useTabBarStore.getState().selectedIndex).toBe(2);
    });

    it('should update selectedIndex to 0 when set to 0', () => {
      useTabBarStore.getState().setSelectedIndex(3);
      expect(useTabBarStore.getState().selectedIndex).toBe(3);

      useTabBarStore.getState().setSelectedIndex(0);
      expect(useTabBarStore.getState().selectedIndex).toBe(0);
    });

    it('should handle multiple updates', () => {
      useTabBarStore.getState().setSelectedIndex(1);
      expect(useTabBarStore.getState().selectedIndex).toBe(1);

      useTabBarStore.getState().setSelectedIndex(4);
      expect(useTabBarStore.getState().selectedIndex).toBe(4);

      useTabBarStore.getState().setSelectedIndex(2);
      expect(useTabBarStore.getState().selectedIndex).toBe(2);
    });
  });
});
