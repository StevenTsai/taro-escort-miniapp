# Taro 4 + React 18 实战：从零搭建医疗陪诊小程序

> 本文介绍如何使用 Taro 4 + React 18 搭建一个完整的医疗陪诊小程序，涵盖技术选型、项目结构、工程化配置等核心内容。

## 前言

医疗陪诊服务近年来逐渐兴起，但相关的数字化解决方案却很少见。本文将以一个真实的商业项目为例，分享如何使用 Taro 4 + React 18 构建一个功能完整的医疗陪诊小程序。

**你将学到：**

- Taro 4 + React 18 的项目搭建
- NutUI 组件库的集成与使用
- Zustand 状态管理方案
- 完整的工程化配置（ESLint、Prettier、Husky）
- 多端编译策略

## 1. 技术栈选型

### 为什么选择 Taro？

| 需求 | Taro 优势 |
|------|----------|
| 微信小程序为主 | 原生支持，性能接近原生 |
| 未来可能扩展 H5 | 一套代码多端运行 |
| React 技术栈 | 原生支持 React，学习成本低 |
| 社区活跃 | 京东维护，文档完善 |

### 技术栈总览

```
框架：Taro 4.1.5 + React 18
UI 库：@nutui/nutui-react-taro 3.0.17
状态管理：Zustand 5.0.6
构建：Webpack 5.78.0
样式：SCSS
规范：ESLint + Prettier + Stylelint + Husky
测试：Jest + Testing Library
```

### 为什么用 JavaScript 而非 TypeScript？

这是一个务实的选择：

1. **团队熟悉度** — 团队更熟悉 JavaScript
2. **渐进式迁移** — 先用 JS 快速开发，再逐步迁移 TS
3. **已有实践** — constants 和 auth 模块已迁移至 TypeScript

```typescript
// 已迁移至 TypeScript 的模块示例
// src/utils/auth.ts
export const isLoggedIn = (): boolean => {
  const token = Taro.getStorageSync('token');
  const userInfo = Taro.getStorageSync('userInfo');
  return !!(token && userInfo);
};
```

## 2. 项目结构设计

### 目录结构

```
src/
├── pages/                # 页面目录
│   ├── index/            # 首页
│   ├── order/            # 预约下单
│   ├── orderList/        # 订单列表
│   ├── profile/          # 个人中心
│   └── ...
├── components/           # 组件目录
│   ├── Header/           # 页面头部
│   ├── CityPicker/       # 城市选择器
│   ├── DateTimePicker/   # 日期时间选择器
│   ├── HospitalPicker/   # 医院选择器
│   └── ...
├── store/                # Zustand 状态管理
│   ├── useAuthStore.js   # 认证状态
│   ├── useCityStore.js   # 城市选择
│   └── useTabBarStore.js # TabBar 状态
├── utils/                # 工具函数
│   ├── request.js        # HTTP 请求封装
│   ├── payment.js        # 支付封装
│   ├── auth.ts           # 认证工具
│   ├── imageUtils.js     # 图片工具
│   └── subscribe.js      # 订阅消息
├── constants/            # 常量定义
├── custom-tab-bar/       # 自定义 TabBar
└── app.js                # 应用入口
```

### 划分原则

