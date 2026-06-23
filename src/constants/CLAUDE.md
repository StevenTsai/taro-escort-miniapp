[根目录](../../CLAUDE.md) > [src](../) > **constants**

# Constants 模块 — 全局常量

## 模块职责

定义项目全局常量，使用 TypeScript `as const` 确保类型安全。

## 常量列表

| 常量 | 类型 | 说明 |
|------|------|------|
| `ROLE` | `{ USER: 1, CHAPERON: 2 }` | 用户角色 |
| `ORDER_STATUS` | `{ PENDING, PAID, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED }` | 订单状态（中文值） |
| `ORDER_STATUS_LIST` | `Array<{ key, label, value }>` | 订单状态 Tab 筛选列表 |
| `SERVICE_ID` | `{ BASIC: 1, STANDARD: 2, PREMIUM: 3, ELDER: 4, REMOTE: 5 }` | 服务类型 ID |
| `COLORS` | `{ PRIMARY, TEXT_PRIMARY, DANGER, ... }` | 主题颜色 |
| `APP_NAME` | `'陪诊服务'` | 应用名称 |
| `SHARE_CONFIG` | `{ title, path }` | 默认分享配置 |
| `DEFAULT_CITY` | `'北京市'` | 默认城市 |
| `COS_URLS` | `{ PRIVACY_POLICY, SERVICE_AGREEMENT }` | COS 协议文件地址（从环境变量读取） |

## 测试覆盖

- `__tests__/index.test.js` — 常量值验证
- `__tests__/orderStatus.test.js` — 订单状态常量验证

## 相关文件清单

```
src/constants/
  index.ts
  __tests__/
    index.test.js
    orderStatus.test.js
```
