import Taro from '@tarojs/taro';

import {
  checkSubscribeSetting,
  subscribeCommonMessages,
  subscribeOrderStatusUpdate,
  requestSubscribeMessage,
} from '../subscribe';

// Auto-mock Taro (same pattern as auth.test.js)
jest.mock('@tarojs/taro');

describe('subscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to WEAPP environment
    Taro.getEnv.mockReturnValue('WEAPP');
    Taro.ENV_TYPE = { WEAPP: 'WEAPP', WEB: 'WEB', RN: 'RN' };
    // Ensure callback-style APIs exist as mock functions (may not be auto-mocked)
    if (!Taro.getSetting) Taro.getSetting = jest.fn();
  });

  describe('requestSubscribeMessage', () => {
    it('should reject when tmplIds is not an array', async () => {
      await expect(requestSubscribeMessage('not-an-array')).rejects.toThrow(
        'tmplIds must be a non-empty array'
      );
    });

    it('should reject when tmplIds is an empty array', async () => {
      await expect(requestSubscribeMessage([])).rejects.toThrow(
        'tmplIds must be a non-empty array'
      );
    });

    it('should limit to 3 template IDs when more are provided', async () => {
      Taro.requestSubscribeMessage.mockImplementation((opts) => {
        opts.success({ errMsg: 'ok' });
      });

      const ids = ['id1', 'id2', 'id3', 'id4', 'id5'];
      await requestSubscribeMessage(ids);

      expect(Taro.requestSubscribeMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          tmplIds: ['id1', 'id2', 'id3'],
        })
      );
    });

    it('should resolve on success', async () => {
      Taro.requestSubscribeMessage.mockImplementation((opts) => {
        opts.success({ errMsg: 'requestSubscribeMessage:ok' });
      });

      const result = await requestSubscribeMessage(['id1']);
      expect(result).toEqual({ errMsg: 'requestSubscribeMessage:ok' });
    });

    it('should reject on failure', async () => {
      const error = { errMsg: 'fail' };
      Taro.requestSubscribeMessage.mockImplementation((opts) => {
        opts.fail(error);
      });

      await expect(requestSubscribeMessage(['id1'])).rejects.toEqual(error);
    });

    it('should resolve with warning when not in WEAPP environment', async () => {
      Taro.getEnv.mockReturnValue('WEB');

      const result = await requestSubscribeMessage(['id1']);
      expect(result).toEqual({ errMsg: 'not in weapp environment' });
      expect(Taro.requestSubscribeMessage).not.toHaveBeenCalled();
    });

    it('should accept 3 or fewer template IDs without truncation', async () => {
      Taro.requestSubscribeMessage.mockImplementation((opts) => {
        opts.success({ errMsg: 'ok' });
      });

      await requestSubscribeMessage(['a', 'b', 'c']);

      expect(Taro.requestSubscribeMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          tmplIds: ['a', 'b', 'c'],
        })
      );
    });
  });

  describe('subscribeOrderStatusUpdate', () => {
    it('should call requestSubscribeMessage with ORDER_STATUS_UPDATE template ID', async () => {
      Taro.requestSubscribeMessage.mockImplementation((opts) => {
        opts.success({ errMsg: 'ok' });
      });

      await subscribeOrderStatusUpdate();

      expect(Taro.requestSubscribeMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          tmplIds: ['Qv1QlPWH47bjPZo1G2fon-g9wUfNFugYJZomnWRspCk'],
        })
      );
    });
  });

  describe('subscribeCommonMessages', () => {
    it('should call with 3 template IDs', async () => {
      Taro.requestSubscribeMessage.mockImplementation((opts) => {
        opts.success({ errMsg: 'ok' });
      });

      await subscribeCommonMessages();

      const callArgs = Taro.requestSubscribeMessage.mock.calls[0][0];
      expect(callArgs.tmplIds).toHaveLength(3);
    });

    it('should include ORDER_STATUS_UPDATE, SERVICE_COMPLETE, and SERVICE_REMINDER IDs', async () => {
      Taro.requestSubscribeMessage.mockImplementation((opts) => {
        opts.success({ errMsg: 'ok' });
      });

      await subscribeCommonMessages();

      const ids = Taro.requestSubscribeMessage.mock.calls[0][0].tmplIds;
      expect(ids).toContain('Qv1QlPWH47bjPZo1G2fon-g9wUfNFugYJZomnWRspCk');
      expect(ids).toContain('Xz3DQ-r_puOP-5MELrJfOgEYT6Y3kHlHnJYicivmLWA');
      expect(ids).toContain('xFXHUxi1wREwX_sHxkWjrq5wc6y1pIBOZX2GfyWCd6k');
    });
  });

  describe('checkSubscribeSetting', () => {
    it('should call Taro.getSetting with withSubscriptions true', async () => {
      const mockResult = { subscriptionsSetting: { mainSwitch: true } };
      Taro.getSetting.mockImplementation((opts) => {
        opts.success(mockResult);
      });

      const result = await checkSubscribeSetting();

      expect(Taro.getSetting).toHaveBeenCalledWith(
        expect.objectContaining({ withSubscriptions: true })
      );
      expect(result).toEqual(mockResult);
    });

    it('should reject when getSetting fails', async () => {
      const error = { errMsg: 'fail' };
      Taro.getSetting.mockImplementation((opts) => {
        opts.fail(error);
      });

      await expect(checkSubscribeSetting()).rejects.toEqual(error);
    });

    it('should resolve with warning when not in WEAPP environment', async () => {
      Taro.getEnv.mockReturnValue('WEB');

      const result = await checkSubscribeSetting();

      expect(result).toEqual({ errMsg: 'not in weapp environment' });
      expect(Taro.getSetting).not.toHaveBeenCalled();
    });
  });
});
