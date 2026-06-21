import { Text, View } from '@tarojs/components';
import Taro, { pxTransform } from '@tarojs/taro';

import { Button, Cell, Image, Tag } from '@nutui/nutui-react-taro';
import './index.scss';

const MedicalChaperonCard = props => {
  const { state, city } = props;

  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/detail/detail?id=${state.id}&city=${city}`,
    });
  };

  return (
    <Cell className='medical-chaperon-card' onClick={handleClick}>
      <View className='avatar-container'>
        <Image
          src={state.avatar}
          width={pxTransform(70)}
          height={pxTransform(70)}
          radius={pxTransform(70)}
        />
      </View>
      <View className='content'>
        <View>
          <View className='top'>
            <View className='name'>{state.name}</View>
          </View>
          <Text className='bio-text'>
            {state.bio && state.bio.length > 15 ? state.bio.substring(0, 15) + '...' : state.bio}
          </Text>
        </View>
        <View className='bottom'>
          <View className='tags-container'>
            {state.tags.map(tag => {
              return (
                <Tag key={tag} background='#e9e9e9' color='#999999' className='tag'>
                  {tag.replaceAll('"', '')}
                </Tag>
              );
            })}
          </View>
          <Button className='btn-booking' shape='square' type='success' size='mini'>
            预约
          </Button>
        </View>
      </View>
    </Cell>
  );
};

export default MedicalChaperonCard;
