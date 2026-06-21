import { pxTransform } from '@tarojs/taro';

import { Image, Swiper } from '@nutui/nutui-react-taro';

const Header = ({ bannerList }) => {
  const list = bannerList?.length > 0 ? bannerList : [];

  if (list.length === 0) {
    return null;
  }

  return (
    <Swiper autoplay loop width='100vw' height={pxTransform(200)}>
      {list.map((item, index) => {
        return (
          <Swiper.Item key={item.id || index}>
            <Image
              mode='scaleToFill'
              src={item.imageUrl || item}
              alt={`轮播图${index + 1}`}
              draggable={false}
            />
          </Swiper.Item>
        );
      })}
    </Swiper>
  );
};

export default Header;
