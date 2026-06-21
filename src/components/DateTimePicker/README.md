# DateTimePicker 日期时间选择器

一个基于 NutUI DatePicker 组件封装的日期时间选择器，支持多种类型的日期时间选择，与表单完全集成。

## 功能特性

- 🕒 支持多种选择类型：date、time、datetime、year-month、month-day
- 🌍 自动中文本地化显示
- 📱 响应式设计，适配小程序和H5
- ✨ 与表单组件完全集成
- 🎯 支持清空选择和获取值
- 📅 可自定义日期范围限制
- 💾 提供完整的选择状态管理

## 基础用法

```jsx
import { useRef } from 'react';
import { Form } from '@nutui/nutui-react-taro';
import DateTimePicker from '@/components/DateTimePicker';

function MyComponent() {
  const dateTimePickerRef = useRef();

  const handleDateTimeChange = (value, info) => {
    console.log('选择的日期时间:', value, info);
  };

  return (
    <Form.Item label='服务日期' name='serviceDate'>
      <DateTimePicker
        ref={dateTimePickerRef}
        type='datetime'
        placeholder='请选择服务日期时间'
        title='选择服务日期时间'
        startDate={new Date()}
        onChange={handleDateTimeChange}
      />
    </Form.Item>
  );
}
```

## Props

| 参数        | 说明                           | 类型                                                            | 默认值           |
| ----------- | ------------------------------ | --------------------------------------------------------------- | ---------------- |
| type        | 选择器类型                     | `'date' \| 'time' \| 'datetime' \| 'year-month' \| 'month-day'` | `'date'`         |
| value       | 当前选中的值                   | `number \| string \| null`                                      | -                |
| placeholder | 占位符文本                     | `string`                                                        | `'请选择日期'`   |
| title       | 选择器标题                     | `string`                                                        | `'选择日期'`     |
| disabled    | 是否禁用                       | `boolean`                                                       | `false`          |
| showIcon    | 是否显示箭头图标               | `boolean`                                                       | `true`           |
| showChinese | 是否显示中文                   | `boolean`                                                       | `true`           |
| startDate   | 开始日期                       | `Date`                                                          | 根据类型自动设置 |
| endDate     | 结束日期                       | `Date`                                                          | 根据类型自动设置 |
| minuteStep  | 分钟步长                       | `number`                                                        | `1`              |
| onChange    | 选择时的回调                   | `(value: number \| string, info: object) => void`               | -                |
| cellProps   | 传递给Cell组件的额外属性       | `object`                                                        | `{}`             |
| pickerProps | 传递给DatePicker组件的额外属性 | `object`                                                        | `{}`             |

## Ref 方法

通过ref可以调用以下方法：

| 方法名               | 说明                     | 返回值                   |
| -------------------- | ------------------------ | ------------------------ |
| `getSelectedValue()` | 获取当前选中的值         | `Date \| string \| null` |
| `getDisplayText()`   | 获取当前显示的文本       | `string`                 |
| `getValue()`         | 获取当前选中的值（别名） | `Date \| string \| null` |
| `clearSelection()`   | 清空当前选择             | `void`                   |
| `openPicker()`       | 打开选择器               | `void`                   |
| `closePicker()`      | 关闭选择器               | `void`                   |

## 选择器类型详解

### 1. 日期选择器 (date)

选择年月日，返回 Date 对象。

```jsx
<DateTimePicker
  type='date'
  placeholder='请选择日期'
  title='选择日期'
  startDate={new Date(1950, 0, 1)}
  endDate={new Date()}
  onChange={value => {
    console.log('选择的日期:', value); // Date 对象
  }}
/>
```

**显示格式**: `2024/12/25`

### 2. 时间选择器 (time)

选择小时和分钟，返回时间字符串。

```jsx
<DateTimePicker
  type='time'
  placeholder='请选择时间'
  title='选择时间'
  minuteStep={5}
  onChange={value => {
    console.log('选择的时间:', value); // "14:30"
  }}
/>
```

**显示格式**: `14:30`

### 3. 日期时间选择器 (datetime)

选择年月日时分，返回 Date 对象。

```jsx
<DateTimePicker
  type='datetime'
  placeholder='请选择日期时间'
  title='选择日期时间'
  startDate={new Date()}
  onChange={value => {
    console.log('选择的日期时间:', value); // Date 对象
  }}
/>
```

**显示格式**: `2024/12/25 14:30`

### 4. 年月选择器 (year-month)

选择年份和月份，返回 Date 对象（日期为1号）。

```jsx
<DateTimePicker
  type='year-month'
  placeholder='请选择年月'
  title='选择年月'
  startDate={new Date(2020, 0, 1)}
  endDate={new Date(2030, 11, 31)}
  onChange={value => {
    console.log('选择的年月:', value); // Date 对象
  }}
/>
```

**显示格式**: `2024/12`

### 5. 月日选择器 (month-day)

选择月份和日期，返回 Date 对象（使用当前年份）。

```jsx
<DateTimePicker
  type='month-day'
  placeholder='请选择月日'
  title='选择月日'
  onChange={value => {
    console.log('选择的月日:', value); // Date 对象
  }}
/>
```

