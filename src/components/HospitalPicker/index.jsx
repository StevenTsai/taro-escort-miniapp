import { Cell, CellGroup, Picker } from '@nutui/nutui-react-taro';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';

import { get } from '@/utils/request';

const HospitalPicker = forwardRef(
  (
    {
      placeholder = '请选择医院',
      title = '选择医院',
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
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [selectedValue, setSelectedValue] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const convertToHospital = useCallback(hospital => {
      return {
        value: hospital.id,
        label: hospital.name,
        level: hospital.level,
        address: hospital.address,
      };
    }, []);

    // 获取医院数据
    const fetchHospitals = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        // 调用真实API接口
        const response = await get('/api/hospitals/', { city });

        if (response && Array.isArray(response)) {
          const data = response.map(convertToHospital);
          setHospitals([data]);
        } else {
          setError('医院数据格式错误');
          setHospitals([]);
        }
      } catch (err) {
        console.error('获取医院数据失败:', err);
        setError(err.message || '获取医院数据失败');
        setHospitals([]);
      } finally {
        setLoading(false);
      }
    }, [city, convertToHospital]);

    useEffect(() => {
      if (city) {
        fetchHospitals();
      }
    }, [city, fetchHospitals]);

    // 根据value初始化选中状态
    useEffect(() => {
      if (value && hospitals.length > 0 && hospitals[0]) {
        const hospital = hospitals[0].find(h => h.value == value);
        if (hospital) {
          setSelectedHospital(hospital);
          setSelectedValue([value]);
        }
      }
    }, [value, hospitals]);

    // 获取显示文本
    const getDisplayText = () => {
      if (loading) return '加载中...';
      if (error) return '加载失败，点击重试';
      return selectedHospital?.label || placeholder;
    };

    const handleConfirm = (options, values) => {
      const selectedOption = options[0];
      setSelectedHospital(selectedOption);
      setSelectedValue(values);
      setVisible(false);

      // 调用onChange回调，传递医院ID和完整医院信息
      if (onChange) {
        onChange(values[0], {
          hospital: selectedOption,
          hospitalId: values[0],
          hospitalName: selectedOption.label,
          values,
          options,
        });
      }
    };

    const handleCancel = () => {
      setVisible(false);
    };

    const clearSelection = () => {
      setSelectedHospital(null);
      setSelectedValue([]);
      if (onChange) {
        onChange(null);
      }
    };

    // 重试获取数据
    const handleRetry = () => {
      if (error) {
        fetchHospitals();
      }
    };

    // 处理点击事件
    const handleCellClick = () => {
      if (disabled) return;

      if (error) {
        handleRetry();
      } else if (!loading) {
        setVisible(true);
      }
    };

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      clearSelection,
      openPicker: () => setVisible(true),
      closePicker: () => setVisible(false),
      getSelectedHospital: () => selectedHospital,
      getSelectedHospitalId: () => selectedValue[0],
      getSelectedValue: () => selectedValue,
      refresh: fetchHospitals, // 新增：手动刷新数据方法
    }));

    return (
      <>
        <CellGroup divider={false}>
          <Cell
            title={getDisplayText()}
            titleStyle={{
              color: selectedHospital ? '#323233' : error ? '#ee0a24' : '#969799',
            }}
            style={{ padding: 0 }}
            isLink={showIcon && !disabled && !loading}
            clickable={!disabled}
            onClick={handleCellClick}
            {...cellProps}
            {...restProps}
          />
        </CellGroup>

        {/* 选择器 */}
        <Picker
          visible={visible}
          title={title}
          options={hospitals}
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

HospitalPicker.displayName = 'HospitalPicker';

export default HospitalPicker;
