import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { Button, Checkbox, Form, Image, Input, TextArea, Toast } from '@nutui/nutui-react-taro';
import { useCallback, useEffect, useRef, useState } from 'react';

import CityPicker from '@/components/CityPicker';
import DateTimePicker from '@/components/DateTimePicker';
import HospitalPicker from '@/components/HospitalPicker';
import MedicalChaperonPicker from '@/components/MedicalChaperonPicker';
import { COS_URLS } from '@/constants';
import { requestPayment } from '@/utils/payment';
import { get, post } from '@/utils/request';
import './order.scss';

function OrderPage() {
  const {
    serviceType,
    city: cityParam,
    id: hospitalId,
    medicalEscortId,
  } = Taro.getCurrentInstance().router.params;

  const [form] = Form.useForm();
  const cityPickerRef = useRef();
  const dateTimePickerRef = useRef();
  const hospitalPickerRef = useRef();
  const medicalChaperonPickerRef = useRef();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState(cityParam || '');

  // 控制选择的城市
  const handleCityChange = cityValue => {
    setCurrentCity(cityValue);
  };

  // 获取服务详情
  const fetchServiceDetail = useCallback(async serviceId => {
    if (!serviceId) return;

    try {
      setServiceLoading(true);
      const result = await get(`/api/medicalEscorts/service/${serviceId}`);

      if (result) {
        setCurrentService(result);
      }
    } catch (error) {
      console.error('获取服务详情失败:', error);
      Toast.show('order', {
        content: '获取服务信息失败',
        icon: 'error',
      });
    } finally {
      setServiceLoading(false);
    }
  }, []);

  // 设置表单初始值
  useEffect(() => {
    if (hospitalId) {
      form.setFieldsValue({ hospitalId });
    }
    if (medicalEscortId) {
      form.setFieldsValue({ medicalEscortId });
    }
  }, [hospitalId, medicalEscortId, form]);

  // 获取服务详情
  useEffect(() => {
    if (serviceType) {
      fetchServiceDetail(serviceType);
    }
  }, [serviceType, fetchServiceDetail]);

  // 生成符合要求的起始日期（分钟只能是00或30）
  const getValidStartDate = () => {
    const now = new Date();
    const minutes = now.getMinutes();

    // 如果当前分钟数小于30，设置为30分
    if (minutes < 30) {
      now.setMinutes(30, 0, 0);
    } else {
      // 如果当前分钟数大于等于30，设置为下一小时的00分
      now.setHours(now.getHours() + 1, 0, 0, 0);
    }

    return now;
  };

  // 函数校验
  const customValidator = (rule, value) => {
    return /^\d+$/.test(value);
  };

  const phoneValidator = (rule, value) => {
    return /^1[3-9]\d{9}$/.test(value);
  };

  // 处理日期时间选择
  const handleDateTimeChange = (dateValue, _info) => {
    form.setFieldsValue({ serviceDate: dateValue });
  };

  // 处理医院选择
  const handleHospitalChange = (id, _info) => {
    form.setFieldsValue({ hospitalId: id });
  };

  // 处理陪诊师选择
  const handleMedicalChaperonChange = (id, _info) => {
    form.setFieldsValue({ medicalEscortId: id });
  };

  // 跳转隐私政策和用户服务协议
  const gotoPrivacy = () => {
    Taro.downloadFile({
      url: COS_URLS.PRIVACY_POLICY,
      success: res => {
        Taro.openDocument({
          filePath: res.tempFilePath,
        });
      },
    });
  };

  // 跳转用户服务协议
  const gotoServiceAgreement = () => {
    Taro.downloadFile({
      url: COS_URLS.SERVICE_AGREEMENT,
      success: res => {
        Taro.openDocument({
          filePath: res.tempFilePath,
        });
      },
    });
  };

  const handleSubmit = async values => {
    if (!agreeTerms) {
      Toast.show('order', {
        content: '请先阅读并同意服务协议',
        icon: 'warn',
      });
      return;
    }

    if (!currentService) {
      Toast.show('order', {
        content: '服务信息加载中，请稍后重试',
        icon: 'warn',
      });
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        ...values,
        serviceId: serviceType,
        hospitalName: hospitalPickerRef.current?.getSelectedHospital()?.text,
        chaperonName: medicalChaperonPickerRef.current?.getSelectedChaperon()?.text,
      };
      delete bookingData.city;

      const result = await post('/api/orders', bookingData);

      if (result && result.outTradeNo) {
        Toast.show('order', {
          content: '预约成功！',
          icon: 'success',
        });
        // 使用统一支付函数
        await requestPayment({
          outTradeNo: result.outTradeNo,
          onSuccess: () => {
            Toast.show('order', {
              content: '支付成功',
              icon: 'success',
            });
          },
          onFail: () => {
            Toast.show('order', {
              content: '支付失败',
              icon: 'error',
            });
          },
          onCancel: () => {
            // 用户取消支付，不做额外处理
          },
        });
      } else {
        Toast.show('order', {
          content: result.msg || '预约失败',
          icon: 'error',
        });
      }
    } catch (error) {
      Toast.show('order', {
        content: error.message || '预约失败',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='order-page'>
      {/* 服务信息卡片 */}
      <View className='service-card'>
        <Image
          className='service-image'
          width={100}
          height={80}
          src={currentService?.image || ''}
          radius={10}
          mode='aspectFill'
        />
        <View className='service-info'>
          {serviceLoading ? (
            <>
              <Text className='service-title'>加载中...</Text>
              <Text className='service-price'>¥--</Text>
            </>
          ) : (
            <>
              <Text className='service-title'>
                {currentService?.name || currentService?.label || '服务'}
              </Text>
              <Text className='service-price'>¥{currentService?.price || 0}</Text>
            </>
          )}
        </View>
      </View>

      {/* 预约表单 - 联系方式 */}
      <View className='booking-form-container'>
        <Form divider labelPosition='left' starPosition='right' form={form} onFinish={handleSubmit}>
          <View className='booking-form'>
            <Form.Item
              label='就诊人姓名'
              name='patientName'
              rules={[{ required: true, message: '请输入就诊人姓名' }]}
            >
              <Input placeholder='请输入就诊人姓名' />
            </Form.Item>
            <Form.Item
              label='联系方式'
              name='patientPhone'
              rules={[
                { required: true, message: '请输入联系方式' },
                { validator: customValidator, message: '必须输入数字' },
                { validator: phoneValidator, message: '必须输入手机号码' },
              ]}
            >
              <Input placeholder='请输入联系方式' />
            </Form.Item>
            <Form.Item
              label='陪诊城市'
              name='city'
              rules={[{ required: true, message: '请选择陪诊的城市' }]}
            >
              <CityPicker
                ref={cityPickerRef}
                placeholder='请选择陪诊城市'
                title='选择陪诊城市'
                onChange={handleCityChange}
                city={currentCity}
                cellProps={{ style: { boxShadow: 'none', padding: 0, margin: 0 } }}
              />
            </Form.Item>
            <Form.Item
              label='服务日期'
              name='serviceDate'
              rules={[{ required: true, message: '请选择服务日期' }]}
            >
              <DateTimePicker
                ref={dateTimePickerRef}
                type='datetime'
                placeholder='请选择服务日期时间'
                title='选择服务日期时间'
                startDate={getValidStartDate()}
                minuteStep={30}
                onChange={handleDateTimeChange}
              />
            </Form.Item>
            <Form.Item label='服务要求' name='remark'>
              <TextArea autoHeight placeholder='请输入服务要求' />
            </Form.Item>
          </View>

          {/* 预约表单 - 医院和陪诊师信息 */}
          <View className='booking-form'>
            <Form.Item
              label='就诊医院'
              name='hospitalId'
              rules={[{ required: true, message: '请选择就诊医院' }]}
            >
              <HospitalPicker
                ref={hospitalPickerRef}
                placeholder='请选择就诊医院'
                title='选择就诊医院'
                city={currentCity}
                onChange={handleHospitalChange}
              />
            </Form.Item>
            <Form.Item label='陪诊师' name='medicalEscortId'>
              <MedicalChaperonPicker
                ref={medicalChaperonPickerRef}
                city={currentCity}
                onChange={handleMedicalChaperonChange}
              />
            </Form.Item>
          </View>
        </Form>
      </View>

      {/* TODO: 预约表单 - 接送服务 & 保险 */}

      <View className='bootom-tips'>
        <View className='contact-tip'>支付后您的专属陪诊助理会在第一时间联系您</View>
      </View>

      {/* 底部信息和支付 */}
      <View className='bottom-info'>
        <View className='agreement'>
          <Checkbox checked={agreeTerms} onChange={setAgreeTerms}>
            我已阅读并同意{' '}
            <Text className='agreement-link' onClick={gotoServiceAgreement}>
              《用户服务协议》
            </Text>{' '}
            和{' '}
            <Text className='agreement-link' onClick={gotoPrivacy}>
              《隐私政策》
            </Text>
          </Checkbox>
        </View>

        <View className='pay-section'>
          <View className='price-info'>
            <Text className='price'>¥{currentService?.price || 0}</Text>
          </View>
          <Button
            className='pay-btn'
            type='primary'
            loading={loading}
            onClick={() => form.submit()}
          >
            立即支付
          </Button>
        </View>
      </View>
      <Toast id='order' />
    </View>
  );
}

export default OrderPage;
