# 医疗陪诊微信小程序

[![CI](https://github.com/StevenTsai/taro-escort-miniapp/actions/workflows/ci.yml/badge.svg)](https://github.com/StevenTsai/taro-escort-miniapp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Taro](https://img.shields.io/badge/Taro-4.1.5-blue)](https://taro.jd.com)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org)

> 基于 Taro 4 + React 18 + Zustand 5 的医疗陪诊服务微信小程序，提供完整的预约、支付、认证流程，支持多端编译。

## 项目介绍

一款面向患者和陪诊师的微信小程序，提供陪诊预约等一站式医疗陪诊服务。通过简洁的界面和流畅的用户体验，帮助用户快速找到合适的陪诊师。

### 亮点

- 🔐 **完整认证流程** — 微信手机号授权 + 服务端 session + Zustand 状态管理
- 💰 **声明式支付封装** — 统一支付 API，支持 Promise 和回调
- 📡 **请求层封装** — 拦截器 + 客户端缓存（TTL） + Token 自动注入
- 🖼️ **图片缓存优化** — 文件系统缓存替代 Base64，突破 10MB Storage 限制
- 📱 **多端编译** — 微信/支付宝/字节/H5 等多平台支持
- ✅ **工程化完备** — ESLint + Prettier + Husky + Jest，231 个测试用例

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 开发框架 | Taro | 4.1.5 |
| 前端框架 | React | 18 |
| UI 组件库 | NutUI-React-Taro | 3.0.17 |
| 状态管理 | Zustand | 5.0.6 |
| 构建工具 | Webpack | 5.78.0 |
| 样式预处理 | Sass | - |
| 代码规范 | ESLint + Prettier | - |
| 类型检查 | TypeScript（渐进式） | - |
| 测试框架 | Jest + Testing Library | - |
| Git Hooks | husky + lint-staged | - |

## 快速开始

### 环境准备

- Node.js >= 20.0.0
- Yarn >= 1.22.0（推荐）或 npm
- Taro CLI >= 4.0.0

### 安装依赖

```bash
yarn install
```

### 配置环境变量

```bash
cp .env.example .env.development
```

编辑 `.env.development`，填入你的后端 API 地址和 COS 存储桶地址。

### 开发模式

```bash
# 微信小程序（推荐）
yarn dev:weapp

# H5
yarn dev:h5

# 其他平台
yarn dev:alipay   # 支付宝小程序
yarn dev:tt       # 字节跳动小程序
```

### 构建生产版本

```bash
# 微信小程序（输出到 dist/）
yarn build:weapp

# H5
yarn build:h5
```

### 代码质量

```bash
yarn lint          # ESLint 检查
yarn lint:fix      # ESLint 修复 + Prettier 格式化
yarn format        # Prettier 格式化
yarn test          # 运行测试
yarn test:coverage # 运行测试 + 覆盖率报告
```

## 项目结构

```
├── src/                           # 源码目录
│   ├── app.js                     # 应用入口
│   ├── app.config.js              # 路由与页面配置
│   ├── app.scss                   # 全局样式
│   ├── components/                # 公共组件（13 个）
│   │   ├── CityPicker/            # 城市选择器
│   │   ├── DateTimePicker/        # 日期时间选择器
│   │   ├── Header/                # 轮播头部
│   │   ├── HospitalList/          # 医院列表
│   │   ├── HospitalPicker/        # 医院选择器
│   │   ├── MedicalChaperonDetail/ # 陪诊师详情
│   │   ├── MedicalChaperonList/   # 陪诊师列表
│   │   ├── MedicalChaperonPicker/ # 陪诊师选择器
│   │   ├── OrderCard/             # 订单卡片
│   │   ├── RegisterBtn/           # 注册按钮
│   │   ├── ServiceComponent/      # 服务类型展示
│   │   ├── ServiceDetail/         # 服务详情
│   │   └── VirtualList/           # 虚拟滚动列表
│   ├── custom-tab-bar/            # 自定义 TabBar
│   ├── constants/                 # 全局常量（TypeScript）
│   ├── pages/                     # 页面组件（14 个）
│   ├── store/                     # Zustand 状态管理（4 个 Store）
│   └── utils/                     # 工具函数（6 个模块）
├── docs/                          # 技术文章（7 篇）
├── config/                        # Taro 构建配置
├── __mocks__/                     # Jest mock 文件
├── .github/                       # GitHub 模板 + CI
├── jest.config.js                 # Jest 测试配置
├── tsconfig.json                  # TypeScript 配置
├── babel.config.js                # Babel 配置
├── .eslintrc                      # ESLint 配置
└── .prettierrc                    # Prettier 配置
```

## 核心功能模块

### 1. 用户认证系统

- 微信手机号授权登录 + 服务端 session（skey）
- Zustand 持久化到 Storage
- 粒度化登出（仅清除鉴权 key，不影响城市偏好等数据）
- `isLoggedIn` 派生状态（避免状态不一致）

### 2. 服务预约流程

- 多种医疗服务类型选择（陪诊、代问诊、病理会诊、代办服务、就医规划）
- 医院、城市、陪诊师选择
- 日期时间预约
- 统一支付函数（`utils/payment.js`）
- 微信订阅消息集成

### 3. 订单管理

- 订单列表（按状态筛选：待确认/已支付/已接单/进行中/已完成/已取消）
- 订单详情与操作（取消、确认、评价）

### 4. 陪诊师管理

- 分步表单注册（基本信息 → 身份认证 → 服务标签）
- 陪诊师资料编辑
- 收入查询（按月、按状态）

### 5. 数据请求模块

- 统一 API 请求封装 + 拦截器
- Token 自动添加与 401 过期处理
- 客户端缓存（可配置 TTL，稳定 key 排序）
- 文件上传功能

## 页面路由表

| 页面路径 | 功能 | 角色权限 |
|---------|------|---------|
| `pages/index/index` | 首页（轮播图/服务/医院列表） | 公开 |
| `pages/medicalChaperons/medicalChaperons` | 陪诊师预约列表 | 公开 |
| `pages/profile/profile` | 个人中心（登录入口） | 公开 |
| `pages/order/order` | 陪诊预约下单 | 需登录 |
| `pages/orderList/orderList` | 我的订单列表 | 需登录 |
| `pages/serviceDetail/serviceDetail` | 服务详情 | 公开 |
| `pages/hospitalDetail/hospitalDetail` | 医院详情 | 公开 |
| `pages/escortIncome/escortIncome` | 陪诊师收入管理 | 陪诊师 |
| `pages/chaperonEdit/chaperonEdit` | 陪诊师资料编辑 | 陪诊师 |
| `pages/register/register` | 陪诊师注册 | 需登录 |

## 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `TARO_APP_API` | 后端 API 基础地址 | `https://your-api.com` |
| `TARO_APP_COS_BASE` | COS 存储桶地址 | `https://your-bucket.cos.ap-guangzhou.myqcloud.com` |
| `TARO_APP_CLOUD_ENV` | 微信云开发环境 ID（可选） | `your-cloud-env-id` |

参考 `.env.example` 配置，开发环境配置 `.env.development`，生产环境配置 `.env.production`。

## 部署说明

### 微信小程序

1. `yarn build:weapp` 构建
2. 微信开发者工具导入 `dist/` 目录
3. 填写 AppID（`project.config.json` 中配置）
4. 上传代码

### H5

1. `yarn build:h5` 构建
2. 将 `dist/` 部署到 Web 服务器

## 技术文章

项目配套 7 篇技术深度文章，详细介绍核心技术实现：

| 文章 | 主题 |
|------|------|
| [01 - Taro 4 + React 18 实战](docs/01-taro-react18-medical-miniapp.md) | 项目搭建与技术选型 |
| [02 - 请求层最佳实践](docs/02-request-layer-best-practices.md) | 拦截器、缓存、Token 管理 |
| [03 - 微信支付封装](docs/03-wechat-payment-encapsulation.md) | 统一下单到 Promise 化 |
| [04 - 图片缓存优化](docs/04-image-cache-optimization.md) | 突破 10MB Storage 限制 |
| [05 - Zustand 实践](docs/05-zustand-miniapp-practice.md) | 小程序状态管理方案 |
| [06 - 订阅消息封装](docs/06-wechat-subscribe-message.md) | 从模板申请到用户授权 |
| [07 - 虚拟列表实现](docs/07-virtual-list-implementation.md) | 长列表性能优化 |

## 工程化规范

### 代码规范

- **ESLint**：react-hooks/rules-of-hooks (error) + react-hooks/exhaustive-deps (warn) + no-console (warn)
- **Prettier**：100 字符宽、单引号、尾逗号
- **TypeScript**：渐进式引入，已迁移 constants 和 auth

### 提交规范

- pre-commit 自动执行 lint-staged（ESLint + Prettier）
- 语义化提交信息

### 测试规范

- **测试框架**：Jest + Testing Library
- **测试文件**：`src/**/__tests__/**/*.test.js` 或 `src/**/*.test.js`
- **覆盖率**：`yarn test:coverage`

## 贡献指南

欢迎贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

## 注意事项

- 项目需要 Node.js v20 或更高版本
- `.env` 文件不提交到版本控制（已在 `.gitignore` 中排除）
- 微信小程序的 `wx.cloud` API 仅在小程序环境可用，H5 环境不可用
- 订阅消息模板 ID 需要在[微信公众平台](https://mp.weixin.qq.com)申请后替换

## License

[MIT](./LICENSE)
