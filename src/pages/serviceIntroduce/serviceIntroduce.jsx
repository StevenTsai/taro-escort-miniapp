import { Text, View } from '@tarojs/components';
import Taro, { pxTransform } from '@tarojs/taro';

import {
  AddToHome,
  Check,
  CheckClose,
  List,
  Order,
  PickedUp,
  Received,
  Refresh,
  User,
} from '@nutui/icons-react-taro';
import { Button, Col, ConfigProvider, Image, Row } from '@nutui/nutui-react-taro';

import './serviceIntroduce.scss';

function Index() {
  const handleBack = () => {
    Taro.navigateBack();
  };

  return (
    <View className='service-introduce'>
      <Image
        mode='widthFix'
        src={`${process.env.TARO_APP_COS_BASE}/marquee/WechatIMG1021.jpg`}
      />
      <ConfigProvider theme={{ nutuiColDefaultMarginBottom: pxTransform(40) }}>
        <View className='section-1'>
          <View className='service-introduce-title'>
            <Text className='service-introduce-title-text'>本平台</Text>
            <Text className='service-introduce-title-text'>能解决那些问题？</Text>
          </View>
          <View className='service-introduce-content-text'>
            <Text>陪诊是什么？</Text>
            <Text>
              陪诊服务是指通过专业陪诊师为患者提供从预约到就医整个过程中所需的陪伴与支持。陪诊师不仅协助患者完成就医流程,
              还提供心理支持, 确保患者在就医过程中更加安心和顺利。
            </Text>
          </View>
          <Row type='flex' wrap='wrap' gutter={pxTransform(10)}>
            <Col className='introduce-item' span={12}>
              <Text className='introduce-item-title'>就医流程复杂</Text>
              <Text className='introduce-item-content'>陪诊师理清流程</Text>
              <Text className='introduce-item-content'>确保顺利就诊</Text>
            </Col>
            <Col className='introduce-item' span={12}>
              <Text className='introduce-item-title'>排队等待</Text>
              <Text className='introduce-item-content'>陪诊师代排队, 减少等待时间</Text>
            </Col>
            <Col className='introduce-item' span={12}>
              <Text className='introduce-item-title'>缺乏医疗知识</Text>
              <Text className='introduce-item-content'>提供专业指导, 协助选医和理解治疗方案</Text>
            </Col>
            <Col className='introduce-item' span={12}>
              <Text className='introduce-item-title'>沟通障碍</Text>
              <Text className='introduce-item-content'>协助医患沟通</Text>
              <Text className='introduce-item-content'>避免误解</Text>
            </Col>
            <Col className='introduce-item' span={12}>
              <Text className='introduce-item-title'>医院环境复杂</Text>
              <Text className='introduce-item-content'>导航指引, 避免迷路</Text>
            </Col>
            <Col className='introduce-item' span={12}>
              <Text className='introduce-item-title'>病历整理</Text>
              <Text className='introduce-item-content'>整理病历, 跟进病情</Text>
            </Col>
            <Col className='introduce-item' span={12}>
              <Text className='introduce-item-title'>缺乏陪伴</Text>
              <Text className='introduce-item-content'>提供情感支持, 缓解焦虑</Text>
            </Col>
            <Col className='introduce-item' span={12}>
              <Text className='introduce-item-title'>异地就医</Text>
              <Text className='introduce-item-content'>提供本地导航和支持</Text>
            </Col>
            <Col className='introduce-item' span={12}>
              <Text className='introduce-item-title'>特殊人群</Text>
              <Text className='introduce-item-content'>帮助老年人及行动不</Text>
              <Text className='introduce-item-content'>便者顺利就医</Text>
            </Col>
            <Col className='introduce-item' span={12}>
              <Text className='introduce-item-title'>减少医患纠纷</Text>
              <Text className='introduce-item-content'>促进医患理解</Text>
              <Text className='introduce-item-content'>降低纠纷风险</Text>
            </Col>
            <Col className='introduce-item' span={12}>
              <Text className='introduce-item-title'>跨国就医</Text>
              <Text className='introduce-item-content'>解决语言文化障碍</Text>
              <Text className='introduce-item-content'>确保顺畅沟通</Text>
            </Col>
            <Col className='introduce-item' span={12}>
              <Text className='introduce-item-title'>流程陪伴</Text>
              <Text className='introduce-item-content'>陪同独自就诊者</Text>
              <Text className='introduce-item-content'>全程引导就医流程</Text>
            </Col>
          </Row>
        </View>
        <View className='section-2'>
          <View className='service-introduce-title'>
            <Text className='service-introduce-title-text'>为什么选本平台？</Text>
          </View>
          <View className='service-introduce-content-text'>
            <Text>
              本平台专注陪诊服务, 从客户的角度出发, 不断改进完善服务细节, 力求提供最完美的服务。
            </Text>
          </View>
          <Row type='flex' wrap='wrap'>
            <Col span={24} className='section-2-item'>
              <View className='section-2-item-icon'>
                <User size={pxTransform(50)} color='#459b4c' />
              </View>
              <View className='section-2-item-content-box'>
                <Text className='section-2-item-title'>独创全方位陪诊</Text>
                <Text className='section-2-item-content'>
                  为每位就诊人配备一名陪诊师,提供全方位的专业服务。
                </Text>
              </View>
            </Col>
            <Col span={24} className='section-2-item'>
              <View className='section-2-item-icon'>
                <AddToHome size={pxTransform(50)} color='#459b4c' />
              </View>
              <View className='section-2-item-content-box'>
                <Text className='section-2-item-title'>精准分诊</Text>
                <Text className='section-2-item-content'>
                  根据患者的症状和需求,精准推荐合适的科室和医生,确保就医效率。
                </Text>
              </View>
            </Col>
            <Col span={24} className='section-2-item'>
              <View className='section-2-item-icon'>
                <Order size={pxTransform(50)} color='#459b4c' />
              </View>
              <View className='section-2-item-content-box'>
                <Text className='section-2-item-title'>病情跟进</Text>
                <Text className='section-2-item-content'>
                  在就医后, 陪诊师会定期跟进患者的康复情况, 确保病情得到持续关注。
                </Text>
              </View>
            </Col>

            <Col span={24} className='section-2-item'>
              <View className='section-2-item-icon'>
                <PickedUp size={pxTransform(50)} color='#459b4c' />
              </View>
              <View className='section-2-item-content-box'>
                <Text className='section-2-item-title'>专业陪诊师</Text>
                <Text className='section-2-item-content'>
                  陪诊师具备医学知识和实践经验,
                  许多陪诊师拥有护理或医疗背景。提供基本的健康指导和医学知识,
                  帮助患者更好地理解病情。
                </Text>
              </View>
            </Col>
            <Col span={24} className='section-2-item'>
              <View className='section-2-item-icon'>
                <Received size={pxTransform(50)} color='#459b4c' />
              </View>
              <View className='section-2-item-content-box'>
                <Text className='section-2-item-title'>系统性健康档案</Text>
                <Text className='section-2-item-content'>
                  为每位患者建立详细的健康档案, 记录就医历史, 便于后续跟进。
                </Text>
              </View>
            </Col>
            <Col span={24} className='section-2-item'>
              <View className='section-2-item-icon'>
                <List size={pxTransform(50)} color='#459b4c' />
              </View>
              <View className='section-2-item-content-box'>
                <Text className='section-2-item-title'>标准专业化服务流程</Text>
                <Text className='section-2-item-content'>
                  本平台专注于陪诊服务拥有一套完善且标准化的陪诊服务流程,
                  确保每一位患者都能得到高效、专业的服务。
                </Text>
              </View>
            </Col>
            <Col span={24} className='section-2-item'>
              <View className='section-2-item-icon'>
                <Refresh size={pxTransform(50)} color='#459b4c' />
              </View>
              <View className='section-2-item-content-box'>
                <Text className='section-2-item-title'>完整且丰富的陪诊环节</Text>
                <Text className='section-2-item-content'>
                  我们提供的不仅是陪伴,
                  还是一个全方位的健康管理过程。诊前、诊中、到后续的健康档案维护和康复跟进,
                  确保患者的就医体验不仅轻松, 还有深度服务和关注。
                </Text>
              </View>
            </Col>
          </Row>
        </View>
      </ConfigProvider>

      <View className='section-3'>
        <View className='section-3-item'>
          <View className='section-3-item-icon'>
            <CheckClose size={pxTransform(30)} color='#459b4c' />
          </View>
          <View className='section-3-item-content'>
            <View className='section-3-item-content-title'>
              <Text className='bold'>无</Text>
              <Text>陪诊</Text>
            </View>
            <View className='section-3-item-content-text'>
              本平台曾遇到许多就诊人因流程不熟悉、不会选择科室、不清楚检查步骤等问题,
              浪费大量时间,感到焦虑和无助,甚至影响治疗进程和效果。
            </View>
          </View>
        </View>
        <View className='section-3-item'>
          <View className='section-3-item-icon'>
            <Check size={pxTransform(30)} color='#459b4c' />
          </View>
          <View className='section-3-item-content'>
            <View className='section-3-item-content-title'>
              <Text className='bold'>有</Text>
              <Text>陪诊</Text>
            </View>
            <View className='section-3-item-content-text'>
              在陪诊师的引导下,就诊流程变得顺畅高效。陪诊师不仅帮助就诊人节省大量时间,还能稳定情绪,
              使其更专注于病情和治疗。在陪诊师的协助下,就诊人平均节省一半的就诊时间,
              避免不必要的等待和困惑。
            </View>
          </View>
        </View>
      </View>

      <View className='section-4'>
        <View className='section-4-box'>
          <View className='section-4-title'>
            仅需<Text className='section-4-title-text'>三步</Text> 轻松预约
          </View>
          <View className='section-4-list'>
            <View className='section-4-list-item'>
              <Text className='section-4-list-item-title'>1</Text>
              <Text className='section-4-list-item-text'>选择所需的服务</Text>
            </View>
            <View className='section-4-list-item'>
              <Text className='section-4-list-item-title'>2</Text>
              <Text className='section-4-list-item-text'>填写联系方式和姓名, 支付预约费用</Text>
            </View>
            <View className='section-4-list-item'>
              <Text className='section-4-list-item-title'>3</Text>
              <View className='section-4-list-item-text-box'>
                <Text className='section-4-list-item-text'>保持电话通畅</Text>
                <Text className='section-4-list-item-text'>陪诊助理将在第一时间联系您</Text>
              </View>
            </View>
          </View>
        </View>

        <Button
          type='success'
          block
          className='service-btn-back'
          color='#459b4c'
          onClick={handleBack}
        >
          返回选择服务
        </Button>
      </View>
    </View>
  );
}

export default Index;
