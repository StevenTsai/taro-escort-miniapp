import { Image, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { Button, Cell, CellGroup, Form, Input, Picker, Textarea, Toast } from '@nutui/nutui-react-taro';
import { useEffect, useRef, useState } from 'react';

import CityPicker from '@/components/CityPicker';
import { get, post, upload } from '@/utils/request';

import './register.scss';

function Register() {
  const cityPickerRef = useRef(null);
  const [form] = Form.useForm();

  // 使用ref保存form实例，确保在事件处理函数中能访问到最新的form实例
  const formRef = useRef(form);

  // 当form实例更新时，同步到ref
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  // 状态管理
  const [avatar, setAvatar] = useState(''); // 展示用（url）
  const [avatarCommit, setAvatarCommit] = useState(''); // 提交用（objKeyUrl）
  const [idCardFront, setIdCardFront] = useState(''); // 展示用（url）
  const [idCardFrontCommit, setIdCardFrontCommit] = useState(''); // 提交用（objKeyUrl）
  const [idCardBack, setIdCardBack] = useState(''); // 展示用（url）
  const [idCardBackCommit, setIdCardBackCommit] = useState(''); // 提交用（objKeyUrl）
  const [tags, setTags] = useState([]); // 改为一维数组，用于标签云展示
  const [selectedTags, setSelectedTags] = useState([]);
  const [genderValue, setGenderValue] = useState('');
  const [cityValue, setCityValue] = useState('');
  const [genderPickerVisible, setGenderPickerVisible] = useState(false);

  // 分步表单状态
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // 获取标签列表
  const fetchTags = async () => {
    try {
      const result = await get('/api/medicalEscorts/tags');
      // 适配实际接口返回格式: {tags: ['标签1', '标签2', ...]}
      if (result && Array.isArray(result.tags)) {
        // 将标签转换为一维数组格式，用于标签云展示
        const tagOptions = result.tags.map(tag => ({ label: tag, value: tag }));
        setTags(tagOptions);
      } else {
        Toast.show('toast-register', {
          content: '获取标签失败',
          icon: 'error',
        });
        setTags([]);
      }
    } catch (error) {
      console.error('获取标签失败:', error);
      Toast.show('toast-register', {
        content: '获取标签失败',
        icon: 'error',
      });
      setTags([]);
    }
  };

  // 上传图片
  const uploadImage = async type => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });

      const tempFilePath = res.tempFilePaths[0];
      const fileName = tempFilePath.split('/').pop();
      const path = '/identification/';

      // 显示上传中提示
      Taro.showLoading({ title: '上传中...' });

      // 上传图片到服务器
      const uploadResult = await upload('/api/medicalEscorts/uploadIDCard', tempFilePath, {
        objKey: fileName,
        path: path
      });

      Taro.hideLoading();

      // 解析上传结果
      const data = JSON.parse(uploadResult.data);

      if (data.code ===200) {
        // 返回url和objKeyUrl两个字段
        return {
          url: data.data.url,
          objKeyUrl: data.data.objKeyUrl
        };
      } else {
        Toast.show('toast-register', {
          content: '上传失败',
          icon: 'error',
        });
        return null;
      }
    } catch (error) {
      Taro.hideLoading();
      console.error('上传图片失败:', error);
      Toast.show('toast-register', {
        content: '上传失败',
        icon: 'error',
      });
      return null;
    }
  };

  // 上传头像
  const handleAvatarUpload = async () => {
    const result = await uploadImage('avatar');
    if (result && result.url && result.objKeyUrl) {
      setAvatar(result.url); // 展示用：API返回的完整URL
      setAvatarCommit(result.objKeyUrl); // 提交用：路径+文件名组合
    }
  };

  // 上传身份证正面
  const handleIdCardFrontUpload = async () => {
    const result = await uploadImage('front');
    if (result && result.url && result.objKeyUrl) {
      setIdCardFront(result.url); // 展示用：API返回的完整URL
      setIdCardFrontCommit(result.objKeyUrl); // 提交用：路径+文件名组合
    }
  };

  // 上传身份证反面
  const handleIdCardBackUpload = async () => {
    const result = await uploadImage('back');
    if (result && result.url && result.objKeyUrl) {
      setIdCardBack(result.url); // 展示用：API返回的完整URL
      setIdCardBackCommit(result.objKeyUrl); // 提交用：路径+文件名组合
    }
  };

  // 切换标签选择状态
  const toggleTagSelection = tag => {
    setSelectedTags(prev => {
      if (prev.includes(tag.value)) {
        return prev.filter(t => t !== tag.value);
      } else {
        return [...prev, tag.value];
      }
    });
  };

  // 身份证号码验证
  const idCardValidator = (rule, value) => {
    // 简单的身份证号码验证规则
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return reg.test(value);
  };

  // 初始化获取标签
  useEffect(() => {
    fetchTags();
  }, []);

  // 监听城市值变化，更新表单
  useEffect(() => {
    if (cityValue && formRef.current && typeof formRef.current.setFieldsValue === 'function') {
      formRef.current.setFieldsValue({
        city: cityValue,
      });
    }
  }, [cityValue]);

  // 监听性别选择变化，更新表单
  useEffect(() => {
    if (genderValue && formRef.current && typeof formRef.current.setFieldsValue === 'function') {
      formRef.current.setFieldsValue({
        gender: genderValue,
      });
    }
  }, [genderValue]);

  // 监听标签选择变化，更新表单
  useEffect(() => {
    if (formRef.current && typeof formRef.current.setFieldsValue === 'function') {
      // 无论selectedTags是否为空，都更新表单值
      formRef.current.setFieldsValue({
        tags: selectedTags,
      });
    }
  }, [selectedTags]);

  const submitFailed = error => {
    Toast.show('toast-register', {
      content: JSON.stringify(error),
      icon: 'error',
    });
  };

  const submitSucceed = async values => {
    try {
      // 使用封装的post方法
      const result = await post(
        '/api/medicalEscorts/apply',
        {
          ...values,
          city: encodeURIComponent(values.city),
          avatar: avatarCommit, // 使用提交用的objKeyUrl
          idCardFrontImage: idCardFrontCommit, // 使用提交用的objKeyUrl
          idCardBackImage: idCardBackCommit, // 使用提交用的objKeyUrl
        },
        {
          onSuccess: data => {
            Toast.show('toast-register', {
              content: '报名成功',
              icon: 'success',
              onClose: () => {
                Taro.switchTab({
                  url: '/pages/profile/profile',
                });
              },
            });
          },
          onError: error => {
            const code = error?.code;
            const msg = error?.msg;

            if (code === 20002) {
              // 专门处理未登录情况
              Toast.show('toast-register', {
                content: msg || '未登录或已过期',
                icon: 'error',
                onClose: () => {
                  Taro.switchTab({
                    url: '/pages/profile/profile',
                  });
                },
              });
            } else {
              const errorMessage = msg || '提交失败，请稍后重试';
              Toast.show('toast-register', {
                content: errorMessage,
                icon: 'error',
              });
            }
          },
        }
      );

      return result;
    } catch (error) {
      // 网络错误或其他异常
      const errorMessage = error?.message || '网络请求失败，请稍后重试';
      Toast.show('toast-register', {
        content: errorMessage,
        icon: 'error',
      });
    }
  };

  // 函数校验
  const customValidator = (rule, value) => {
    return /^\d+$/.test(value);
  };

  const phoneValidator = (rule, value) => {
    return /^1[3-9]\d{9}$/.test(value);
  };

  const onFinish = values => {
    Taro.requestSubscribeMessage({
      tmplIds: [
        'xFXHUxi1wREwX_sHxkWjrhfdvLPSugtfAP5ns4YDj4Q',
        '23oVo6eA0LXP1VTKrRmztie4LM7mi0m1J-8ZjOf1sXU',
        '-h75fmq3IWMddNhy2bfP4-Gv4z8eHv5E_aw5K5MeKA0',
      ],
      success: res => {
        // 检查是否有任何模板被拒绝
        let hasRejected = false;
        const tmplIds = ['xFXHUxi1wREwX_sHxkWjrhfdvLPSugtfAP5ns4YDj4Q', '23oVo6eA0LXP1VTKrRmztie4LM7mi0m1J-8ZjOf1sXU', '-h75fmq3IWMddNhy2bfP4-Gv4z8eHv5E_aw5K5MeKA0'];

        for (const tmplId of tmplIds) {
          // 只检查实际返回的模板状态，未返回的表示之前已经处理过
          if (tmplId in res) {
            // 检查所有非接受状态：reject（拒绝）、ban（封禁）、filter（过滤）等
            if (res[tmplId] !== 'accept') {
              hasRejected = true;
              break;
            }
          }
        }

        // if (!hasRejected) {
          // 没有模板被拒绝，可以提交
          // Toast.show('toast-register', {
          //   content: '订阅成功',
          //   icon: 'success',
          // });
          submitSucceed(values);
        // } else {
        //   // 有模板被拒绝，显示提示
        //   Toast.show('toast-register', {
        //     content: '请同意陪诊师消息通知，否则无法报名',
        //     icon: 'error',
        //   });
        // }
      },
      fail: err => {
        // 订阅请求失败，提供重试机会
        Toast.show('toast-register', {
          content: '订阅请求失败，请重试',
          icon: 'error',
        });
      },
    });
  };

  // 步骤导航函数
  const goToNextStep = async () => {
    if (currentStep < totalSteps) {
      // 验证当前步骤的必填项
      let fieldsToValidate = [];
      
      // 根据当前步骤确定需要验证的字段
      if (currentStep === 1) {
        fieldsToValidate = ['name', 'phone', 'age', 'gender', 'city'];
        
        // 手动更新性别和城市字段的值，确保它们已经同步到表单实例
        // 移除条件判断，确保始终更新字段值
        if (formRef.current && typeof formRef.current.setFieldsValue === 'function') {
          formRef.current.setFieldsValue({ gender: genderValue });
          formRef.current.setFieldsValue({ city: cityValue });
        }
      } else if (currentStep === 2) {
        fieldsToValidate = ['tags', 'bio'];
        
        // 手动更新标签字段的值
        if (formRef.current && typeof formRef.current.setFieldsValue === 'function') {
          formRef.current.setFieldsValue({ tags: selectedTags });
        }
      }
      
      try {
        // 短暂延迟，确保字段值已更新
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 检查表单实例是否存在
        if (!formRef.current) {
          console.error('表单实例不存在');
          return;
        }
        
        // 安全地获取表单字段值（使用try-catch包裹）
        try {
          if (typeof formRef.current.getFieldsValue === 'function') {
            formRef.current.getFieldsValue();
          } else {
            console.error('getFieldsValue不是函数');
          }
        } catch (err) {
          console.error('获取表单字段值失败:', err);
        }
        
        // 验证指定字段 - 检查validate方法是否存在
        if (typeof formRef.current.validateFields === 'function') {
          // NutUI可能使用validateFields方法
          await formRef.current.validateFields(fieldsToValidate);
        } else if (typeof formRef.current.validate === 'function') {
          // 尝试使用validate方法
          await formRef.current.validate(fieldsToValidate);
        } else {
          throw new Error('表单验证方法不存在');
        }
        
        // 验证通过，进入下一步
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        // 验证失败，显示提示
        console.error('表单验证失败:', error);
        Toast.show('toast-register', {
          content: '请先补充本页的必填数据项！',
          icon: 'error',
        });
      }
    } else {
      // 最后一步，提交前检查所有必填项
      try {
        // 检查表单实例是否存在
        if (!formRef.current) {
          console.error('表单实例不存在');
          return;
        }
        
        // 1. 验证所有Form.Item的必填项
        if (typeof formRef.current.validateFields === 'function') {
          // NutUI可能使用validateFields方法
          await formRef.current.validateFields();
        } else if (typeof formRef.current.validate === 'function') {
          // 尝试使用validate方法
          await formRef.current.validate();
        } else {
          throw new Error('表单验证方法不存在');
        }
        
        // 2. 检查非Form.Item的必填项
        let hasMissingFields = false;
        let errorMessage = '请先补充以下必填项：';
        
        if (!avatarCommit) {
          hasMissingFields = true;
          errorMessage += '\n- 头像';
        }
        
        if (!idCardFrontCommit) {
          hasMissingFields = true;
          errorMessage += '\n- 身份证正面照片';
        }
        
        if (!idCardBackCommit) {
          hasMissingFields = true;
          errorMessage += '\n- 身份证反面照片';
        }
        
        if (hasMissingFields) {
          Toast.show('toast-register', {
            content: errorMessage,
            icon: 'error',
          });
          return;
        }
        
        // 所有必填项都已填写，提交表单
        if (typeof formRef.current.submit === 'function') {
          formRef.current.submit();
        } else {
          // 如果没有submit方法，直接调用onFinish函数
          console.error('submit方法不存在，直接调用onFinish');
          onFinish(formRef.current.getFieldsValue?.() || {});
        }
      } catch (error) {
        // Form.Item验证失败，显示提示
        console.error('表单验证失败:', error);
        Toast.show('toast-register', {
          content: '请先补充所有必填数据项！',
          icon: 'error',
        });
      }
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <View className='register-container'>
      {/* 页面标题 */}
      <View className='register-header'>
     
        {/* 进度指示器 */}
        <View className='progress-container'>
          <View className='progress-bar'>
            <View
              className='progress-fill'
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </View>
          <View className='step-indicators'>
            {Array.from({ length: totalSteps }, (_, index) => (
              <View
                key={index}
                className={`step-indicator ${currentStep >= index + 1 ? 'active' : ''}`}
              >
                <Text className='step-number'>{index + 1}</Text>
              </View>
            ))}
          </View>
          <Text className='step-text'>
            {currentStep}/{totalSteps}
          </Text>
        </View>
      </View>

      {/* 表单内容 */}
      <Form
        className='register-form'
        form={form}
        labelPosition='left'
        starPosition='right'
        onFinish={onFinish}
        onFinishFailed={(values, errors) => submitFailed(errors)}
      >
        {/* 步骤1：基本信息与个人信息 */}
        {currentStep === 1 && (
          <View className='step-content'>
            <View className='form-card'>
              <Text className='card-title'>基本信息</Text>
              <Form.Item
                label='姓名'
                name='name'
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder='请输入姓名' type='text' />
              </Form.Item>
              <Form.Item
                label='电话'
                name='phone'
                rules={[
                  { required: true, message: '请输入电话' },
                  { validator: customValidator, message: '必须输入数字' },
                  { validator: phoneValidator, message: '必须输入手机号码' },
                ]}
              >
                <Input placeholder='请输入电话' type='text' />
              </Form.Item>

              <Form.Item
                label='年龄'
                name='age'
                rules={[{ required: true, message: '请输入年龄' }]}
              >
                <Input placeholder='请输入年龄' type='number' min='18' max='65' />
              </Form.Item>
              <Form.Item
                label='性别'
                name='gender'
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <CellGroup divider={false} className='gender-picker'>
                  <Cell
                    className='gender-picker-cell'
                    title={genderValue ? (genderValue === '男' ? '男' : '女') : '请选择性别'}
                    titleStyle={{
                      color: genderValue ? '#323233' : '#969799',
                    }}
                    isLink
                    clickable
                    onClick={() => {
                      setGenderPickerVisible(true);
                    }}
                  />
                  <Picker
                    title='选择性别'
                    visible={genderPickerVisible}
                    value={genderValue ? [genderValue] : []}
                    options={[
                      [
                        { label: '男', value: '男' },
                        { label: '女', value: '女' },
                      ]
                    ]}
                    onConfirm={(options, values) => {
                      const selectedGender = values[0]; // values[0]直接是选中项的value，不是索引
                      setGenderValue(selectedGender);
                      setGenderPickerVisible(false);
                      if (formRef.current && typeof formRef.current.setFieldsValue === 'function' && selectedGender) {
                        formRef.current.setFieldsValue({
                          gender: selectedGender,
                        });
                      }
                    }}
                    onCancel={() => {
                      setGenderPickerVisible(false);
                    }}
                    onClose={() => {
                      setGenderPickerVisible(false);
                    }}
                  />
                </CellGroup>
              </Form.Item>

              <Form.Item
                label='所在城市'
                name='city'
                rules={[{ required: true, message: '请选择城市' }]}
              >
                <CityPicker
                  style={{ padding: 0 }}
                  ref={cityPickerRef}
                  placeholder='请选择城市'
                  title='选择所在城市'
                  onChange={value => {
                    setCityValue(value);
                  }}
                />
              </Form.Item>

              {/* 头像上传 */}
              <View className='upload-section'>
                <Text className='section-title'>头像：只能上传1M以内的照片</Text>
                <View className='avatar-uploader'>
                  <View className='avatar-preview' onClick={handleAvatarUpload}>
                    {avatar ? (
                      <Image src={avatar} width={120} height={120} mode='aspectFill' />
                    ) : (
                      <View className='upload-placeholder'>
                        <Text>点击上传头像</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 步骤2：专业标签 */}
        {currentStep === 2 && (
          <View className='step-content'>
            <View className='form-card'>
              <Text className='card-title'>专业信息</Text>
              <Form.Item
                label='专业标签'
                name='tags'
                rules={[{ required: true, message: '请选择至少一个标签' }]}
              >
                <View className='tag-cloud'>
                  {tags.length > 0 ? (
                    tags.map(tag => (
                      <View
                        key={tag.value}
                        className={`tag-item ${selectedTags.includes(tag.value) ? 'selected' : ''}`}
                        onClick={() => toggleTagSelection(tag)}
                      >
                        <Text>{tag.label}</Text>
                      </View>
                    ))
                  ) : (
                    <Text className='no-tags'>加载标签中...</Text>
                  )}
                </View>
                <Text className='selected-tags-text'>
                  已选: {selectedTags.join(', ') || '未选择'}
                </Text>
              </Form.Item>

              {/* 个人简介 */}
              <Form.Item
                label='个人简介'
                name='bio'
                rules={[{ required: true, message: '请输入个人简介' }]}
              >
                <Textarea
                  placeholder='请输入个人简介:介绍您的专业背景、陪诊经验等,会展示在陪诊师个人页'
                  rows={12}
                  maxlength={500}
                  showWordLimit
                  className='introduction-textarea'
                />
              </Form.Item>
            </View>
          </View>
        )}

        {/* 步骤3：身份验证 */}
        {currentStep === 3 && (
          <View className='step-content'>
            <View className='form-card'>
              <Text className='card-title'>身份验证</Text>


              {/* 身份证信息 */}
              <Form.Item
                label='身份证号'
                name='idCardNumber'
                rules={[
                  { required: true, message: '请输入身份证号码' },
                  { validator: idCardValidator, message: '请输入有效的身份证号码' },
                ]}
              >
                <Input placeholder='请输入身份证号码' type='text' />
              </Form.Item>

              {/* 身份证正反面上传 */}
              <View className='upload-section'>
                <Text className='section-title'>身份证照片：只能上传1M以内的照片</Text>
                <View className='id-card-uploader'>
              
                  <View className='id-card-preview-item' onClick={handleIdCardFrontUpload}>
                    {idCardFront ? (
                      <Image src={idCardFront} width='100%' height='100%' mode='aspectFill' />
                    ) : (
                      <View className='upload-placeholder'>
                        <Text>点击上传身份证正面</Text>
                      </View>
                    )}
                  </View>

                  <View className='id-card-preview-item' onClick={handleIdCardBackUpload}>
                    {idCardBack ? (
                      <Image src={idCardBack} width='100%' height='100%' mode='aspectFill' />
                    ) : (
                      <View className='upload-placeholder'>
                        <Text>点击上传身份证反面</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 步骤导航按钮 */}
        <View className='step-navigation'>
          {currentStep > 1 && (
            <Button type='default' className='nav-button prev-button' onClick={goToPrevStep}>
              上一步
            </Button>
          )}
          <Button type='primary' className='nav-button next-button' onClick={goToNextStep}>
            {currentStep < totalSteps ? '下一步' : '提交'}
          </Button>
        </View>
      </Form>
      <Toast id='toast-register' />
    </View>
  );
}

export default Register;
