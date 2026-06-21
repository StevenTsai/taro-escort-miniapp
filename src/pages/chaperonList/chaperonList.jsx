import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { Dialog, Tabs, Toast } from '@nutui/nutui-react-taro';
import { useCallback, useEffect, useState } from 'react';

import OrderCard from '@/components/OrderCard/OrderCard';
import { get } from '@/utils/request';

import './chaperonList.scss';

function ChaperonListPage() {
  const [tabvalue, setTabvalue] = useState('已接单');
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 订单状态标签配置
  const tabs = [
    { title: '已接单', value: '已接单' },
    { title: '进行中', value: '进行中' },
    { title: '已取消', value: '已取消' },
    { title: '已完成', value: '已完成' },
  ];

  // 获取订单列表
  const fetchOrder = useCallback(async (status = '全部') => {
    try {
      setLoading(true);
      setError(null);
      const params = status === '全部' ? {} : { status };
      const data = await get('/api/orders/my-accepted', params);
      setOrderList(data || []);
      return data;
    } catch (err) {
      setError(err.message || '获取订单列表失败');
      Taro.showToast({
        title: '获取订单列表失败',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 处理标签切换
  const handleTabChange = useCallback(
    value => {
      setTabvalue(value);
      fetchOrder(value);
    },
    [fetchOrder]
  );

  // 渲染订单列表内容
  const renderOrderList = () => {
    if (loading) {
      return <View className='loading-placeholder'>加载中...</View>;
    }

    if (error) {
      return <View className='error-placeholder'>加载失败，请重试</View>;
    }

    if (orderList.length === 0) {
      return <View className='empty-placeholder'>暂无订单</View>;
    }

    return orderList.map(item => (
      <OrderCard
        key={item.orderId}
        orderInfo={item}
        onOrderUpdate={() => fetchOrder(tabvalue)} // 订单状态更新后刷新列表
      />
    ));
  };

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return (
    <>
      <Tabs className='chaperon-list-page' value={tabvalue} onChange={handleTabChange}>
        {tabs.map(tab => (
          <Tabs.TabPane key={tab.value} title={tab.title} value={tab.value}>
            {renderOrderList()}
          </Tabs.TabPane>
        ))}
      </Tabs>
      <Dialog id='order-dialog' />
      <Toast id='order-toast' />
    </>
  );
}

export default ChaperonListPage;
