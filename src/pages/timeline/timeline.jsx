import { Button, ScrollView, Text, View } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';

import { useCallback, useEffect, useRef, useState } from 'react';

import DateTimePicker from '@/components/DateTimePicker';
import { get } from '@/utils/request';
import './timeline.scss';

const Timeline = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    eventType: '',
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 获取患者ID（从路由参数）
  const router = useRouter();
  const patientId = router.params.patientId ;

  // 事件类型选项
  const eventTypeOptions = [
    { value: '', text: '全部事件' },
    { value: 'treatment', text: '治疗小结' },
    { value: 'inspection', text: '检查事件' },
    { value: 'medication', text: '用药事件' },
  ];

  // 获取事件类型显示文本、颜色和图标
  const getEventTypeInfo = type => {
    switch (type) {
      case 'treatment':
      case 4:
        return { text: '治疗小结', color: '#1890ff', icon: '📋' };
      case 'inspection':
      case 2:
        return { text: '检查事件', color: '#52c41a', icon: '🔬' };
      case 'medication':
      case 3:
        return { text: '用药事件', color: '#faad14', icon: '💊' };
      default:
        return { text: '事件', color: '#8c8c8c', icon: '📌' };
    }
  };

  // 获取事件列表
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        patient_id: patientId,
        page: page,
        page_size: 100,
        ...filters,
      };

      const response = await get('/api/timeline/timeline-events', params);
      if (response) {
        const newEvents = response.list || [];
        setEvents(prev => (refreshing ? newEvents : [...prev, ...newEvents]));
        setHasMore(newEvents.length >= 10);
        setRefreshing(false);
      }
    } catch (error) {
      Taro.showToast({ title: '加载数据失败', icon: 'none' });
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }, [patientId, page, filters, refreshing]);

  // 使用 ref 保持 fetchEvents 最新引用，避免 mount effect 依赖它
  const fetchEventsRef = useRef(fetchEvents);
  fetchEventsRef.current = fetchEvents;

  // 加载更多
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchEvents();
    }
  };

  // 下拉刷新
  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchEvents();
  };

  // 应用筛选条件
  const applyFilters = () => {
    setFilterVisible(false);
    setPage(1);
    setEvents([]);
    setHasMore(true);
    fetchEventsRef.current();
  };

  // 重置筛选条件
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      eventType: '',
    });
  };

  // 初始化数据 — 仅在挂载时执行
  useEffect(() => {
    setPage(1);
    setEvents([]);
    setHasMore(true);
    fetchEventsRef.current();
  }, []);

  // page 变化时加载更多
  useEffect(() => {
    if (page > 1) {
      fetchEvents();
    }
  }, [page, fetchEvents]);

  return (
    <View className='timeline-container'>
      {/* 筛选栏 */}
      <View className='filter-bar'>
        <Button className='filter-btn' onClick={() => setFilterVisible(!filterVisible)}>
          <Text className='filter-icon'>🔍</Text>
          <Text>筛选条件</Text>
        </Button>
      </View>

      {/* 筛选面板 */}
      {filterVisible && (
        <View className='filter-panel'>
          <View className='filter-item'>
            <Text className='filter-label'>时间范围</Text>
            <View className='date-range'>
              <DateTimePicker
                type='date'
                placeholder='开始日期'
                value={filters.startDate}
                onChange={value => setFilters(prev => ({ ...prev, startDate: value }))}
              />
              <Text className='date-separator'>至</Text>
              <DateTimePicker
                type='date'
                placeholder='结束日期'
                value={filters.endDate}
                onChange={value => setFilters(prev => ({ ...prev, endDate: value }))}
              />
            </View>
          </View>
          <View className='filter-item'>
            <Text className='filter-label'>事件类型</Text>
            <View className='event-type-selector'>
              {eventTypeOptions.map(option => (
                <Button
                  key={option.value}
                  className={`type-btn ${filters.eventType === option.value ? 'active' : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, eventType: option.value }))}
                >
                  {option.text}
                </Button>
              ))}
            </View>
          </View>
          <View className='filter-actions'>
            <Button className='reset-btn' onClick={resetFilters}>
              重置
            </Button>
            <Button className='apply-btn' onClick={applyFilters}>
              应用
            </Button>
          </View>
        </View>
      )}

      {/* 时间轴主体 */}
      <ScrollView
        className='timeline-scroll'
        scrollY
        onScrollToLower={loadMore}
        enablePullDownRefresh
        onPullDownRefresh={onRefresh}
      >
        {events.length > 0 ? (
          <View className='events-list'>
            {events.map(event => {
              const typeInfo = getEventTypeInfo(event.eventType);
              return (
                <View key={event.id} className='event-item'>
                  <View className='event-left'>
                    <View className='event-vertical-line' />
                  </View>
                  <View className='event-right'>
                    <View className='event-header'>
                      <View className='event-title-container'>
                        <View className='event-type-marker' style={{ backgroundColor: typeInfo.color }}>
                          {typeInfo.icon}
                        </View>
                        <Text className='event-title'>{event.title}</Text>
                      </View>
                      {event.is_key_node === 1 && <View className='key-node-tag'>关键节点</View>}
                    </View>
                    <Text className='event-date'>{event.eventDate}</Text>
                    <Text className='event-type'>{typeInfo.text}</Text>
                    {/* <Text className='event-content'>{event.content}</Text>
                    {event.attachments && event.attachments.length > 0 && (
                      <View className='attachments'>
                        <Text className='attachments-label'>附件：</Text>
                        <View className='attachments-list'>
                          {event.attachments.map(attachment => (
                            <Text key={attachment.id} className='attachment-item'>
                              {attachment.file_name}
                            </Text>
                          ))}
                        </View>
                      </View>
                    )} */}
                    <Button
                      className='view-detail-btn'
                      onClick={() =>
                        Taro.navigateTo({
                          url: `/pages/eventDetail/eventDetail?id=${event.id}&patientId=${patientId}`,
                        })
                      }
                    >
                      查看详情
                    </Button>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className='no-data-container'>
            <Text className='no-data-text'>暂无治疗事件</Text>
          </View>
        )}

        {/* 加载更多提示 */}
        {loading && events.length > 0 && (
          <View className='loading-more'>
            <Text>加载中...</Text>
          </View>
        )}

        {!hasMore && events.length > 0 && (
          <View className='no-more'>
            <Text>没有更多数据了</Text>
          </View>
        )}
      </ScrollView>

      {/* 添加事件按钮 */}
      <Button
        className='add-event-btn'
        onClick={() =>
          Taro.showActionSheet({
            itemList: ['添加治疗小结', '添加检查事件', '添加用药事件', '添加通用事件'],
            success: res => {
              switch (res.tapIndex) {
                case 0:
                  Taro.navigateTo({
                    url: `/pages/addTreatment/addTreatment?patientId=${patientId}`,
                  });
                  break;
                case 1:
                  Taro.navigateTo({
                    url: `/pages/addInspection/addInspection?patientId=${patientId}`,
                  });
                  break;
                case 2:
                  Taro.navigateTo({
                    url: `/pages/addMedication/addMedication?patientId=${patientId}`,
                  });
                  break;
                case 3:
                  Taro.navigateTo({
                    url: `/pages/addGeneralEvent/addGeneralEvent?patientId=${patientId}`,
                  });
                  break;
              }
            },
          })
        }
      >
        +
      </Button>
    </View>
  );
};

export default Timeline;
