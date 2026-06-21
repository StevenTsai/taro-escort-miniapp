/**
 * 项目全局常量（TypeScript 类型安全）
 */

// 用户角色
export const ROLE = {
  USER: 1,
  CHAPERON: 2,
} as const;

export type RoleValue = (typeof ROLE)[keyof typeof ROLE];

// 订单状态
export const ORDER_STATUS = {
  PENDING: '待确认',
  PAID: '已支付',
  ACCEPTED: '已接单',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
} as const;

export type OrderStatusValue = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// 订单状态列表（用于 Tab 筛选）
export const ORDER_STATUS_LIST = [
  { key: 'all', label: '全部', value: '' as const },
  { key: 'pending', label: '待确认', value: ORDER_STATUS.PENDING },
  { key: 'paid', label: '已支付', value: ORDER_STATUS.PAID },
  { key: 'accepted', label: '已接单', value: ORDER_STATUS.ACCEPTED },
  { key: 'in_progress', label: '进行中', value: ORDER_STATUS.IN_PROGRESS },
  { key: 'cancelled', label: '已取消', value: ORDER_STATUS.CANCELLED },
  { key: 'completed', label: '已完成', value: ORDER_STATUS.COMPLETED },
] as const;

export interface OrderStatusItem {
  key: string;
  label: string;
  value: string;
}

// 服务 ID
export const SERVICE_ID = {
  BASIC: 1,
  STANDARD: 2,
  PREMIUM: 3,
  ELDER: 4,
  REMOTE: 5,
} as const;

export type ServiceIdValue = (typeof SERVICE_ID)[keyof typeof SERVICE_ID];

// 主题颜色
export const COLORS = {
  PRIMARY: '#008000',
  PRIMARY_LIGHT: '#e8f5e9',
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#666666',
  TEXT_MUTED: '#999999',
  BG_PAGE: '#f5f5f5',
  BORDER: '#eeeeee',
  WHITE: '#ffffff',
  DANGER: '#ff4d4f',
  WARNING: '#faad14',
  SUCCESS: '#52c41a',
} as const;

export type ColorValue = (typeof COLORS)[keyof typeof COLORS];

// 应用信息
export const APP_NAME = '壹鹿康行' as const;

// 分享配置
export const SHARE_CONFIG = {
  title: APP_NAME,
  path: '/pages/index/index',
} as const;

// 默认城市
export const DEFAULT_CITY = '北京市' as const;

// COS 资源地址（从环境变量读取，不再硬编码 AppID）
const COS_BASE = process.env.TARO_APP_COS_BASE || '';
export const COS_URLS = {
  PRIVACY_POLICY: `${COS_BASE}/agreement/%E9%9A%90%E7%A7%81%E6%94%BF%E7%AD%96.md`,
  SERVICE_AGREEMENT: `${COS_BASE}/agreement/%E6%9C%8D%E5%8A%A1%E5%8D%8F%E8%AE%AE.md`,
} as const;
