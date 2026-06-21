import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { PickedUp } from '@nutui/icons-react-taro';

import useAuthStore from '@/store/useAuthStore';

import './index.scss';

const RegisterBtn = () => {
  const { checkAuth } = useAuthStore();
  
  const handleClick = () => {
    // 检查用户是否登录
        if (!checkAuth()) {
          Taro.showModal({
            title: '提示',
            content: '请先登录后才能申请为陪诊师',
            showCancel: false,
            success: () => {
              Taro.switchTab({ url: '/pages/profile/profile' });
            },
          });
          return;
        }

   // 已登录，跳转到注册页
      Taro.navigateTo({
        url: '/pages/register/register',
      });
  };
  return (
    <View className='cmp-register-btn' onClick={handleClick}>
      <PickedUp className='cmp-register-btn-icon' color='#fff' size={50} />
      <View className='cmp-register-btn-sub-title'>点击了解更多</View>
      <View className='cmp-register-btn-title'>加入陪诊师家庭</View>
    </View>
  );
};

export default RegisterBtn;
