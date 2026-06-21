import { useDidShow } from '@tarojs/taro';

import { useEffect } from 'react';

// 导入认证store
import useAuthStore from '@/store/useAuthStore';
// 导入城市store
import useCityStore from '@/store/useCityStore';

// 全局样式
import '@nutui/nutui-react-taro/dist/styles/themes/default.css';
import './app.scss';

const CLOUD_ENV_ID = process.env.TARO_APP_CLOUD_ENV || 'medical-online-8g6dkg7v5cabce79';

function App(props) {
  const { initAuth } = useAuthStore();
  const { initCity } = useCityStore();

  // 可以使用所有的 React Hooks
  useEffect(() => {
    // 初始化云开发
    if (typeof wx !== 'undefined' && wx.cloud) {
      wx.cloud.init({
        env: CLOUD_ENV_ID,
        traceUser: true,
      });
    }
    // 应用启动时初始化认证状态和城市信息
    initAuth();
    initCity();
  }, [initAuth, initCity]);

  // 对应 onShow
  useDidShow(() => {
    initAuth();
  });

  return props.children;
}

export default App;
