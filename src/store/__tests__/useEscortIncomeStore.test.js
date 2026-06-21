/**
 * Tests for useEscortIncomeStore
 */

const mockGet = jest.fn();
const mockShowToast = jest.fn();

jest.mock('@tarojs/taro', () => ({
  getStorageSync: jest.fn().mockReturnValue(null),
  setStorageSync: jest.fn(),
  showToast: mockShowToast,
}));

jest.mock('@/utils/request', () => ({
  get: mockGet,
  post: jest.fn(),
}));

describe('useEscortIncomeStore', () => {
  let useEscortIncomeStore;

  beforeEach(() => {
    mockGet.mockReset();
    mockShowToast.mockReset();
    jest.isolateModules(() => {
      useEscortIncomeStore = require('../useEscortIncomeStore').default;
    });
  });

  describe('initial state', () => {
    it('should have empty incomeDetails', () => {
      const state = useEscortIncomeStore.getState();
      expect(state.incomeDetails).toEqual([]);
    });

    it('should have currentMonth as current YYYY-MM', () => {
      const expected = new Date().toISOString().slice(0, 7);
      const state = useEscortIncomeStore.getState();
      expect(state.currentMonth).toBe(expected);
    });

    it('should have currentStatus as empty string (all)', () => {
      const state = useEscortIncomeStore.getState();
      expect(state.currentStatus).toBe('');
    });
  });

  describe('fetchIncomeDetails', () => {
    it('should populate incomeDetails from API', async () => {
      const details = [
        { id: 1, amount: 100, status: 'received' },
        { id: 2, amount: 200, status: 'pending' },
      ];
      mockGet.mockResolvedValue({ data: { list: details, total: 2 } });

      await useEscortIncomeStore.getState().fetchIncomeDetails(true);

      const state = useEscortIncomeStore.getState();
      expect(state.incomeDetails).toEqual(details);
      expect(state.totalDetails).toBe(2);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('fetchIncomeOverview', () => {
    it('should populate incomeOverview from API', async () => {
      const overview = {
        month: '2026-06',
        totalAmount: 500,
        receivedAmount: 300,
        pendingAmount: 200,
      };
      mockGet.mockResolvedValue({ data: overview });

      await useEscortIncomeStore.getState().fetchIncomeOverview();

      const state = useEscortIncomeStore.getState();
      expect(state.incomeOverview).toEqual(overview);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setCurrentMonth', () => {
    it('should update month and reset page to 1', () => {
      useEscortIncomeStore.setState({ currentPage: 3 });

      useEscortIncomeStore.getState().setCurrentMonth('2026-01');

      const state = useEscortIncomeStore.getState();
      expect(state.currentMonth).toBe('2026-01');
      expect(state.currentPage).toBe(1);
    });
  });

  describe('setCurrentStatus', () => {
    it('should update status filter and reset page to 1', () => {
      useEscortIncomeStore.setState({ currentPage: 5 });

      useEscortIncomeStore.getState().setCurrentStatus('received');

      const state = useEscortIncomeStore.getState();
      expect(state.currentStatus).toBe('received');
      expect(state.currentPage).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should set error on fetchIncomeDetails failure', async () => {
      mockGet.mockRejectedValue(new Error('Network error'));

      await useEscortIncomeStore.getState().fetchIncomeDetails(true);

      const state = useEscortIncomeStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: '获取收入明细失败' })
      );
    });
  });
});
