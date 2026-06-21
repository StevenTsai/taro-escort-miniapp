import { Button, Input, ScrollView, Text, Textarea, View } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';

import { useEffect, useState } from 'react';

import { get, post, put } from '@/utils/request';
import './createPatient.scss';

const CreatePatient = () => {
  const router = useRouter();
  const patientId = router.params.id;
  const isEditMode = !!patientId;

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    gender: 1, // 1: 男, 2: 女
    age: '',
    height: '',
    weight: '',
    phone: '',
    past_medical_history: '',
    allergy_history: '',
    family_history: '',
    disease_name: '', // 疾病名称
    treatment_summary: '', // 治疗总结
  });

  // 表单错误信息
  const [errors, setErrors] = useState({});
  // 加载状态
  const [loading, setLoading] = useState(false);

  // 设置页面标题
  useEffect(() => {
    Taro.setNavigationBarTitle({
      title: isEditMode ? '编辑患者' : '创建患者'
    });
  }, [isEditMode]);

  // 编辑模式下，加载患者信息
  useEffect(() => {
    if (isEditMode) {
      loadPatientInfo();
    }
  }, [patientId]);

  // 加载患者信息
  const loadPatientInfo = async () => {
    try {
      setLoading(true);
      const response = await get(`/api/timeline/patients/${patientId}`);
      if (response) {
        const patientData = response;
        const histories = patientData.histories || [];
        
        // 初始化病史数据
        let past_medical_history = '';
        let allergy_history = '';
        let family_history = '';
        let disease_name = '';
        
        // 根据病史类型分配数据
        histories.forEach(history => {
          switch (history.type) {
            case 0: // 疾病名称
              disease_name = history.content || '';
              break;
            case 1: // 既往病史
              past_medical_history = history.content || '';
              break;
            case 2: // 过敏史
              allergy_history = history.content || '';
              break;
            case 3: // 家族病史
              family_history = history.content || '';
              break;
          }
        });
        
        setFormData({
          name: patientData.name || '',
          gender: patientData.gender || 1,
          age: patientData.age?.toString() || '',
          height: patientData.height?.toString() || '',
          weight: patientData.weight?.toString() || '',
          phone: patientData.phone || '',
          past_medical_history,
          allergy_history,
          family_history,
          disease_name,
          treatment_summary:patientData.treatmentSummary || '',
        });
      }
    } catch (error) {
      Taro.showToast({ title: '加载患者信息失败', icon: 'none' });
      console.error('Failed to load patient info:', error);
    } finally {
      setLoading(false);
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors = {};

    // 姓名验证
    if (!formData.name.trim()) {
      newErrors.name = '请输入患者姓名';
    } else if (formData.name.length > 50) {
      newErrors.name = '姓名长度不能超过50个字符';
    }

    // 年龄验证
    if (!formData.age) {
      newErrors.age = '请输入年龄';
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 1 || age > 120) {
        newErrors.age = '年龄必须在1-120之间';
      }
    }

    // 联系电话验证
    if (!formData.phone) {
      newErrors.phone = '请输入联系电话';
    } else {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = '请输入有效的11位手机号码';
      }
    }

    // 身高验证（可选）
    if (formData.height) {
      const height = parseFloat(formData.height);
      if (isNaN(height) || height < 50 || height > 250) {
        newErrors.height = '身高必须在50-250之间';
      }
    }

    // 体重验证（可选）
    if (formData.weight) {
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight < 10 || weight > 200) {
        newErrors.weight = '体重必须在10-200之间';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单输入变化
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // 清除对应字段的错误信息
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 处理性别选择
  const handleGenderChange = (gender) => {
    setFormData(prev => ({
      ...prev,
      gender,
    }));
  };

  // 提交表单
  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // 获取当前日期，格式为YYYY-MM-DD
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const recordDate = `${year}-${month}-${day}`;

        // 构建提交数据，适配后端接口入参结构
        const submitData = {
          name: formData.name,
          gender: formData.gender,
          age: parseInt(formData.age),
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          phone: formData.phone,
          treatmentSummary: formData.treatment_summary,
          histories: []
        };

        // 添加疾病名称
        if (formData.disease_name.trim()) {
          submitData.histories.push({
            type: 0, // 疾病名称类型
            content: formData.disease_name,
            record_date: recordDate
          });
        }

        // 添加既往病史
        if (formData.past_medical_history.trim()) {
          submitData.histories.push({
            type: 1, // 既往病史类型
            content: formData.past_medical_history,
            record_date: recordDate
          });
        }

        // 添加过敏史
        if (formData.allergy_history.trim()) {
          submitData.histories.push({
            type: 2, // 过敏史类型
            content: formData.allergy_history,
            record_date: recordDate
          });
        }

        // 添加家族病史
        if (formData.family_history.trim()) {
          submitData.histories.push({
            type: 3, // 家族病史类型
            content: formData.family_history,
            record_date: recordDate
          });
        }

        // 调用API保存数据
        let response;
        if (isEditMode) {
          // 编辑模式：调用更新API
          response = await put(`/api/timeline/patients/${patientId}`, submitData);
        } else {
          // 创建模式：调用创建API
          response = await post('/api/timeline/patients', submitData);
        }

        if (response) {
          Taro.showToast({ title: isEditMode ? '更新成功' : '保存成功' });
          Taro.navigateBack();
        } else {
          Taro.showToast({ title: response?.msg || (isEditMode ? '更新失败' : '保存失败'), icon: 'none' });
        }
      } catch (error) {
        // 尝试获取接口返回的错误信息
        let errorMessage = isEditMode ? '更新失败' : '保存失败';
        if (error?.response?.msg) {
          errorMessage = error.response.msg;
        } 
        Taro.showToast({ title: errorMessage, icon: 'none' });
        console.error(isEditMode ? 'Failed to update patient:' : 'Failed to create patient:', error);
      }
    }
  };

  return (
    <View className='create-patient-container'>
      <ScrollView scrollY className='scroll-view'>
        <View className='form-container'>
          {/* 基本信息 */}
          <View className='form-section'>
            <Text className='section-title'>基本信息</Text>
            <View className='form-item'>
              <Text className='form-label'>姓名 *</Text>
              <Input
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder='请输入患者姓名'
                value={formData.name}
                onChange={e => handleInputChange('name', e.detail.value)}
                maxLength={50}
              />
              {errors.name && <Text className='error-text'>{errors.name}</Text>}
            </View>

            <View className='form-item'>
              <Text className='form-label'>性别 *</Text>
              <View className='gender-selector'>
                <View
                  className={`gender-option ${formData.gender === 1 ? 'selected' : ''}`}
                  onClick={() => handleGenderChange(1)}
                >
                  <Text className='gender-text'>男</Text>
                  <View className={`gender-radio ${formData.gender === 1 ? 'checked' : ''}`} />
                </View>
                <View
                  className={`gender-option ${formData.gender === 2 ? 'selected' : ''}`}
                  onClick={() => handleGenderChange(2)}
                >
                  <Text className='gender-text'>女</Text>
                  <View className={`gender-radio ${formData.gender === 2 ? 'checked' : ''}`} />
                </View>
              </View>
            </View>

            <View className='form-item'>
              <Text className='form-label'>年龄 *</Text>
              <Input
                className={`form-input ${errors.age ? 'error' : ''}`}
                placeholder='请输入年龄'
                value={formData.age}
                onChange={e => handleInputChange('age', e.detail.value)}
                type='number'
              />
              {errors.age && <Text className='error-text'>{errors.age}</Text>}
            </View>

            <View className='form-item'>
              <Text className='form-label'>身高 (cm)</Text>
              <Input
                className={`form-input ${errors.height ? 'error' : ''}`}
                placeholder='请输入身高'
                value={formData.height}
                onChange={e => handleInputChange('height', e.detail.value)}
                type='number'
              />
              {errors.height && <Text className='error-text'>{errors.height}</Text>}
            </View>

            <View className='form-item'>
              <Text className='form-label'>体重 (kg)</Text>
              <Input
                className={`form-input ${errors.weight ? 'error' : ''}`}
                placeholder='请输入体重'
                value={formData.weight}
                onChange={e => handleInputChange('weight', e.detail.value)}
                type='number'
              />
              {errors.weight && <Text className='error-text'>{errors.weight}</Text>}
            </View>

            <View className='form-item'>
              <Text className='form-label'>联系电话 *</Text>
              <Input
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder='请输入联系电话'
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.detail.value)}
                type='number'
                maxLength={11}
              />
              {errors.phone && <Text className='error-text'>{errors.phone}</Text>}
            </View>
          </View>

          {/* 基础病史 */}
          <View className='form-section'>
            <Text className='section-title'>基础病史</Text>

            <View className='form-item'>
              <Text className='form-label'>疾病诊断</Text>
              <Input
                className='form-input'
                placeholder='请输入疾病名称'
                value={formData.disease_name}
                onChange={e => handleInputChange('disease_name', e.detail.value)}
              />
            </View>

            <View className='form-item'>
              <Text className='form-label'>既往病史</Text>
              <View className='rich-text-editor'>
                <Input
                  className='history-input'
                  placeholder='请输入既往病史'
                  value={formData.past_medical_history}
                  onChange={e => handleInputChange('past_medical_history', e.detail.value)}
                  multiline
                  numberOfLines={5}
                />
              </View>
            </View>

            <View className='form-item'>
              <Text className='form-label'>过敏史</Text>
              <View className='rich-text-editor'>
                <Input
                  className='history-input'
                  placeholder='请输入过敏史'
                  value={formData.allergy_history}
                  onChange={e => handleInputChange('allergy_history', e.detail.value)}
                  multiline
                  numberOfLines={5}
                />
              </View>
            </View>

            <View className='form-item'>
              <Text className='form-label'>家族病史</Text>
              <View className='rich-text-editor'>
                <Input
                  className='history-input'
                  placeholder='请输入家族病史'
                  value={formData.family_history}
                  onChange={e => handleInputChange('family_history', e.detail.value)}
                  multiline
                  numberOfLines={5}
                />
              </View>
            </View>

            <View className='form-item'>
              <Text className='form-label'>治疗总结</Text>
              <View className='treatment-container'>
                <Textarea
                  className='treatment-textarea'
                  placeholder='请输入治疗总结'
                  value={formData.treatment_summary}
                  onInput={e => handleInputChange('treatment_summary', e.detail.value)}
                  autoHeight
                  maxlength="500"
                />
                <View className='word-count'>
                  <Text>{formData.treatment_summary ? formData.treatment_summary.length : 0}/500</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 保存按钮 */}
          <View className='form-actions'>
            <Button className='save-btn' onClick={handleSubmit}>
              保存
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CreatePatient;