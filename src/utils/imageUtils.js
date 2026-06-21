import Taro from '@tarojs/taro';

/**
 * 将网络图片下载到本地文件系统并缓存路径
 * 使用文件系统缓存替代 Base64 存储，避免撑爆 10MB SyncStorage 限制
 * @param {string} imageUrl - 图片链接
 * @param {string} storageKey - 存储的key，默认为 'cached_avatar'
 * @returns {Promise<string>} 返回本地文件路径或原始 URL
 */
export const cacheImageFromUrl = async (imageUrl, storageKey = 'cached_avatar') => {
  try {
    // 先检查 storage 中是否已缓存本地路径
    const cachedPath = Taro.getStorageSync(storageKey);
    const cacheTimestamp = Taro.getStorageSync(`${storageKey}_timestamp`);
    const currentTime = Date.now();

    // 如果缓存存在且未过期（24小时），直接返回
    if (cachedPath && cacheTimestamp && currentTime - cacheTimestamp < 24 * 60 * 60 * 1000) {
      return cachedPath;
    }

    // 下载图片到本地临时文件
    const downloadResult = await Taro.downloadFile({
      url: imageUrl,
    });

    if (downloadResult.statusCode !== 200) {
      throw new Error('图片下载失败');
    }

    // 将临时文件保存到持久化文件系统
    const fs = Taro.getFileSystemManager();
    let savedPath = downloadResult.tempFilePath;

    try {
      // 尝试保存到持久化存储
      const saveResult = fs.saveFileSync(downloadResult.tempFilePath, `${storageKey}`);
      savedPath = saveResult || downloadResult.tempFilePath;
    } catch (_e) {
      // saveFileSync 不可用时，使用临时路径（小程序环境兼容）
      savedPath = downloadResult.tempFilePath;
    }

    // 保存路径和时间戳到 storage
    Taro.setStorageSync(storageKey, savedPath);
    Taro.setStorageSync(`${storageKey}_timestamp`, currentTime);

    return savedPath;
  } catch (error) {
    console.error('图片缓存失败:', error);
    // 转换失败时返回原始URL
    return imageUrl;
  }
};

/**
 * 清除缓存的图片
 * @param {string} storageKey - 存储的key
 */
export const clearCachedImage = (storageKey = 'cached_avatar') => {
  try {
    const cachedPath = Taro.getStorageSync(storageKey);
    // 如果缓存的是本地文件路径（非 base64），尝试删除文件
    if (cachedPath && !cachedPath.startsWith('data:') && !cachedPath.startsWith('http')) {
      try {
        Taro.getFileSystemManager().unlinkSync(cachedPath);
      } catch (_e) {
        // 文件可能已不存在
      }
    }
    Taro.removeStorageSync(storageKey);
    Taro.removeStorageSync(`${storageKey}_timestamp`);
  } catch (error) {
    console.error('清除缓存失败:', error);
  }
};

/**
 * 获取缓存的图片
 * @param {string} storageKey - 存储的key
 * @returns {string|null} 返回本地路径/base64字符串或null
 */
export const getCachedImage = (storageKey = 'cached_avatar') => {
  try {
    return Taro.getStorageSync(storageKey) || null;
  } catch (error) {
    console.error('获取缓存图片失败:', error);
    return null;
  }
};

/**
 * 获取文件信息（Promise 封装）
 * @param {string} path - 文件路径
 * @returns {Promise<{size: number}>}
 */
const getFileInfo = path => {
  return new Promise((resolve, reject) => {
    Taro.getFileInfo({
      filePath: path,
      success: resolve,
      fail: reject,
    });
  });
};

/**
 * 压缩图片到目标大小
 * @param {string} filePath - 图片临时文件路径
 * @param {number} maxSize - 目标大小（字节），默认 500KB
 * @param {number} initialQuality - 初始压缩质量，默认 80
 * @returns {Promise<object>} { success, filePath, size, quality } 或 { success: false, filePath, error }
 */
export const compressImageToSize = async (filePath, maxSize = 500 * 1024, initialQuality = 80) => {
  try {
    let currentFilePath = filePath;
    let currentQuality = initialQuality;

    let fileInfo = await getFileInfo(currentFilePath);

    // 如果已经小于目标大小，直接返回
    if (fileInfo.size <= maxSize) {
      return { success: true, filePath: currentFilePath, size: fileInfo.size, quality: currentQuality };
    }

    // 循环压缩直到满足大小要求
    while (currentQuality > 30) {
      const compressed = await Taro.compressImage({
        src: currentFilePath,
        quality: currentQuality,
      });

      currentFilePath = compressed.tempFilePath;
      fileInfo = await getFileInfo(currentFilePath);

      if (fileInfo.size <= maxSize) {
        return { success: true, filePath: currentFilePath, size: fileInfo.size, quality: currentQuality };
      }

      currentQuality -= 10;
    }

    // 压缩到最低质量仍超过目标，返回当前结果
    return { success: true, filePath: currentFilePath, size: fileInfo.size, quality: currentQuality };
  } catch (error) {
    console.error('图片压缩失败:', error);
    return { success: false, filePath, error: error.message };
  }
};
