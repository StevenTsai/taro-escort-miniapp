import { Text, View } from '@tarojs/components';
import Taro, { Toast } from '@tarojs/taro';

import { Button, Image, Rate, Tag } from '@nutui/nutui-react-taro';
import { useEffect, useState } from 'react';

import useAuthStore from '@/store/useAuthStore';
import { get } from '@/utils/request';
import './index.scss';

const ServiceCard = props => {
  const { title, description, price, onClick, serviceId } = props;
  
  // 点击卡片跳转到服务详情页
  const handleCardClick = () => {
    Taro.navigateTo({
      url: `/pages/serviceDetail/serviceDetail?serviceId=${serviceId}`,
    });
  };
  
  return (
    <View className='service-card' onClick={handleCardClick}>
      <View className='service-card-left'>
        <View className='service-card-title'>{title}</View>
        <View className='service-card-description'>{description}</View>
      </View>
      <View className='service-card-right'>
        <View className='service-card-price'>¥{price}</View>
        <Button size='small' type='success' className='service-card-btn' onClick={onClick}>
          预约
        </Button>
      </View>
    </View>
  );
};

function MedicalChaperonDetail(props) {
  const { id, city } = props;
  const { checkAuth } = useAuthStore();

  const [detail, setDetail] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // 获取陪诊师详情
  useEffect(() => {
    if (!id) return;

    get(`/api/medicalEscorts/${id}`)
      .then(res => {
        if (res) {
          setDetail(res);
        }
      })
      .catch(error => {
        console.error('请求失败:', error);
        Toast.showToast({ title: error.message, icon: 'error' });
      });
  }, [id]);

  // 获取评论列表
  useEffect(() => {
    if (!id) return;

    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const res = await get(`/api/medicalEscorts/${id}/comments`);
        setComments(res || []);
      } catch (error) {
        console.error('获取评论失败:', error);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [id]);

  const goToOrders = serviceType => {
    if (!checkAuth()) {
      Taro.switchTab({ url: '/pages/profile/profile' });
      return;
    }
    Taro.navigateTo({
      url: `/pages/order/order?medicalEscortId=${id}&city=${city}&serviceType=${serviceType}`,
    });
  };

  // 如果没有数据，显示加载中
  if (detail === null) {
    return (
      <View className='detail-page'>
        <View>加载中...</View>
      </View>
    );
  }

  return (
    <View className='detail-page'>
      <View className='profile'>
        <Image className='avatar' src={detail.avatar} width={80} height={80} radius={40} />
        <View className='name'>{detail.name || '陪诊师'}</View>
        <View className='tag-list'>
          {Array.isArray(detail.tags) &&
            detail.tags.map((tag, index) => (
              <Tag key={index} round type='success' size='small'>
                {tag.replaceAll('"', '')}
              </Tag>
            ))}
        </View>
        <View className='bio'>{detail.bio}</View>
      </View>
      <View className='function-list'>
        <View className='function-list-title'>
          <View className='function-list-title-text'>预约服务</View>
          <View className='green-dot' />
        </View>
        <View className='service-list'>
          {detail?.services.map(item => (
            <ServiceCard
              key={item.id}
              title={item.name}
              description={item.bio}
              price={item.price}
              serviceId={item.id}
              onClick={() => goToOrders(item.id)}
            />
          ))}
        </View>
      </View>

      {/* 评论列表 */}
      <View className='comments-section'>
        <View className='comments-title'>
          <View className='function-list-title-text'>用户评价</View>
          <View className='green-dot' />
        </View>
        {loadingComments ? (
          <View className='comments-loading'>加载中...</View>
        ) : comments.length > 0 ? (
          <View className='comments-list'>
            {comments.map((comment, index) => (
              <View key={index} className='comment-item'>
                <View className='comment-header'>
                  <View className='comment-user'>
                    <Text className='user-name'>
                      {comment.userName || `用户：${comment.userId}`}
                    </Text>
                  </View>
                  <View className='comment-rating'>
                    <Rate
                      value={comment.score || 0}
                      count={5}
                      size={20}
                      readOnly
                      activeColor='#f89d00'
                      voidColor='#e0e0e0'
                    />
                  </View>
                </View>
                <View className='comment-content'>
                  <Text>{comment.content || '该用户未填写评论'}</Text>
                </View>
                <View className='comment-time'>
                  <Text>{comment.createTime || ''}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className='comments-empty'>暂无评价</View>
        )}
      </View>
    </View>
  );
}

export default MedicalChaperonDetail;
