# Zustand 在小程序中的实践：轻量、高效、TypeScript 友好

> 本文介绍如何在小程序中使用 Zustand 进行状态管理，对比 Redux 的优劣，并分享认证状态、城市选择等实战案例。

## 前言

状态管理是前端开发的核心问题之一。在小程序环境中，状态管理有其特殊性：

- 页面生命周期复杂（onLoad、onShow、onHide）
- 跨页面通信需求频繁
- 存储容量有限（10MB）
- 需要考虑性能和包体积

本文将分享为什么选择 Zustand，以及如何在小程序中优雅地使用它。

## 1. 小程序状态管理现状

### 常见方案对比

| 方案 | 包体积 | 学习成本 | TypeScript | 生态 |
|------|--------|---------|------------|------|
| Redux | ~11KB | 高 | 好 | 丰富 |
| MobX | ~16KB | 中 | 好 | 一般 |
| Zustand | ~1KB | 低 | 原生支持 | 增长中 |
| Jotai | ~3KB | 低 | 好 | 增长中 |
| Recoil | ~15KB | 中 | 好 | Meta 维护 |

### 小程序的特殊需求

1. **无 Provider 包裹** — 小程序页面没有统一的根组件
2. **轻量化** — 包体积敏感
3. **持久化** — 部分状态需要持久化到 Storage
4. **跨页面共享** — 多个页面需要共享状态

## 2. 为什么选择 Zustand

### 核心优势

```javascript
// ✅ Zustand：极简 API
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// 使用
const Component = () => {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);
  return <Button onClick={increment}>{count}</Button>;
};
```

### 与 Redux 对比

**Redux 写法：**

```javascript
// ❌ Redux：样板代码多
// 1. 定义 action types
const INCREMENT = 'INCREMENT';

// 2. 定义 action creator
const increment = () => ({ type: INCREMENT });

// 3. 定义 reducer
const reducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case INCREMENT:
      return { count: state.count + 1 };
    default:
      return state;
  }
};

// 4. 创建 store
const store = createStore(reducer);

// 5. Provider 包裹
<Provider store={store}>
  <App />
</Provider>

// 6. 使用
const Component = () => {
  const count = useSelector((state) => state.count);
  const dispatch = useDispatch();
  return <Button onClick={() => dispatch(increment())}>{count}</Button>;
};
```

**Zustand 写法：**

```javascript
// ✅ Zustand：一步到位
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// 使用（无需 Provider）
const Component = () => {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);
  return <Button onClick={increment}>{count}</Button>;
};
```

### 体积对比

| 方案 | 压缩后体积 | Gzip 后 |
|------|-----------|---------|
| Redux + React-Redux | ~11KB | ~4KB |
| MobX | ~16KB | ~5KB |
| **Zustand** | **~1KB** | **~0.5KB** |

## 3. 实战案例

### 3.1 认证状态管理（useAuthStore）

这是最核心的 Store，管理用户登录状态：

```javascript
// src/store/useAuthStore.js
import Taro from '@tarojs/taro';
import { create } from 'zustand';
import { getCachedImage } from '@/utils/imageUtils';

// 鉴权相关的存储 key
const AUTH_KEYS = [
  'token',
  'userInfo',
  'cached_avatar',
  'cached_avatar_timestamp',
  'user_avatar',
  'user_avatar_timestamp',
];

const useAuthStore = create((set, get) => ({
  // 状态
  token: Taro.getStorageSync('token') || '',
  userInfo: Taro.getStorageSync('userInfo') || null,

  // 初始化登录状态
  initAuth: () => {
    const token = Taro.getStorageSync('token');
    let userInfo = Taro.getStorageSync('userInfo');

    // 如果用户信息存在且有头像，检查是否有缓存的头像
    if (userInfo && userInfo.avatar) {
      const cachedAvatar = getCachedImage('user_avatar');
      if (cachedAvatar) {
        userInfo.avatar = cachedAvatar;
        Taro.setStorageSync('userInfo', userInfo);
      }
    }

    set({ token, userInfo });
  },

  // 设置 token
  setToken: (token) => {
    Taro.setStorageSync('token', token);
    set({ token });
  },

  // 设置用户信息
  setUserInfo: (userInfo) => {
    Taro.setStorageSync('userInfo', userInfo);
    set({ userInfo });
  },

  // 登出 — 仅清除鉴权相关 key，不影响城市偏好等其他数据
  logout: () => {
    AUTH_KEYS.forEach((key) => {
      try {
        Taro.removeStorageSync(key);
      } catch (_e) {
        // ignore
      }
    });
    set({ token: '', userInfo: null });
  },

  // 检查是否需要登录
  checkAuth: () => {
    const { token, userInfo } = get();
    if (!token || !userInfo) {
      Taro.switchTab({ url: '/pages/profile/profile' });
      return false;
    }
    return true;
  },
}));

// 派生状态 — 始终从 token 和 userInfo 计算，避免状态不一致
export const useIsLoggedIn = () => {
  const token = useAuthStore((s) => s.token);
  const userInfo = useAuthStore((s) => s.userInfo);
  return !!(token && userInfo);
};

export default useAuthStore;
```

