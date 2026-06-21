// Mock Taro before importing the store (store reads storage at import time)
const mockTaro = {
  getStorageSync: jest.fn().mockReturnValue(null),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
};

jest.mock('@tarojs/taro', () => mockTaro);

describe('useCityStore', () => {
  let useCityStore;

  beforeEach(() => {
    // Clear all mock call history but keep implementations
    mockTaro.getStorageSync.mockClear();
    mockTaro.setStorageSync.mockClear();
    mockTaro.removeStorageSync.mockClear();
    mockTaro.getStorageSync.mockReturnValue(null);

    // Reset the module so zustand store re-initializes with clean state
    jest.isolateModules(() => {
      useCityStore = require('../useCityStore').default;
    });
  });

  describe('initCity', () => {
    it('should read selectedCity and selectedCityName from storage', () => {
      mockTaro.getStorageSync.mockImplementation((key) => {
        if (key === 'selectedCity') return 'bj';
        if (key === 'selectedCityName') return 'Beijing';
        return null;
      });

      // Re-require store so it picks up the new mockImplementation at init
      jest.isolateModules(() => {
        useCityStore = require('../useCityStore').default;
      });

      const state = useCityStore.getState();
      expect(state.selectedCity).toBe('bj');
      expect(state.selectedCityName).toBe('Beijing');
    });

    it('should default to empty strings when storage is empty', () => {
      mockTaro.getStorageSync.mockReturnValue(null);

      jest.isolateModules(() => {
        useCityStore = require('../useCityStore').default;
      });

      const state = useCityStore.getState();
      expect(state.selectedCity).toBe('');
      expect(state.selectedCityName).toBe('');
    });

    it('should reload from storage when initCity is called', () => {
      // Initially empty
      const state = useCityStore.getState();
      expect(state.selectedCity).toBe('');

      // Mock storage now returning values
      mockTaro.getStorageSync.mockImplementation((key) => {
        if (key === 'selectedCity') return 'gz';
        if (key === 'selectedCityName') return 'Guangzhou';
        return null;
      });

      state.initCity();

      const updated = useCityStore.getState();
      expect(updated.selectedCity).toBe('gz');
      expect(updated.selectedCityName).toBe('Guangzhou');
    });
  });

  describe('setSelectedCity', () => {
    it('should set city code and name in storage and state', () => {
      useCityStore.getState().setSelectedCity('sh', 'Shanghai');

      expect(mockTaro.setStorageSync).toHaveBeenCalledWith('selectedCity', 'sh');
      expect(mockTaro.setStorageSync).toHaveBeenCalledWith('selectedCityName', 'Shanghai');

      const state = useCityStore.getState();
      expect(state.selectedCity).toBe('sh');
      expect(state.selectedCityName).toBe('Shanghai');
    });

    it('should update state when called multiple times', () => {
      useCityStore.getState().setSelectedCity('bj', 'Beijing');
      expect(useCityStore.getState().selectedCity).toBe('bj');
      expect(useCityStore.getState().selectedCityName).toBe('Beijing');

      useCityStore.getState().setSelectedCity('gz', 'Guangzhou');
      expect(useCityStore.getState().selectedCity).toBe('gz');
      expect(useCityStore.getState().selectedCityName).toBe('Guangzhou');
    });
  });
});
