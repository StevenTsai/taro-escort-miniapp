import {
  APP_NAME,
  COLORS,
  COS_URLS,
  DEFAULT_CITY,
  ORDER_STATUS,
  ORDER_STATUS_LIST,
  ROLE,
  SERVICE_ID,
  SHARE_CONFIG,
} from '../index';

describe('constants', () => {
  describe('ROLE', () => {
    it('should define USER and CHAPERON roles', () => {
      expect(ROLE.USER).toBe(1);
      expect(ROLE.CHAPERON).toBe(2);
    });
  });

  describe('ORDER_STATUS', () => {
    it('should define all order statuses in Chinese', () => {
      expect(ORDER_STATUS.PENDING).toBe('待确认');
      expect(ORDER_STATUS.PAID).toBe('已支付');
      expect(ORDER_STATUS.ACCEPTED).toBe('已接单');
      expect(ORDER_STATUS.IN_PROGRESS).toBe('进行中');
      expect(ORDER_STATUS.COMPLETED).toBe('已完成');
      expect(ORDER_STATUS.CANCELLED).toBe('已取消');
    });
  });

  describe('ORDER_STATUS_LIST', () => {
    it('should have 7 items including "all"', () => {
      expect(ORDER_STATUS_LIST).toHaveLength(7);
      expect(ORDER_STATUS_LIST[0].key).toBe('all');
    });

    it('each item should have key, label, and value', () => {
      ORDER_STATUS_LIST.forEach(item => {
        expect(item).toHaveProperty('key');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('value');
      });
    });
  });

  describe('SERVICE_ID', () => {
    it('should define 5 service types', () => {
      expect(Object.keys(SERVICE_ID)).toHaveLength(5);
      expect(SERVICE_ID.BASIC).toBe(1);
      expect(SERVICE_ID.REMOTE).toBe(5);
    });
  });

  describe('COLORS', () => {
    it('should define primary color', () => {
      expect(COLORS.PRIMARY).toBe('#008000');
    });

    it('should define danger color', () => {
      expect(COLORS.DANGER).toBe('#ff4d4f');
    });
  });

  describe('APP_NAME', () => {
    it('should be defined', () => {
      expect(APP_NAME).toBe('陪诊服务');
    });
  });

  describe('SHARE_CONFIG', () => {
    it('should use APP_NAME as title', () => {
      expect(SHARE_CONFIG.title).toBe(APP_NAME);
    });

    it('should point to index page', () => {
      expect(SHARE_CONFIG.path).toBe('/pages/index/index');
    });
  });

  describe('DEFAULT_CITY', () => {
    it('should be Beijing', () => {
      expect(DEFAULT_CITY).toBe('北京市');
    });
  });

  describe('COS_URLS', () => {
    it('should define privacy policy URL path', () => {
      expect(COS_URLS.PRIVACY_POLICY).toContain('/agreement/');
    });

    it('should define service agreement URL path', () => {
      expect(COS_URLS.SERVICE_AGREEMENT).toContain('/agreement/');
    });
  });
});
