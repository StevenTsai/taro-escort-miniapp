import { View } from '@tarojs/components';
import { pxTransform } from '@tarojs/taro';

import { Col, ConfigProvider, Row, Step, Steps } from '@nutui/nutui-react-taro';

import './ServiceContent.scss';

const serviceContentData = [
  {
    title: '半天陪诊：',
    description: '专业陪诊师陪同就诊服务4小时 (工作日9:00-18:00期间)。',
  },
  {
    title: '全天陪诊：',
    description: '专业陪诊师陪同就诊服务8小时 (工作日9:00-18:00期间)。',
  },
];

const escortTaskServiceContentData = [
  '代开药',
  '代探望',
  '代开检查单',
  '代预约胃肠镜',
  '代预约检查时间',
  '打印门诊报告',
  '打印住院资料',
  '借玻片',
  '还玻片',
  '打印门诊发票、费用清单等',
  '以上代办服务需要在下单时，备注里写清楚具体代办事项，如打印门诊报告、打印住院资料等。',
];

const pathologyConsultationContentData = [
  '诊前咨询，会诊规划，送检切片，缴费代办，病理会诊，打印结果，代办问诊，记录医嘱，解读医嘱和切片物品归还',
  '会诊所需材料:1.借取切片:患者到原医院病理科办理借取病理切片手续，借取病理染色切片和白片10-15张;2.准备代问诊材料:准备近期的检查资料和影像资料，填写代问诊申请表。3.邮寄切片:邮寄原医院病理切片，病理报告，影像资料和其他检查资料给陪诊员;',
];

const medicalCourierServiceData = [
  '诊前问询，建档取号，代缴费用，排队候诊，问诊沟通，记录医嘱，代取药品，解读医嘱和回寄物品。就诊当天，问诊专员拿着患者的检查资料提前到达医院排队取号候诊。见到医生后把患者全部检查资料给医生看，并把患者的病况描述及要问的内容转述给医生。问诊过程中问诊专员会让医生与患者电话沟通，如果医生不方便，陪诊员会全程记录问诊结果和医嘱。最后将问诊结果和诊断结果，反馈给家属并把患者病历材料及诊断结果邮寄回去。',
];

const medicalPlanningServiceData = [
  '壹鹿康行平台可以提供专业的就医规划咨询服务，包括但不限于:梳理问诊思路，疑难病理指导，难治病情分析',
];

// 就医规划服务流程数据
const medicalPlanningServiceProcessData = [
  {
    value: '诊前',
    items: [
      {
        title: '1、1对1咨询：',
        description: '由专业医疗顾问与患者沟通，了解病情和需求，收集相关病历资料。',
      },
      {
        title: '2、病情分析：',
        description: '专业团队分析患者病情，梳理就医思路和重点。',
      },
    ],
  },
  {
    value: '规划',
    items: [
      {
        title: '3、制定方案：',
        description: '根据病情制定个性化就医规划，推荐合适的医院和专家。',
      },
      {
        title: '4、疑难病理指导：',
        description: '针对疑难病理提供专业指导和建议。',
      },
    ],
  },
  {
    value: '后续',
    items: [
      {
        title: '5、持续跟进：',
        description: '提供后续就医咨询和指导，确保患者顺利就诊。',
      },
    ],
  },
];

const stepTheme = {
  nutuiStepsBusinessHeadTextColor: '#fff',
  nutuiStepsBusinessHeadBackgroundColor: '#117b32',
  nutuiStepsVerticalItemIconSize: pxTransform(20),
  nutuiStepsBaseHeadTextSize: pxTransform(20),
  nutuiStepsBusinessDescriptionColor: '#666',
  nutuiStepsBaseLineBackground: '#117b32',
};

// 陪诊服务流程数据
const accompanyingServiceData = [
  {
    value: '诊前',
    items: [
      {
        title: '1、1对1服务：',
        description: '由陪诊师跟患者沟通陪诊具体事项和收集相关资料，提高服务效率与质量。',
      },
      {
        title: '2、协助挂号：',
        description:
          '按照医院常规挂号系统协助挂号,不保证挂号为指定的医院或医生或时间, 不保证百分百挂到号!',
      },
      {
        title: '3、行程规划：',
        description: '规划到院时间及流程, 异地就医提供行程规划建议安排等。',
      },
    ],
  },
  {
    value: '诊中',
    items: [
      {
        title: '4、全程陪同：',
        description: '陪诊师提前到院,代排队、报道,节省等待时间。',
      },
      {
        title: '5、问诊辅助：',
        description: '协助描述病情,记录医生诊断及医嘱,确保关键信息不遗漏。',
      },
      {
        title: '6、实时反馈：',
        description: '记录问诊要点, 按需反馈问诊进度和结果。',
      },
      {
        title: '7、情绪安抚：',
        description: '提供必要的心理疏导, 缓解紧张情绪。',
      },
    ],
  },
  {
    value: '诊后',
    items: [
      {
        title: '8、专病解读：',
        description: '诊后协助患者解读专业疾病, 并线上康复指导。',
      },
    ],
  },
];

// 病理会诊流程数据
const pathologyConsultationServiceData = [
  {
    value: '诊前',
    items: [
      {
        title: '1、会诊准备：',
        description: '平台下单，客服对接，指定陪诊员，诊前准备，邮寄切片，预约挂号',
      }
    ],
  },
  {
    value: '诊中',
    items: [
      {
        title: '2、提交病理资料：',
        description: '到达病理科，办理送检手续，代缴费，领取回执，等待结果。',
      },
      {
        title: '3、取会诊结果：',
        description: '预约挂号，取会诊报告，整理检查资料',
      },
      {
        title: '4、代问诊：',
        description: '分诊报到，代办问诊，记录医嘱，转述医嘱，物品回寄',
      },
    ],
  },
  {
    value: '诊后',
    items: [
      {
        title: '5、健康管理：',
        description:
          '整理病历、记录医嘱,提醒复诊,三甲医生解答后续疑问,确保诊后康复跟进。',
      },
    ],
  },
];

