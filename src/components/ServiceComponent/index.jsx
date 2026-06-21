import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { Health, Received, Service, Transit, UserAdd } from '@nutui/icons-react-taro';

import { COLORS, SERVICE_ID } from '@/constants';

import './index.scss';

const ServiceComponent = () => {
  const handleEscortServiceClick = serviceId => {
    Taro.navigateTo({
      url: `/pages/serviceDetail/serviceDetail?serviceId=${serviceId}`,
    });
  };

  const gotoIntroduce = () => {
    Taro.navigateTo({
      url: '/pages/serviceIntroduce/serviceIntroduce',
    });
  };

  return (
    <View className='service-component'>
      <View className='service-title'>
        <Text>还不清楚什么是陪诊？</Text>
        <Text onClick={gotoIntroduce}>点击查看陪诊介绍&gt;</Text>
      </View>
      <View className='service-btn'>
        <View className='btn-item' onClick={() => handleEscortServiceClick(SERVICE_ID.BASIC)}>
          <UserAdd size={50} color={COLORS.PRIMARY} />
          <Text className='title'>半天陪诊</Text>
          <Text className='desc'>高效就医 贴心陪伴</Text>
        </View>
        <View className='btn-divider'></View>
        <View className='btn-item' onClick={() => handleEscortServiceClick(SERVICE_ID.STANDARD)}>
          <Service size={50} color={COLORS.PRIMARY} />
          <Text className='title'>代问诊</Text>
          <Text className='desc'>安全省心 高效便捷</Text>
        </View>
      </View>

      <View className='service-list'>
        <View className='service-item' onClick={() => handleEscortServiceClick(SERVICE_ID.REMOTE)}>
          <Health size={25} color={COLORS.PRIMARY} />
          <Text>全天陪诊</Text>
        </View>
        <View className='service-item' onClick={() => handleEscortServiceClick(SERVICE_ID.PREMIUM)}>
          <Received size={25} color={COLORS.PRIMARY} />
          <Text>病理会诊</Text>
        </View>
        <View className='service-item' onClick={() => handleEscortServiceClick(SERVICE_ID.ELDER)}>
          <Transit size={25} color={COLORS.PRIMARY} />
          <Text>代办服务</Text>
        </View>
      </View>
    </View>
  );
};

export default ServiceComponent;
