# HospitalPicker 医院选择器

一个基于NutUI Picker的医院选择器组件，通过API接口动态获取医院数据。

## 功能特性

- 🏥 支持医院列表选择
- 🌏 基于城市筛选医院
- 📱 移动端友好的界面
- 🔄 从API接口动态获取数据
- ⚠️ 完善的错误处理和重试机制
- 💾 支持表单集成
- 🎯 支持ref访问组件方法

## API接口

组件会调用 `/api/hospitals/` 接口获取医院数据，请求参数：

```javascript
GET /api/hospitals/
Query Parameters:
{
  city: "广州市"  // 城市名称
}
```

**期望的API响应格式：**

```javascript
[
  {
    id: 1, // 医院ID
    name: '广州市第一人民医院', // 医院名称
    level: '三甲', // 医院等级
    address: '广州市越秀区盘福路1号', // 医院地址
  },
  // ... 更多医院数据
];
```

## 基本用法

```jsx
import HospitalPicker from '@/components/HospitalPicker';

function MyComponent() {
  const hospitalPickerRef = useRef();

  const handleHospitalChange = (hospitalId, info) => {
    console.log('选择的医院:', { hospitalId, info });
  };

  return (
    <HospitalPicker
      ref={hospitalPickerRef}
      placeholder='请选择医院'
      title='选择医院'
      city='广州市'
      onChange={handleHospitalChange}
    />
  );
}
```

## 在表单中使用

```jsx
import { Form } from '@nutui/nutui-react-taro';
import HospitalPicker from '@/components/HospitalPicker';

function OrderForm() {
  const [form] = Form.useForm();
  const hospitalPickerRef = useRef();

  const handleHospitalChange = (hospitalId, info) => {
    // 更新表单字段值
    form.setFieldsValue({ hospitalId: hospitalId });
  };

  return (
    <Form form={form}>
      <Form.Item
        label='就诊医院'
        name='hospitalId'
        rules={[{ required: true, message: '请选择就诊医院' }]}
      >
        <HospitalPicker
          ref={hospitalPickerRef}
          placeholder='请选择就诊医院'
          title='选择就诊医院'
          city='广州市'
          onChange={handleHospitalChange}
        />
      </Form.Item>
    </Form>
  );
}
```

## API

### Props

| 参数        | 说明                   | 类型                       | 默认值       |
| ----------- | ---------------------- | -------------------------- | ------------ |
| placeholder | 占位符文本             | string                     | '请选择医院' |
| title       | 选择器标题             | string                     | '选择医院'   |
| city        | 城市名称，用于筛选医院 | string                     | '广州市'     |
| value       | 选中的医院ID           | string \| number           | -            |
| onChange    | 选择变化回调           | (hospitalId, info) => void | -            |
| disabled    | 是否禁用               | boolean                    | false        |
| showIcon    | 是否显示箭头图标       | boolean                    | true         |
| cellProps   | Cell组件的额外属性     | object                     | {}           |
| pickerProps | Picker组件的额外属性   | object                     | {}           |

### onChange 回调参数

```javascript
onChange(hospitalId, info);
```

- `hospitalId`: 选中的医院ID
- `info`: 详细信息对象
  - `hospital`: 选中的医院完整信息
  - `hospitalId`: 医院ID
  - `hospitalName`: 医院名称
  - `values`: 选择器返回的值数组
  - `options`: 选择器返回的选项数组

### Ref 方法

```javascript
const hospitalPickerRef = useRef();

// 清空选择
hospitalPickerRef.current.clearSelection();

// 打开选择器
hospitalPickerRef.current.openPicker();

// 关闭选择器
hospitalPickerRef.current.closePicker();

// 获取选中的医院信息
const hospital = hospitalPickerRef.current.getSelectedHospital();

// 获取选中的医院ID
const hospitalId = hospitalPickerRef.current.getSelectedHospitalId();

// 获取选中的值数组
const values = hospitalPickerRef.current.getSelectedValue();

// 手动刷新医院数据（新增）
hospitalPickerRef.current.refresh();
```

## 数据格式

医院数据应包含以下字段：

```javascript
{
  id: 1,                              // 医院ID
  name: '广州市第一人民医院',           // 医院名称
  level: '三甲',                      // 医院等级
  address: '广州市越秀区盘福路1号'      // 医院地址
}
```

## 错误处理

组件内置了完善的错误处理机制：

1. **加载状态**：数据获取过程中显示"加载中..."
2. **错误状态**：API调用失败时显示"加载失败，点击重试"
3. **重试机制**：点击错误状态的Cell可以重新获取数据
4. **手动刷新**：通过ref的`refresh()`方法可以手动刷新数据

## 状态显示

- **正常状态**：显示选中的医院名称或占位符（灰色文字）
- **选中状态**：显示医院名称（黑色文字）
- **加载状态**：显示"加载中..."（灰色文字）
- **错误状态**：显示"加载失败，点击重试"（红色文字）

## 自定义样式

组件支持通过CSS类名进行样式自定义：

```scss
.hospital-picker {
  .hospital-option {
    // 医院选项样式
  }

  .hospital-name {
    // 医院名称样式
  }

  .hospital-level {
    // 医院等级样式
  }

  .hospital-address {
    // 医院地址样式
  }
}
```

## 注意事项

1. 需要确保项目中已安装并配置了 `@nutui/nutui-react-taro`
2. 需要确保 `/api/hospitals/` 接口返回正确格式的数据
3. 组件会根据传入的城市参数自动调用API获取医院列表
4. 当城市参数变化时，会自动重新获取医院数据
5. 建议在API接口中实现适当的错误处理和数据验证
6. 如果API响应时间较长，用户会看到加载状态提示
