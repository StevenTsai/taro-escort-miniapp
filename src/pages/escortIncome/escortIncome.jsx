import { ScrollView, Text, View } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';

import { Cell, CellGroup, Empty, Loading, Picker } from '@nutui/nutui-react-taro';
import { useEffect, useState } from 'react';

import useEscortIncomeStore from '@/store/useEscortIncomeStore';

import './escortIncome.scss';

const EscortIncome = () => {
  const {
    incomeOverview,
    incomeDetails,
    totalDetails,
    currentMonth,
    currentStatus,
    isLoading,
    fetchIncomeOverview,
    fetchIncomeDetails,
    refreshAllData,
    changeMonth,
    changeStatusFilter,
    loadMore,
  } = useEscortIncomeStore();

  // 生成最近12个月的选项
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const value = `${year}-${month}`;
      const label = `${year}年${month}月`;
      options.push({ value, label });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();
  const statusOptions = [
    { value: '', label: '全部' },
    { value: 'received', label: '已到账' },
    { value: 'pending', label: '未到账' },
  ];

  // 控制选择器显示状态
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);

  // 初始化数据
  useEffect(() => {
    fetchIncomeOverview();
    fetchIncomeDetails();
  }, []);

  // 处理月份变更
  const handleMonthChange = (selected) => {
    // Picker onChange在小程序中返回完整对象，包含selectedOptions、value和index
    let monthValue;
    if (selected && selected.value) {
      // 如果返回的是完整对象，从中提取value数组的第一个元素
      monthValue = Array.isArray(selected.value) ? selected.value[0] : selected.value;
    } else if (Array.isArray(selected)) {
      // 如果返回的是数组
      monthValue = selected[0];
    } else {
      // 如果返回的是单个值
      monthValue = selected;
    }
    
    if (monthValue) {
      changeMonth(monthValue);
      setMonthPickerVisible(false);
    }
  };

  // 处理状态筛选变更
  const handleStatusChange = (selected) => {
    // Picker onChange在小程序中返回完整对象，包含selectedOptions、value和index
    let statusValue;
    if (selected && selected.value) {
      // 如果返回的是完整对象，从中提取value数组的第一个元素
      statusValue = Array.isArray(selected.value) ? selected.value[0] : selected.value;
    } else if (Array.isArray(selected)) {
      // 如果返回的是数组
      statusValue = selected[0];
    } else {
      // 如果返回的是单个值
      statusValue = selected;
    }
    
    if (statusValue !== undefined) {
      changeStatusFilter(statusValue);
      setStatusPickerVisible(false);
    }
  };

  // 下拉刷新
  usePullDownRefresh(() => {
    refreshAllData().then(() => {
      Taro.stopPullDownRefresh();
    });
  });

  // 触底加载更多
  useReachBottom(() => {
    loadMore();
  });

  // 格式化金额
  const formatAmount = amount => {
    return `¥${(amount || 0).toFixed(2)}`;
  };

  // 格式化日期
  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 获取状态文本
  const getStatusText = status => {
    const statusMap = {
      received: '✅ 已到账',
      pending: '⏳ 未到账',
    };
    return statusMap[status] || '';
  };

  // 获取状态样式
  const getStatusClass = status => {
    return status === 'received' ? 'status-received' : 'status-pending';
  };

  return (
    <View className='escort-income-container'>
      {/* 页面标题和月份选择 */}
      <View className='escort-income-header'>
         <Text className='escort-income-title'>收入概览</Text>

        <View  
          className='month-picker-value' 
          onClick={() => setMonthPickerVisible(true)}
        >
          {monthOptions.find(opt => opt.value === currentMonth)?.label}
        </View>
        <Picker
          visible={monthPickerVisible}
          title='选择月份'
          value={[currentMonth]}
          options={[monthOptions]}
          onChange={handleMonthChange}
          onCancel={() => setMonthPickerVisible(false)}
          onClose={() => setMonthPickerVisible(false)}
        />
      </View>

      {/* 收入概览 */}
      <View className='income-overview'>
        <View className='overview-item'>
          <Text className='overview-label'>💰 总收入</Text>
          <Text className='overview-value total-amount'>
            {formatAmount(incomeOverview?.totalAmount)}
          </Text>
        </View>
        <View className='overview-divider'></View>
        <View className='overview-item'>
          <Text className='overview-label'>✅ 已到账</Text>
          <Text className='overview-value received-amount'>
            {formatAmount(incomeOverview?.receivedAmount)}
          </Text>
        </View>
        <View className='overview-divider'></View>
        <View className='overview-item'>
          <Text className='overview-label'>⏳ 未到账</Text>
          <Text className='overview-value pending-amount'>
            {formatAmount(incomeOverview?.pendingAmount)}
          </Text>
        </View>
      </View>

      {/* 收入明细 */}
      <ScrollView className='income-details-container' scrollY enablePullDownRefresh>
        <View className='details-header'>
          <Text className='details-title'>收入明细</Text>
          <View className='status-filter-container'>
            <Text className='filter-label'>到账状态：</Text>
            <View 
              className='status-picker-value' 
              onClick={() => setStatusPickerVisible(true)}
            >
              {statusOptions.find(opt => opt.value === currentStatus)?.label}
            </View>
            <Picker
              visible={statusPickerVisible}
              title='选择到账状态'
              value={[currentStatus]}
              options={[statusOptions]}
              onChange={handleStatusChange}
              onCancel={() => setStatusPickerVisible(false)}
              onClose={() => setStatusPickerVisible(false)}
            />
          </View>
        </View>

        {incomeDetails.length > 0 ? (
          <CellGroup inset className='details-list'>
            {incomeDetails.map((item, index) => (
              <Cell key={item.id || index} className='detail-item'>
                <View className='detail-item-content'>
                  <View className='detail-item-header'>
                    <Text className='detail-order-id'>订单ID：{item.orderId}</Text>
                    <Text className={`detail-status ${getStatusClass(item.status)}`}>
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                  <View className='detail-item-info'>
                    <Text className='detail-service-type'>服务类型：{item.serviceType}</Text>
                    <Text className='detail-hospital'>服务医院：{item.hospital}</Text>
                  </View>
                  <View className='detail-item-info'>
                    <Text className='detail-service-date'>
                      服务日期：{formatDate(item.serviceDate)}
                    </Text>
                    {item.status === 'received' && item.receivedTime && (
                      <Text className='detail-received-time'>
                        到账时间：{formatDate(item.receivedTime)}
                      </Text>
                    )}
                    {item.status === 'received' && item.transactionNo && (
                      <Text className='detail-transaction-no'>
                        交易单号：{item.transactionNo}
                      </Text>
                    )}
                  </View>
                  <View className='detail-item-footer'>
                    <Text className='detail-patient-name'>患者：{item.patientName}</Text>
                    <Text className='detail-amount'>{formatAmount(item.amount)}</Text>
                  </View>
                </View>
              </Cell>
            ))}
          </CellGroup>
        ) : (
          <Empty description='暂无收入记录' className='empty-details' />
        )}

        {/* 加载更多 */}
        {isLoading && incomeDetails.length > 0 && (
          <View className='loading-more'>
            <Loading type='ellipsis' color='#1890ff' />
            <Text>加载中...</Text>
          </View>
        )}

        {!isLoading && incomeDetails.length > 0 && incomeDetails.length >= totalDetails && (
          <View className='no-more'>
            <Text>没有更多数据了</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default EscortIncome;
