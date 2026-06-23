export default defineAppConfig({
  pages: [
  'pages/index/index',
  'pages/detail/detail',
  'pages/register/register',
  'pages/profile/profile',
  'pages/medicalChaperons/medicalChaperons',
  'pages/orderList/orderList',
  'pages/order/order',
  'pages/serviceDetail/serviceDetail',
  'pages/hospitalDetail/hospitalDetail',
  'pages/serviceIntroduce/serviceIntroduce',
  'pages/chaperonList/chaperonList',
  'pages/escortIncome/escortIncome',
  'pages/comment/comment',
  'pages/chaperonEdit/chaperonEdit',
],



  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
    // 全局启用分享功能
    enableShareAppMessage: true,  // 启用分享给好友
    enableShareTimeline: true      // 启用分享到朋友圈
  },
  tabBar: {
    custom: true,
    list: [
    {
      pagePath: 'pages/index/index',
      text: '首页'
    },
    {
      pagePath: 'pages/medicalChaperons/medicalChaperons',
      text: '陪诊师预约'
    },
    {
      pagePath: 'pages/profile/profile',
      text: '个人中心'
    }]
  },
  permission: {
    'scope.userLocation': {
      desc: '您的位置信息将用于为您提供更准确的服务'
    }
  },
  requiredPrivateInfos: [
  'getLocation',
  'chooseLocation']



});