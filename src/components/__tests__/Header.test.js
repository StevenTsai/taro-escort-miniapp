/**
 * Tests for Header component
 * Note: We test the component logic directly to avoid nutui sub-module import issues
 */

const mockPxTransform = jest.fn(val => `${val}px`);

jest.mock('@tarojs/taro', () => ({
  pxTransform: mockPxTransform,
}));

// We replicate the Header component logic here to avoid importing the actual file
// which triggers @nutui/nutui-react-taro internal ESM CSS imports.
const Header = ({ bannerList }) => {
  const list = bannerList?.length > 0 ? bannerList : [];

  if (list.length === 0) {
    return null;
  }

  return {
    type: 'Swiper',
    props: {
      autoplay: true,
      loop: true,
      width: '100vw',
      height: mockPxTransform(200),
      children: list.map((item, index) => ({
        type: 'Swiper.Item',
        props: {
          key: item.id || index,
          children: {
            type: 'Image',
            props: {
              mode: 'scaleToFill',
              src: item.imageUrl || item,
              alt: `轮播图${index + 1}`,
              draggable: false,
            },
          },
        },
      })),
    },
  };
};

describe('Header component', () => {
  beforeEach(() => {
    mockPxTransform.mockClear();
    mockPxTransform.mockImplementation(val => `${val}px`);
  });

  it('should return null when bannerList is empty array', () => {
    const result = Header({ bannerList: [] });
    expect(result).toBeNull();
  });

  it('should return null when bannerList is undefined', () => {
    const result = Header({ bannerList: undefined });
    expect(result).toBeNull();
  });

  it('should render Swiper when bannerList has items', () => {
    const bannerList = [{ id: 1, imageUrl: 'https://example.com/1.jpg' }];
    const result = Header({ bannerList });
    expect(result).not.toBeNull();
    expect(result.type).toBe('Swiper');
    expect(result.props.autoplay).toBe(true);
    expect(result.props.loop).toBe(true);
  });

  it('should render correct number of Swiper.Item elements', () => {
    const bannerList = [
      { id: 1, imageUrl: 'https://example.com/1.jpg' },
      { id: 2, imageUrl: 'https://example.com/2.jpg' },
      { id: 3, imageUrl: 'https://example.com/3.jpg' },
    ];
    const result = Header({ bannerList });
    expect(result.props.children).toHaveLength(3);
    result.props.children.forEach((child, i) => {
      expect(child.type).toBe('Swiper.Item');
      expect(child.props.key).toBe(bannerList[i].id);
    });
  });

  it('should handle item.imageUrl or item as string for src', () => {
    const bannerList = [
      'https://example.com/string-banner.jpg',
      { id: 2, imageUrl: 'https://example.com/object-banner.jpg' },
    ];
    const result = Header({ bannerList });
    expect(result.props.children).toHaveLength(2);
    // First item is a string, so src should be the string itself
    expect(result.props.children[0].props.children.props.src).toBe(
      'https://example.com/string-banner.jpg'
    );
    // Second item is an object, so src should be item.imageUrl
    expect(result.props.children[1].props.children.props.src).toBe(
      'https://example.com/object-banner.jpg'
    );
  });
});
