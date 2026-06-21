[根目录](../../CLAUDE.md) > [src](../) > **store**

# Store 模块 — Zustand 状态管理

## 模块职责

集中管理应用全局状态，使用 Zustand 轻量级状态管理库。每个 Store 职责单一，通过 `create()` 创建，部分 Store 使用 `Taro.setStorageSync` 实现持久化。

## Store 列表

| Store | 文件 | 职责 | 持久化 |
|-------|------|------|--------|
| useAuthStore | `useAuthStore.js` | 用户认证（token/userInfo/登录/登出） | 是（Storage） |
| useCityStore | `useCityStore.js` | 城市选择（selectedCity/selectedCityName） | 是（Storage） |
| useTabBarStore | `useTabBarStore.js` | TabBar 选中索引 | 否 |
| useEscortIncomeStore | `useEscortIncomeStore.js` | 陪诊师收入概览/明细（分页） | 否 |

## 关键模式

### 认证 Store（useAuthStore）

- `initAuth()` — 从 Storage 恢复登录状态，同时处理头像缓存
- `setToken/setUserInfo` — 写入 Storage + 更新 state
- `logout()` — 仅清除鉴权相关 key（`AUTH_KEYS`），不影响城市偏好
- `checkAuth()` — 未登录时跳转个人中心页
- 派生 hook: `useIsLoggedIn()` — 从 token + userInfo 计算登录状态

### 请求型 Store（useEscortIncomeStore）

- 使用 `@/utils/request` 的 `get/post` 方法
- 支持请求缓存（`useCache`, `expireTime`, `cacheKey`）
- 统一的 loading/error 状态管理
- 分页加载（`loadMore` 模式）

## 测试覆盖

- `__tests__/useAuthStore.test.js` — 认证状态管理
- `__tests__/useCityStore.test.js` — 城市选择
- `__tests__/useTabBarStore.test.js` — TabBar 状态
- `__tests__/useEscortIncomeStore.test.js` — 收入管理

## 缺口

- useEscortIncomeStore 缺测试

## 相关文件清单

```
src/store/
  useAuthStore.js
  useCityStore.js
  useTabBarStore.js
  useEscortIncomeStore.js
  __tests__/
    useAuthStore.test.js
    useCityStore.test.js
    useTabBarStore.test.js
    useEscortIncomeStore.test.js
```
