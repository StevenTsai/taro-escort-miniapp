import { CheckNormal } from '@nutui/icons-react-taro';
import { ConfigProvider, Step, Steps } from '@nutui/nutui-react-taro';

import './ServiceDescriptionSteps.scss';

const serviceDescriptionTheme = {
  nutuiStepsBusinessHeadBackgroundColor: '#fff',
  nutuiStepsBusinessTitleColor: '#D3706C',
  nutuiStepsBusinessHeadIconColor: '#D3706C',
  nutuiStepsBusinessDescriptionColor: '#808080',
  nutuiStepsVerticalItemIconSize: '7px',
  nutuiStepsVerticalTitleFontSize: '12px',
};

const ServiceDescriptionSteps = () => (
  <ConfigProvider theme={serviceDescriptionTheme}>
    <Steps direction='vertical' type='icon' status='business' className='service-description-steps'>
      <Step
        type='icon'
        icon={<CheckNormal />}
        title='超时收费：'
        description='陪诊从见到陪诊师开始计时,超出按每小时80元(节假日100元)计算(4小时封顶)(每次超时30分钟算超时1小时)。'
      />
      <Step
        type='icon'
        icon={<CheckNormal />}
        title='节假日费用：'
        description='节假日半天陪诊额外收取80元、全天额外收取200元。'
      />
      <Step
        type='icon'
        icon={<CheckNormal />}
        title='费用说明：'
        description='服务费用不含医疗、检查、药品等费用, 由用户自理。'
      />
        <Step
        type='icon'
        icon={<CheckNormal />}
        title='服务范围：'
        description='仅支持当地医院的陪诊服务，不负责接送服务，陪诊员会提前到达医院等待。服务按单个就诊号收费，仅限当次就诊使用'
      />
      <Step
        type='icon'
        icon={<CheckNormal />}
        title='无医疗行为：'
        description='陪诊师仅提供流程引导和陪同, 不提供医疗建议或诊断'
      />
      <Step
        type='icon'
        icon={<CheckNormal />}
        title='特殊需求：'
        description='行动辅助、翻译等特殊需求请提前告知, 以便安排合适陪诊师。'
      />
      <Step
        type='icon'
        icon={<CheckNormal />}
        title='责任范围：'
        description='陪诊师不代替家属职责, 不承担患者监护责任。'
      />
      <Step
        type='icon'
        icon={<CheckNormal />}
        title='不可控因素：'
        description='医院排队或设备故障等不可控因素导致延误, 平台不承担责任。'
      />
      <Step
        type='icon'
        icon={<CheckNormal />}
        title='取消订单：'
        description='非服务问题不支持无理由退款, 需退款请联系客服。'
      />
      <Step
        type='icon'
        icon={<CheckNormal />}
        title='服务人数：'
        description='服务为定制服务, 为保证服务质量, 每次陪诊服务仅服务一名就诊人。'
      />
    </Steps>
  </ConfigProvider>
);

export default ServiceDescriptionSteps;
