import { Button, Image, ScrollView, Text, View } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';

import { useEffect, useState } from 'react';

import { del, get } from '@/utils/request';
import './eventDetail.scss';

const EventDetail = () => {
  const [event, setEvent] = useState({});
  const [loading, setLoading] = useState(true);

  // 获取事件ID和患者ID（从路由参数）
  const router = useRouter();
  const { id, patientId } = router.params;

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

  // 初始化数据
  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        setLoading(true);
        const response = await get(`/api/timeline/timeline-events/${id}`);
        if (response) {
          // 如果是治疗小结，解析content为JSON对象
          if (response.eventType === 'treatment' || response.eventType === 4) {
            try {
              response.treatmentContent = JSON.parse(response.content || '{}');
            } catch (error) {
              console.error('Failed to parse treatment content:', error);
              response.treatmentContent = {};
            }
          }
          // 如果是检查事件，解析content为JSON对象
          if (response.eventType === 'inspection' || response.eventType === 2) {
            try {
              response.inspectionContent = JSON.parse(response.content || '{}');
            } catch (error) {
              console.error('Failed to parse inspection content:', error);
              response.inspectionContent = {};
            }
          }
          // 如果是用药事件，解析content为JSON对象
          if (response.eventType === 'medication' || response.eventType === 3) {
            try {
              response.medicationContent = JSON.parse(response.content || '{}');
            } catch (error) {
              console.error('Failed to parse medication content:', error);
              response.medicationContent = {};
            }
          }
          setEvent(response);
        }
      } catch (error) {
        Taro.showToast({ title: '加载数据失败', icon: 'none' });
        console.error('Failed to fetch event detail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <View className='loading-container'>
        <Text>加载中...</Text>
      </View>
    );
  }

  const typeInfo = getEventTypeInfo(event.eventType);

  return (
    <ScrollView className='event-detail-container' scrollY>
      {/* 事件基本信息 */}
      <View className='event-basic-info'>
        <View className='event-header'>
          <View className='event-type-badge' style={{ backgroundColor: typeInfo.color }}>
            {typeInfo.icon}
          </View>
          <View className='event-title-section'>
            <Text className='event-title'>{event.title}</Text>
            {event.is_key_node === 1 && <View className='key-node-tag'>关键节点</View>}
          </View>
        </View>
        <View className='event-meta'>
          <Text className='event-type-text'>事件日期:</Text>
          <Text className='event-date'>{event.eventDate}</Text>
        </View>
      </View>

      {/* 事件详细内容 - 治疗小结专用布局 */}
      {(event.eventType === 'treatment' || event.eventType === 4) && event.treatmentContent && (
        <View className='event-content-section'>
          <View className='treatment-info-item'>
            <Text className='info-label'>就诊医院：</Text>
            <Text className='info-value'>{event.treatmentContent.hospital_name}</Text>
          </View>
          <View className='treatment-info-item'>
            <Text className='info-label'>医生姓名：</Text>
            <Text className='info-value'>{event.treatmentContent.doctor_name}</Text>
          </View>
          <View className='treatment-info-item'>
            <Text className='info-label'>诊断结果：</Text>
            <Text className='info-value multi-line'>{event.treatmentContent.diagnosis_result}</Text>
          </View>
          <View className='treatment-info-item'>
            <Text className='info-label'>治疗方案：</Text>
            <Text className='info-value multi-line'>{event.treatmentContent.treatment_plan}</Text>
          </View>
        </View>
      )}

      {/* 事件详细内容 - 检查事件专用布局 */}
      {(event.eventType === 'inspection' || event.eventType === 2) && event.inspectionContent && (
        <View className='event-content-section'>
          <View className='inspection-info-item'>
            <Text className='info-label'>检查机构：</Text>
            <Text className='info-value'>{event.inspectionContent.inspection_organization}</Text>
          </View>
          <View className='inspection-info-item'>
            <Text className='info-label'>检查项目：</Text>
            <Text className='info-value'>{event.inspectionContent.inspection_item}</Text>
          </View>
          <View className='inspection-info-item'>
            <Text className='info-label'>检查结果：</Text>
            <Text className='info-value multi-line'>{event.inspectionContent.inspection_result}</Text>
          </View>
          <View className='inspection-info-item'>
            <Text className='info-label'>备注：</Text>
            <Text className='info-value multi-line'>{event.inspectionContent.remark || '-'}</Text>
          </View>
        </View>
      )}

      {/* 事件详细内容 - 用药事件专用布局 */}
      {(event.eventType === 'medication' || event.eventType === 3) && event.medicationContent && (
        <View className='event-content-section'>
          {/* 用药备注 */}
          <View className='treatment-info-item'>
            <Text className='ection-title'>1.用药备注：</Text>
            <Text className='info-value multi-line'>{event.medicationContent.content || '-'}</Text>
          </View>

          {/* 用药记录 */}
          {event.medicationContent.medications && event.medicationContent.medications.length > 0 && (
            <View className='medication-records-wrapper'>
               <Text className='section-title'>2.用药记录</Text>
              {event.medicationContent.medications.map((medication, index) => (
                <View key={index} className='medication-record'>
                  <View className='treatment-info-item'>
                    <Text className='info-label'>药物名称：</Text>
                    <Text className='info-value'>{medication.drugName || medication.drug_name || '-'}</Text>
                  </View>
                  <View className='treatment-info-item'>
                    <Text className='info-label'>剂量：</Text>
                    <Text className='info-value'>{medication.dosage || '-'}</Text>
                  </View>
                  <View className='treatment-info-item'>
                    <Text className='info-label'>用法：</Text>
                    <Text className='info-value'>{medication.usageRemark || '-'}</Text>
                  </View>
                  <View className='treatment-info-item'>
                    <Text className='info-label'>用药时间：</Text>
                    <Text className='info-value'>
                      {medication.startDate || medication.start_date || '-'} 至 {medication.endDate || medication.end_date || '至今'}
                    </Text>
                  </View>
                  {index < event.medicationContent.medications.length - 1 && (
                    <View className='medication-divider'></View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 事件详细内容 - 其他事件类型 */}
      {!(event.eventType === 'treatment' || event.eventType === 4 || event.eventType === 'inspection' || event.eventType === 2 || event.eventType === 'medication' || event.eventType === 3) && (
        <View className='event-content-section'>
          <Text className='section-title'>详细内容</Text>
          <View className='content-body'>
            <Text className='content-text'>{event.content}</Text>
          </View>
        </View>
      )}


      {/* 附件列表 */}
      {event.attachments && event.attachments.length > 0 && (
        <View className='attachments-section'>
          <Text className='section-title'>相关附件</Text>
          
          {/* 图片附件水平滚动展示 */}
          {event.attachments.some(att => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(att.fileName)) && (
            <ScrollView className='image-scroll-container' scrollX showsHorizontalScrollIndicator={false}>
              <View className='image-scroll-list'>
                {event.attachments
                  .filter(att => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(att.fileName))
                  .map((attachment, index) => (
                    <View key={attachment.id} className='image-scroll-item'>
                      <View 
                        className='image-preview'
                        onClick={() => {
                          // 预览图片
                          const imageUrls = event.attachments
                            .filter(att => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(att.fileName))
                            .map(att => att.filePath);
                          const currentIndex = imageUrls.indexOf(attachment.filePath);
                          
                          Taro.previewImage({
                            urls: imageUrls,
                            current: currentIndex
                          });
                        }}
                      >
                        <Image 
                          src={attachment.filePath} 
                          className='attachment-image'
                          mode='aspectFill'
                        />
                      </View>
                    </View>
                  ))}
              </View>
            </ScrollView>
          )}
          
          {/* 非图片附件列表 */}
          {event.attachments.some(att => !/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(att.fileName)) && (
            <View className='non-image-attachments'>
              {event.attachments
                .filter(att => !/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(att.fileName))
                .map(attachment => (
                  <View key={attachment.id} className='attachment-item'>
                    <View className='attachment-info'>
                      <Text className='attachment-name'>{attachment.fileName}</Text>
                      <Text className='attachment-size'>
                        {(attachment.fileSize / 1024 / 1024).toFixed(2)}MB
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          )}
        </View>
      )}

      {/* 操作按钮 */}
      <View className='action-buttons'>
        <Button
          className='edit-btn'
          onClick={() => {
            // 根据事件类型跳转到对应的编辑页面
            if (event.event_type === 4 || event.eventType === 'treatment') {
              // 治疗小结：使用addTreatment页面（支持编辑）
              Taro.navigateTo({
                url: `/pages/addTreatment/addTreatment?id=${id}&patientId=${patientId}`,
              });
            } else if (event.event_type === 2 || event.eventType === 'inspection') {
              Taro.navigateTo({
                url: `/pages/addInspection/addInspection?id=${id}&patientId=${patientId}`,
              });
            } else if (event.event_type === 3 || event.eventType === 'common') {
              Taro.navigateTo({
                url: `/pages/addGeneralEvent/addGeneralEvent?id=${id}&patientId=${patientId}`,
              });
            } else {
              Taro.navigateTo({
                url: `/pages/addMedication/addMedication?id=${id}&patientId=${patientId}`,
              });
            }
          }}
        >
          编辑事件
        </Button>
        <Button
          className='delete-btn'
          onClick={() => {
            Taro.showModal({
              title: '确认删除',
              content: '确定要删除这个事件吗？删除后不可恢复。',
              success: res => {
                if (res.confirm) {
                  // 调用删除接口
                  del(`/api/timeline/timeline-events/${id}`).then(() => {
                    Taro.showToast({ title: '删除成功' });
                    Taro.navigateBack();
                  }).catch(error => {
                    Taro.showToast({ title: '删除失败', icon: 'none' });
                    console.error('Failed to delete event:', error);
                  });
                }
              },
            });
          }}
        >
          删除事件
        </Button>
      </View>
    </ScrollView>
  );
};

export default EventDetail;
