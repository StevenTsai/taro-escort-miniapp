import { Text, View } from '@tarojs/components';
import Taro, { pxTransform } from '@tarojs/taro';

import { Location } from '@nutui/icons-react-taro';
import { Button, Col, Dialog, Image, Row, Space, Toast } from '@nutui/nutui-react-taro';
import { useState } from 'react';

import { ORDER_STATUS, ROLE } from '@/constants';
import useAuthStore from '@/store/useAuthStore';
import { requestPayment } from '@/utils/payment';
import { get, post } from '@/utils/request';

import './index.scss';

const OrderCard = ({ orderInfo, onOrderUpdate }) => {
  const { userInfo } = useAuthStore();
  const [btnLoading, setBtnLoading] = useState(false);
  const { serviceName, serviceDate, status, medicalEscort, orderId, outTradeNo } = orderInfo;

  // 可以退款的方法
  const canRefund = async () => {
    const { refundAmount, reason } = await get(`/api/pay/refund/calculate/${outTradeNo}`);
    Dialog.open('order-dialog', {
      title: '取消订单',
      content: (
        <View>
          <Text>退款规则：{'\n'}</Text>
          <Text>
            服务开始时间 {'>'} 24小时：退款100%{'\n'}
          </Text>
          <Text>
            服务开始时间 {'>'} 12-24小时：退款90%{'\n'}
          </Text>
          <Text>
            服务开始时间 {'>'} 4-12小时：退款50%{'\n'}
          </Text>
          <Text>
            服务开始时间 {'<'} 4小时：退款20%{'\n'}
          </Text>
          <Text>
            服务已开始：不退款{'\n'}
            {'\n'}
            {'\n'}
          </Text>
          <Text className='refund-reason'>
            当前退款金额: ¥<Text className='refund-amount'>{refundAmount.toFixed(2)}</Text>
            {'\n'}
          </Text>
          <Text className='refund-reason'>{reason}</Text>
        </View>
      ),
      onConfirm: () => {
        cancelOrder();
      },
      onCancel: () => {
        Dialog.close('order-dialog');
      },
    });
  };

  const cancelOrderWithoutRefund = async () => {
    Dialog.open('order-dialog', {
      title: '取消订单',
      content: '当前可以无责取消，是否确认取消订单?',
      onConfirm: () => {
        cancelOrder();
      },
      onCancel: () => {
        Dialog.close('order-dialog');
      },
    });
  };

  const showCancelOrderDialog = async () => {
    try {
      if (status === ORDER_STATUS.PAID || status === ORDER_STATUS.ACCEPTED) {
        canRefund();
      } else {
        cancelOrderWithoutRefund();
      }
    } catch (error) {
      Toast.show('order-toast', {
        content: error.message,
        icon: 'error',
      });
    }
  };

  // 取消订单
  const cancelOrder = async () => {
    setBtnLoading(true);
    try {
      const data = await post('/api/pay/closeOrder', { outTradeNo });
      setBtnLoading(false);
      Dialog.close('order-dialog');
      Toast.show('order-toast', {
        content: '取消订单成功',
        icon: 'success',
      });
      if (onOrderUpdate) {
        onOrderUpdate();
      }
      return data;
    } catch (error) {
      setBtnLoading(false);
      Dialog.close('order-dialog');
      Toast.show('order-toast', {
        content: error.message || '取消订单失败',
        icon: 'error',
      });
    }
  };

  // 立刻支付
  const payOrder = async () => {
    await requestPayment({
      outTradeNo,
      onSuccess: () => {
        Toast.show('order-toast', {
          content: '支付成功',
          icon: 'success',
        });
        if (onOrderUpdate) {
          onOrderUpdate();
        }
      },
      onFail: () => {
        Toast.show('order-toast', {
          content: '支付失败',
          icon: 'error',
        });
      },
    });
  };

  // 开始陪诊
  const startChaperon = async () => {
    Dialog.open('order-dialog', {
      title: '开始陪诊',
      content: '是否确认开始陪诊，陪诊开始后将无法取消订单',
      onConfirm: async () => {
        try {
          await post(`/api/orders/${orderId}/start`);
          Dialog.close('order-dialog');
          Toast.show('order-toast', {
            content: '开始陪诊成功',
            icon: 'success',
          });
          if (onOrderUpdate) {
            onOrderUpdate();
          }
        } catch (error) {
          Toast.show('order-toast', {
            content: error.message,
            icon: 'error',
          });
        }
      },
      onCancel: () => {
        Dialog.close('order-dialog');
      },
    });
  };

  // 结束陪诊服务
  const endChaperon = async () => {
    Dialog.open('order-dialog', {
      title: '结束陪诊',
      content: '是否确认结束陪诊，陪诊结束将无法取消订单',
      onConfirm: async () => {
        try {
          await post(`/api/orders/${orderId}/complete`);
          Dialog.close('order-dialog');
          Toast.show('order-toast', {
            content: '结束陪诊成功',
            icon: 'success',
          });
          if (onOrderUpdate) {
            onOrderUpdate();
          }
        } catch (error) {
          Toast.show('order-toast', {
            content: error.message,
            icon: 'error',
          });
        }
      },
      onCancel: () => {
        Dialog.close('order-dialog');
      },
    });
  };

  // 状态按钮类型映射
  const statusButtonType = {
    [ORDER_STATUS.PENDING]: 'warning',
    [ORDER_STATUS.PAID]: 'success',
    [ORDER_STATUS.ACCEPTED]: 'success',
    [ORDER_STATUS.IN_PROGRESS]: 'info',
    [ORDER_STATUS.COMPLETED]: 'default',
    [ORDER_STATUS.CANCELLED]: 'danger',
  };

  return (
    <View className='order-card'>
      <View className='order-title'>
        <View>
          {serviceName}({orderId})
        </View>
        <View>
          <Button
            className='order-status'
            type={statusButtonType[status] || 'default'}
            size='mini'
            fill='outline'
            disabled={status !== ORDER_STATUS.PENDING}
          >
            {status}
          </Button>
        </View>
      </View>
      <View className='order-medical-chaperon'>
        <View className='order-medical-chaperon-left'>
          <View className='order-medical-chaperon-left-avatar'>
            <Image
              width={pxTransform(40)}
              height={pxTransform(40)}
              radius={pxTransform(40)}
              src={medicalEscort?.avatar}
            />
          </View>
        </View>
        <View className='order-medical-chaperon-right'>
          <View className='order-medical-chaperon-right-name'>
            {medicalEscort?.name || '未指定'}
          </View>
          <View className='order-medical-chaperon-right-datetime'>
            <Location />
            {orderInfo.hospitalName}
          </View>
        </View>
        <View className='order-medical-chaperon-right-price'>
          <Text className='order-medical-chaperon-right-price-symbol'>￥</Text>
          <Text>{orderInfo.servicePrice.toFixed(2)}</Text>
        </View>
      </View>
      <Row className='order-info' wrap='wrap'>
        <Col span={14}>服务时间：{serviceDate}</Col>
        <Col span={10}>客户：{orderInfo.patientName}</Col>
      </Row>

      {userInfo?.role !== ROLE.CHAPERON ? (
        <Space align='end' justify='end'>
          {/* 操作按钮 */}
          {status === ORDER_STATUS.PENDING && (
            <Button
              type='warning'
              size='mini'
              loading={btnLoading}
              onClick={payOrder}
            >
              立刻支付
            </Button>
          )}
          {(status === ORDER_STATUS.PENDING ||
            status === ORDER_STATUS.PAID ||
            status === ORDER_STATUS.ACCEPTED) && (
            <Button type='danger' size='mini' loading={btnLoading} onClick={showCancelOrderDialog}>
              取消订单
            </Button>
          )}
          {status === ORDER_STATUS.IN_PROGRESS && (
            <Button type='primary' size='mini' onClick={endChaperon}>
              结束陪诊
            </Button>
          )}
          {status === ORDER_STATUS.COMPLETED && orderInfo.commentStatus === 'COMMENTED' && (
            <Button type='default' size='mini' disabled>
              已评价
            </Button>
          )}
          {status === ORDER_STATUS.COMPLETED && orderInfo.commentStatus !== 'COMMENTED' && (
            <Button
              type='success'
              size='mini'
              onClick={() => {
                Taro.navigateTo({
                  url: `/pages/comment/comment?orderId=${orderId}`,
                });
              }}
            >
              评价
            </Button>
          )}
        </Space>
      ) : (
        <Space align='end' justify='end'>
          {status === ORDER_STATUS.ACCEPTED && (
            <Button type='success' size='mini' onClick={startChaperon}>
              开始陪诊
            </Button>
          )}
        </Space>
      )}
    </View>
  );
};

export default OrderCard;
