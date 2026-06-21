// Taro mock for Jest tests
const Taro = {
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  getStorageInfoSync: jest.fn(() => ({ keys: [] })),
  clearStorageSync: jest.fn(),
  request: jest.fn(),
  downloadFile: jest.fn(),
  uploadFile: jest.fn(),
  compressImage: jest.fn(),
  getFileSystemManager: jest.fn(() => ({
    readFileSync: jest.fn(),
    saveFileSync: jest.fn(),
    unlinkSync: jest.fn(),
    statSync: jest.fn(),
  })),
  getFileInfo: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn(),
  showActionSheet: jest.fn(),
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  switchTab: jest.fn(),
  getCurrentPages: jest.fn(() => []),
  getCurrentInstance: jest.fn(() => ({
    router: { params: {} },
    page: { route: '' },
  })),
  addInterceptor: jest.fn(),
  requestSubscribeMessage: jest.fn(),
  getEnv: jest.fn(() => 'WEAPP'),
  ENV_TYPE: {
    WEAPP: 'WEAPP',
    H5: 'H5',
  },
  useDidShow: jest.fn(),
  useDidHide: jest.fn(),
  usePullDownRefresh: jest.fn(),
  useShareAppMessage: jest.fn(),
  useShareTimeline: jest.fn(),
};

module.exports = Taro;
module.exports.default = Taro;
