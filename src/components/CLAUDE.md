[根目录](../../CLAUDE.md) > [src](../) > **components**

# Components 模块 — UI 组件库

## 模块职责

包含所有可复用的 UI 组件，分为业务组件和通用组件两类。

## 组件分类

### 业务组件

| 组件 | 路径 | 职责 |
|------|------|------|
| Header | `Header/index.jsx` | 首页顶部横幅/轮播图 |
| ServiceComponent | `ServiceComponent/index.jsx` | 首页服务列表展示 |
| OrderCard | `OrderCard/OrderCard.jsx` | 订单卡片（含状态/操作） |
| ServiceDetail | `ServiceDetail/` | 服务详情（内容/目标/退款说明/步骤） |
| HospitalList | `HospitalList/` | 医院列表卡片 |
| HospitalCard | `HospitalList/HospitalCard.jsx` | 单个医院卡片 |
| MedicalChaperonList | `MedicalChaperonList/` | 陪诊师列表 |
| MedicalChaperonCard | `MedicalChaperonList/MedicalChaperonCard.jsx` | 单个陪诊师卡片 |
| MedicalChaperonDetail | `MedicalChaperonDetail/index.jsx` | 陪诊师详情 |
| RegisterBtn | `RegisterBtn/RegisterBtn.jsx` | 陪诊师注册按钮 |
| Order | `Order.jsx` | 订单组件（旧版） |

### 通用选择器组件

| 组件 | 路径 | 职责 |
|------|------|------|
| CityPicker | `CityPicker/index.jsx` | 城市选择器 |
| DateTimePicker | `DateTimePicker/index.jsx` | 日期时间选择器 |
| HospitalPicker | `HospitalPicker/index.jsx` | 医院选择器 |
| MedicalChaperonPicker | `MedicalChaperonPicker/index.jsx` | 陪诊师选择器 |
| VirtualList | `VirtualList/index.jsx` | 虚拟滚动列表 |

## 测试覆盖

- `__tests__/constants.test.js` — 常量测试
- `__tests__/Header.test.js` — Header 组件测试
- `__tests__/ServiceComponent.test.js` — 服务组件测试

## 缺口

- 大部分业务组件缺测试

## 注意事项

- 文件名注意：`MedicalChaperonList/ MedicalChaperonCard.jsx` 文件名前有空格
- 组件样式文件与组件同目录，使用 SCSS
