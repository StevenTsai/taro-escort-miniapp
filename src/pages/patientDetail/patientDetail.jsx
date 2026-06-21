import { Button, ScrollView, Text, View } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';

import { useEffect, useState } from 'react';

import { get } from '@/utils/request';
import './patientDetail.scss';

const PatientDetail = () => {
  const [patientInfo, setPatientInfo] = useState({});
  const [histories, setHistories] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 获取患者ID（从路由参数）
  const router = useRouter();
  const patientId = router.params.id;

  // 获取病史类型显示文本和颜色
  const getHistoryTypeInfo = type => {
    switch (type) {
      case 0:
        return { text: '疾病诊断', color: '#722ed1' };
      case 1:
        return { text: '既往病史', color: '#8c8c8c' };
      case 2:
        return { text: '过敏史', color: '#ff4d4f' };
      case 3:
        return { text: '家族病史', color: '#1890ff' };
      case 4:
        return { text: '治疗总结', color: '#52c41a' };
      default:
        return { text: '病史', color: '#8c8c8c' };
    }
  };

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
      case 'common':
      case 1:
        return { text: '通用事件', color: '#8c8c8c', icon: '📌' };
      default:
        return { text: '事件', color: '#8c8c8c', icon: '📌' };
    }
  };

  // 初始化数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 获取患者信息和病史
        const patientResponse = await get(`/api/timeline/patients/${patientId}`);
        if (patientResponse) {
          setPatientInfo(patientResponse);
          setHistories(patientResponse.histories || []);
        }

        // 获取最近事件
        const eventsResponse = await get('/api/timeline/timeline-events', {
          patient_id: patientId,
          page: 1,
          page_size: 5,
        });
        if (eventsResponse) {
          setRecentEvents(eventsResponse.list || []);
        }
      } catch (error) {
        Taro.showToast({ title: '加载数据失败', icon: 'none' });
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchData();
    }
  }, [patientId]);

  if (loading) {
    return (
      <View className='loading-container'>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView className='patient-detail-container' scrollY>
      {/* 患者基本信息 */}
      <View className='basic-info-section'>
        <View className='info-header'>
          <Text className='patient-name'>{patientInfo.name || '未命名'}</Text>
          <View className='patient-gender-age'>
            <Text>{patientInfo.gender === 1 ? '男' : '女'}</Text>
            <Text className='age-separator'>|</Text>
            <Text>{patientInfo.age || 0}岁</Text>
          </View>
        </View>
        <View className='info-body'>
          <View className='info-item'>
            <Text className='info-label'>身高：</Text>
            <Text className='info-value'>{patientInfo.height || 0}cm</Text>
          </View>
          <View className='info-item'>
            <Text className='info-label'>体重：</Text>
            <Text className='info-value'>{patientInfo.weight || 0}kg</Text>
          </View>
        </View>
        {/* 按钮容器 */}
        <View className='buttons-container'>
          <Button
            className='edit-btn'
            onClick={() =>
              Taro.navigateTo({ url: `/pages/createPatient/createPatient?id=${patientId}` })
            }
          >
            编辑信息
          </Button>

             {/* 生成病历报告按钮 */}
          <Button
            className='generate-report-btn'
            onClick={() =>
              Taro.navigateTo({
                url: `/pages/reportGenerate/reportGenerate?id=${patientId}`,
              })
            }
          >
            生成病历报告
          </Button>
        </View>
      </View>

      {/* 基础病史 */}
      <View className='histories-section'>
        <Text className='section-title'>【基础病史】</Text>
        {histories.length > 0 ? (
          <View className='histories-list'>
            {histories.map(history => {
              const typeInfo = getHistoryTypeInfo(history.type);
              return (
                <View key={history.id} className='history-item'>
                  <View className='history-type-tag' style={{ color: typeInfo.color }}>
                    □ {typeInfo.text}：
                  </View>
                  <Text className='history-content'>{history.content}</Text>
                </View>
              );
            })}
            {/* 治疗总结 */}
            {patientInfo.treatmentSummary && (
              <View className='history-item treatment-summary-item'>
                <View className='history-type-tag' style={{ color: '#52c41a' }}>
                  □ 治疗总结：
                </View>
                <Text className='history-content treatment-summary-content'>{patientInfo.treatmentSummary}</Text>
              </View>
            )}
          </View>
        ) : (
          <Text className='no-data-text'>暂无病史记录</Text>
        )}
      </View>

      {/* 最近事件预览 */}
      <View className='recent-events-section'>
        <View className='section-header'>
          <Text className='section-title'>【最近治疗事件】</Text>
          <Button
            className='view-all-btn'
            onClick={() =>
              Taro.navigateTo({ url: `/pages/timeline/timeline?patientId=${patientId}` })
            }
          >
            查看全部
          </Button>
        </View>
        {recentEvents.length > 0 ? (
          <View className='events-list'>
            {recentEvents.map(event => {
              const typeInfo = getEventTypeInfo(event.eventType);
              return (
                <View key={event.id} className='event-item'>
                  <View className='event-right'>
                    <View className='event-header'>
                      <View className='event-title-container'>
                        <View
                          className='event-type-marker'
                          style={{ backgroundColor: typeInfo.color }}
                        >
                          {typeInfo.icon}
                        </View>
                        <Text className='event-title'>{event.title}</Text>
                      </View>
                      {event.is_key_node === 1 && <View className='key-node-tag'>关键节点</View>}
                    </View>
                    <Text className='event-date'>{event.eventDate}</Text>
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
          <Text className='no-data-text'>暂无事件记录</Text>
        )}
      </View>

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
    </ScrollView>
  );
};

export default PatientDetail;
