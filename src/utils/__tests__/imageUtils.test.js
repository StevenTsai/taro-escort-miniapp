import Taro from '@tarojs/taro';

import { cacheImageFromUrl, clearCachedImage, compressImageToSize, getCachedImage } from '../imageUtils';

// Mock Taro
jest.mock('@tarojs/taro');

describe('imageUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCachedImage', () => {
    it('should return cached value when exists', () => {
      Taro.getStorageSync.mockReturnValue('/tmp/cached_avatar.png');
      expect(getCachedImage()).toBe('/tmp/cached_avatar.png');
      expect(Taro.getStorageSync).toHaveBeenCalledWith('cached_avatar');
    });

    it('should return null when no cached value', () => {
      Taro.getStorageSync.mockReturnValue(null);
      expect(getCachedImage()).toBeNull();
    });

    it('should return null when getStorageSync throws', () => {
      Taro.getStorageSync.mockImplementation(() => {
        throw new Error('storage error');
      });
      expect(getCachedImage()).toBeNull();
    });

    it('should accept custom storageKey', () => {
      Taro.getStorageSync.mockReturnValue('/tmp/custom.png');
      expect(getCachedImage('custom_key')).toBe('/tmp/custom.png');
      expect(Taro.getStorageSync).toHaveBeenCalledWith('custom_key');
    });
  });

  describe('clearCachedImage', () => {
    it('should remove cached key and timestamp from storage', () => {
      Taro.getStorageSync.mockReturnValue('/tmp/local_file.png');
      const mockUnlinkSync = jest.fn();
      Taro.getFileSystemManager = jest.fn(() => ({ unlinkSync: mockUnlinkSync }));

      clearCachedImage();

      expect(Taro.removeStorageSync).toHaveBeenCalledWith('cached_avatar');
      expect(Taro.removeStorageSync).toHaveBeenCalledWith('cached_avatar_timestamp');
      expect(mockUnlinkSync).toHaveBeenCalledWith('/tmp/local_file.png');
    });

    it('should not attempt unlink for http URLs', () => {
      Taro.getStorageSync.mockReturnValue('https://example.com/avatar.png');

      clearCachedImage();

      expect(Taro.removeStorageSync).toHaveBeenCalledWith('cached_avatar');
      expect(Taro.removeStorageSync).toHaveBeenCalledWith('cached_avatar_timestamp');
    });

    it('should not attempt unlink for data URIs', () => {
      Taro.getStorageSync.mockReturnValue('data:image/png;base64,abc123');

      clearCachedImage();

      expect(Taro.removeStorageSync).toHaveBeenCalledWith('cached_avatar');
      expect(Taro.removeStorageSync).toHaveBeenCalledWith('cached_avatar_timestamp');
    });

    it('should handle unlink failure gracefully', () => {
      Taro.getStorageSync.mockReturnValue('/tmp/deleted_file.png');
      Taro.getFileSystemManager = jest.fn(() => ({
        unlinkSync: jest.fn(() => { throw new Error('file not found'); }),
      }));

      expect(() => clearCachedImage()).not.toThrow();
      expect(Taro.removeStorageSync).toHaveBeenCalledWith('cached_avatar');
    });

    it('should accept custom storageKey', () => {
      Taro.getStorageSync.mockReturnValue(null);

      clearCachedImage('my_key');

      expect(Taro.removeStorageSync).toHaveBeenCalledWith('my_key');
      expect(Taro.removeStorageSync).toHaveBeenCalledWith('my_key_timestamp');
    });
  });

  describe('cacheImageFromUrl', () => {
    it('should return cached path when cache is valid (not expired)', async () => {
      const currentTime = Date.now();
      Taro.getStorageSync.mockImplementation((key) => {
        if (key === 'cached_avatar') return '/tmp/cached.png';
        if (key === 'cached_avatar_timestamp') return currentTime - 1000; // 1 second ago
        return null;
      });

      const result = await cacheImageFromUrl('https://example.com/image.png');

      expect(result).toBe('/tmp/cached.png');
      expect(Taro.downloadFile).not.toHaveBeenCalled();
    });

    it('should download and cache image when no cache exists', async () => {
      Taro.getStorageSync.mockReturnValue(null);
      Taro.downloadFile = jest.fn().mockResolvedValue({
        statusCode: 200,
        tempFilePath: '/tmp/downloaded.png',
      });
      const mockSaveFileSync = jest.fn().mockReturnValue('/tmp/saved.png');
      Taro.getFileSystemManager = jest.fn(() => ({
        saveFileSync: mockSaveFileSync,
      }));

      const result = await cacheImageFromUrl('https://example.com/image.png');

      expect(Taro.downloadFile).toHaveBeenCalledWith({ url: 'https://example.com/image.png' });
      expect(result).toBe('/tmp/saved.png');
      expect(Taro.setStorageSync).toHaveBeenCalledWith('cached_avatar', '/tmp/saved.png');
      expect(Taro.setStorageSync).toHaveBeenCalledWith('cached_avatar_timestamp', expect.any(Number));
    });

    it('should fall back to tempFilePath when saveFileSync fails', async () => {
      Taro.getStorageSync.mockReturnValue(null);
      Taro.downloadFile = jest.fn().mockResolvedValue({
        statusCode: 200,
        tempFilePath: '/tmp/temp.png',
      });
      Taro.getFileSystemManager = jest.fn(() => ({
        saveFileSync: jest.fn(() => { throw new Error('save failed'); }),
      }));

      const result = await cacheImageFromUrl('https://example.com/image.png');

      expect(result).toBe('/tmp/temp.png');
    });

    it('should return original URL when download fails (non-200)', async () => {
      Taro.getStorageSync.mockReturnValue(null);
      Taro.downloadFile = jest.fn().mockResolvedValue({
        statusCode: 404,
        tempFilePath: '/tmp/error',
      });

      const result = await cacheImageFromUrl('https://example.com/missing.png');

      expect(result).toBe('https://example.com/missing.png');
    });

    it('should return original URL when download throws', async () => {
      Taro.getStorageSync.mockReturnValue(null);
      Taro.downloadFile = jest.fn().mockRejectedValue(new Error('network error'));

      const result = await cacheImageFromUrl('https://example.com/image.png');

      expect(result).toBe('https://example.com/image.png');
    });

    it('should re-download when cache has expired (over 24 hours)', async () => {
      const expiredTimestamp = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      Taro.getStorageSync.mockImplementation((key) => {
        if (key === 'cached_avatar') return '/tmp/old.png';
        if (key === 'cached_avatar_timestamp') return expiredTimestamp;
        return null;
      });
      Taro.downloadFile = jest.fn().mockResolvedValue({
        statusCode: 200,
        tempFilePath: '/tmp/new.png',
      });
      const mockSaveFileSync = jest.fn().mockReturnValue('/tmp/new_saved.png');
      Taro.getFileSystemManager = jest.fn(() => ({
        saveFileSync: mockSaveFileSync,
      }));

      const result = await cacheImageFromUrl('https://example.com/image.png');

      expect(Taro.downloadFile).toHaveBeenCalled();
      expect(result).toBe('/tmp/new_saved.png');
    });
  });

  describe('compressImageToSize', () => {
    it('should return immediately when file is already under maxSize', async () => {
      Taro.getFileInfo = jest.fn((opts) => {
        opts.success({ size: 100 * 1024 }); // 100KB
      });

      const result = await compressImageToSize('/tmp/photo.jpg');

      expect(result.success).toBe(true);
      expect(result.size).toBe(100 * 1024);
      expect(result.filePath).toBe('/tmp/photo.jpg');
      expect(Taro.compressImage).not.toHaveBeenCalled();
    });

    it('should compress image until under maxSize', async () => {
      let callCount = 0;
      Taro.getFileInfo = jest.fn((opts) => {
        callCount++;
        // First call: 800KB, second call after compress: 400KB
        opts.success({ size: callCount === 1 ? 800 * 1024 : 400 * 1024 });
      });
      Taro.compressImage = jest.fn().mockResolvedValue({
        tempFilePath: '/tmp/compressed.jpg',
      });

      const result = await compressImageToSize('/tmp/photo.jpg', 500 * 1024, 80);

      expect(result.success).toBe(true);
      expect(result.size).toBe(400 * 1024);
      expect(Taro.compressImage).toHaveBeenCalled();
    });

    it('should use default maxSize of 500KB', async () => {
      Taro.getFileInfo = jest.fn((opts) => {
        opts.success({ size: 300 * 1024 }); // 300KB < 500KB
      });

      const result = await compressImageToSize('/tmp/small.jpg');

      expect(result.success).toBe(true);
      expect(result.quality).toBe(80); // default initialQuality
    });

    it('should return error result when compression throws', async () => {
      Taro.getFileInfo = jest.fn((opts) => {
        opts.fail(new Error('file not found'));
      });

      const result = await compressImageToSize('/tmp/missing.jpg');

      expect(result.success).toBe(false);
      expect(result.error).toBe('file not found');
    });

    it('should accept custom initialQuality', async () => {
      Taro.getFileInfo = jest.fn((opts) => {
        opts.success({ size: 100 * 1024 }); // already small enough
      });

      const result = await compressImageToSize('/tmp/photo.jpg', 500 * 1024, 60);

      expect(result.success).toBe(true);
      expect(result.quality).toBe(60);
    });
  });
});
