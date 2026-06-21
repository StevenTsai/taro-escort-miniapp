import { Text, View } from '@tarojs/components';
import Taro, { Toast, useRouter } from '@tarojs/taro';

import { Location } from '@nutui/icons-react-taro';
import { Button, Image } from '@nutui/nutui-react-taro';
import { useEffect, useState } from 'react';

import useAuthStore from '@/store/useAuthStore';
import { get } from '@/utils/request';
import './hospitalDetail.scss';

const ServiceCard = props => {
  const { title, description, price, onClick, serviceId } = props;
  
  // 点击卡片跳转到服务详情页
  const handleCardClick = () => {
    Taro.navigateTo({
      url: `/pages/serviceDetail/serviceDetail?serviceId=${serviceId}`,
    });
  };
  
  return (
    <View className='service-card' onClick={handleCardClick}>
      <View className='service-card-left'>
        <View className='service-card-title'>{title}</View>
        <View className='service-card-description'>{description}</View>
      </View>
      <View className='service-card-right'>
        <View className='service-card-price'>¥{price}</View>
        <Button size='small' type='success' className='service-card-btn' onClick={onClick}>
          预约
        </Button>
      </View>
    </View>
  );
};

function HospitalDetail() {
  const router = useRouter();
  const { id, city } = router.params;
  const { checkAuth } = useAuthStore();

  const [detail, setDetail] = useState(null);

  // 分享功能
  Taro.useShareAppMessage(() => {
    return {
      title: detail?.name || '医院详情',
      path: `/pages/hospitalDetail/hospitalDetail?id=${id}&city=${city}`,
    };
  });

  Taro.useShareTimeline(() => {
    return {
      title: detail?.name || '医院详情',
      path: `/pages/hospitalDetail/hospitalDetail?id=${id}&city=${city}`,
    };
  });

  useEffect(() => {
    if (!id) return;

    get(`/api/hospitals/${id}`)
      .then(res => {
        if (res) {
          setDetail(res);
        }
      })
      .catch(error => {
        console.error('请求失败:', error);
        Toast.showToast({ title: error.message, icon: 'error' });
      });
  }, [id]);

  const goToOrders = serviceType => {
    if (!checkAuth()) {
      Taro.switchTab({ url: '/pages/profile/profile' });
      return;
    }
    Taro.navigateTo({
      url: `/pages/order/order?id=${id}&city=${city}&serviceType=${serviceType}`,
    });
  };

  const goToNavigation = navigation => {
    Taro.openLocation({
      latitude: navigation.latitude,
      longitude: navigation.longitude,
    });
  };

  // 如果没有数据，显示加载中
  if (detail === null) {
    return (
      <View className='detail-page'>
        <View>加载中...</View>
      </View>
    );
  }

  return (
    <View className='detail-page'>
      <Image src={detail.avatar} className='hospital-background' mode='widthFix' />
      <View className='profile'>
        <View className='profile-header'>
          <View className='name'>{detail.name || '医院名字'}</View>
          <View className='tag-list'>{detail.tags.join('、')}</View>
        </View>
        <View className='location'>
          <View className='location-left'>
            <Location color='#117b32' />
            <Text>{detail.location}</Text>
          </View>
          <Button
            fill='outline'
            type='success'
            size='mini'
            onClick={() => goToNavigation(detail.navigation)}
          >
            导航
          </Button>
        </View>
        <View className='profile-content'>
          <View className='profile-content-title'>医院简介</View>
          <View className='profile-content-text'>{detail.description}</View>
        </View>
      </View>

      <View className='function-list'>
        <View className='function-list-title'>
          <View className='function-list-title-text'>预约服务</View>
          <View className='green-dot' />
        </View>
        <View className='service-list'>
          {detail?.services.map(item => (
            <ServiceCard
              key={item.id}
              title={item.name}
              description={item.bio}
              price={item.price}
              serviceId={item.id}
              onClick={() => goToOrders(item.id)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export default HospitalDetail;
