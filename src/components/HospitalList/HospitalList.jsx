import { View } from '@tarojs/components';
import { pxTransform } from '@tarojs/taro';

import { Cell, CellGroup, SearchBar, Skeleton } from '@nutui/nutui-react-taro';
import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_CITY } from '@/constants';
import useCityStore from '@/store/useCityStore';
import { get } from '@/utils/request';

import CityPicker from '../CityPicker';

import HospitalCard from './HospitalCard';

import './index.scss';

const HospitalList = () => {
  const [list, setList] = useState([]);
  const [originalList, setOriginalList] = useState([]);

  const { selectedCity, setSelectedCity } = useCityStore();

  const onSearch = value => {
    const filteredList = originalList.filter(item => item.name.includes(value));
    setList(filteredList);
  };

  const onClear = () => {
    setList(originalList);
  };

  const getList = useCallback(async (city = DEFAULT_CITY) => {
    try {
      const url = city ? `/api/hospitals/?city=${encodeURIComponent(city)}` : '/api/hospitals/';
      const res = await get(url);
      setList(res);
      setOriginalList(res);
    } catch (error) {
      console.error('获取医院列表失败:', error);
    }
  }, []);

  const handleCityChange = useCallback(
    (cityValue, info) => {
      setSelectedCity(cityValue, info.label || cityValue);
    },
    [setSelectedCity]
  );

  useEffect(() => {
    getList(selectedCity);
  }, [selectedCity, getList]);

  return (
    <View className='hospital-list'>
      <CellGroup
        divider={false}
        style={{ padding: 0 }}
        title={
          <>
            <View className='hospital-list-title'>预约医院</View>
            <View>
              <SearchBar
                left={
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    &gt;&nbsp;&nbsp;
                    <CityPicker
                      cellProps={{ style: { boxShadow: 'none', padding: 0, margin: 0 } }}
                      onChange={handleCityChange}
                      value={selectedCity}
                    />
                  </View>
                }
                shape='round'
                clearable={false}
                placeholder='搜索当地的医院'
                onChange={onSearch}
                onClear={onClear}
              />
            </View>
          </>
        }
      >
        {list.length < 1 && (
          <Cell>
            <Skeleton width={pxTransform(100)} height={pxTransform(100)} />
            <View className='skeleton-cell'>
              <Skeleton width='100%' style={{ marginBottom: pxTransform(5) }} />
              <Skeleton width='100%' size='small' rows={3} />
            </View>
          </Cell>
        )}
        {list.map(item => {
          return <HospitalCard key={item.id} state={item} />;
        })}
      </CellGroup>
    </View>
  );
};

export default HospitalList;