**设计要点：**

1. **持久化同步** — 状态变更时同步写入 Storage
2. **派生状态** — `useIsLoggedIn` 从 token 和 userInfo 计算，避免状态不一致
3. **精准清除** — 登出时只清除鉴权相关 key，不影响其他数据
4. **初始化** — 应用启动时从 Storage 恢复状态

### 使用示例

```jsx
// 页面中使用
const ProfilePage = () => {
  const userInfo = useAuthStore((s) => s.userInfo);
  const logout = useAuthStore((s) => s.logout);
  const isLoggedIn = useIsLoggedIn();

  if (!isLoggedIn) {
    return <LoginButton />;
  }

  return (
    <View>
      <Image src={userInfo.avatar} />
      <Text>{userInfo.nickName}</Text>
      <Button onClick={logout}>退出登录</Button>
    </View>
  );
};

// 在 app.js 中初始化
const App = ({ children }) => {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, []);

  return children;
};
```

### 3.2 城市选择状态（useCityStore）

```javascript
// src/store/useCityStore.js
import Taro from '@tarojs/taro';
import { create } from 'zustand';

const useCityStore = create((set) => ({
  // 当前选择的城市
  currentCity: Taro.getStorageSync('currentCity') || {
    id: 1,
    name: '北京',
  },

  // 城市列表
  cityList: [],

  // 设置当前城市
  setCurrentCity: (city) => {
    Taro.setStorageSync('currentCity', city);
    set({ currentCity: city });
  },

  // 设置城市列表
  setCityList: (list) => {
    set({ cityList: list });
  },
}));

export default useCityStore;
```

**使用场景：**

- 首页选择城市
- 医院列表按城市筛选
- 陪诊师列表按城市筛选

### 3.3 TabBar 状态（useTabBarStore）

```javascript
// src/store/useTabBarStore.js
import { create } from 'zustand';

const useTabBarStore = create((set) => ({
  // 当前激活的 Tab
  activeTab: 0,

  // 设置激活的 Tab
  setActiveTab: (index) => {
    set({ activeTab: index });
  },
}));

export default useTabBarStore;
```

**使用场景：**

- 自定义 TabBar 状态同步
- 页面切换时保持 Tab 状态

## 4. 设计模式

### Store 拆分原则

```
✅ 按业务域拆分
├── useAuthStore.js      # 认证相关
├── useCityStore.js      # 城市选择
├── useTabBarStore.js    # TabBar 状态
└── useEscortIncomeStore.js  # 收入相关

❌ 不推荐：按数据类型拆分
├── useUserStore.js      # 用户数据（太大）
├── useUISotre.js        # UI 状态（太杂）
└── useDataStore.js      # 业务数据（太乱）
```

### 派生状态的使用

```javascript
// ✅ 推荐：派生状态
export const useIsLoggedIn = () => {
  const token = useAuthStore((s) => s.token);
  const userInfo = useAuthStore((s) => s.userInfo);
  return !!(token && userInfo);
};

// ❌ 不推荐：在 Store 中存储派生状态
const useAuthStore = create((set) => ({
  token: '',
  userInfo: null,
  isLoggedIn: false, // ❌ 可能与 token、userInfo 不同步
}));
```

### 持久化策略

```javascript
// 需要持久化的数据
const PERSIST_KEYS = ['token', 'userInfo', 'currentCity'];

// 不需要持久化的数据
const TEMP_KEYS = ['activeTab', 'loading', 'error'];
```

**判断标准：**

- **需要持久化** — 用户偏好、登录状态、选择的城市
- **不需要持久化** — 临时状态、加载状态、错误信息

## 5. TypeScript 支持

Zustand 原生支持 TypeScript：

