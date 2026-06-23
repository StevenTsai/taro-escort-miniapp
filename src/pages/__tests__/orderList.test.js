/**
 * Tests for orderList page business logic
 * Tests order filtering and status mapping
 */

// ===== Constants and pure functions from orderList =====

const ORDER_STATUS = {
  PENDING: '待确认',
  PAID: '已支付',
  ACCEPTED: '已接单',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

const ORDER_STATUS_LIST = [
  { key: 'all', label: '全部', value: '' },
  { key: 'pending', label: '待确认', value: ORDER_STATUS.PENDING },
  { key: 'paid', label: '已支付', value: ORDER_STATUS.PAID },
  { key: 'accepted', label: '已接单', value: ORDER_STATUS.ACCEPTED },
  { key: 'in_progress', label: '进行中', value: ORDER_STATUS.IN_PROGRESS },
  { key: 'cancelled', label: '已取消', value: ORDER_STATUS.CANCELLED },
  { key: 'completed', label: '已完成', value: ORDER_STATUS.COMPLETED },
];

/** 按状态筛选订单 */
const filterOrdersByStatus = (orders, status) => {
  if (!status) return orders;
  return orders.filter(order => order.status === status);
};

/** 获取订单状态对应的显示标签 */
const getStatusLabel = status => {
  const found = ORDER_STATUS_LIST.find(item => item.value === status);
  return found ? found.label : status;
};

/** 判断订单是否可取消 */
const canCancelOrder = status => {
  return [ORDER_STATUS.PENDING, ORDER_STATUS.PAID].includes(status);
};

/** 判断订单是否可评价 */
const canCommentOrder = status => {
  return status === ORDER_STATUS.COMPLETED;
};

/** 格式化订单金额 */
const formatPrice = price => {
  if (typeof price !== 'number' || isNaN(price)) return '¥0.00';
  return `¥${price.toFixed(2)}`;
};

// ===== Tests =====

describe('orderList page logic', () => {
  const mockOrders = [
    { id: 1, status: '待确认', patientName: '张三', price: 299 },
    { id: 2, status: '已支付', patientName: '李四', price: 399 },
    { id: 3, status: '已接单', patientName: '王五', price: 199 },
    { id: 4, status: '进行中', patientName: '赵六', price: 499 },
    { id: 5, status: '已完成', patientName: '钱七', price: 599 },
    { id: 6, status: '已取消', patientName: '孙八', price: 99 },
  ];

  describe('filterOrdersByStatus', () => {
    it('should return all orders when status is empty', () => {
      const result = filterOrdersByStatus(mockOrders, '');
      expect(result).toHaveLength(6);
    });

    it('should return all orders when status is null', () => {
      const result = filterOrdersByStatus(mockOrders, null);
      expect(result).toHaveLength(6);
    });

    it('should filter by specific status', () => {
      const result = filterOrdersByStatus(mockOrders, '待确认');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should return empty array when no match', () => {
      const result = filterOrdersByStatus(mockOrders, '不存在的状态');
      expect(result).toHaveLength(0);
    });

    it('should handle empty orders array', () => {
      const result = filterOrdersByStatus([], '待确认');
      expect(result).toHaveLength(0);
    });
  });

  describe('getStatusLabel', () => {
    it('should return correct label for known status', () => {
      expect(getStatusLabel('待确认')).toBe('待确认');
      expect(getStatusLabel('已支付')).toBe('已支付');
      expect(getStatusLabel('已完成')).toBe('已完成');
    });

    it('should return original value for unknown status', () => {
      expect(getStatusLabel('未知状态')).toBe('未知状态');
    });
  });

  describe('canCancelOrder', () => {
    it('should allow cancel for pending orders', () => {
      expect(canCancelOrder('待确认')).toBe(true);
    });

    it('should allow cancel for paid orders', () => {
      expect(canCancelOrder('已支付')).toBe(true);
    });

    it('should not allow cancel for accepted orders', () => {
      expect(canCancelOrder('已接单')).toBe(false);
    });

    it('should not allow cancel for in-progress orders', () => {
      expect(canCancelOrder('进行中')).toBe(false);
    });

    it('should not allow cancel for completed orders', () => {
      expect(canCancelOrder('已完成')).toBe(false);
    });

    it('should not allow cancel for already cancelled orders', () => {
      expect(canCancelOrder('已取消')).toBe(false);
    });
  });

  describe('canCommentOrder', () => {
    it('should allow comment for completed orders', () => {
      expect(canCommentOrder('已完成')).toBe(true);
    });

    it('should not allow comment for non-completed orders', () => {
      expect(canCommentOrder('待确认')).toBe(false);
      expect(canCommentOrder('已支付')).toBe(false);
      expect(canCommentOrder('已接单')).toBe(false);
      expect(canCommentOrder('进行中')).toBe(false);
      expect(canCommentOrder('已取消')).toBe(false);
    });
  });

  describe('formatPrice', () => {
    it('should format number to 2 decimal places', () => {
      expect(formatPrice(299)).toBe('¥299.00');
      expect(formatPrice(0)).toBe('¥0.00');
      expect(formatPrice(99.9)).toBe('¥99.90');
    });

    it('should handle NaN', () => {
      expect(formatPrice(NaN)).toBe('¥0.00');
    });

    it('should handle undefined', () => {
      expect(formatPrice(undefined)).toBe('¥0.00');
    });

    it('should handle null', () => {
      expect(formatPrice(null)).toBe('¥0.00');
    });

    it('should handle string input', () => {
      expect(formatPrice('abc')).toBe('¥0.00');
    });
  });
});
