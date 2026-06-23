/**
 * Tests for register page business logic
 * Tests form validation and data processing functions
 */

// ===== Pure functions extracted from register page =====

/** 手机号校验 */
const phoneValidator = value => {
  return /^1[3-9]\d{9}$/.test(value);
};

/** 身份证号校验（简单版） */
const idCardValidator = value => {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(value);
};

/** 构建注册提交数据 */
const buildRegisterData = (values, avatar, phoneNumber) => {
  return {
    nickName: values.nickname,
    avatar: avatar || '',
    phoneNumber: phoneNumber,
  };
};

/** 验证分步表单当前步骤是否可进入下一步 */
const canProceedToStep = (step, formValues) => {
  if (step === 0) {
    // 基本信息步骤：需要姓名和手机号
    return !!(formValues.name && formValues.phone && phoneValidator(formValues.phone));
  }
  if (step === 1) {
    // 身份认证步骤：需要身份证号
    return !!(formValues.idCard && idCardValidator(formValues.idCard));
  }
  return true;
};

// ===== Tests =====

describe('register page logic', () => {
  describe('phoneValidator', () => {
    it('should accept valid phone numbers', () => {
      expect(phoneValidator('13800138000')).toBe(true);
      expect(phoneValidator('15912345678')).toBe(true);
      expect(phoneValidator('18688889999')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(phoneValidator('12345678901')).toBe(false);
      expect(phoneValidator('1380013800')).toBe(false);  // too short
      expect(phoneValidator('138001380001')).toBe(false); // too long
      expect(phoneValidator('')).toBe(false);
      expect(phoneValidator('abcdefghijk')).toBe(false);
    });
  });

  describe('idCardValidator', () => {
    it('should accept valid 18-digit ID cards', () => {
      // Valid format: 6 region + 8 birth + 3 seq + 1 check
      expect(idCardValidator('11010119900307001X')).toBe(true);
      expect(idCardValidator('11010119900307001x')).toBe(true);
      expect(idCardValidator('110101199003070010')).toBe(true);
    });

    it('should reject invalid ID cards', () => {
      expect(idCardValidator('12345678901234567')).toBe(false);  // wrong format
      expect(idCardValidator('11010119900307001')).toBe(false);  // too short
      expect(idCardValidator('1101011990030700100')).toBe(false); // too long
      expect(idCardValidator('')).toBe(false);
      expect(idCardValidator('abcdefghijklmn op')).toBe(false);
    });

    it('should reject ID with invalid month', () => {
      expect(idCardValidator('110101199013070010')).toBe(false); // month 13
    });

    it('should reject ID with invalid day', () => {
      expect(idCardValidator('110101199003320010')).toBe(false); // day 32
    });
  });

  describe('buildRegisterData', () => {
    it('should build correct data structure', () => {
      const values = { nickname: '测试用户' };
      const result = buildRegisterData(values, 'avatar.jpeg', '13800138000');
      expect(result).toEqual({
        nickName: '测试用户',
        avatar: 'avatar.jpeg',
        phoneNumber: '13800138000',
      });
    });

    it('should handle empty avatar', () => {
      const values = { nickname: '测试用户' };
      const result = buildRegisterData(values, '', '13800138000');
      expect(result.avatar).toBe('');
    });

    it('should handle null avatar', () => {
      const values = { nickname: '测试用户' };
      const result = buildRegisterData(values, null, '13800138000');
      expect(result.avatar).toBe('');
    });
  });

  describe('canProceedToStep', () => {
    it('should allow step 0 proceed when name and valid phone are provided', () => {
      expect(canProceedToStep(0, { name: '张三', phone: '13800138000' })).toBe(true);
    });

    it('should block step 0 when name is missing', () => {
      expect(canProceedToStep(0, { phone: '13800138000' })).toBe(false);
    });

    it('should block step 0 when phone is missing', () => {
      expect(canProceedToStep(0, { name: '张三' })).toBe(false);
    });

    it('should block step 0 when phone is invalid', () => {
      expect(canProceedToStep(0, { name: '张三', phone: '123' })).toBe(false);
    });

    it('should allow step 1 proceed when valid ID card is provided', () => {
      expect(canProceedToStep(1, { idCard: '11010119900307001X' })).toBe(true);
    });

    it('should block step 1 when ID card is missing', () => {
      expect(canProceedToStep(1, {})).toBe(false);
    });

    it('should block step 1 when ID card is invalid', () => {
      expect(canProceedToStep(1, { idCard: '123' })).toBe(false);
    });

    it('should always allow step 2', () => {
      expect(canProceedToStep(2, {})).toBe(true);
    });
  });
});
