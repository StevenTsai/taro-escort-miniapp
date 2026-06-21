import { get, post } from '@/utils/request';
import { Button, Rate, Textarea, Toast } from '@nutui/nutui-react-taro';
import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

import './comment.scss';

function CommentPage() {
  // 订单信息
  const [orderInfo, setOrderInfo] = useState(null);
  // 评分
  const [rating, setRating] = useState(0);
  // 评论内容
  const [content, setContent] = useState('');
  // 提交加载状态
  const [loading, setLoading] = useState(false);
  // 页面加载状态
  const [pageLoading, setPageLoading] = useState(true);

  // 评分描述
  const ratingDesc = {
    1: '非常差',
    2: '差',
    3: '一般',
    4: '好',
    5: '非常好'
  };

  // 获取订单ID
  const getOrderId = () => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options;
    return options.orderId || '';
  };

  // 获取订单信息
  const fetchOrderInfo = async () => {
    const orderId = getOrderId();
    if (!orderId) {
      Toast.show('toast-comment', {
        content: '订单ID无效',
        icon: 'error',
        duration: 2000
      });
      Taro.navigateBack();
      return;
    }

    try {
      setPageLoading(true);
      const data = await get(`/api/orders/${orderId}`);
      setOrderInfo(data);
    } catch (error) {
      console.error('获取订单信息失败:', error);
      Toast.show('toast-comment', {
        content: '获取订单信息失败，请重试',
        icon: 'error',
        duration: 2000
      });
      Taro.navigateBack();
    } finally {
      setPageLoading(false);
    }
  };

  // 提交评论
  const submitComment = async () => {
    // 表单验证
    if (rating === 0) {
      Toast.show('toast-comment', {
        content: '请先选择评分',
        icon: 'error',
        duration: 2000
      });
      return;
    }

    const orderId = getOrderId();
    if (!orderId) {
      Toast.show('toast-comment', {
        content: '订单ID无效',
        icon: 'error',
        duration: 2000
      });
      return;
    }

    try {
      setLoading(true);
      const result = await post(`/api/orders/comment`, {
        orderId:orderId,
        score:rating,
        content: content.trim()
      });

      if (result) {
        Toast.show('toast-comment', {
          content: '评论提交成功',
          icon: 'success',
          duration: 2000
        });
        // 返回上一页
        setTimeout(() => {
          Taro.navigateBack();
        }, 2000);
      }
    } catch (error) {
      console.error('提交评论失败:', error);
      Toast.show('toast-comment', {
        content: error.message || '评论提交失败，请重试',
        icon: 'error',
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  // 字数限制处理
  const handleContentChange = (value) => {
    if (value.length <= 500) {
      setContent(value);
    }
  };

  // 页面加载时获取订单信息
  useEffect(() => {
    fetchOrderInfo();
  }, []);

  if (pageLoading) {
    return (
      <View className='comment-page'>
        <View style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className='comment-page'>
      {/* 订单信息 */}
      {orderInfo && (
        <View className='order-info'>
          <View className='order-title'>订单信息</View>
          <View className='order-detail'>
            <View className='detail-item'>
              <Text className='label'>服务名称：</Text>
              <Text>{orderInfo.serviceName || '陪诊服务'}</Text>
            </View>
            <View className='detail-item'>
              <Text className='label'>陪诊师：</Text>
              <Text>{orderInfo.medicalEscort?.escortName || '未知'}</Text>
            </View>
            <View className='detail-item'>
              <Text className='label'>服务时间：</Text>
              <Text>{orderInfo.date || '未知'}</Text>
            </View>
            <View className='detail-item'>
              <Text className='label'>服务费用：</Text>
              <Text>¥{orderInfo.servicePrice?.toFixed(2) || '0.00'}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 评分 */}
      <View className='rating-section'>
        <View className='section-title'>服务评分</View>
        <View className='rating-desc'>
          {rating > 0 ? (
            <Text style={{ color: '#f89d00', fontWeight: 'bold' }}>
              {ratingDesc[rating]}
            </Text>
          ) : (
            <Text>请为本次服务打分</Text>
          )}
        </View>
        <View className='rating-stars'>
          <Rate
            value={rating}
            onChange={setRating}
            count={5}
            size={32}
            activeColor='#f89d00'
            voidColor='#e0e0e0'
          />
        </View>
      </View>

      {/* 评论内容 */}
      <View className='comment-section'>
        <View className='section-title'>评论内容</View>
        <View className='comment-input'>
          <Textarea
            placeholder='请输入您的评论内容（可选，最多500字）'
            value={content}
            onChange={handleContentChange}
            rows={6}
            maxLength={500}
            showWordLimit
          />
        </View>
      </View>

      {/* 提交按钮 */}
      <Button
        className='submit-btn'
        type='primary'
        loading={loading}
        onClick={submitComment}
        disabled={rating === 0}
      >
        提交评论
      </Button>

      {/* Toast 提示 */}
      <Toast id='toast-comment' />
    </View>
  );
}

export default CommentPage;
