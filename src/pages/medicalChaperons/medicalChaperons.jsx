import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import MedicalChaperonList from '../../components/MedicalChaperonList/ MedicalChaperonList';
import RegisterBtn from '../../components/RegisterBtn/RegisterBtn';
import './index.scss';

function Index() {
  const { city } = Taro.getCurrentInstance().router.params;

  Taro.useShareAppMessage(() => {
    return {
      title: '陪诊师预约',
      path: '/pages/medicalChaperons/medicalChaperons',
    };
  });

  Taro.useShareTimeline(() => {
    return {
      title: '陪诊师预约',
      path: '/pages/medicalChaperons/medicalChaperons',
    };
  });

  return (
    <View className='medical-chaperons'>
      <RegisterBtn />
      <MedicalChaperonList city={city} />
    </View>
  );
}

export default Index;
