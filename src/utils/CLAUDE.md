[根目录](../../CLAUDE.md) > [src](../) > **utils**

# Utils 模块 — 工具层

## 模块职责

提供跨页面复用的核心工具函数：HTTP 请求封装、认证辅助、微信支付、权限检查、图片处理、订阅消息。

## 工具列表

### request.js — HTTP 请求封装

- **拦截器**: 自动注入 `Authorization` 头（token）、`x-biz: medical-chaperon` 标识
- **401 处理**: 清除 token/userInfo，跳转个人中心
- **缓存管理器**: 基于 `Taro.setStorageSync` 的本地缓存，支持 TTL 过期
- **导出方法**: `get(url, params, callbacks, cacheOptions)` / `post` / `put` / `del` / `upload`
- **缓存 key 生成**: `stableStringify` 递归排序对象键，确保相同参数生成相同 key

### auth.ts — 认证工具（TypeScript）

- `isLoggedIn()` — 检查是否已登录
- `getToken()` / `getUserInfo()` — 获取存储的认证信息
- `setLoginInfo(token, userInfo)` — 设置登录信息（带参数校验）
- `clearLoginInfo()` — 清除鉴权相关 key
- `redirectToLogin()` — 跳转登录页（保留当前路由用于回跳）
- `withAuth(pageComponent)` — 需登录页面的装饰器 HOC

### payment.js — 微信支付

- `requestPayment({ outTradeNo, onSuccess, onFail, onCancel })` — 统一支付调用
- `createOrderAndPay({ orderData })` — 创建陪诊订单并支付
- `createProductOrderAndPay({ orderData })` — 创建产品订单（课程等）并支付
- 支付成功后自动触发订阅消息

### permission.js — 权限检查

- `checkLogin()` — 检查登录状态
- `checkCoursePermission(courseId)` — 检查课程购买权限
- `checkVideoPermission(courseId, videoId, course)` — 检查视频观看权限（免费/已购/试看）
- `checkPermission(courseId, videoId, course)` — 综合权限检查（登录 + 课程权限）

### imageUtils.js — 图片处理

- `cacheImageFromUrl(imageUrl, storageKey)` — 下载网络图片到本地文件系统并缓存路径（24h 过期）
- `clearCachedImage(storageKey)` — 清除缓存图片
- `getCachedImage(storageKey)` — 获取缓存图片路径
- `compressImageToSize(filePath, maxSize, quality)` — 循环压缩图片至目标大小

### subscribe.js — 微信订阅消息

- 模板 ID: ORDER_STATUS_UPDATE / SERVICE_COMPLETE / SERVICE_REMINDER / SERVICE_BOOKING_SUCCESS
- `requestSubscribeMessage(tmplIds)` — 请求订阅权限（限制最多 3 个模板）
- 便捷方法: `subscribeOrderStatusUpdate` / `subscribeServiceBookingSuccess` / `subscribeServiceReminder` / `subscribeCommonMessages`
- `checkSubscribeSetting()` — 检查用户订阅设置

## 测试覆盖

- `__tests__/auth.test.js`
- `__tests__/request.test.js`
- `__tests__/permission.test.js`
- `__tests__/imageUtils.test.js`
- `__tests__/subscribe.test.js`
- `__tests__/payment.test.js`

## 缺口

- 所有核心工具均有测试，覆盖较完整

## 相关文件清单

```
src/utils/
  request.js
  auth.ts
  payment.js
  permission.js
  imageUtils.js
  subscribe.js
  __tests__/
    auth.test.js
    request.test.js
    permission.test.js
    imageUtils.test.js
    subscribe.test.js
    payment.test.js
```
