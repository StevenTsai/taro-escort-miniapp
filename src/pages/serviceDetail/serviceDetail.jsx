import Taro, { useRouter } from '@tarojs/taro';

import ServiceDetail from '@/components/ServiceDetail/ServiceDetail';

import './index.scss';

function Index() {
  const router = useRouter();
  const serviceId = parseInt(router.params.serviceId) || 2; // 默认值为2

  Taro.useShareAppMessage(() => {
    return {
      title: '服务详情',
      path: `/pages/serviceDetail/serviceDetail?serviceId=${serviceId}`,
    };
  });

  Taro.useShareTimeline(() => {
    return {
      title: '服务详情',
      path: `/pages/serviceDetail/serviceDetail?serviceId=${serviceId}`,
    };
  });

  return (
    <>
      <ServiceDetail serviceId={serviceId} />
    </>
  );
}

export default Index;
