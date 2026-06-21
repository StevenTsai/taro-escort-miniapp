import useAuthStore from '@/store/useAuthStore';
import { get, post, upload } from '@/utils/request';
import { Button, Cell, CellGroup, Form, Image, Textarea, Toast } from '@nutui/nutui-react-taro';
import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import './chaperonEdit.scss';

function ChaperonEdit() {
  const { userInfo, setUserInfo } = useAuthStore();
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState(userInfo?.avatar || '');
  const [nickName, setNickName] = useState(userInfo?.nickName || '');
  const [introduction, setIntroduction] = useState(userInfo?.introduction || '');
  const [tags, setTags] = useState([]); // 所有可用标签
  const [selectedTags, setSelectedTags] = useState([]); // 选中的标签
  const [loading, setLoading] = useState(false);

  // 获取标签列表
  const fetchTags = async () => {
    try {
      setLoading(true);
      const result = await get('/api/medicalEscorts/tags');
      if (result && Array.isArray(result.tags)) {
        // 将标签转换为标准格式
        const tagOptions = result.tags.map(tag => ({ label: tag, value: tag }));
        setTags(tagOptions);
      }
      setLoading(false);
    } catch (error) {
      console.error('获取标签失败:', error);
      Toast.show('获取标签失败');
      setLoading(false);
    }
  };

  // 页面加载时初始化数据
  useEffect(() => {
    // 获取标签列表
    fetchTags();
    
    // 获取陪诊师基本信息
    const fetchBasicInfo = async () => {
      try {
        setLoading(true);
        const result = await get('/api/medicalEscorts/basicInfo');
        if (result) {
          const data = result;
          // 使用接口返回的数据初始化页面
          setAvatar(data.avatar || '');
          setNickName(data.name || '');
          setIntroduction(data.bio || '');
          // 初始化选中的标签
          if (data.tags && Array.isArray(data.tags)) {
            setSelectedTags(data.tags);
          }
        }
      } catch (error) {
        console.error('获取陪诊师信息失败:', error);
        Toast.show('获取信息失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBasicInfo();
  }, []);

  // 选择头像
  const handleChooseAvatar = async (e) => {
    try {
      setLoading(true);
      const avatarUrl = e.detail.avatarUrl;
      setAvatar(avatarUrl);
      setLoading(false);
    } catch (error) {
      console.error('选择头像失败:', error);
      Toast.show('选择头像失败');
      setLoading(false);
    }
  };

  // 切换标签选择状态
  const toggleTagSelection = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag.value)) {
        return prev.filter(t => t !== tag.value);
      } else {
        return [...prev, tag.value];
      }
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      // 登录态校验
      if (!useAuthStore.getState().checkAuth()) {
        return;
      }
      
      setLoading(true);
 
      if (selectedTags.length === 0) {
        Toast.show('请选择至少一个标签');
        setLoading(false);
        return;
      }

      let avatarUrl = avatar;
      // 如果有头像且是临时路径，先上传头像
      if (avatar && (avatar.startsWith('http://tmp') || avatar.startsWith('wxfile'))) {
        Taro.showLoading({ title: '上传头像中...' });
        
        // 生成文件名
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const fileName = `avatar_${timestamp}_${random}.jpeg`;
        const path = '/identification/';


        // 上传图片到服务器
        const uploadResult = await upload('/api/medicalEscorts/uploadIDCard', avatar, {
          objKey: fileName,
          path: path
        });
        
  
        avatarUrl = path+fileName;
        
        Taro.hideLoading();
      }

      // 准备提交的数据
      const submitData = {
        avatar: avatarUrl,
        bio:introduction,
        tags: selectedTags,
      };
      try {
        // 调用API更新信息
        const result = await post('/api/medicalEscorts/update-info', submitData);
        Toast.show('保存成功');
      }catch (err) {
          console.error('保存失败:', err);
          Toast.show('保存失败');
      }

      
      
      // 返回上一页
      Taro.navigateBack();
    } catch (error) {
      console.error('保存失败:', error);
      Toast.show(error.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='chaperon-edit-page'>
      <View className='header'>
        <View className='title'>编辑陪诊师资料</View>
      </View>

      <CellGroup className='edit-form'>
        {/* 头像编辑 */}
        <Cell>
          <View className='avatar-section'>
            <View className='avatar-label'>头像</View>
            <View className='avatar-container'>
              {avatar ? (
                <Image 
                  className='avatar' 
                  src={avatar} 
                  width={80} 
                  height={80} 
                  radius={40}
                />
              ) : (
                <View className='avatar-placeholder'>
                  <Text>添加头像</Text>
                </View>
              )}
              <Button 
                type='default' 
                size='small' 
                className='avatar-btn'
                openType='chooseAvatar'
                onChooseAvatar={handleChooseAvatar}
              >
                更换头像
              </Button>
            </View>
          </View>
        </Cell>

        {/* 个人简介编辑 */}
        <Cell title='个人简介'>
          <Text>修改个人简介</Text>
          <Textarea 
            value={introduction} 
            onChange={setIntroduction} 
            placeholder='请输入个人简介'
            className='edit-textarea'
            maxLength={200}
            showCount
          />
        </Cell>

        {/* 标签编辑 */}
        <Cell title='专业标签'>
          <Text>修改专业标签</Text>
          <View className='tag-section'>
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
          </View>
        </Cell>
      </CellGroup>

      {/* 底部提交按钮 */}
      <View className='bottom-submit'>
        <Button type='primary' onClick={handleSubmit} loading={loading} block>
          保存
        </Button>
      </View>

      <Toast id='chaperon-edit-toast' />
    </View>
  );
}

export default ChaperonEdit;