```typescript
import { create } from 'zustand';

interface AuthState {
  token: string;
  userInfo: UserInfo | null;
  setToken: (token: string) => void;
  setUserInfo: (userInfo: UserInfo) => void;
  logout: () => void;
}

interface UserInfo {
  id: number;
  nickName: string;
  avatar: string;
}

const useAuthStore = create<AuthState>((set) => ({
  token: '',
  userInfo: null,
  setToken: (token) => set({ token }),
  setUserInfo: (userInfo) => set({ userInfo }),
  logout: () => set({ token: '', userInfo: null }),
}));
```

**TypeScript 优势：**

- 自动类型推导
- 编译时检查
- IDE 智能提示

## 6. 性能优化

### 选择性订阅

```javascript
// ✅ 推荐：只订阅需要的字段
const Component = () => {
  const token = useAuthStore((s) => s.token);
  // 只有 token 变化时才会重渲染
};

// ❌ 不推荐：订阅整个 Store
const Component = () => {
  const store = useAuthStore();
  // 任何字段变化都会重渲染
};
```

### 避免不必要的重渲染

```javascript
// ✅ 使用 shallow 比较
import { shallow } from 'zustand/shallow';

const Component = () => {
  const { token, userInfo } = useAuthStore(
    (s) => ({ token: s.token, userInfo: s.userInfo }),
    shallow
  );
};

// ✅ 使用选择器函数
const Component = () => {
  const token = useAuthStore((s) => s.token);
  const userInfo = useAuthStore((s) => s.userInfo);
};
```

## 7. 与 Redux 对比

| 维度 | Redux | Zustand |
|------|-------|---------|
| 代码量 | 多（action、reducer、selector） | 少（一个 create） |
| 学习成本 | 高（概念多） | 低（API 简单） |
| 包体积 | ~11KB | ~1KB |
| TypeScript | 需要额外配置 | 原生支持 |
| DevTools | 完善 | 有插件 |
| 中间件 | 丰富 | 支持 |
| Provider | 需要 | 不需要 |

### 代码量对比

**Redux 实现登录状态：**

```javascript
// 1. action types
const SET_TOKEN = 'SET_TOKEN';
const SET_USER_INFO = 'SET_USER_INFO';
const LOGOUT = 'LOGOUT';

// 2. action creators
export const setToken = (token) => ({ type: SET_TOKEN, payload: token });
export const setUserInfo = (info) => ({ type: SET_USER_INFO, payload: info });
export const logout = () => ({ type: LOGOUT });

// 3. reducer
const initialState = { token: '', userInfo: null };
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TOKEN:
      return { ...state, token: action.payload };
    case SET_USER_INFO:
      return { ...state, userInfo: action.payload };
    case LOGOUT:
      return { ...state, token: '', userInfo: null };
    default:
      return state;
  }
};

// 4. selector
export const selectToken = (state) => state.auth.token;
export const selectUserInfo = (state) => state.auth.userInfo;
export const selectIsLoggedIn = (state) => !!(state.auth.token && state.auth.userInfo);
```

**Zustand 实现同样功能：**

```javascript
// 一个文件搞定
const useAuthStore = create((set) => ({
  token: '',
  userInfo: null,
  setToken: (token) => set({ token }),
  setUserInfo: (userInfo) => set({ userInfo }),
  logout: () => set({ token: '', userInfo: null }),
}));

export const useIsLoggedIn = () => {
  const token = useAuthStore((s) => s.token);
  const userInfo = useAuthStore((s) => s.userInfo);
  return !!(token && userInfo);
};
```

## 8. 总结

Zustand 在小程序中的优势：

1. **极简 API** — 学习成本低，代码量少
2. **轻量化** — ~1KB，适合小程序环境
3. **无需 Provider** — 小程序友好
4. **TypeScript 友好** — 原生支持类型推导
5. **持久化简单** — 手动同步 Storage 即可

适用场景：
- 中小型项目的状态管理
- 需要轻量级方案的场景
- TypeScript 项目

不适用场景：
- 需要复杂中间件的大型项目
- 需要时间旅行调试的场景

## 相关文章

- [Taro 4 + React 18 实战：从零搭建医疗陪诊小程序](./01-taro-react18-medical-miniapp.md)
- [小程序请求层最佳实践：拦截器、缓存、Token 管理](./02-request-layer-best-practices.md)

## 开源项目

完整代码已开源：[医疗陪诊小程序](https://github.com/StevenTsai/taro-escort-miniapp)

---

> 作者：Steven
> 原文链接：https://juejin.cn/post/xxx