1. **pages/** — 按业务功能划分，每个页面独立目录
2. **components/** — 可复用的 UI 组件，按功能命名
3. **store/** — 全局状态，按业务域划分
4. **utils/** — 纯函数工具，无业务依赖

### 自定义 TabBar 实现

使用 NutUI 的 Tabbar 组件实现自定义底部导航：

```jsx
// src/custom-tab-bar/index.jsx
import { Tabbar } from '@nutui/nutui-react-taro';
import { Home, My, Find, Wallet } from '@nutui/icons-react-taro';

const TAB_PAGES = [
  'pages/index/index',
  'pages/medicalChaperons/medicalChaperons',
  'pages/profile/profile',
];

const CustomTabBar = () => {
  const [active, setActive] = useState(0);

  return (
    <Tabbar value={active} onSwitch={setActive}>
      <Tabbar.Item icon={<Home />} text="首页" />
      <Tabbar.Item icon={<Find />} text="陪诊师预约" />
      <Tabbar.Item icon={<My />} text="个人中心" />
    </Tabbar>
  );
};
```

## 3. 工程化配置

### ESLint + Prettier

```json
// .eslintrc
{
  "extends": ["taro/react", "plugin:react-hooks/recommended"],
  "rules": {
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

```json
// .prettierrc
{
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true
}
```

### Husky + lint-staged

提交代码时自动格式化：

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{scss,css}": ["stylelint --fix"]
  }
}
```

### Jest 测试配置

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(png|jpg|jpeg|gif)$': '<rootDir>/__mocks__/fileMock.js',
  },
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
};
```

## 4. 多端编译配置

### 环境变量管理

```javascript
// config/index.js
const config = {
  env: {
    TARO_APP_API: JSON.stringify(process.env.TARO_APP_API),
    TARO_APP_COS_BASE: JSON.stringify(process.env.TARO_APP_COS_BASE),
  },
  // ...
};
```

```bash
# .env.development
TARO_APP_API=https://dev-api.example.com
TARO_APP_COS_BASE=https://dev-cos.example.com

# .env.production
TARO_APP_API=https://api.example.com
TARO_APP_COS_BASE=https://cos.example.com
```

### 编译命令

```bash
# 微信小程序开发
npm run dev:weapp

# 微信小程序构建
npm run build:weapp

# H5 开发
npm run dev:h5

# H5 构建
npm run build:h5
```

## 5. 应用入口配置

```javascript
// src/app.config.js
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/order/order',
    'pages/orderList/orderList',
    'pages/profile/profile',
    'pages/medicalChaperons/medicalChaperons',
    // ...
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '陪诊服务',
    navigationBarTextStyle: 'black',
    enableShareAppMessage: true,
    enableShareTimeline: true,
  },
  tabBar: {
    custom: true,
    list: [
      { pagePath: 'pages/index/index', text: '首页' },
      { pagePath: 'pages/medicalChaperons/medicalChaperons', text: '陪诊师预约' },
      { pagePath: 'pages/profile/profile', text: '个人中心' },
    ],
  },
});
```

## 6. 核心代码示例

### 应用入口

```javascript
// src/app.js
import { create } from 'zustand';
import useAuthStore from './store/useAuthStore';

const App = ({ children }) => {
  const initAuth = useAuthStore(s => s.initAuth);

  useEffect(() => {
    // 初始化云开发
    if (process.env.TARO_ENV === 'weapp') {
      wx.cloud.init({
        env: process.env.TARO_APP_CLOUD_ENV,
        traceUser: true,
      });
    }
    // 初始化认证状态
    initAuth();
  }, []);

  return children;
};
```

### 页面示例

```jsx
// src/pages/index/index.jsx
import { View, Swiper, SwiperItem } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import Header from '@/components/Header';
import HospitalList from '@/components/HospitalList';
import ServiceComponent from '@/components/ServiceComponent';

const Index = () => {
  const [banners, setBanners] = useState([]);

  useLoad(() => {
    // 加载轮播图数据
    loadBanners();
  });

  return (
    <View className="index">
      <Header />
      <Swiper className="banner">
        {banners.map(banner => (
          <SwiperItem key={banner.id}>
            <Image src={banner.url} mode="aspectFill" />
          </SwiperItem>
        ))}
      </Swiper>
      <ServiceComponent />
      <HospitalList />
    </View>
  );
};
```

## 7. 运行与开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev:weapp

# 运行测试
npm test

# 代码格式化
npm run format

# ESLint 检查
npm run lint
```

## 总结

本文介绍了使用 Taro 4 + React 18 搭建医疗陪诊小程序的完整方案。核心技术要点：

1. **技术栈选择** — Taro 4 + React 18 + Zustand + NutUI
2. **项目结构** — 按功能划分，清晰的模块边界
3. **工程化** — ESLint + Prettier + Husky 保证代码质量
4. **多端支持** — 一套代码支持微信小程序和 H5

## 相关文章

- [小程序请求层最佳实践：拦截器、缓存、Token 管理](./02-request-layer-best-practices.md)
- [微信小程序支付封装：统一下单到 Promise 化](./03-wechat-payment-encapsulation.md)

## 开源项目

完整代码已开源：[医疗陪诊小程序](https://github.com/StevenTsai/taro-escort-miniapp)

---

> 作者：Steven
> 原文链接：https://juejin.cn/post/xxx
