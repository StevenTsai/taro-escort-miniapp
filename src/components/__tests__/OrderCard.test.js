/**
 * Tests for OrderCard component
 */

const mockNavigateTo = jest.fn();
const mockRequestPayment = jest.fn();
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockSetBtnLoading = jest.fn();

// Mock React to provide createElement, jsx, and useState in node environment
const mockJsx = (type, props, key) => {
  const mergedProps = { ...(props || {}) };
  if (key !== undefined) mergedProps.key = key;
  if (typeof type === 'function') {
    return type(mergedProps);
  }
  return { type, props: mergedProps };
};

const mockCreateElement = (type, props, ...children) => {
  const mergedProps = { ...(props || {}) };
  if (children.length === 1) mergedProps.children = children[0];
  else if (children.length > 1) mergedProps.children = children;
  if (typeof type === 'function') {
    return type(mergedProps);
  }
  return { type, props: mergedProps };
};

jest.mock('react', () => ({
  __esModule: true,
  default: { createElement: mockCreateElement },
  createElement: mockCreateElement,
  useState: jest.fn(init => [false, mockSetBtnLoading]),
}));

jest.mock('react/jsx-runtime', () => ({
  __esModule: true,
  jsx: mockJsx,
  jsxs: mockJsx,
  Fragment: ({ children }) => children,
}));

jest.mock('@tarojs/taro', () => ({
  navigateTo: mockNavigateTo,
  pxTransform: jest.fn(val => `${val}px`),
}));

jest.mock('@tarojs/components', () => ({
  View: ({ children, ...props }) => ({ type: 'View', props: { ...props, children } }),
  Text: ({ children, ...props }) => ({ type: 'Text', props: { ...props, children } }),
}));

// Mock nutui components individually (babel-plugin-import transforms paths)
const mockButton = ({ children, ...props }) => ({ type: 'Button', props: { ...props, children } });
const mockCol = ({ children, ...props }) => ({ type: 'Col', props: { ...props, children } });
const mockRow = ({ children, ...props }) => ({ type: 'Row', props: { ...props, children } });
const mockSpace = ({ children, ...props }) => ({ type: 'Space', props: { ...props, children } });
const mockImage = (props) => ({ type: 'Image', props });

jest.mock('@nutui/nutui-react-taro/dist/es/packages/button', () => ({ __esModule: true, default: mockButton }));
jest.mock('@nutui/nutui-react-taro/dist/es/packages/col', () => ({ __esModule: true, default: mockCol }));
jest.mock('@nutui/nutui-react-taro/dist/es/packages/dialog', () => ({ __esModule: true, default: { open: jest.fn(), close: jest.fn() } }));
jest.mock('@nutui/nutui-react-taro/dist/es/packages/image', () => ({ __esModule: true, default: mockImage }));
jest.mock('@nutui/nutui-react-taro/dist/es/packages/row', () => ({ __esModule: true, default: mockRow }));
jest.mock('@nutui/nutui-react-taro/dist/es/packages/space', () => ({ __esModule: true, default: mockSpace }));
jest.mock('@nutui/nutui-react-taro/dist/es/packages/toast', () => ({ __esModule: true, default: { show: jest.fn() } }));

// Mock nutui CSS imports
jest.mock('@nutui/nutui-react-taro/dist/es/packages/button/style/css', () => ({}));
jest.mock('@nutui/nutui-react-taro/dist/es/packages/col/style/css', () => ({}));
jest.mock('@nutui/nutui-react-taro/dist/es/packages/dialog/style/css', () => ({}));
jest.mock('@nutui/nutui-react-taro/dist/es/packages/image/style/css', () => ({}));
jest.mock('@nutui/nutui-react-taro/dist/es/packages/row/style/css', () => ({}));
jest.mock('@nutui/nutui-react-taro/dist/es/packages/space/style/css', () => ({}));
jest.mock('@nutui/nutui-react-taro/dist/es/packages/toast/style/css', () => ({}));

jest.mock('@nutui/icons-react-taro', () => ({
  Location: (props) => ({ type: 'Location', props }),
}));

jest.mock('@/store/useAuthStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/utils/request', () => ({
  get: mockGet,
  post: mockPost,
}));

jest.mock('@/utils/payment', () => ({
  requestPayment: mockRequestPayment,
}));

