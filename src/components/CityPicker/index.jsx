import { Cell, CellGroup, Picker } from '@nutui/nutui-react-taro';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { get } from '@/utils/request';

import './index.scss';

const CityPicker = forwardRef(
  (
    {
      placeholder = '请选择城市',
      title = '选择城市',
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
    const [selectedValue, setSelectedValue] = useState('');
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);

    // 使用 ref 来跟踪是否已经初始化过
    const hasInitialized = useRef(false);

    // 获取城市数据
    const fetchCities = async () => {
      try {
        setLoading(true);
        const data = await get('/api/hospitals/cities');
        const cityOptions = data.map(cityName => ({
          label: cityName,
          value: cityName,
        }));
        setCities([cityOptions]);
        return cityOptions;
      } catch (error) {
        console.error('获取城市数据失败:', error);
        return [];
      } finally {
        setLoading(false);
      }
    };

    // 使用 useRef 来存储 onChange 回调，避免依赖问题
    const onChangeRef = useRef(onChange);

    // 更新 onChange ref
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    // 初始化城市
    const initializeCity = useCallback(async () => {
      // 如果已经初始化过且没有外部 value，则不重复初始化
      if (hasInitialized.current && !value) {
        return;
      }

      const cityOptions = await fetchCities();

      if (!value) {
        // 没有传入值，尝试自动定位
        // const locationCity = await getCurrentCity();
        const locationCity = '北京市';
        let defaultCity = '北京市'; // 默认城市

        if (locationCity) {
          // 在城市列表中查找匹配的城市
          const matchedCity = cityOptions.find(
            city =>
              city.label.includes(locationCity) ||
              locationCity.includes(city.label.replace('市', ''))
          );
          if (matchedCity) {
            defaultCity = matchedCity.value;
          }
        }

        setSelectedValue(defaultCity);

        // 只在首次初始化时通知父组件，使用 ref 中的回调
        if (!hasInitialized.current && onChangeRef.current) {
          onChangeRef.current(defaultCity, {
            value: defaultCity,
            label: defaultCity,
            isAutoLocation: !!locationCity,
          });
        }

        hasInitialized.current = true;
      } else {
        setSelectedValue(value);
      }
    }, [value]);

    // 组件挂载时初始化
    useEffect(() => {
      initializeCity();
    }, [initializeCity]);

    // 监听外部value变化
    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    // 处理选择确认
    const handleConfirm = (options, values) => {
      const selectedCity = values[0];
      setSelectedValue(selectedCity);
      setVisible(false);

      if (onChangeRef.current) {
        onChangeRef.current(selectedCity, {
          value: selectedCity,
          label: selectedCity,
          isAutoLocation: false,
        });
      }
    };

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      clearSelection: () => {
        setSelectedValue('');
        if (onChangeRef.current) onChangeRef.current('');
      },
      openPicker: () => setVisible(true),
      closePicker: () => setVisible(false),
      getSelectedValue: () => selectedValue,
      refreshCities: fetchCities,
    }));

    // 获取显示文本
    const getDisplayText = () => {
      if (loading) return '加载中...';
      return selectedValue || placeholder;
    };

    return (
      <CellGroup divider={false} className='city-picker'>
        <Cell
          className='city-picker-cell'
          title={getDisplayText()}
          titleStyle={{
            color: selectedValue ? '#323233' : '#969799',
          }}
          isLink={showIcon && !disabled && !loading}
          clickable={!disabled && !loading}
          onClick={() => !disabled && !loading && setVisible(true)}
          {...cellProps}
          {...restProps}
        />

        <Picker
          visible={visible}
          title={title}
          options={cities}
          value={selectedValue ? [selectedValue] : []}
          onConfirm={handleConfirm}
          onCancel={() => setVisible(false)}
          onClose={() => setVisible(false)}
          {...pickerProps}
        />
      </CellGroup>
    );
  }
);

CityPicker.displayName = 'CityPicker';

export default CityPicker;
