# 壹鹿康行 — 医疗陪诊微信小程序

## 项目介绍

壹鹿康行是一款面向患者和陪诊师的微信小程序，提供陪诊预约、患者管理等一站式医疗陪诊服务。通过简洁的界面和流畅的用户体验，帮助用户快速找到合适的陪诊师，管理就医记录与病程时间线。

## 技术栈

- **开发框架**：Taro v4.1.5 (支持多端编译)
- **前端框架**：React 18
- **UI 组件库**：NutUI-React-Taro v3.0.17
- **状态管理**：Zustand v5.0.6
- **构建工具**：Webpack 5.78.0（持久缓存 + Prebundle 已启用）
- **样式预处理器**：Sass
- **代码规范**：ESLint + Prettier + Stylelint
- **类型检查**：TypeScript（渐进式引入）
- **测试框架**：Jest + Testing Library
- **Git Hooks**：husky + lint-staged

## 快速开始

### 环境准备

- Node.js >= 20.0.0
- npm >= 10.0.0 或 yarn
- Taro CLI >= 4.0.0

### 安装依赖

```bash
npm install --legacy-peer-deps
```

### 开发模式

```bash
# 微信小程序开发模式
npm run dev:weapp

# H5 开发模式
npm run dev:h5

# 其他平台
npm run dev:alipay   # 支付宝小程序
npm run dev:tt       # 字节跳动小程序
```

### 构建生产版本

```bash
# 微信小程序（输出到 dist/）
npm run build:weapp

# H5
npm run build:h5
```

### 代码质量

```bash
npm run lint          # ESLint 检查
npm run lint:fix      # ESLint 修复 + Prettier 格式化
npm run format        # Prettier 格式化
npm run test          # 运行测试
npm run test:coverage # 运行测试 + 覆盖率报告
```

## 项目结构

```
├── src/                           # 源码目录
│   ├── app.js                     # 应用入口
│   ├── app.config.js              # 路由与页面配置
│   ├── app.scss                   # 全局样式
│   ├── components/                # 公共组件
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
│   │   └── index.ts               # 角色、状态、颜色、服务 ID 等
│   ├── pages/                     # 页面组件（24 个页面）
│   ├── store/                     # Zustand 状态管理
│   │   ├── useAuthStore.js        # 认证状态
│   │   ├── useCityStore.js        # 城市选择
│   │   ├── useTabBarStore.js      # TabBar 状态
│   │   └── useEscortIncomeStore.js# 陪诊师收入
│   └── utils/                     # 工具函数
│       ├── auth.ts                # 认证工具（TypeScript）
│       ├── imageUtils.js          # 图片处理 + 压缩
│       ├── payment.js             # 统一支付逻辑
│       ├── permission.js          # 权限检查
│       ├── request.js             # 网络请求（拦截器 + 缓存）
│       └── subscribe.js           # 订阅消息管理
├── config/                        # Taro 构建配置
├── __mocks__/                     # Jest mock 文件
├── .husky/pre-commit              # Git pre-commit hook
├── jest.config.js                 # Jest 测试配置
├── tsconfig.json                  # TypeScript 配置
├── babel.config.js                # Babel 配置
├── .eslintrc                      # ESLint 配置
├── .prettierrc                    # Prettier 配置
└── .gitignore                     # Git 忽略配置
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

### 3. 患者管理

- 患者信息 CRUD
- 病程时间线（治疗、检查、用药、通用事件）
- 日期范围筛选
- 事件详情与附件展示
- 问诊病历报告生成与 PDF 导出

### 4. 订单管理

- 订单列表（按状态筛选：待确认/已支付/已接单/进行中/已完成/已取消）
- 订单详情与操作（取消、确认、评价）

### 5. 陪诊师管理

- 分步表单注册（基本信息 → 身份认证 → 服务标签）
- 陪诊师资料编辑
- 收入查询（按月、按状态）

### 6. 数据请求模块

- 统一 API 请求封装 + 拦截器
- Token 自动添加与 401 过期处理
- 客户端缓存（可配置 TTL，稳定 key 排序）
- 文件上传功能

## 页面路由表

| 页面路径 | 功能 | 角色权限 |
|---------|------|---------|
| `pages/index/index` | 首页（轮播图/服务/医院列表） | 公开 |
| `pages/medicalChaperons/medicalChaperons` | 陪诊师预约列表 | 公开 |
| `pages/patientList/patientList` | 患者管理列表 | 需登录 |
| `pages/profile/profile` | 个人中心（登录入口） | 公开 |
| `pages/order/order` | 陪诊预约下单 | 需登录 |
| `pages/orderList/orderList` | 我的订单列表 | 需登录 |
| `pages/serviceDetail/serviceDetail` | 服务详情 | 公开 |
| `pages/hospitalDetail/hospitalDetail` | 医院详情 | 公开 |
| `pages/timeline/timeline` | 患者病程时间线 | 需登录 |
| `pages/reportGenerate/reportGenerate` | 问诊病历报告生成 | 需登录 |
| `pages/escortIncome/escortIncome` | 陪诊师收入管理 | 陪诊师 |
| `pages/chaperonEdit/chaperonEdit` | 陪诊师资料编辑 | 陪诊师 |
| `pages/register/register` | 陪诊师注册 | 需登录 |

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
- **覆盖率**：`npm run test:coverage`

## 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `TARO_APP_API` | API 基础地址 | `https://caxcz.xin` |
| `TARO_APP_COS_BASE` | COS 存储桶地址 | `https://xxx.cos.ap-guangzhou.myqcloud.com` |

开发环境配置 `.env.development`，生产环境配置 `.env.production`。

## 部署说明

### 微信小程序

1. `npm run build:weapp` 构建
2. 微信开发者工具导入 `dist/` 目录
3. 填写 AppID（`project.config.json` 中配置）
4. 上传代码

### H5

1. `npm run build:h5` 构建
2. 将 `dist/` 部署到 Web 服务器

## 注意事项

- 项目需要 Node.js v20 或更高版本
- 使用 `--legacy-peer-deps` 解决依赖冲突
- `.env` 文件不提交到版本控制（已在 `.gitignore` 中排除）
- 微信小程序的 `wx.cloud` API 仅在小程序环境可用，H5 环境不可用

## License

MIT
