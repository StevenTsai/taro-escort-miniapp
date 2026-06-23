import { CheckNormal } from '@nutui/icons-react-taro';
import { ConfigProvider, Step, Steps } from '@nutui/nutui-react-taro';

import './ServiceDescriptionSteps.scss';

const serviceInstructionsTheme = {
  nutuiStepsBusinessHeadBackgroundColor: '#fff',
  nutuiStepsBusinessTitleColor: '#117b32',
  nutuiStepsBusinessHeadIconColor: '#117b32',
  nutuiStepsBusinessDescriptionColor: '#808080',
  nutuiStepsVerticalItemIconSize: '7px',
  nutuiStepsVerticalItemPaddingBottom: 0,
};

const RefundInstructionsSteps = () => (
  <ConfigProvider theme={serviceInstructionsTheme}>
    <Steps direction='vertical' type='icon' status='business' className='service-description-steps'>
      <Step
        type='icon'
        icon={<CheckNormal />}
        description='服务开始时间24小时前取消订单的, 全额退款。'
      />
       <Step
        type='icon'
        icon={<CheckNormal />}
        description='距离服务开始时间12-24小时以内取消订单, 扣除订单金额10%。'
      />
      <Step
        type='icon'
        icon={<CheckNormal />}
        description='距离服务开始时间4-12小时以内的取消订单, 扣除订单金额50%。'
      />
      <Step
        type='icon'
        icon={<CheckNormal />}
        description='距离订单服务时间4小时以内的取消订单, 扣除订单金额80%。'
      />
      <Step
        type='icon'
        icon={<CheckNormal />}
        description='服务开始后不能取消订单, 扣除订单金额100%。如有特殊情况要退款请主动联系客服!
        请个人页->点击右下方的”联系客服”。'
      />
    </Steps>
  </ConfigProvider>
);

export default RefundInstructionsSteps;
