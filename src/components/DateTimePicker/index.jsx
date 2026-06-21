import { Cell, CellGroup, DatePicker } from '@nutui/nutui-react-taro';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';

import './index.scss';

const DateTimePicker = forwardRef(
  (
    {
      placeholder = '请选择日期',
      title = '选择日期',
      type = 'date', // 'date' | 'time' | 'datetime' | 'year-month' | 'month-day'
      value,
      onChange,
      disabled = false,
      showIcon = true,
      showChinese = true,
      startDate,
      endDate,
      minuteStep = 1,
      cellProps = {},
      pickerProps = {},
      ...restProps
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || null);
    const [selectedText, setSelectedText] = useState('');

    // 根据类型设置默认的开始和结束日期
    const getDefaultStartDate = () => {
      if (startDate) return startDate;
      switch (type) {
        case 'date':
        case 'datetime':
          return new Date(1950, 0, 1);
        case 'year-month':
          return new Date(2000, 0, 1);
        default:
          return new Date();
      }
    };

    const getDefaultEndDate = () => {
      if (endDate) return endDate;
      switch (type) {
        case 'date':
        case 'datetime':
          return new Date(2050, 11, 31);
        case 'year-month':
          return new Date(2050, 11, 31);
        default:
          return new Date();
      }
    };

    // 格式化显示文本
    const formatDisplayText = useCallback(
      date => {
        if (!date) return '';

        switch (type) {
          case 'date':
            return new Date(date).toLocaleDateString('zh-CN');
          case 'datetime':
            return new Date(date).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });
          case 'time':
            // 对于时间类型，date可能是字符串格式如"14:30"
            return typeof date === 'string' ? date : '';
          case 'year-month':
            return new Date(date).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
            });
          case 'month-day':
            return new Date(date).toLocaleDateString('zh-CN', {
              month: '2-digit',
              day: '2-digit',
            });
          default:
            return new Date(date).toLocaleDateString('zh-CN');
        }
      },
      [type]
    );

    // 初始化显示文本
    useEffect(() => {
      if (value) {
        setSelectedValue(value);
        // 如果value是时间戳，转换为Date对象用于显示
        let displayValue = value;
        if (typeof value === 'number' && type !== 'time') {
          displayValue = new Date(value);
        }
        setSelectedText(formatDisplayText(displayValue));
      } else {
        setSelectedText('');
        setSelectedValue(null);
      }
    }, [value, type, formatDisplayText]);

    // 处理选择器确认事件
    const handleConfirm = (options, values) => {
      let processedValue;
      let dateObject; // 用于显示格式化

      switch (type) {
        case 'datetime': {
          const [year, month, day, hour, minute] = values;
          dateObject = new Date(year, month - 1, day, hour || 0, minute || 0);
          processedValue = dateObject.getTime(); // 返回时间戳
          break;
        }
        case 'date': {
          const [year, month, day] = values;
          dateObject = new Date(year, month - 1, day);
          processedValue = dateObject.getTime(); // 返回时间戳
          break;
        }
        case 'time': {
          const [hour, minute] = values;
          // 时间类型仍然返回字符串格式，因为时间戳需要完整日期
          processedValue = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          dateObject = processedValue; // 用于显示
          break;
        }
        case 'year-month': {
          const [year, month] = values;
          dateObject = new Date(year, month - 1, 1);
          processedValue = dateObject.getTime(); // 返回时间戳
          break;
        }
        case 'month-day': {
          const [month, day] = values;
          // 使用当前年份
          const currentYear = new Date().getFullYear();
          dateObject = new Date(currentYear, month - 1, day);
          processedValue = dateObject.getTime(); // 返回时间戳
          break;
        }
        default:
          dateObject = new Date(...values);
          processedValue = dateObject.getTime(); // 返回时间戳
      }

      const displayText = formatDisplayText(dateObject);

      setSelectedText(displayText);
      setSelectedValue(processedValue);
      setVisible(false);

      if (onChange) {
        onChange(processedValue, {
          values,
          options: {
            'zh-CN': {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            },
          },
          displayText,
          type,
          formattedValue: processedValue,
          dateObject, // 提供原始Date对象供需要时使用
        });
      }
    };

    // 处理选择器取消事件
    const handleCancel = () => {
      setVisible(false);
    };

    // 清空选择
    const clearSelection = () => {
      setSelectedText('');
      setSelectedValue(null);
      if (onChange) {
        onChange(null);
      }
    };

    // 获取当前选中的值
    const getSelectedValue = () => {
      return selectedValue;
    };

    // 获取格式化后的显示文本
    const getDisplayText = () => {
      return selectedText;
    };

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      clearSelection,
      openPicker: () => setVisible(true),
      closePicker: () => setVisible(false),
      getSelectedValue,
      getDisplayText,
      getValue: getSelectedValue, // 别名
    }));

    // 获取显示文本
    const getTitle = () => {
      return selectedText || placeholder;
    };

    // 判断是否已选择
    const hasSelection = selectedText && selectedText !== placeholder;

    return (
      <>
        {/* 触发器 - 使用Cell组件作为触发器 */}
        <CellGroup divider={false}>
          <Cell
            className='datetime-picker-cell'
            title={getTitle()}
            titleStyle={{
              color: hasSelection ? '#323233' : '#969799',
            }}
            style={{ padding: 0 }}
            isLink={showIcon && !disabled}
            clickable={!disabled}
            onClick={() => !disabled && setVisible(true)}
            {...cellProps}
            {...restProps}
          />
        </CellGroup>

        {/* 选择器 */}
        <DatePicker
          visible={visible}
          title={title}
          type={type}
          showChinese={showChinese}
          startDate={getDefaultStartDate()}
          endDate={getDefaultEndDate()}
          minuteStep={minuteStep}
          value={selectedValue ? new Date(selectedValue) : null}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onClose={handleCancel}
          {...pickerProps}
        />
      </>
    );
  }
);

DateTimePicker.displayName = 'DateTimePicker';

export default DateTimePicker;