**显示格式**: `12/25`

## 在表单中使用

### 基本用法

```jsx
import { Form, Button } from '@nutui/nutui-react-taro';
import { useRef } from 'react';

function OrderForm() {
  const [form] = Form.useForm();
  const dateTimePickerRef = useRef();

  const handleSubmit = values => {
    console.log('表单数据:', values);
    const selectedDateTime = dateTimePickerRef.current?.getSelectedValue();
    console.log('选中的日期时间:', selectedDateTime);
  };

  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item
        label='服务日期时间'
        name='serviceDateTime'
        rules={[{ required: true, message: '请选择服务日期时间' }]}
      >
        <DateTimePicker
          ref={dateTimePickerRef}
          type='datetime'
          startDate={new Date()}
          onChange={value => {
            // 更新表单字段值
            form.setFieldsValue({ serviceDateTime: value });
          }}
        />
      </Form.Item>

      <Button nativeType='submit'>提交</Button>
    </Form>
  );
}
```

### 复杂表单示例

```jsx
function ComplexForm() {
  const [form] = Form.useForm();
  const birthDateRef = useRef();
  const appointmentTimeRef = useRef();
  const serviceDateTimeRef = useRef();

  const handleSubmit = values => {
    const submitData = {
      ...values,
      // 获取组件的实际值
      birthDate: birthDateRef.current?.getSelectedValue(),
      appointmentTime: appointmentTimeRef.current?.getSelectedValue(),
      serviceDateTime: serviceDateTimeRef.current?.getSelectedValue(),
    };

    console.log('提交数据:', submitData);
  };

  return (
    <Form form={form} onFinish={handleSubmit}>
      {/* 日期选择 */}
      <Form.Item label='出生日期' name='birthDate'>
        <DateTimePicker
          ref={birthDateRef}
          type='date'
          placeholder='请选择出生日期'
          startDate={new Date(1950, 0, 1)}
          endDate={new Date()}
          onChange={value => form.setFieldsValue({ birthDate: value })}
        />
      </Form.Item>

      {/* 时间选择 */}
      <Form.Item label='预约时间' name='appointmentTime'>
        <DateTimePicker
          ref={appointmentTimeRef}
          type='time'
          placeholder='请选择预约时间'
          onChange={value => form.setFieldsValue({ appointmentTime: value })}
        />
      </Form.Item>

      {/* 日期时间选择 */}
      <Form.Item label='服务日期时间' name='serviceDateTime'>
        <DateTimePicker
          ref={serviceDateTimeRef}
          type='datetime'
          placeholder='请选择服务日期时间'
          startDate={new Date()}
          onChange={value => form.setFieldsValue({ serviceDateTime: value })}
        />
      </Form.Item>

      <Button nativeType='submit'>提交</Button>
    </Form>
  );
}
```

## 高级用法

### 自定义样式

```jsx
<DateTimePicker
  type='date'
  cellProps={{
    style: { backgroundColor: '#f5f5f5' },
    className: 'custom-date-cell',
  }}
  pickerProps={{
    style: { zIndex: 2000 },
  }}
/>
```

### 动态设置日期范围

```jsx
function DynamicRangeExample() {
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(2025, 11, 31),
  });

  return (
    <DateTimePicker
      type='datetime'
      startDate={dateRange.start}
      endDate={dateRange.end}
      onChange={value => {
        console.log('选择的日期:', value);
        // 可以根据选择的值动态调整范围
      }}
    />
  );
}
```

### 禁用状态

```jsx
<DateTimePicker type='date' disabled={true} placeholder='已禁用' />
```

## onChange 回调参数

onChange 回调函数会接收两个参数：

```jsx
onChange={(value, info) => {
  console.log('选中的值:', value);
  console.log('额外信息:', info);
  // info 包含：
  // - values: 选择器返回的原始值数组
  // - options: 选择器选项
  // - displayText: 格式化后的显示文本
  // - type: 选择器类型
  // - formattedValue: 处理后的值（与 value 相同）
}}
```

## 注意事项

1. **时间类型返回字符串**: `type='time'` 返回 "HH:MM" 格式的字符串，其他类型返回 Date 对象
2. **月份从0开始**: JavaScript Date 对象的月份从0开始，但显示时会自动处理
3. **表单集成**: 建议在 onChange 中同时更新表单字段值
4. **日期范围**: 默认的日期范围根据类型自动设置，可通过 startDate 和 endDate 自定义
5. **性能优化**: 组件内部已做优化，避免不必要的重渲染

## 故障排除

### Q: 表单提交时获取不到日期值？

A: 确保在 onChange 中调用 `form.setFieldsValue()` 更新表单字段。

### Q: 如何获取组件当前选中的值？

A: 使用 ref 调用 `getSelectedValue()` 方法。

### Q: 如何自定义日期显示格式？

A: 组件内部已处理中文本地化，如需自定义可修改 `formatDisplayText` 函数。

### Q: 时间选择器返回的格式是什么？

A: 时间选择器返回 "HH:MM" 格式的字符串，如 "14:30"。
