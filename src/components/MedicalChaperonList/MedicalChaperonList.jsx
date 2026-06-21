import { Text, View } from '@tarojs/components';

import { Location } from '@nutui/icons-react-taro';
import { Cell, CellGroup } from '@nutui/nutui-react-taro';
import { useEffect, useState } from 'react';

import useCityStore from '@/store/useCityStore';
import { get } from '@/utils/request';

import CityPicker from '../CityPicker';

import MedicalChaperonCard from './MedicalChaperonCard';

const MedicalChaperonList = () => {
  // 使用城市 store
  const { selectedCity, setSelectedCity } = useCityStore();

  const [list, setList] = useState([]);

  // 处理城市选择变化
  const handleCityChange = (cityName, cityInfo) => {
    // setSelectedCity 需要两个参数：cityCode 和 cityName
    // 这里假设城市名称就是城市代码，如果有不同的城市代码，需要相应调整
    setSelectedCity(cityName, cityName);
  };

  useEffect(() => {
    const getList = async () => {
      if (selectedCity) {
        const res = await get('/api/medicalEscorts/', { city: selectedCity });
        setList(res);
      }
    };
    getList();
  }, [selectedCity]);

  return (
    <View>
      <View className='medical-chaperon-list'>
        <CellGroup
          title={
            <Cell
              description={
                // <CityPicker cellProps={{ style: { boxShadow: 'none' } }} onChange={setCity} />
                <View className='cell-city'>
                  <Location color='#117b32' />
                  <CityPicker
                    cellProps={{ style: { boxShadow: 'none', padding: 0, margin: 0 } }}
                    value={selectedCity}
                    onChange={handleCityChange}
                  />
                </View>
              }
              title={<View className='cell-title'>预约陪诊师</View>}
              className='cell-list'
            />
          }
          divider={false}
          style={{ padding: 0, background: '#fff' }}
        >
          {list.map(item => {
            return <MedicalChaperonCard key={item.id} state={item} city={selectedCity} />;
          })}
          {list.length < 1 && (
            <View className='medical-chaperon-list-empty'>
              <Text>当前城市暂无陪诊师，请选择其他城市</Text>
            </View>
          )}
        </CellGroup>
      </View>
    </View>
  );
};

export default MedicalChaperonList;