// 代问诊流程数据
const proxyConsultationServiceData = [
  {
    value: '诊前',
    items: [
      {
        title: '1、诊前咨询：',
        description: '用户提前与壹鹿康行顾问沟通，了解代问诊内容、服务流程、收费标准；患者写清具体病史、病况及问诊需求，准备病案材料，近期检查资料；确认代问诊时间及医院地点等事宜，由委托人填写代问诊申请表，以便问诊专员为患者提供代问诊服务。诊前准备',
      },
       {
        title: '2、诊前资料准备：',
        description: '确定问诊医院及科室，计划好挂号时间，做好异地就医备案，提前把纸质病历材料、影像报告、治疗记录、病情描述、近期就医情况、既往病史及用药情况，代问诊申请表等资料信息邮寄给陪诊师',
      }
    ],
  },
  {
    value: '诊中',
    items: [
      {
        title: '3、代问诊：',
        description: '问诊专员会拿着患者的所有资料以患者临时家属的身份去找医生问诊，问诊专员尽可能的会让医生与患者通电话，医生给出诊断建议或治疗意见给患者，问诊专员同时也会时刻记录医嘱。',
      }
    ],
  },
  {
    value: '诊后',
    items: [
      {
        title: '4、诊后关怀：',
        description:
          '诊后1-2个工作日，回访人员进行诊后回访，回寄材料，叮嘱客户正确用药按时复诊。',
      },
    ],
  },
];

// 代办服务流程数据
const escortTaskServiceData = [
  {
    value: '诊前',
    items: [
      {
        title: '1、1对1服务：',
        description: '由陪诊师跟患者沟通代办具体事项和收集相关资料，提高服务效率与质量。',
      },
      {
        title: '2、协助挂号：',
        description:
          '按照医院常规挂号系统协助挂号,不保证挂号为指定的医院或医生或时间, 不保证百分百挂到号!',
      },
    ],
  },
  {
    value: '诊中',
    items: [
      {
        title: '3、实时反馈：',
        description: '记录问诊和代办要点,按需反馈问诊进度和结果。',
      },
    ],
  },
  {
    value: '诊后',
    items: [
      {
        title: '4、健康管理：',
        description:
          '整理病历、记录医嘱,提醒复诊,三甲医生解答后续疑问,确保诊后康复跟进。',
      },
    ],
  },
];

// 服务流程Steps组件
const ServiceProcessSteps = ({ serviceId }) => {
  let stepData = [];

  switch (serviceId) {
      case 1:
      case 5:
        stepData = accompanyingServiceData;
        break;
      case 2:
        stepData = proxyConsultationServiceData;
        break;
      case 3:
        stepData = pathologyConsultationServiceData;
        break;
      case 4:
        stepData = escortTaskServiceData;
        break;
      case 6:
        stepData = medicalPlanningServiceProcessData;
        break;
      default:
        stepData = [];
    }

  return (
    <ConfigProvider theme={stepTheme}>
      <Steps direction='vertical' type='icon' status='business'>
        {stepData.map((step, stepIndex) => (
          <Step
            key={stepIndex}
            type='text'
            value={step.value}
            title=' '
            description={
              <>
                {step.items.map((item, itemIndex) => (
                  <Row key={itemIndex} type='flex'>
                    <Col span={12} className='step-small-title mt-0'>
                      {item.title}
                    </Col>
                    <Col className='mt-0'>{item.description}</Col>
                  </Row>
                ))}
              </>
            }
          />
        ))}
      </Steps>
    </ConfigProvider>
  );
};

const ServiceContent = ({ serviceId }) => (
  <View>
    <View className='service-content-title'>
      <View className='service-content-zh'>服务内容</View>
      <View className='service-content-en'>service content</View>
    </View>
    <View className='service-content'>
      {/* 陪诊服务 */}
      {(serviceId === 1 || serviceId === 5) &&
        serviceContentData.map((item, index) => (
          <View key={index}>
            <View className='item-title'>{item.title}</View>
            <View>{item.description}</View>
          </View>
        ))}
      <View style={{ textAlign: 'center' }}>
        {/* 代办服务 */}
        {serviceId === 4 &&
          escortTaskServiceContentData.map((item, index) => <View key={index}>{item}</View>)}
        {/* 代问诊 */}
        {serviceId === 2 &&
          medicalCourierServiceData.map((item, index) => <View key={index}>{item}</View>)}
        {/* 病理会诊 */}
        {serviceId === 3 &&
          pathologyConsultationContentData.map((item, index) => <View key={index}>{item}</View>)}
        {/* 就医规划 */}
        {serviceId === 6 &&
          medicalPlanningServiceData.map((item, index) => <View key={index}>{item}</View>)}
      </View>
    </View>

  

    {/* steps 陪诊服务和代办服务流程 */}
    {(serviceId === 1 || serviceId === 5 || serviceId === 4 || serviceId === 3 || serviceId === 2 || serviceId === 6) && (
      <View>
        <View className='step'>
          <ServiceProcessSteps serviceId={serviceId} />
        </View>
      </View>
    )}
  </View>
);

export default ServiceContent;
