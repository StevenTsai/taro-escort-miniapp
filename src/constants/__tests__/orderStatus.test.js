/**
 * Deep tests for ORDER_STATUS and ORDER_STATUS_LIST
 */

import { ORDER_STATUS, ORDER_STATUS_LIST } from '../index';

describe('ORDER_STATUS deep tests', () => {
  describe('value validation', () => {
    it('PENDING should be a non-empty string', () => {
      expect(typeof ORDER_STATUS.PENDING).toBe('string');
      expect(ORDER_STATUS.PENDING.length).toBeGreaterThan(0);
    });

    it('PAID should be a non-empty string', () => {
      expect(typeof ORDER_STATUS.PAID).toBe('string');
      expect(ORDER_STATUS.PAID.length).toBeGreaterThan(0);
    });

    it('ACCEPTED should be a non-empty string', () => {
      expect(typeof ORDER_STATUS.ACCEPTED).toBe('string');
      expect(ORDER_STATUS.ACCEPTED.length).toBeGreaterThan(0);
    });

    it('IN_PROGRESS should be a non-empty string', () => {
      expect(typeof ORDER_STATUS.IN_PROGRESS).toBe('string');
      expect(ORDER_STATUS.IN_PROGRESS.length).toBeGreaterThan(0);
    });

    it('COMPLETED should be a non-empty string', () => {
      expect(typeof ORDER_STATUS.COMPLETED).toBe('string');
      expect(ORDER_STATUS.COMPLETED.length).toBeGreaterThan(0);
    });

    it('CANCELLED should be a non-empty string', () => {
      expect(typeof ORDER_STATUS.CANCELLED).toBe('string');
      expect(ORDER_STATUS.CANCELLED.length).toBeGreaterThan(0);
    });
  });

  describe('ORDER_STATUS_LIST validation', () => {
    it('should have "all" as first item', () => {
      expect(ORDER_STATUS_LIST[0].key).toBe('all');
      expect(ORDER_STATUS_LIST[0].value).toBe('');
      expect(ORDER_STATUS_LIST[0].label).toBe('全部');
    });

    it('each non-all item should reference valid ORDER_STATUS values', () => {
      const validValues = Object.values(ORDER_STATUS);
      const nonAllItems = ORDER_STATUS_LIST.filter(item => item.key !== 'all');
      nonAllItems.forEach(item => {
        expect(validValues).toContain(item.value);
      });
    });

    it('each item should have key, label, and value properties', () => {
      ORDER_STATUS_LIST.forEach(item => {
        expect(item).toHaveProperty('key');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('value');
        expect(typeof item.key).toBe('string');
        expect(typeof item.label).toBe('string');
      });
    });

    it('should have no duplicate keys', () => {
      const keys = ORDER_STATUS_LIST.map(item => item.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('labels should match ORDER_STATUS values for non-all entries', () => {
      const nonAllItems = ORDER_STATUS_LIST.filter(item => item.key !== 'all');
      nonAllItems.forEach(item => {
        expect(item.label).toBe(item.value);
      });
    });

    it('should cover all ORDER_STATUS keys', () => {
      const statusValues = Object.values(ORDER_STATUS);
      const listValues = ORDER_STATUS_LIST.filter(item => item.key !== 'all').map(
        item => item.value
      );
      statusValues.forEach(val => {
        expect(listValues).toContain(val);
      });
    });

    it('should have total count equal to ORDER_STATUS count plus all', () => {
      const statusCount = Object.keys(ORDER_STATUS).length;
      expect(ORDER_STATUS_LIST.length).toBe(statusCount + 1);
    });
  });
});
