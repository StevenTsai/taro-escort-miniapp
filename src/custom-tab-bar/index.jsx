import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { Cart, User, UserAdd } from '@nutui/icons-react-taro';
import { Tabbar } from '@nutui/nutui-react-taro';
import { useEffect } from 'react';

import useTabBarStore from '../store/useTabBarStore';
import './index.scss';

const TAB_PAGES = [
  'pages/index/index',
  'pages/medicalChaperons/medicalChaperons',
  'pages/profile/profile',
];

const TAB_ROUTES = TAB_PAGES.map(page => `/${page}`);

function CustomTabBar() {
  const { selectedIndex, setSelectedIndex } = useTabBarStore();

  useEffect(() => {
    const currentPage = Taro.getCurrentInstance().page?.route;
    const index = TAB_PAGES.findIndex(page => page.includes(currentPage));
    if (index !== -1) {
      setSelectedIndex(index);
    }
  }, [setSelectedIndex]);

  const handleSwitch = index => {
    setSelectedIndex(index);
    Taro.switchTab({
      url: TAB_ROUTES[index],
    });
  };

  return (
    <View className='custom-tab-bar'>
      <Tabbar
        fixed
        value={selectedIndex}
        onSwitch={handleSwitch}
        style={{
          backgroundColor: '#fff',
          borderTop: '1px solid #eee',
        }}
      >
        <Tabbar.Item icon={<Cart />} title='首页' />
        <Tabbar.Item icon={<UserAdd />} title='陪诊师预约' />
        <Tabbar.Item icon={<User />} title='个人中心' />
      </Tabbar>
    </View>
  );
}

export default CustomTabBar;
