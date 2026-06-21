import Taro from '@tarojs/taro';

import { create } from 'zustand';

import { get } from '@/utils/request';

const useEscortIncomeStore = create((set, storeGet) => ({
  // 状态
  incomeOverview: null, // 收入概览数据
  incomeDetails: [], // 收入明细列表
  totalDetails: 0, // 收入明细总数
  currentMonth: new Date().toISOString().slice(0, 7), // 当前选中月份，格式：YYYY-MM
  currentStatus: '', // 当前筛选状态：''(全部)、'received'(已到账)、'pending'(未到账)
  currentPage: 1, // 当前页码
  pageSize: 10, // 每页条数
  isLoading: false, // 加载状态
  error: null, // 错误信息

  // 动作
  setIncomeOverview: overview => set({ incomeOverview: overview }),
  setIncomeDetails: details => set({ incomeDetails: details }),
  setTotalDetails: total => set({ totalDetails: total }),
  setCurrentMonth: month => set({ currentMonth: month, currentPage: 1 }),
  setCurrentStatus: status => set({ currentStatus: status, currentPage: 1 }),
  setCurrentPage: page => set({ currentPage: page }),
  setIsLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),

  // 异步动作
  fetchIncomeOverview: async (month = storeGet().currentMonth) => {
    try {
      set({ isLoading: true, error: null });
      // 调用实际的API获取收入概览
      const result = await get(
        '/api/medicalEscorts/income/overview',
        { month },
        {},
        {
          useCache: true,
          expireTime: 5 * 60 * 1000, // 缓存5分钟
          cacheKey: `income_overview_${month}`,
        }
      );

      // 增加错误处理，确保即使API返回的数据结构不符合预期，代码也能正常运行
      // 处理不同的数据结构：可能是直接数据或包含在data字段中
      const overview = result?.data ||
        result || {
          month,
          totalAmount: 0,
          receivedAmount: 0,
          pendingAmount: 0,
        };
      set({ incomeOverview: overview, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to fetch income overview:', error);
      Taro.showToast({
        title: '获取收入概览失败',
        icon: 'error',
        duration: 2000,
      });
    }
  },

  fetchIncomeDetails: async (refresh = false) => {
    try {
      const { currentMonth, currentStatus, currentPage, pageSize } = storeGet();
      const page = refresh ? 1 : currentPage;

      set({ isLoading: true, error: null, currentPage: page });
      // 调用实际的API获取收入明细
      const result = await get(
        '/api/medicalEscorts/income/details',
        { month: currentMonth, status: currentStatus, page, pageSize },
        {},
        {
          useCache: true,
          expireTime: 5 * 60 * 1000, // 缓存5分钟
          cacheKey: `income_details_${currentMonth}_${currentStatus}_${page}`,
        }
      );

      // 增加错误处理，确保即使API返回的数据结构不符合预期，代码也能正常运行
      // 处理不同的数据结构：可能是直接数据或包含在data字段中
      const responseData = result?.data || result || {};
      const list = responseData?.list || [];
      const total = responseData?.total || 0;

      set({
        incomeDetails: refresh ? list : [...storeGet().incomeDetails, ...list],
        totalDetails: total,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to fetch income details:', error);
      Taro.showToast({
        title: '获取收入明细失败',
        icon: 'error',
        duration: 2000,
      });
    }
  },

  // 刷新所有数据
  refreshAllData: async () => {
    await Promise.all([storeGet().fetchIncomeOverview(), storeGet().fetchIncomeDetails(true)]);
  },

  // 切换月份
  changeMonth: async month => {
    // 确保 month 参数是正确的 YYYY-MM 格式
    let cleanMonth = month;
    try {
      // 如果传入的是对象，尝试从 value 属性中提取
      if (typeof month === 'object' && month !== null) {
        if (Array.isArray(month.value)) {
          cleanMonth = month.value[0];
        } else if (typeof month.value === 'string') {
          cleanMonth = month.value;
        }
      } else if (typeof month === 'string') {
        // 如果传入的是字符串，检查是否包含 JSON 格式的对象
        if (month.startsWith('{') && month.endsWith('}')) {
          const parsed = JSON.parse(month);
          if (parsed.value) {
            cleanMonth = Array.isArray(parsed.value) ? parsed.value[0] : parsed.value;
          }
        }
      }
      // 验证是否为 YYYY-MM 格式
      if (!/^\d{4}-\d{2}$/.test(cleanMonth)) {
        console.error('Invalid month format:', cleanMonth);
        return;
      }
    } catch (error) {
      console.error('Error processing month parameter:', error);
      return;
    }
    set({ currentMonth: cleanMonth, currentPage: 1 });
    await storeGet().refreshAllData();
  },

  // 切换状态筛选
  changeStatusFilter: async status => {
    set({ currentStatus: status, currentPage: 1 });
    await storeGet().fetchIncomeDetails(true);
  },

  // 加载更多数据
  loadMore: async () => {
    const { currentPage, totalDetails, incomeDetails, isLoading } = storeGet();
    if (isLoading || incomeDetails.length >= totalDetails) {
      return;
    }
    set({ currentPage: currentPage + 1 });
    await storeGet().fetchIncomeDetails();
  },
}));

export default useEscortIncomeStore;
