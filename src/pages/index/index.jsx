import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { ConfigProvider } from '@nutui/nutui-react-taro';
import zhCN from '@nutui/nutui-react-taro/dist/es/locales/zh-CN';
import { useCallback, useEffect, useState } from 'react';

import Header from '@/components/Header';
import HospitalList from '@/components/HospitalList/HospitalList';
import ServiceComponent from '@/components/ServiceComponent';
import { get } from '@/utils/request';

function Index() {
  const [locale, _setLocale] = useState(zhCN);

  const [bannerList, setBannerList] = useState([]);

  Taro.useShareAppMessage(() => {
    return {
      title: '陪诊服务',
      path: '/pages/index/index',
    };
  });

  Taro.useShareTimeline(() => {
    return {
      title: '陪诊服务',
      path: '/pages/index/index',
    };
  });

  // 从API获取轮播图数据
  const fetchBannerData = useCallback(async () => {
    try {
      const data = await get('/api/marquee');
      setBannerList(data);
    } catch (error) {
      console.error('获取轮播图数据失败:', error);
      setBannerList([]);
    }
  }, []);

  useEffect(() => {
    fetchBannerData();
  }, [fetchBannerData]);

  return (
    <ConfigProvider locale={locale}>
      <View className='nutui-react-demo'>
        <Header bannerList={bannerList} />
        <ServiceComponent />
        <HospitalList />
      </View>
    </ConfigProvider>
  );
}

export default Index;
