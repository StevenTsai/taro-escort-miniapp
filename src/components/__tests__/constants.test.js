import {
  COLORS,
  ORDER_STATUS,
  ORDER_STATUS_LIST,
  SERVICE_ID,
} from '@/constants/index';

describe('constants - thorough validation', () => {
  describe('ORDER_STATUS values', () => {
    it('should have all values as non-empty strings', () => {
      Object.entries(ORDER_STATUS).forEach(([key, value]) => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });

    it('should have unique values', () => {
      const values = Object.values(ORDER_STATUS);
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });

    it('should have known keys', () => {
      const expectedKeys = ['PENDING', 'PAID', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      expectedKeys.forEach(key => {
        expect(ORDER_STATUS).toHaveProperty(key);
      });
    });
  });

  describe('SERVICE_ID values', () => {
    it('should have all values as positive integers', () => {
      Object.entries(SERVICE_ID).forEach(([key, value]) => {
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
      });
    });

    it('should have unique values', () => {
      const values = Object.values(SERVICE_ID);
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });

    it('should have known keys', () => {
      const expectedKeys = ['BASIC', 'STANDARD', 'PREMIUM', 'ELDER', 'REMOTE'];
      expectedKeys.forEach(key => {
        expect(SERVICE_ID).toHaveProperty(key);
      });
    });
  });

  describe('COLORS values', () => {
    const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

    it('should have all values as valid hex colors', () => {
      Object.entries(COLORS).forEach(([key, value]) => {
        expect(value).toMatch(hexColorRegex);
      });
    });

    it('should have known keys', () => {
      const expectedKeys = [
        'PRIMARY',
        'PRIMARY_LIGHT',
        'TEXT_PRIMARY',
        'TEXT_SECONDARY',
        'TEXT_MUTED',
        'BG_PAGE',
        'BORDER',
        'WHITE',
        'DANGER',
        'WARNING',
        'SUCCESS',
      ];
      expectedKeys.forEach(key => {
        expect(COLORS).toHaveProperty(key);
      });
    });

    it('should have WHITE as #ffffff', () => {
      expect(COLORS.WHITE).toBe('#ffffff');
    });

    it('should have all TEXT_ keys defined', () => {
      const textKeys = Object.keys(COLORS).filter(k => k.startsWith('TEXT_'));
      expect(textKeys.length).toBeGreaterThanOrEqual(3);
      textKeys.forEach(key => {
        expect(COLORS[key]).toMatch(hexColorRegex);
      });
    });
  });

  describe('ORDER_STATUS_LIST coverage', () => {
    const statusKeys = Object.keys(ORDER_STATUS);
    const nonAllEntries = ORDER_STATUS_LIST.filter(item => item.key !== 'all');

    it('should cover all ORDER_STATUS keys', () => {
      statusKeys.forEach(statusKey => {
        const matchingEntry = nonAllEntries.find(
          item => item.value === ORDER_STATUS[statusKey]
        );
        expect(matchingEntry).toBeDefined();
      });
    });

    it('should have "all" as first entry with empty value', () => {
      expect(ORDER_STATUS_LIST[0].key).toBe('all');
      expect(ORDER_STATUS_LIST[0].value).toBe('');
    });

    it('should have total entries equal to ORDER_STATUS count plus "all"', () => {
      expect(ORDER_STATUS_LIST.length).toBe(statusKeys.length + 1);
    });

    it('should have label matching the ORDER_STATUS value for non-all entries', () => {
      nonAllEntries.forEach(item => {
        expect(item.label).toBe(item.value);
      });
    });
  });
});
