/**
 * Tests for order page business logic
 * Tests pure functions extracted from order.jsx
 */

// ===== Pure functions extracted from order page =====

/** 生成符合要求的起始日期（分钟只能是00或30） */
const getValidStartDate = (now = new Date()) => {
  const minutes = now.getMinutes();
  if (minutes < 30) {
    now.setMinutes(30, 0, 0);
  } else {
    now.setHours(now.getHours() + 1, 0, 0, 0);
  }
  return now;
};

/** 数字校验 */
const customValidator = value => {
  return /^\d+$/.test(value);
};

/** 手机号校验 */
const phoneValidator = value => {
  return /^1[3-9]\d{9}$/.test(value);
};

/** 构建预约数据 */
const buildBookingData = (values, serviceType, hospitalName, chaperonName) => {
  const bookingData = {
    ...values,
    serviceId: serviceType,
    hospitalName,
    chaperonName,
  };
  delete bookingData.city;
  return bookingData;
};

// ===== Tests =====

describe('order page logic', () => {
  describe('getValidStartDate', () => {
    it('should round up to 30 when minutes < 30', () => {
      const now = new Date('2026-01-15T10:15:00');
      const result = getValidStartDate(now);
      expect(result.getMinutes()).toBe(30);
      expect(result.getHours()).toBe(10);
      expect(result.getSeconds()).toBe(0);
    });

    it('should round up to next hour 00 when minutes >= 30', () => {
      const now = new Date('2026-01-15T10:45:00');
      const result = getValidStartDate(now);
      expect(result.getMinutes()).toBe(0);
      expect(result.getHours()).toBe(11);
      expect(result.getSeconds()).toBe(0);
    });

    it('should handle exactly 30 minutes', () => {
      const now = new Date('2026-01-15T10:30:00');
      const result = getValidStartDate(now);
      expect(result.getMinutes()).toBe(0);
      expect(result.getHours()).toBe(11);
    });

    it('should handle exactly 0 minutes', () => {
      const now = new Date('2026-01-15T10:00:00');
      const result = getValidStartDate(now);
      expect(result.getMinutes()).toBe(30);
      expect(result.getHours()).toBe(10);
    });

    it('should handle 59 minutes (round to next hour)', () => {
      const now = new Date('2026-01-15T10:59:00');
      const result = getValidStartDate(now);
      expect(result.getMinutes()).toBe(0);
      expect(result.getHours()).toBe(11);
    });

    it('should handle midnight rollover', () => {
      const now = new Date('2026-01-15T23:45:00');
      const result = getValidStartDate(now);
      expect(result.getMinutes()).toBe(0);
      expect(result.getHours()).toBe(0);
      expect(result.getDate()).toBe(16);
    });
  });

  describe('customValidator', () => {
    it('should return true for numeric strings', () => {
      expect(customValidator('12345')).toBe(true);
      expect(customValidator('0')).toBe(true);
      expect(customValidator('999999')).toBe(true);
    });

    it('should return false for non-numeric strings', () => {
      expect(customValidator('abc')).toBe(false);
      expect(customValidator('12a34')).toBe(false);
      expect(customValidator('')).toBe(false);
    });

    it('should return false for special characters', () => {
      expect(customValidator('123-456')).toBe(false);
      expect(customValidator('123 456')).toBe(false);
      expect(customValidator('12.34')).toBe(false);
    });
  });

  describe('phoneValidator', () => {
    it('should return true for valid phone numbers', () => {
      expect(phoneValidator('13800138000')).toBe(true);
      expect(phoneValidator('15912345678')).toBe(true);
      expect(phoneValidator('18688889999')).toBe(true);
      expect(phoneValidator('17700001111')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(phoneValidator('12345678901')).toBe(false); // starts with 12
      expect(phoneValidator('10800138000')).toBe(false); // starts with 10
      expect(phoneValidator('1380013800')).toBe(false); // only 10 digits
      expect(phoneValidator('138001380001')).toBe(false); // 12 digits
      expect(phoneValidator('')).toBe(false);
      expect(phoneValidator('abcdefghijk')).toBe(false);
    });

    it('should accept all valid prefixes (13x-19x)', () => {
      for (let prefix = 130; prefix <= 199; prefix++) {
        const phone = `${prefix}00000000`;
        // Only 13x-19x where x is 3-9 should be valid
        const secondDigit = parseInt(phone[1]);
        if (secondDigit >= 3 && secondDigit <= 9) {
          expect(phoneValidator(phone)).toBe(true);
        }
      }
    });
  });

  describe('buildBookingData', () => {
    it('should merge values with service info', () => {
      const values = {
        patientName: '张三',
        patientPhone: '13800138000',
        city: 'beijing',
        hospitalId: 'h001',
      };
      const result = buildBookingData(values, 's1', '北京医院', '李四');
      expect(result.patientName).toBe('张三');
      expect(result.serviceId).toBe('s1');
      expect(result.hospitalName).toBe('北京医院');
      expect(result.chaperonName).toBe('李四');
    });

    it('should remove city field from booking data', () => {
      const values = {
        patientName: '张三',
        city: 'beijing',
      };
      const result = buildBookingData(values, 's1', null, null);
      expect(result.city).toBeUndefined();
      expect(result.patientName).toBe('张三');
    });

    it('should handle missing optional fields', () => {
      const values = { patientName: '张三' };
      const result = buildBookingData(values, 's1', undefined, undefined);
      expect(result.hospitalName).toBeUndefined();
      expect(result.chaperonName).toBeUndefined();
      expect(result.serviceId).toBe('s1');
    });
  });
});
