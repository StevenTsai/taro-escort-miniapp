import { Text, View } from '@tarojs/components';
import Taro, { pxTransform } from '@tarojs/taro';

import { Location } from '@nutui/icons-react-taro';
import { Button, Cell, Image, Space, Tag } from '@nutui/nutui-react-taro';

import './index.scss';

const HospitalCard = props => {
  const { state } = props;

  const handleClick = () => {
    // Taro.navigateTo({
    //   url: `/pages/medicalChaperons/medicalChaperons?city=${state.city}`,
    // });
    Taro.navigateTo({
      url: `/pages/hospitalDetail/hospitalDetail?id=${state.id}&city=${state.city}`,
    });
  };

  // 获取图片源
  const getImageSrc = () => {
    // 尝试从state中获取图片URL，支持多种可能的字段名
    const imageUrl = state.imageUrl || state.image || state.avatar || state.photo;
    return imageUrl && imageUrl.trim() !== '' ? imageUrl : undefined;
  };

  return (
    <Cell className='hospital-card' onClick={handleClick}>
      <Image radius={pxTransform(10)} src={getImageSrc()} className='hospital-card-image' />
      <View className='hospital-card-info'>
        <View className='top'>
          <View className='name'>{state.name}</View>
          <View className='location'>
            <Location />
          </View>
        </View>
        <Space>
          {Array.isArray(state.tags) && state.tags.length > 0 ? (
            state.tags.map((tag, index) => (
              <Tag key={index} background='#E9E9E9' color='#999999' className='tag'>
                {tag}
              </Tag>
            ))
          ) : (
            <Tag background='#E9E9E9' color='#999999' className='tag'>
              三甲医院
            </Tag>
          )}
        </Space>
        <Cell
          align='center'
          className='bottom'
          title={
            <Text
              style={{
                color: '#888B94',
                fontSize: pxTransform(12),
              }}
            >
              {state.city}
            </Text>
          }
          extra={
            <Button shape='square' type='success' size='mini'>
              预约
            </Button>
          }
        ></Cell>
      </View>
    </Cell>
  );
};

export default HospitalCard;
