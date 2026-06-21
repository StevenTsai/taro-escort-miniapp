import DateTimePicker from '@/components/DateTimePicker';
import { Button, Form, Input, ScrollView, Switch, Text, Textarea, View } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';

import { useEffect, useState } from 'react';

import { get, post, put, upload } from '@/utils/request';
import { compressImageToSize } from '@/utils/imageUtils';
import './addMedication.scss';

// 获取当前日期的YYYY-MM-DD格式
const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AddMedication = () => {
  // 获取路由参数
  const router = useRouter();
  const patientId = router.params.patientId;
  const eventId = router.params.id; // 编辑模式下的事件ID
  const isEditMode = !!eventId;

  // 表单数据
  const [formData, setFormData] = useState({
    patient_id: patientId,
    event_date: getCurrentDate(),
    event_type: 'medication',
    title: '',
    content: '',
    medications: [],
    is_key_node: 1, // 默认是关键事件
  });

  // 表单错误信息
  const [errors, setErrors] = useState({});

  // 文件上传状态
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  // 初始附件列表（用于编辑模式下比较是否有变更）
  const [initialAttachments, setInitialAttachments] = useState([]);

  // 设置导航栏标题
  useEffect(() => {
    Taro.setNavigationBarTitle({
      title: isEditMode ? '编辑用药记录' : '添加用药记录'
    });
  }, [isEditMode]);

  // 用药记录列表 - 初始默认包含3个空的用药记录
  const currentDate = getCurrentDate();
  const [medications, setMedications] = useState([
    { drug_name: '', dosage: '', usage: '', start_date: currentDate, end_date: currentDate },
  ]);

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
        // 解析用药记录内容
        let medicationContent = {};
        try {
          medicationContent = JSON.parse(response.content || '{}');
        } catch (e) {
          console.error('Failed to parse medication content:', e);
        }

        // 更新表单数据
        setFormData({
          patient_id: response.patientId || patientId,
          event_date: response.eventDate || '',
          event_type: response.eventType || 'medication',
          title: response.title || '',
          content: medicationContent.content || '',
          medications: medicationContent.medications || [],
          is_key_node: response.isKeyNode || 0, // 加载关键事件状态，默认是
        });

        // 更新用药记录列表 - 将驼峰命名转换为下划线命名以匹配表单绑定
        if (medicationContent.medications && medicationContent.medications.length > 0) {
          const formattedMedications = medicationContent.medications.map(med => ({
            drug_name: med.drugName || '',
            dosage: med.dosage || '',
            usage: med.usageRemark || '',
            start_date: med.startDate || currentDate,
            end_date: med.endDate || currentDate
          }));
          setMedications(formattedMedications);
        }

        // 更新附件数据（如果有）
        if (response.attachments) {
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

  // 表单验证
  const validateForm = () => {
    const newErrors = {};

    if (!formData.event_date) {
      newErrors.event_date = '请选择用药日期';
    }

    if (!formData.title) {
      newErrors.title = '请输入事件标题';
    }

    // 检查是否至少有一个用药记录填写了药物名称
    const hasMedication = medications.some(med => med.drug_name.trim() !== '');
    if (!hasMedication) {
      newErrors.medications = '请至少填写一个用药记录';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单输入变化
  const handleInputChange = (field, value) => {
    // 如果是日期字段，将时间戳转换为YYYY-MM-DD格式的字符串
    if (field === 'event_date' && typeof value === 'number') {
      const date = new Date(value);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      value = `${year}-${month}-${day}`;
    }

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

  // 处理用药记录变化
  const handleMedicationChange = (index, field, value) => {
    // 如果是日期字段，将时间戳转换为YYYY-MM-DD格式的字符串
    if ((field === 'start_date' || field === 'end_date') && typeof value === 'number') {
      const date = new Date(value);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      value = `${year}-${month}-${day}`;
    }

    const newMedications = [...medications];
    newMedications[index][field] = value;
    setMedications(newMedications);
    setFormData(prev => ({
      ...prev,
      medications: newMedications,
    }));

    // 清除用药记录的错误信息
    if (errors.medications) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.medications;
        return newErrors;
      });
    }
  };

  // 添加用药记录
  const addMedication = () => {
    const currentDate = getCurrentDate();
    setMedications(prev => [
      ...prev,
      {
        drug_name: '',
        dosage: '',
        usage: '',
        start_date: currentDate,
        end_date: currentDate,
      },
    ]);
  };

  // 删除用药记录
  const removeMedication = index => {
    if (medications.length > 1) {
      const newMedications = medications.filter((_, i) => i !== index);
      setMedications(newMedications);
      setFormData(prev => ({
        ...prev,
        medications: newMedications,
      }));
    }
  };

  // 选择文件
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
      
      // 设置附件信息
      setUploading(true);
      
      // 实际项目中这里可能需要先上传文件到服务器
      // 这里我们直接使用本地文件路径，在提交表单时再进行上传
      const newAttachments = processedFiles.map((file, index) => ({
        id: `temp_${Date.now()}_${index}`,
        file_name: `file_${Date.now()}_${index}.jpg`,
        file_path: file.path,
        file_type: 'image/jpeg',
        file_size: file.size,
        preview_url: file.path, // 使用file_path作为预览地址
      }));
      
      setTimeout(() => {
        setAttachments(prev => [...prev, ...newAttachments]);
        setUploading(false);
        
        // 显示成功提示
        Taro.showToast({ 
          title: `成功添加${processedFiles.length}张图片`, 
          icon: 'success'
        });
      }, 1000);
    } catch (error) {
      console.error('选择图片失败:', error);
      Taro.showToast({ title: '选择图片失败', icon: 'none' });
      setUploading(false);
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
        // 过滤掉空的用药记录
        const validMedications = medications.filter(med => med.drug_name.trim() !== '');

        // 将用药记录字段名从下划线命名转换为驼峰式命名以匹配接口要求
        const formattedMedications = validMedications.map(med => ({
          drugName: med.drug_name,
          dosage: med.dosage,
          usageRemark: med.usage,
          startDate: med.start_date,
          endDate: med.end_date
        }));

        // 构建用药内容JSON对象
        const medicationContent = {
          medications: formattedMedications,
          content: formData.content
        };

        // 构建提交数据
        const submitData = {
          patientId: formData.patient_id,
          eventDate: formData.event_date,
          eventType: formData.event_type,
          title: formData.title,
          isKeyNode: formData.is_key_node, 
          content: JSON.stringify(medicationContent),
          medications: formattedMedications,
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
        console.error('Failed to save medication:', error);
      }
    }
  };

  return (
    <View style={{ width: '100%', height: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ScrollView 
        className='add-medication-container' 
        scrollY 
        enableBackToTop
        style={{ flex: 1, width: '100%' }}
        scroll-into-view={undefined}
      >
    
        <Form className='medication-form' style={{ width: '100%', boxSizing: 'border-box' }}>
        {/* 基本信息 */}
        <View className='form-section'>
          <Text className='section-title'>基本信息</Text>

          <View className='form-item'>
            <Text className='form-label'>用药日期 *</Text>
            <DateTimePicker
              className={`date-picker-btn ${errors.event_date ? 'error' : ''}`}
              placeholder="请选择用药日期"
              value={formData.event_date}
              onChange={(value) => handleInputChange('event_date', value)}
              disabled={false}
            />
            {errors.event_date && <Text className='error-text'>{errors.event_date}</Text>}
          </View>

          <View className='form-item'>
            <Text className='form-label'>事件标题 *</Text>
            <Input
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder='请输入事件标题'
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
        </View>

        {/* 用药记录 */}
        <View className='form-section'>
          <Text className='section-title'>用药记录</Text>
          {errors.medications && (
            <Text className='error-text error-medication'>{errors.medications}</Text>
          )}
          <View className='medications-list'>
            {medications.map((medication, index) => (
              <View key={index} className='medication-form-item'>
                <View className='medication-header'>
                  <Text className='medication-title'>用药 {index + 1}</Text>
                  {medications.length > 1 && (
                    <Button
                      className='remove-medication-btn'
                      onClick={() => removeMedication(index)}
                    >
                      删除
                    </Button>
                  )}
                </View>
                <View className='medication-body'>
                  <View className='form-item required'>
                    <Text className='form-label'>药物名称 *</Text>
                    <Input
                      className='form-input'
                      placeholder='请输入药物名称'
                      value={medication.drug_name}
                      onChange={e => handleMedicationChange(index, 'drug_name', e.detail.value)}
                    />
                  </View>
                  <View className='form-row'>
                    <View className='form-item half'>
                      <Text className='form-label'>剂量</Text>
                      <Input
                        className='form-input'
                        placeholder='请输入剂量'
                        value={medication.dosage}
                        onChange={e => handleMedicationChange(index, 'dosage', e.detail.value)}
                      />
                    </View>
                    <View className='form-item half'>
                      <Text className='form-label'>用法</Text>
                      <Input
                        className='form-input'
                        placeholder='请输入用法'
                        value={medication.usage}
                        onChange={e => handleMedicationChange(index, 'usage', e.detail.value)}
                      />
                    </View>
                  </View>
                  <View className='form-row'>
                    <View className='form-item half'>
                      <Text className='form-label'>开始日期</Text>
                      <DateTimePicker
                        className='date-picker-btn'
                        placeholder="请选择开始日期"
                        value={medication.start_date}
                        onChange={(value) => handleMedicationChange(index, 'start_date', value)}
                        disabled={false}
                      />
                    </View>
                    <View className='form-item half'>
                      <Text className='form-label'>结束日期</Text>
                      <DateTimePicker
                        className='date-picker-btn'
                        placeholder="请选择结束日期"
                        value={medication.end_date}
                        onChange={(value) => handleMedicationChange(index, 'end_date', value)}
                        disabled={false}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
          <Button className='add-medication-btn' onClick={addMedication}>
          + 添加更多用药记录
        </Button>
      </View>

      {/* 用药备注 */}
      <View className='form-section'>
        <Text className='section-title'>用药备注</Text>
        <View className='medication-note-container'>
          <Textarea
            className='medication-note-textarea'
            placeholder='请输入用药备注'
            value={formData.content}
            onInput={e => handleInputChange('content', e.detail.value)}
            autoHeight
            maxlength="500"
          />
          <View className='word-count'>
            <Text>{formData.content ? formData.content.length : 0}/500</Text>
          </View>
        </View>
      </View>

      {/* 附件上传 */}
        <View className='form-section'>
          <Text className='section-title'>相关附件</Text>
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
              {uploading ? '上传中...' : '+ 上传附件'}
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

export default AddMedication;
