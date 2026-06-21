# CityPicker 城市选择器

基于 NutUI Taro 的 Picker 组件封装的简洁城市选择器，支持自动定位和默认城市设置。

## 特性

- 🎯 **简洁设计** - 代码简洁，易于维护和扩展
- 🌐 **API 数据源** - 从 `/api/hospitals/cities` 接口获取最新城市数据
- 📍 **智能默认值** - 自动定位或默认显示广州市
- 🔒 **权限处理** - 自动处理定位权限，失败时优雅降级
- ⏱️ **频率控制** - 避免定位API频率限制问题
- 📱 **响应式触发器** - 使用 Cell 组件作为触发器
- 📝 **表单集成** - 完美支持 NutUI Form 组件

## 基础用法

```jsx
import CityPicker from '@/components/CityPicker';

function App() {
  const handleChange = (city, result) => {
    console.log('选中的城市:', city); // '北京市'
    console.log('是否自动定位:', result.isAutoLocation); // true/false
  };

  return <CityPicker placeholder='请选择城市' onChange={handleChange} />;
}
```

## 表单中使用

```jsx
import { Form } from '@nutui/nutui-react-taro';
import CityPicker from '@/components/CityPicker';

function FormExample() {
  const handleFinish = values => {
    console.log('表单数据:', values);
    // values.city 将是选中的城市名
  };

  return (
    <Form onFinish={handleFinish}>
      <Form.Item label='城市' name='city' rules={[{ required: true, message: '请选择城市' }]}>
        <CityPicker placeholder='请选择城市' />
      </Form.Item>
      <Button formType='submit'>提交</Button>
    </Form>
  );
}
```

## 设置初始值

```jsx
<CityPicker
  placeholder='请选择城市'
  value='北京市' // 设置初始城市
  onChange={(city, result) => {
    console.log('当前选择:', city);
  }}
/>
```

## 自定义样式

```jsx
<CityPicker
  placeholder='请选择城市'
  title='选择所在城市'
  cellProps={{
    style: {
      backgroundColor: '#f7f8fa',
      borderRadius: '8px',
      padding: '12px',
    },
  }}
  pickerProps={
    {
      // Picker 组件的其他属性
    }
  }
/>
```

## 使用 Ref 方法

```jsx
import { useRef } from 'react';

function RefExample() {
  const cityPickerRef = useRef();

  const handleClear = () => {
    cityPickerRef.current?.clearSelection();
  };

  const handleOpen = () => {
    cityPickerRef.current?.openPicker();
  };

  const handleGetValue = () => {
    const value = cityPickerRef.current?.getSelectedValue();
    console.log('当前选中:', value);
  };

  const handleRefresh = () => {
    cityPickerRef.current?.refreshCities();
  };

  return (
    <>
      <CityPicker ref={cityPickerRef} placeholder='请选择城市' />
      <Button onClick={handleClear}>清空选择</Button>
      <Button onClick={handleOpen}>打开选择器</Button>
      <Button onClick={handleGetValue}>获取当前值</Button>
      <Button onClick={handleRefresh}>刷新城市数据</Button>
    </>
  );
}
```

## API

### Props

| 参数        | 说明                     | 类型                                           | 默认值         |
| ----------- | ------------------------ | ---------------------------------------------- | -------------- |
| placeholder | 占位符文本               | `string`                                       | `'请选择城市'` |
| title       | 选择器标题               | `string`                                       | `'选择城市'`   |
| value       | 当前选中的城市           | `string`                                       | -              |
| onChange    | 选择时的回调函数         | `(city: string, result: ResultObject) => void` | -              |
| disabled    | 是否禁用                 | `boolean`                                      | `false`        |
| showIcon    | 是否显示右侧箭头图标     | `boolean`                                      | `true`         |
| cellProps   | 传递给 Cell 组件的属性   | `object`                                       | `{}`           |
| pickerProps | 传递给 Picker 组件的属性 | `object`                                       | `{}`           |

### onChange 回调参数

onChange 函数接收两个参数：

#### 第一个参数：city（城市名）

- 类型：`string`
- 说明：选中的城市名称
- 示例：`'北京市'`

#### 第二个参数：result（结果对象）

- 类型：`ResultObject`
- 说明：包含选择信息的对象

```typescript
interface ResultObject {
  value: string; // 城市名，如: '北京市'
  text: string; // 城市名，如: '北京市'
  isAutoLocation: boolean; // 是否为自动定位结果
}
```

### Ref 方法

| 方法名           | 说明             | 参数 | 返回值          |
| ---------------- | ---------------- | ---- | --------------- |
| clearSelection   | 清空当前选择     | -    | `void`          |
| openPicker       | 打开选择器       | -    | `void`          |
| closePicker      | 关闭选择器       | -    | `void`          |
| getSelectedValue | 获取当前选中的值 | -    | `string`        |
| refreshCities    | 手动刷新城市数据 | -    | `Promise<void>` |

## 城市数据说明

### API 响应格式

组件从 `/api/hospitals/cities` 接口获取城市数据：

```json
{
  "code": 200,
  "msg": null,
  "data": ["上海市", "北京市", "广州市", "济南市"]
}
```

### 自动定位逻辑

1. **权限检查**：检查用户是否授权位置信息
2. **频率控制**：30秒内不重复请求定位，避免频率限制
3. **默认降级**：定位失败时自动使用"广州市"作为默认值
4. **匹配策略**：支持模糊匹配定位城市与列表中的城市

## 权限配置

在 `src/app.config.js` 中添加以下配置：

```javascript
export default defineAppConfig({
  // ... 其他配置
  permission: {
    'scope.userLocation': {
      desc: '您的位置信息将用于为您提供更准确的服务',
    },
  },
  requiredPrivateInfos: ['getLocation', 'chooseLocation'],
});
```

## 注意事项

1. **表单集成**：在 Form.Item 中使用时，会自动将选中的城市名绑定到表单字段
2. **初始值格式**：value 属性传入城市名字符串，如 `'北京市'`
3. **定位权限**：组件会自动处理定位权限，用户拒绝时使用默认城市
4. **频率限制**：内置30秒防抖机制，避免微信小程序定位API频率限制
5. **网络依赖**：组件依赖网络请求获取城市数据，请确保网络连接正常
6. **默认城市**：当没有传入初始值且定位失败时，默认显示"广州市"

## 错误处理

组件内置了完善的错误处理机制：

- **网络错误**：API请求失败时会在控制台输出错误信息
- **定位错误**：定位失败时自动降级使用默认城市
- **权限错误**：用户拒绝定位权限时使用默认城市
- **频率限制**：遇到定位频率限制时会跳过定位尝试

## 与原生 Picker 对比

| 特性     | CityPicker          | 原生 Picker                |
| -------- | ------------------- | -------------------------- |
| 状态管理 | ✅ 自动管理         | ❌ 需手动管理 visible 状态 |
| 触发器   | ✅ 内置 Cell 触发器 | ❌ 需自行实现              |
| 城市数据 | ✅ API 动态获取     | ❌ 需自行准备              |
| 自动定位 | ✅ 内置定位功能     | ❌ 需自行实现              |
| 表单集成 | ✅ 开箱即用         | ❌ 需额外处理              |
| 错误处理 | ✅ 完善的错误处理   | ❌ 需自行处理              |
| Ref 方法 | ✅ 丰富的控制方法   | ❌ 控制能力有限            |
