import { get } from '@/utils/request';
import { Button, ScrollView, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useState } from 'react';
import './reportGenerate.scss';

const ReportGenerate = () => {
  // 使用Taro的路由功能获取参数
  const patientId = Taro.getCurrentInstance().router.params.id;
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  /**
   * 加载报告数据
   */
  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      // 调用报告生成API
      const response = await get(`/api/timeline/report/generate/${patientId}`);

      if (response) {
        setReportData(response);
      } else {
        Taro.showToast({
          title: '报告生成失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('Failed to load report data:', error);
      Taro.showToast({
        title: '网络错误',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadReportData();
  }, [patientId, loadReportData]); // 添加loadReportData到依赖项

  /**
   * 下载PDF文件
   */
  const handleDownloadPDF = async () => {
    try {
      setDownloadLoading(true);
      // 调用PDF下载API
      const response = await get('/api/timeline/report/export-pdf', {
        patientId,
      });

      if (response) {
        const { downloadUrl } = response;
        if (downloadUrl) {
          // 触发下载
          Taro.downloadFile({
            url: downloadUrl,
            success: res => {
              if (res.statusCode === 200) {
                Taro.openDocument({
                  filePath: res.tempFilePath,
                  showMenu: true,
                  success: () => {
                    Taro.showToast({
                      title: 'PDF下载成功',
                      icon: 'success',
                    });
                  },
                });
              }
            },
            fail: err => {
              console.error('Failed to download PDF:', err);
              Taro.showToast({
                title: 'PDF下载失败',
                icon: 'none',
              });
            },
          });
        }
      } else {
        Taro.showToast({
          title: 'PDF下载失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
      Taro.showToast({
        title: '网络错误',
        icon: 'none',
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  /**
   * 渲染加载状态
   */
  const renderLoading = () => {
    return (
      <View className='loading-container'>
        <Text className='loading-text'>正在生成报告，请稍候...</Text>
      </View>
    );
  };

  /**
   * 渲染错误状态
   */
  const renderError = () => {
    return (
      <View className='error-container'>
        <Text className='error-text'>报告生成失败</Text>
        <Button onClick={loadReportData} className='retry-btn'>
          重试
        </Button>
      </View>
    );
  };

  /**
   * 渲染报告内容
   */
  const renderReportContent = () => {
    if (!reportData) return renderError();

    return (
      <View className='report-container'>
        <ScrollView className='report-scroll' scrollY>
          {/* 报告头部 */}
          <View className='report-header'>
            <View className='header-top'>
              <View className='header-left'>
                <Text className='company-name'>
                  {reportData.reportHeader?.companyName || '壹鹿康行平台'}
                </Text>
                <View className='qrcode'>
                  <img src="https://medical-chaperon-1300583272.cos.ap-guangzhou.myqcloud.com/attachment/Q7-hhI9Y1CIP25c1b9cc3cb14901d6ff5ea3e721eee5.jpg" alt="二维码" />
                </View>
              </View>
            </View>
            <View className='header-title'>
              <Text className='title-text'>
                {reportData.reportHeader?.title || '问诊病历报告单'}
              </Text>
            </View>
          </View>

          {/* 报告内容 */}
          <View className='report-content'>
            {/* 患者基本信息 */}
            <View className='patient-info'>
              <Text className='section-title'>患者基础信息</Text>
              <View className='patient-details'>
                <View className='patient-item'>
                  <Text className='item-label'>姓名：</Text>
                  <Text className='item-value'>{reportData.patient?.name || '未填写'}</Text>
                </View>
                <View className='patient-item'>
                  <Text className='item-label'>年龄：</Text>
                  <Text className='item-value'>{reportData.patient?.age || '未填写'}岁</Text>
                </View>
                <View className='patient-item'>
                  <Text className='item-label'>性别：</Text>
                  <Text className='item-value'>{reportData.patient?.gender === 1 ? '男' : reportData.patient?.gender === 2 ? '女' : '未填写'}</Text>
                </View>
                <View className='patient-item'>
                  <Text className='item-label'>身高：</Text>
                  <Text className='item-value'>{reportData.patient?.height || '未填写'}cm</Text>
                </View>
                <View className='patient-item'>
                  <Text className='item-label'>体重：</Text>
                  <Text className='item-value'>{reportData.patient?.weight || '未填写'}kg</Text>
                </View>
              </View>
            </View>

            {/* 疾病诊断 */}
            <View className='disease-diagnosis'>
              <Text className='section-title'>疾病诊断：</Text>
              <Text className='content-text'>{reportData.diseaseDiagnosis || '未填写'}</Text>
            </View>

           <View className='disease-diagnosis'>
              <Text className='section-title'>治疗总结：</Text>
              <Text className='content-text'>{reportData.patient?.treatmentSummary || '未填写'}</Text>
            </View>

            {/* 基础病史 */}
            <View className='basic-medical-history'>
              <Text className='section-title'>基础病史</Text>
              {reportData.basicMedicalHistory && reportData.basicMedicalHistory.length > 0 ? (
                reportData.basicMedicalHistory.map((item, index) => (
                  <View key={index} className='history-item'>
                    <Text className='history-type'>{item.type}：</Text>
                    <Text className='history-content'>{item.content || '未填写'}</Text>
                  </View>
                ))
              ) : (
                <Text className='empty-text'>无相关记录</Text>
              )}
            </View>

            {/* 医疗事件 */}
            <View className='medical-events'>
              <Text className='section-title'>详细的诊断和治疗经历</Text>
              {reportData.medicalEvents && reportData.medicalEvents.length > 0 ? (
                reportData.medicalEvents.map((event, index) => (
                  <View key={index} className={`event-item ${event.type}-event`}>
                    <Text className='event-date'>{event.date}</Text>
                    <Text className='event-title'>{event.title}</Text>
                    
                    {/* 治疗事件 */}
                    {event.type === 'treatment' && event.content && (
                      <View className='treatment-content'>
                        {event.content.hospitalName && <Text className='event-detail'>医院：{event.content.hospitalName}</Text>}
                        {event.content.diagnosisResult && <Text className='event-detail'>诊断结果：{event.content.diagnosisResult}</Text>}
                        {event.content.treatmentPlan && <Text className='event-detail'>治疗方案：{event.content.treatmentPlan}</Text>}
                      </View>
                    )}
                    
                    {/* 用药事件 */}
                    {event.type === 'medication' && event.content && event.content.medications && (
                      <View className='medication-content'>
                        {event.content.medications.map((med, medIndex) => (
                          <View key={medIndex} className='medication-detail'>
                            <Text className='event-detail'>药品名称：{med.drugName}</Text>
                            <Text className='event-detail'>剂量：{med.dosage || '未填写'}</Text>
                            <Text className='event-detail'>用法：{med.usageRemark || '未填写'}</Text>
                            <Text className='event-detail'>用药期间：{med.startDate} 至 {med.endDate}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {/* 检查事件 */}
                    {event.type === 'inspection' && event.content && (
                      <View className='inspection-content'>
                        {event.content.inspectionOrganization && <Text className='event-detail'>检查机构：{event.content.inspectionOrganization}</Text>}
                        {event.content.inspectionResult && <Text className='event-detail'>检查结果：{event.content.inspectionResult}</Text>}
                        {event.content.remark && <Text className='event-detail'>备注：{event.content.remark}</Text>}
                      </View>
                    )}
                    
                    {/* 普通事件 */}
                    {event.type === 'common' && typeof event.content === 'string' && (
                      <Text className='event-detail'>{event.content}</Text>
                    )}
                  </View>
                ))
              ) : (
                <Text className='empty-text'>无相关记录</Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* 下载按钮 */}
        <View className='footer'>
          <Button
            className='download-btn'
            onClick={handleDownloadPDF}
            loading={downloadLoading}
            disabled={downloadLoading}
          >
            下载PDF
          </Button>
        </View>
      </View>
    );
  };

  return <View className='report-page'>{loading ? renderLoading() : renderReportContent()}</View>;
};

export default ReportGenerate;