jest.mock('@/constants', () => ({
  ORDER_STATUS: {
    PENDING: '待确认',
    PAID: '已支付',
    ACCEPTED: '已接单',
    IN_PROGRESS: '进行中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  },
  ROLE: {
    USER: 1,
    CHAPERON: 2,
  },
}));

// Helper to find nodes in rendered tree
function findAllInTree(node, predicate) {
  const results = [];
  if (!node || typeof node !== 'object') return results;
  if (predicate(node)) results.push(node);
  const children = Array.isArray(node.props?.children)
    ? node.props.children
    : node.props?.children != null ? [node.props.children] : [];
  for (const child of children) {
    if (child && typeof child === 'object') {
      results.push(...findAllInTree(child, predicate));
    }
  }
  return results;
}

const useAuthStore = require('@/store/useAuthStore').default;
const OrderCard = require('../OrderCard/OrderCard').default || require('../OrderCard/OrderCard');

const defaultOrderInfo = {
  serviceName: '陪诊服务',
  orderId: 'ORD001',
  status: '待确认',
  serviceDate: '2026-06-10',
  patientName: '张三',
  servicePrice: 299.0,
  hospitalName: '北京协和医院',
  medicalEscort: { name: '李四', avatar: 'avatar.jpg' },
  outTradeNo: 'OUT001',
  commentStatus: 'NONE',
};

describe('OrderCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.mockReturnValue({ userInfo: { role: 1 } });
  });

  it('should render order info with serviceName and orderId', () => {
    const result = OrderCard({ orderInfo: defaultOrderInfo, onOrderUpdate: jest.fn() });

    expect(result).toBeDefined();
    expect(result.type).toBe('View');
    expect(result.props.className).toBe('order-card');

    const allText = JSON.stringify(result);
    expect(allText).toContain('陪诊服务');
    expect(allText).toContain('ORD001');
  });

  it('should render servicePrice with yuan symbol', () => {
    const result = OrderCard({ orderInfo: defaultOrderInfo, onOrderUpdate: jest.fn() });

    const allText = JSON.stringify(result);
    expect(allText).toContain('￥');
    expect(allText).toContain('299.00');
  });

  it('should show warning status button type for PENDING', () => {
    const orderInfo = { ...defaultOrderInfo, status: '待确认' };
    const result = OrderCard({ orderInfo, onOrderUpdate: jest.fn() });

    const statusButtons = findAllInTree(
      result,
      n => n.type === 'Button' && n.props?.className === 'order-status'
    );
    expect(statusButtons.length).toBe(1);
    expect(statusButtons[0].props.type).toBe('warning');
  });

  it('should show pay button for PENDING status with USER role', () => {
    useAuthStore.mockReturnValue({ userInfo: { role: 1 } });
    const orderInfo = { ...defaultOrderInfo, status: '待确认' };
    const result = OrderCard({ orderInfo, onOrderUpdate: jest.fn() });

    const payButtons = findAllInTree(
      result,
      n => n.type === 'Button' && n.props?.children === '立刻支付'
    );
    expect(payButtons.length).toBe(1);
    expect(payButtons[0].props.type).toBe('warning');
  });

  it('should show cancel button for PENDING status with USER role', () => {
    useAuthStore.mockReturnValue({ userInfo: { role: 1 } });
    const orderInfo = { ...defaultOrderInfo, status: '待确认' };
    const result = OrderCard({ orderInfo, onOrderUpdate: jest.fn() });

    const cancelButtons = findAllInTree(
      result,
      n => n.type === 'Button' && n.props?.children === '取消订单'
    );
    expect(cancelButtons.length).toBe(1);
    expect(cancelButtons[0].props.type).toBe('danger');
  });

  it('should show cancel button for PAID status with USER role', () => {
    useAuthStore.mockReturnValue({ userInfo: { role: 1 } });
    const orderInfo = { ...defaultOrderInfo, status: '已支付' };
    const result = OrderCard({ orderInfo, onOrderUpdate: jest.fn() });

    const cancelButtons = findAllInTree(
      result,
      n => n.type === 'Button' && n.props?.children === '取消订单'
    );
    expect(cancelButtons.length).toBe(1);
  });

  it('should show end button for IN_PROGRESS status with USER role', () => {
    useAuthStore.mockReturnValue({ userInfo: { role: 1 } });
    const orderInfo = { ...defaultOrderInfo, status: '进行中' };
    const result = OrderCard({ orderInfo, onOrderUpdate: jest.fn() });

    const endButtons = findAllInTree(
      result,
      n => n.type === 'Button' && n.props?.children === '结束陪诊'
    );
    expect(endButtons.length).toBe(1);
    expect(endButtons[0].props.type).toBe('primary');
  });

  it('should show comment button for COMPLETED status with USER role', () => {
    useAuthStore.mockReturnValue({ userInfo: { role: 1 } });
    const orderInfo = { ...defaultOrderInfo, status: '已完成', commentStatus: 'NONE' };
    const result = OrderCard({ orderInfo, onOrderUpdate: jest.fn() });

    const commentButtons = findAllInTree(
      result,
      n => n.type === 'Button' && n.props?.children === '评价'
    );
    expect(commentButtons.length).toBe(1);
    expect(commentButtons[0].props.type).toBe('success');
  });

  it('should show start chaperon button for ACCEPTED status with CHAPERON role', () => {
    useAuthStore.mockReturnValue({ userInfo: { role: 2 } });
    const orderInfo = { ...defaultOrderInfo, status: '已接单' };
    const result = OrderCard({ orderInfo, onOrderUpdate: jest.fn() });

    const startButtons = findAllInTree(
      result,
      n => n.type === 'Button' && n.props?.children === '开始陪诊'
    );
    expect(startButtons.length).toBe(1);
    expect(startButtons[0].props.type).toBe('success');
  });

  it('should show already-commented button for COMPLETED+COMMENTED with USER role', () => {
    useAuthStore.mockReturnValue({ userInfo: { role: 1 } });
    const orderInfo = { ...defaultOrderInfo, status: '已完成', commentStatus: 'COMMENTED' };
    const result = OrderCard({ orderInfo, onOrderUpdate: jest.fn() });

    const commentedButtons = findAllInTree(
      result,
      n => n.type === 'Button' && n.props?.children === '已评价'
    );
    expect(commentedButtons.length).toBe(1);
    expect(commentedButtons[0].props.disabled).toBe(true);
  });
});
