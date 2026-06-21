import DateTimePicker from '@/components/DateTimePicker';
import { Button, Form, Input, ScrollView, Switch, Text, Textarea, View } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';

import { useEffect, useState } from 'react';

import { get, post, put, upload } from '@/utils/request';
import { compressImageToSize } from '@/utils/imageUtils';
import './addTreatment.scss';

const AddTreatment = () => {
  // 获取路由参数
  const router = useRouter();
  const patientId = router.params.patientId;
  const eventId = router.params.id; // 编辑模式下的事件ID
  const isEditMode = !!eventId;

  // 获取当前时间并格式化
  const getCurrentDate = () => {
    const now = new Date();
    return now.getTime(); // 返回时间戳格式
  };

  // 表单数据
  const [formData, setFormData] = useState({
    patient_id: patientId,
    event_date: getCurrentDate(),
    event_type: 'treatment',
    title: '',
    hospital_name: '',
    doctor_name: '',
    diagnosis_result: '',
    treatment_plan: '',
    is_key_node: 1, // 默认是关键事件
  });

  // 设置导航栏标题
  useEffect(() => {
    Taro.setNavigationBarTitle({
      title: isEditMode ? '编辑治疗小结' : '添加治疗小结'
    });
  }, [isEditMode]);

  // 加载事件数据（编辑模式）
  useDidShow(() => {
    if (isEditMode) {
      loadEventData();
    }
  });

  // 加载事件数据
  const loadEventData = async () => {
    try {
      const response = await get(`/api/timeline/timeline-events/${eventId}`);
      if (response) {
        // 解析治疗小结内容
        let treatmentContent = {};
        try {
          treatmentContent = JSON.parse(response.content || '{}');
        } catch (e) {
          console.error('Failed to parse treatment content:', e);
        }

        // 更新表单数据
        let eventDate = response.eventDate;
        // 如果eventDate是YYYY-MM-DD格式的字符串，转换为时间戳
        if (eventDate && typeof eventDate === 'string') {
          eventDate = new Date(eventDate).getTime();
        }
        setFormData({
          patient_id: response.patientId || patientId,
          event_date: eventDate || getCurrentDate(),
          event_type: response.eventType || 'treatment',
          title: response.title || '',
          hospital_name: treatmentContent.hospital_name || '',
          doctor_name: treatmentContent.doctor_name || '',
          diagnosis_result: treatmentContent.diagnosis_result || '',
          treatment_plan: treatmentContent.treatment_plan || '',
          is_key_node: response.isKeyNode || 0, // 加载关键事件状态，默认不是
        });

        // 更新附件数据（如果有）
        if (response.attachments) {
          // 确保每个附件都有preview_url字段用于图片预览
          // 转换接口返回的驼峰命名为前端需要的下划线命名
          const formattedAttachments = response.attachments.map(attachment => ({
            id: attachment.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            file_name: attachment.fileName || attachment.file_name || '',
            file_path: attachment.filePath || attachment.file_path || '',
            file_type: attachment.fileType || attachment.file_type || '',
            file_size: attachment.fileSize || attachment.file_size || 0,
            preview_url: attachment.filePath || attachment.file_path || '', // 使用file_path作为预览地址
          }));
          setAttachments(formattedAttachments);
          // 保存初始附件列表，用于编辑模式下比较是否有变更
          setInitialAttachments(formattedAttachments);
        }
      }
    } catch (error) {
      Taro.showToast({ title: '加载事件数据失败', icon: 'none' });
      console.error('Failed to load event data:', error);
    }
  };

  // 表单错误信息
  const [errors, setErrors] = useState({});

  // 文件上传状态
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  // 初始附件列表（用于编辑模式下比较是否有变更）
  const [initialAttachments, setInitialAttachments] = useState([]);

  // 表单验证
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title) {
      newErrors.title = '请输入事件标题';
    }

    if (!formData.event_date) {
      newErrors.event_date = '请选择就诊日期';
    }

    if (!formData.hospital_name) {
      newErrors.hospital_name = '请输入就诊医院';
    }

    if (!formData.doctor_name) {
      newErrors.doctor_name = '请输入医生姓名';
    }

    if (!formData.diagnosis_result) {
      newErrors.diagnosis_result = '请输入诊断结果';
    }

    if (!formData.treatment_plan) {
      newErrors.treatment_plan = '请输入治疗方案';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单输入变化
  const handleInputChange = (field, value) => {
    // 日期字段直接使用时间戳，不转换格式
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

  // 处理文件选择
  const handleFileSelect = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 9, // 最多选择9张图片
        sizeType: ['original', 'compressed'], // 支持原图和压缩图
        sourceType: ['album', 'camera'], // 支持从相册选择和拍照
      });
      
      const tempFiles = res.tempFiles;
      
      // 压缩超过1MB的图片
      const maxSize = 1 * 1024 * 1024; // 1MB
      
      // 并行处理所有图片
      const processingPromises = tempFiles.map(async (file) => {
        if (file.size > maxSize) {
          // 需要压缩图片
          const compressionResult = await compressImageToSize(file.path, maxSize);
          
          if (compressionResult.success) {
            // 压缩成功
            return {
              ...file,
              path: compressionResult.filePath,
              size: compressionResult.size
            };
          } else {
            // 压缩失败，返回原图
            return file;
          }
        } else {
          // 不需要压缩，直接使用原图
          return file;
        }
      });
      
      // 等待所有图片处理完成
      const processedFiles = await Promise.all(processingPromises);
      
      // 检查是否有图片仍然大于maxSize
      const oversizedFiles = processedFiles.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        // 有图片仍然大于maxSize，提示用户
        Taro.showToast({ 
          title: `部分图片无法压缩到1MB以下，请重新选择`, 
          icon: 'none',
          duration: 2000
        });
        return;
      }
  
      setUploading(true);
      setTimeout(() => {
        setAttachments(prev => [
          ...prev,
          ...processedFiles.map((file, index) => ({
            id: `temp_${Date.now()}_${index}`,
            file_name: file.path.split('/').pop(), // 使用真实文件名
            file_path: file.path,
            file_type: file.type || 'image/jpeg',
            file_size: file.size,
            preview_url: file.path, // 用于图片预览
          })),
        ]);
        setUploading(false);
        
        // 显示成功提示
        Taro.showToast({ 
          title: `成功添加${processedFiles.length}张图片`, 
          icon: 'success'
        });
      }, 1000);
    } catch (error) {
      console.error('选择图片失败:', error);
      Taro.showToast({ 
        title: '选择图片失败', 
        icon: 'none'
      });
    }
  };
  
  // 预览图片
  const previewImage = (index) => {
    Taro.previewImage({
      current: attachments[index].preview_url,
      urls: attachments.map(item => item.preview_url),
    });
  };

  // 删除附件
  const removeAttachment = id => {
    setAttachments(prev => prev.filter(item => item.id !== id));
  };

  // 提交表单
  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // 构建治疗内容JSON
        const treatmentContent = {
          hospital_name: formData.hospital_name,
          doctor_name: formData.doctor_name,
          diagnosis_result: formData.diagnosis_result,
          treatment_plan: formData.treatment_plan
        };

        // 构建提交数据
        let eventDate = formData.event_date;
        // 如果eventDate是时间戳，转换为YYYY-MM-DD格式的字符串
        if (eventDate && typeof eventDate === 'number') {
          const date = new Date(eventDate);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          eventDate = `${year}-${month}-${day}`;
        }
        const submitData = {
          patientId: formData.patient_id,
          eventDate: eventDate,
          eventType: formData.event_type,
          title: formData.title,
          content: JSON.stringify(treatmentContent),
          isKeyNode: formData.is_key_node,
        };

        if (isEditMode) {
          // 编辑模式：区分新增和删除的附件
          
          // 找出删除的附件（在初始列表中但不在当前列表中）
          const deletedAttachments = initialAttachments.filter(initAtt => 
            !attachments.some(att => att.id === initAtt.id)
          ).map(att => att.id);
          
          // 如果有删除的附件，添加到提交数据中
          if (deletedAttachments.length > 0) {
            submitData.deletedAttachmentIds = deletedAttachments;
          }
          
          // 找出新增的附件（在当前列表中但不在初始列表中）
          const newAttachments = attachments.filter(att => 
            !initialAttachments.some(initAtt => initAtt.id === att.id)
          );
          
          // 上传新增的附件
          if (newAttachments.length > 0) {
            const uploadedAttachments = await Promise.all(newAttachments.map(async (attachment) => {
              try {
                // 上传图片
                const uploadResult = await upload('/api/cos/upload', attachment.file_path, {
                  objKey: attachment.file_name,
                  path: '/attachment/',
                });
                
                // 解析服务器返回的JSON数据
                let parsedResult;
                try {
                  const responseData = uploadResult.data;
                  
                  // 检查data是否已经是对象
                  if (typeof responseData === 'object') {
                    parsedResult = responseData;
                  } else {
                    // 如果是字符串，尝试解析
                    parsedResult = JSON.parse(responseData);
                  }
                } catch (parseError) {
                  console.error('Failed to parse upload result:', parseError);
                  console.error('Raw data for parsing:', uploadResult.data);
                  Taro.showToast({ title: `解析上传结果失败`, icon: 'none' });
                  throw parseError;
                }
                
                // 返回包含上传后URL的附件信息
                const processedAttachment = {
                  fileName: attachment.file_name,
                  filePath: parsedResult.data.objKeyUrl,
                  fileType: attachment.file_type,
                  fileSize: attachment.file_size,
                };
                
                return processedAttachment;
              } catch (uploadError) {
                console.error('Failed to upload attachment:', uploadError);
                Taro.showToast({ title: `上传图片${attachment.file_name}失败`, icon: 'none' });
                throw uploadError; // 上传失败时中断整个提交流程
              }
            }));
            
            // 如果有新增的附件，添加到提交数据中
            if (uploadedAttachments.length > 0) {
              submitData.newAttachments = uploadedAttachments;
            }
          }
        } else {
          // 非编辑模式：上传所有附件
          if (attachments.length > 0) {
            const uploadedAttachments = await Promise.all(attachments.map(async (attachment) => {
              try {
                // 上传图片
                const uploadResult = await upload('/api/cos/upload', attachment.file_path, {
                  objKey: attachment.file_name,
                  path: '/attachment/',
                });
                
                // 解析服务器返回的JSON数据
                let parsedResult;
                try {
                  const responseData = uploadResult.data;
                  
                  // 检查data是否已经是对象
                  if (typeof responseData === 'object') {
                    parsedResult = responseData;
                  } else {
                    // 如果是字符串，尝试解析
                    parsedResult = JSON.parse(responseData);
                  }
                } catch (parseError) {
                  console.error('Failed to parse upload result:', parseError);
                  console.error('Raw data for parsing:', uploadResult.data);
                  Taro.showToast({ title: `解析上传结果失败`, icon: 'none' });
                  throw parseError;
                }
                
                // 返回包含上传后URL的附件信息
                const processedAttachment = {
                  fileName: attachment.file_name,
                  filePath: parsedResult.data.objKeyUrl,
                  fileType: attachment.file_type,
                  fileSize: attachment.file_size,
                };
                
                return processedAttachment;
              } catch (uploadError) {
                console.error('Failed to upload attachment:', uploadError);
                Taro.showToast({ title: `上传图片${attachment.file_name}失败`, icon: 'none' });
                throw uploadError; // 上传失败时中断整个提交流程
              }
            }));
            
            // 添加所有附件到提交数据中
            submitData.newAttachments = uploadedAttachments;
          }
        }

        // 调用API保存数据
        let response;
        if (isEditMode) {
          // 编辑模式：使用POST请求并包含事件ID
          response = await put(`/api/timeline/timeline-events/${eventId}`, submitData);
        } else {
          // 创建模式：使用POST请求
          response = await post('/api/timeline/timeline-events', submitData);
        }
        if (response) {
          Taro.showToast({ title: '保存成功' });
           Taro.navigateTo({ 
                  url: `/pages/patientDetail/patientDetail?id=${patientId}`,
                });
        } else {
          Taro.showToast({ title: response.msg || '保存失败', icon: 'none' });
        }
      } catch (error) {
        Taro.showToast({ title: '保存失败', icon: 'none' });
        console.error('Failed to save treatment:', error);
      }
    }
  };

  return (
    <View style={{ width: '100%', height: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ScrollView 
        className='add-treatment-container' 
        scrollY 
        enableBackToTop
        style={{ flex: 1, width: '100%' }}
        scroll-into-view={undefined}
      >
        {/* 关键事件开关 */}
     
        <Form className='treatment-form' style={{ width: '100%', boxSizing: 'border-box' }}>
        {/* 基本信息 */}
        <View className='form-section'>
          <Text className='section-title'>基本信息</Text>

          <View className='form-item'>
            <Text className='form-label'>事件标题 *</Text>
            <Input
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder='请输入事件标题,例如XXX治疗小结'
              value={formData.title}
              onChange={e => handleInputChange('title', e.detail.value)}
            />
            {errors.title && <Text className='error-text'>{errors.title}</Text>}
          </View>
            <View className='form-item'>
            <Text className='form-label'>关键事件</Text>
             <Switch
                className='key-node-switch'
                checked={formData.is_key_node === 1}
                onChange={(e) => handleInputChange('is_key_node', e.detail.value ? 1 : 0)}
              />
          </View>
        
          <View className='form-item'>
            <Text className='form-label'>就诊日期 *</Text>
            <DateTimePicker
              className={`date-picker-btn ${errors.event_date ? 'error' : ''}`}
              placeholder="请选择就诊日期"
              value={formData.event_date}
              onChange={(value) => handleInputChange('event_date', value)}
              disabled={false}
            />
            {errors.event_date && <Text className='error-text'>{errors.event_date}</Text>}
          </View>

          <View className='form-item'>
            <Text className='form-label'>就诊医院 *</Text>
            <Input
              className={`form-input ${errors.hospital_name ? 'error' : ''}`}
              placeholder='请输入就诊医院'
              value={formData.hospital_name}
              onChange={e => handleInputChange('hospital_name', e.detail.value)}
            />
            {errors.hospital_name && <Text className='error-text'>{errors.hospital_name}</Text>}
          </View>

          <View className='form-item'>
            <Text className='form-label'>医生姓名 *</Text>
            <Input
              className={`form-input ${errors.doctor_name ? 'error' : ''}`}
              placeholder='请输入医生姓名'
              value={formData.doctor_name}
              onChange={e => handleInputChange('doctor_name', e.detail.value)}
            />
            {errors.doctor_name && <Text className='error-text'>{errors.doctor_name}</Text>}
          </View>

          <View className='form-item'>
            <Text className='form-label'>诊断结果 *</Text>
            <Input
              className={`form-input ${errors.diagnosis_result ? 'error' : ''}`}
              placeholder='请输入诊断结果'
              value={formData.diagnosis_result}
              onChange={e => handleInputChange('diagnosis_result', e.detail.value)}
            />
            {errors.diagnosis_result && <Text className='error-text'>{errors.diagnosis_result}</Text>}
          </View>
        </View>

        {/* 治疗方案 */}
        <View className='form-section'>
          <Text className='section-title'>治疗方案 *</Text>
          <View className={`treatment-container ${errors.treatment_plan ? 'error' : ''}`}>
            <Textarea
              className='treatment-textarea'
              placeholder='请输入治疗方案'
              value={formData.treatment_plan}
              onInput={e => handleInputChange('treatment_plan', e.detail.value)}
              autoHeight
              maxlength="500"
            />
            <View className='word-count'>
              <Text>{formData.treatment_plan ? formData.treatment_plan.length : 0}/500</Text>
            </View>
          </View>
          {errors.treatment_plan && <Text className='error-text'>{errors.treatment_plan}</Text>}
        </View>

        {/* 附件上传 */}
        <View className='form-section'>
          <Text className='section-title'>附件上传</Text>
          <View className='attachments-container'>
            {attachments.length > 0 && (
              <View className='attachments-list'>
                {attachments.map((item, index) => (
                  <View key={item.id} className='attachment-item'>
                    {/* 图片预览 */}
                    <View className='image-preview-container' onClick={() => previewImage(index)}>
                      <image 
                        className='image-preview' 
                        src={item.preview_url} 
                        mode='aspectFill'
                      />
                    </View>
                    <Text className='attachment-name'>{item.file_name}</Text>
                    <Text className='attachment-size'>{Math.ceil(item.file_size / 1024)}KB</Text>
                    <Button
                      className='remove-attachment-btn'
                      onClick={() => removeAttachment(item.id)}
                    >
                      删除
                    </Button>
                  </View>
                ))}
              </View>
            )}
            <Button className='upload-btn' onClick={handleFileSelect} disabled={uploading}>
              {uploading ? '上传中...' : '+ 点击上传检查报告或影像数据'}
            </Button>
          </View>
        </View>

        {/* 提交按钮 */}
        <View className='form-actions'>
          <Button className='submit-btn' onClick={handleSubmit}>
            保存
          </Button>
        </View>
      </Form>
      </ScrollView>
    </View>
  );
};

export default AddTreatment;
