import { View } from '@tarojs/components';

import './ServiceTargets.scss';

const ServiceTargets = () => (
  <View className='service-section'>
    <View className='service-content-title'>
      <View className='service-content-zh'>服务对象</View>
      <View className='service-content-en'>service object</View>
    </View>
    <View className='service-object-tags'>
      <View>| 各种肿瘤患者人群</View>
      <View>| 病理类型罕见，当地医院无法治疗人群</View>
      <View>| 刚确诊癌症，需要找大医院制定方案</View>
      <View>| 没有时间陪亲人看病人群</View>
      <View>| 儿童/宝妈/独居青年</View>
      <View>| 异地就医人群</View>
      <View>| 退休老人或语言不通表达不清人群</View>
    </View>
  </View>
);

export default ServiceTargets;
