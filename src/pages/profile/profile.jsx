import { View } from '@tarojs/components';
import Taro, { pxTransform } from '@tarojs/taro';

import { ArrowRight, List, Service } from '@nutui/icons-react-taro';
import { Button, Cell, CellGroup, Form, Image, Input, Popup, Toast } from '@nutui/nutui-react-taro';
import { useEffect, useState } from 'react';

import RegisterBtn from '@/components/RegisterBtn/RegisterBtn';
import useAuthStore, { useIsLoggedIn } from '@/store/useAuthStore';
import { cacheImageFromUrl } from '@/utils/imageUtils';
import { get, post, upload } from '@/utils/request';

import './profile.scss';

const SignUpPopup = ({ visible, onClose, phoneNumber }) => {
  const { setToken, setUserInfo } = useAuthStore();
  const [avatar, setAvatar] = useState('');
  const [form] = Form.useForm();

  const handleFinish = async values => {
    try {
      let avatarUrl = avatar;

      // 如果有头像，先上传头像
      if (avatar) {
        Taro.showLoading({ title: '上传头像中...' });

        // 生成文件名：avatar_时间戳_随机数.jpeg
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const fileName = `avatar_${timestamp}_${random}.jpeg`;

        const uploadResult = await upload('/api/cos/upload', avatar, { objKey: fileName });

        // 解析上传结果，获取头像URL
        avatarUrl = `avatar/${fileName}`;

        Taro.hideLoading();
      }

      // 准备loggin的code
      const loginData = await Taro.login();

      // 准备提交的用户信息
      const submitData = {
        code: loginData.code,
        nickName: values.nickname,
        avatar: avatarUrl,
        phoneNumber: phoneNumber,
      };

      // 调用API保存用户信息
      Taro.showLoading({ title: '保存用户信息中...' });
      const userData = await post('/api/user/register', submitData);
      setUserInfo(userData);
      setToken(userData.skey);

      Taro.hideLoading();
      Taro.showToast({
        title: '保存成功',
        icon: 'success',
      });

      // 完成后关闭popup
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
      Taro.hideLoading();
      Taro.showToast({
        title: error.message || '保存失败，请重试',
        icon: 'error',
      });
    }
  };

  return (
    <>
      <Popup
        closeable={false}
        closeOnOverlayClick={false}
        visible={visible}
        style={{ height: '100%' }}
        position='bottom'
      >
        <CellGroup divider={false}>
          <Cell style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatar ? (
              <Image src={avatar} width={80} height={80} radius={40} />
            ) : (
              <Button
                fill='outline'
                openType='chooseAvatar'
                type='success'
                onChooseAvatar={e => {
                  setAvatar(e.detail.avatarUrl);
                }}
              >
                选择头像
              </Button>
            )}
          </Cell>
          <Cell>
            <Form
              form={form}
              labelPosition='right'
              onFinish={handleFinish}
              footer={
                <>
                  <Button nativeType='submit' block color='#1677ff'>
                    提交
                  </Button>
                </>
              }
            >
              <Form.Item label='用户名' name='nickname'>
                <Input type='text' placeholder='请输入用户名' />
              </Form.Item>
            </Form>
          </Cell>
        </CellGroup>
      </Popup>
    </>
  );
};

