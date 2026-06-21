import Taro from '@tarojs/taro';

import { create } from 'zustand';

const useCityStore = create((set, get) => ({
  // 状态
  selectedCity: Taro.getStorageSync('selectedCity') || '',
  selectedCityName: Taro.getStorageSync('selectedCityName') || '',

  // 设置选中的城市
  setSelectedCity: (cityCode, cityName) => {
    Taro.setStorageSync('selectedCity', cityCode);
    Taro.setStorageSync('selectedCityName', cityName);
    set({
      selectedCity: cityCode,
      selectedCityName: cityName,
    });
  },

  // 清除选中的城市
  clearSelectedCity: () => {
    Taro.removeStorageSync('selectedCity');
    Taro.removeStorageSync('selectedCityName');
    set({
      selectedCity: '',
      selectedCityName: '',
    });
  },

  // 获取当前选中的城市
  getCurrentCity: () => {
    const { selectedCity, selectedCityName } = get();
    return {
      cityCode: selectedCity,
      cityName: selectedCityName,
    };
  },

  // 初始化城市信息（从本地存储加载）
  initCity: () => {
    const selectedCity = Taro.getStorageSync('selectedCity') || '';
    const selectedCityName = Taro.getStorageSync('selectedCityName') || '';
    set({
      selectedCity,
      selectedCityName,
    });
  },
}));

export default useCityStore;
