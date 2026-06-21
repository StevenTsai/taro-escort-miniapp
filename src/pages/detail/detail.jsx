import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import MedicalChaperonDetail from '../../components/MedicalChaperonDetail/index';
import './index.scss';

function Index() {
  const { id, city } = Taro.getCurrentInstance().router.params;

  Taro.useShareAppMessage(() => {
    return {
      title: '陪诊师详情',
      path: `/pages/detail/detail?id=${id}&city=${city}`,
    };
  });

  Taro.useShareTimeline(() => {
    return {
      title: '陪诊师详情',
      path: `/pages/detail/detail?id=${id}&city=${city}`,
    };
  });

  return (
    <View>
      <MedicalChaperonDetail id={id} city={city} />
    </View>
  );
}

export default Index;