function Profile() {
  const { userInfo, logout, initAuth, checkAuth, setToken, setUserInfo } = useAuthStore();
  const isLoggedIn = useIsLoggedIn();
  const [showSignUpPopup, setShowSignUpPopup] = useState(false);
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState('');

  Taro.useShareAppMessage(() => {
    return {
      title: '陪诊服务',
      path: '/pages/index/index',
    };
  });

  Taro.useShareTimeline(() => {
    return {
      title: '陪诊服务',
      path: '/pages/index/index',
    };
  });

  useEffect(() => {
    // 初始化认证状态
    initAuth();

    // 如果没有登录，跳转到登录页
    if (!isLoggedIn) {
      checkAuth();
    }
  }, [initAuth, isLoggedIn, checkAuth]);

  useEffect(() => {
    Taro.getSetting({
      withSubscriptions: true,
      success: res => {
        if (res.subscriptionsSetting.mainSwitch) {
          // 订阅消息功能已开启
        } else {
          // 订阅消息功能已关闭
        }
      },
    });
  }, []);

  const goToOrders = () => {
    // 检查登录状态
    if (!isLoggedIn) {
      Toast.show('profile-toast', {
        content: '请先授权手机号登录',
        icon: 'warn',
      });
      return;
    }

    Taro.navigateTo({
      url: '/pages/orderList/orderList',
    });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: res => {
        if (res.confirm) {
          logout();
        }
      },
    });
  };

  // 移除拨打电话功能，使用微信小程序客服功能

  const login = async () => {
    try {
      const loginData = await Taro.login();
      const submitData = {
        code: loginData.code,
      };
      const userData = await get('/api/user/wxlogin', submitData);
      if (!userData.nickName) {
        // 报错的时候走注册流程，弹出注册页面
        setShowSignUpPopup(true);
        return;
      }

      // 处理头像转换和缓存
      if (userData.avatar) {
        try {
          const cachedAvatar = await cacheImageFromUrl(userData.avatar, 'user_avatar');
          userData.avatar = cachedAvatar;
        } catch (error) {
          console.error('头像处理失败:', error);
          // 头像处理失败不影响登录流程
        }
      }

      setUserInfo(userData);
      setToken(userData.skey);
    } catch (error) {
      Toast.show('profile-toast', {
        content: '登录失败',
        icon: 'error',
      });
    }
  };

  // 订阅通知模板信息
  const getSubscribeMessage = async () => {
    const tmplIds =
      userInfo?.role !== 2
        ? [
            'your-template-id-booking-success',
            'your-template-id-user-notify',
          ]
        : [
            'your-template-id-booking-success',
            'your-template-id-chaperon-notify',
            'your-template-id-service-reminder',
          ];

    Taro.requestSubscribeMessage({
      tmplIds: tmplIds,
      success: res => {
        Toast.show('profile-toast', {
          content: '订阅成功',
          icon: 'success',
        });
      },
      fail: err => {
        Toast.show('profile-toast', {
          content: '订阅失败',
          icon: 'error',
        });
      },
    });
  };

  // 微信获取手机号
  const handleGetPhoneNumber = async e => {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 传递手机号code到登录函数
      const res = await get('/api/user/getUserPhoneNumber', { code: e.detail.code });
      setCurrentPhoneNumber(res.phoneNumber);
      login();
    } else if (e.detail.errMsg === 'getPhoneNumber:fail user deny') {
      Toast.show('profile-toast', {
        content: '用户拒绝授权',
        icon: 'error',
      });
    } else {
      Toast.show('profile-toast', {
        content: '获取手机号失败',
        icon: 'error',
      });
    }
  };

  const goToMedicalChaperons = () => {
    Taro.navigateTo({
      url: '/pages/chaperonList/chaperonList',
    });
  };

  const goToUsageGuide = () => {
    Taro.downloadFile({
      url: `${process.env.TARO_APP_COS_BASE}/file/usage-guide.docx`,
      success: res => {
        Taro.openDocument({
          filePath: res.tempFilePath,
        });
      },
    });
  };

  const goToEscortIncome = () => {
    Taro.navigateTo({
      url: '/pages/escortIncome/escortIncome',
    });
  };

  return (
    <View className='profile-page'>
      <View className={`profile ${userInfo?.role === 2 ? 'profile-medical-chaperon' : ''}`}>
        {isLoggedIn ? (
          <>
            <Image
              className='avatar'
              width={80}
              height={80}
              radius={40}
              src={userInfo?.avatar || ''}
            />
            <View className='name'>{userInfo?.nickName || '用户'}</View>
            {/* <View className='phone'>{userInfo?.phone}</View> */}
          </>
        ) : (
          <>
            <Image className='avatar' width={80} height={80} radius={40} src='' />
            <View className='name'>
              <Button
                size='small'
                color='green'
                openType='getPhoneNumber'
                onGetPhoneNumber={handleGetPhoneNumber}
              >
                授权手机号登录
              </Button>
            </View>
          </>
        )}
      </View>

      <CellGroup className='function-list'>
        {userInfo?.role === 2 ? (
          <>
            <Cell title='我的陪诊' onClick={goToMedicalChaperons} extra={<List />} />
            <Cell title='我的收入' onClick={goToEscortIncome} extra={<ArrowRight />} />
            <Cell
              title='编辑资料'
              onClick={() => Taro.navigateTo({ url: '/pages/chaperonEdit/chaperonEdit' })}
              extra={<ArrowRight />}
            />
          </>
        ) : (
          <>
            <Cell title='我的订单' onClick={goToOrders} extra={<List />} />
          </>
        )}
        <Cell title='使用说明' onClick={goToUsageGuide} extra={<ArrowRight />} />
        {isLoggedIn && (
          <Cell
            title='订阅服务进度'
            onClick={() => {
              getSubscribeMessage();
            }}
            extra={<ArrowRight />}
          />
        )}
        {isLoggedIn && <Cell title='退出登录' onClick={handleLogout} className='logout-cell' />}
      </CellGroup>

      {isLoggedIn && userInfo?.role !== 2 && <RegisterBtn />}

      <Button
        icon={<Service size={pxTransform(30)} />}
        fill='none'
        className='sticky-button'
        openType='contact'
        type='default'
      ></Button>

      <Toast id='profile-toast' />

      <SignUpPopup
        visible={showSignUpPopup}
        onClose={() => setShowSignUpPopup(false)}
        phoneNumber={currentPhoneNumber}
      />
    </View>
  );
}

export default Profile;
