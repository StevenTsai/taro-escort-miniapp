import { Cell, CellGroup, Picker } from '@nutui/nutui-react-taro';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';

import { get } from '@/utils/request';

const MedicalChaperonPicker = forwardRef(
  (
    {
      placeholder = '无指定',
      title = '陪诊师',
      city = '广州市',
      value,
      onChange,
      disabled = false,
      showIcon = true,
      cellProps = {},
      pickerProps = {},
      ...restProps
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const [selectedChaperon, setSelectedChaperon] = useState(null);
    const [selectedValue, setSelectedValue] = useState([]);
    const [chaperons, setChaperons] = useState([]);

    const convertToChaperon = useCallback(chaperon => {
      return {
        value: chaperon.id,
        label: chaperon.name,
      };
    }, []);

    useEffect(() => {
      get('/api/medicalEscorts', { city }).then(res => {
        const data = res.map(convertToChaperon);
        setChaperons([data]);
      });
    }, [city]);

    // 根据value初始化选中状态
    useEffect(() => {
      if (value && chaperons.length > 0 && chaperons[0]) {
        const chaperon = chaperons[0].find(c => c.value == value);
        if (chaperon) {
          setSelectedChaperon(chaperon);
          setSelectedValue([value]);
        }
      }
    }, [value, chaperons]);

    // 获取显示文本
    const getDisplayText = () => {
      return selectedChaperon?.label || placeholder;
    };

    const handleConfirm = (options, values) => {
      setSelectedChaperon(options[0]);
      setSelectedValue(values);
      setVisible(false);
      // 只返回陪诊师的id值
      onChange?.(values[0]);
    };

    const handleCancel = () => {
      setVisible(false);
    };

    const clearSelection = () => {
      setSelectedChaperon(null);
      setSelectedValue([]);
      // 清空时也只传递null
      if (onChange) {
        onChange(null);
      }
    };

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      clearSelection,
      openPicker: () => setVisible(true),
      closePicker: () => setVisible(false),
      getSelectedChaperon: () => selectedChaperon,
      getSelectedChaperonId: () => selectedValue[0],
    }));

    return (
      <>
        <CellGroup divider={false}>
          <Cell
            title={getDisplayText()}
            titleStyle={{
              color: selectedChaperon ? '#323233' : '#969799',
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
        <Picker
          visible={visible}
          title={title}
          options={chaperons}
          value={selectedValue}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onClose={handleCancel}
          {...pickerProps}
        />
      </>
    );
  }
);

export default MedicalChaperonPicker;
