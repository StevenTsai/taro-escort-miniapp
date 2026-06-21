import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { Button, Image, Toast } from '@nutui/nutui-react-taro';
import { useEffect, useState } from 'react';

import { useIsLoggedIn } from '@/store/useAuthStore';
import { get } from '@/utils/request';

import RefundInstructionsSteps from './RefundInstructionsSteps';
import ServiceContent from './ServiceContent';
import ServiceDescriptionSteps from './ServiceDescriptionSteps';
import ServiceTargets from './ServiceTargets';

import './ServiceDetail.scss';

const ServiceDetail = props => {
  const { serviceId } = props;
  const [serviceDetail, setServiceDetail] = useState(null);
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    const getServiceDetail = async () => {
      const data = await get(`/api/medicalEscorts/service/${serviceId}`);
      setServiceDetail(data);
    };
    getServiceDetail();
  }, [serviceId]);

  const handleOrderClick = () => {
    if (!isLoggedIn) {
      Toast.show('service-detail-toast', {
        content: '请先登录，登录后可继续下单',
        icon: 'warn',
        onClose: () => {
          Taro.switchTab({ url: '/pages/profile/profile' });
        },
      });
      return;
    }
    Taro.navigateTo({
      url: `/pages/order/order?serviceType=${serviceId}`,
    });
  };
  return (
    <View className='service-detail'>
      <View className='service-detail-header'>
        <Image src={serviceDetail?.backgroundImage} />
      </View>
      <View className='service-card'>
        <View className='service-card-title'>{serviceDetail?.name}</View>
        <View className='service-card-price'>¥{serviceDetail?.price}</View>
        <View className='service-card-desc'>{serviceDetail?.content}</View>

        <ServiceContent serviceId={serviceId} />

        <ServiceTargets />

        <View className='service-section'>
          <View className='service-content-title'>
            <View className='service-content-zh'>服务说明</View>
            <View className='service-content-en'>service description</View>
          </View>
          <View>
            <ServiceDescriptionSteps />
          </View>
        </View>

        <View className='service-section'>
          <View className='service-content-title'>
            <View className='service-content-zh'>退款须知</View>
            <View className='service-content-en'>service instructions</View>
          </View>
          <View>
            <RefundInstructionsSteps />
          </View>
        </View>
      </View>
      <Button
        color='#117b32'
        block
        type='success'
        className='service-detail-button'
        onClick={handleOrderClick}
      >
        立即预约
      </Button>
      <Toast id='service-detail-toast' />
    </View>
  );
};

export default ServiceDetail;
