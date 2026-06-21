/**
 * Tests for payment.js utility
 */

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

const mockPost = jest.fn();
const mockSubscribeServiceBookingSuccess = jest.fn().mockResolvedValue({});
const mockSubscribeOrderStatusUpdate = jest.fn().mockResolvedValue({});
const mockRequestPayment = jest.fn();

jest.mock('@tarojs/taro', () => ({
  requestPayment: mockRequestPayment,
}));

jest.mock('@/utils/request', () => ({
  post: mockPost,
}));

jest.mock('@/utils/subscribe', () => ({
  subscribeServiceBookingSuccess: mockSubscribeServiceBookingSuccess,
  subscribeOrderStatusUpdate: mockSubscribeOrderStatusUpdate,
}));

const { requestPayment, createOrderAndPay, createProductOrderAndPay } = require('../payment');

describe('payment.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockReset();
    mockRequestPayment.mockReset();
    mockSubscribeServiceBookingSuccess.mockClear();
    mockSubscribeOrderStatusUpdate.mockClear();
  });

  describe('requestPayment', () => {
    it('should call post with outTradeNo', async () => {
      mockPost.mockResolvedValue({
        payParams: {
          timeStamp: '123',
          nonceStr: 'abc',
          packageValue: 'prepay_id=wx123',
          signType: 'MD5',
          paySign: 'sign123',
        },
      });
      mockRequestPayment.mockImplementation(opts => opts.success({}));

      await requestPayment({ outTradeNo: 'ORDER_001' });

      expect(mockPost).toHaveBeenCalledWith('/api/pay/productOrderPay', { outTradeNo: 'ORDER_001' });
    });

    it('should handle success callback', async () => {
      const payResult = {
        payParams: {
          timeStamp: '123',
          nonceStr: 'abc',
          packageValue: 'prepay_id=wx123',
          signType: 'MD5',
          paySign: 'sign123',
        },
      };
      mockPost.mockResolvedValue(payResult);
      mockRequestPayment.mockImplementation(opts => opts.success({}));

      const onSuccess = jest.fn();
      await requestPayment({ outTradeNo: 'ORDER_002', onSuccess });
      await flushPromises();

      expect(onSuccess).toHaveBeenCalledWith(payResult);
    });

    it('should handle fail callback', async () => {
      mockPost.mockResolvedValue({
        payParams: {
          timeStamp: '123',
          nonceStr: 'abc',
          packageValue: 'prepay_id=wx123',
          signType: 'MD5',
          paySign: 'sign123',
        },
      });
      const failError = { errMsg: 'requestPayment:fail' };
      mockRequestPayment.mockImplementation(opts => opts.fail(failError));

      const onFail = jest.fn();
      await requestPayment({ outTradeNo: 'ORDER_003', onFail });

      expect(onFail).toHaveBeenCalledWith(failError);
    });

    it('should handle cancel callback', async () => {
      mockPost.mockResolvedValue({
        payParams: {
          timeStamp: '123',
          nonceStr: 'abc',
          packageValue: 'prepay_id=wx123',
          signType: 'MD5',
          paySign: 'sign123',
        },
      });
      const cancelRes = { errMsg: 'requestPayment:fail cancel' };
      mockRequestPayment.mockImplementation(opts => opts.fail(cancelRes));

      const onCancel = jest.fn();
      await requestPayment({ outTradeNo: 'ORDER_004', onCancel });

      expect(onCancel).toHaveBeenCalledWith(cancelRes);
    });

    it('should subscribe messages after pay by default', async () => {
      mockPost.mockResolvedValue({
        payParams: {
          timeStamp: '123',
          nonceStr: 'abc',
          packageValue: 'prepay_id=wx123',
          signType: 'MD5',
          paySign: 'sign123',
        },
      });
      mockRequestPayment.mockImplementation(opts => opts.success({}));

      await requestPayment({ outTradeNo: 'ORDER_005' });
      await flushPromises();

      expect(mockSubscribeServiceBookingSuccess).toHaveBeenCalled();
      expect(mockSubscribeOrderStatusUpdate).toHaveBeenCalled();
    });

    it('should skip subscription when subscribeAfterPay is false', async () => {
      mockPost.mockResolvedValue({
        payParams: {
          timeStamp: '123',
          nonceStr: 'abc',
          packageValue: 'prepay_id=wx123',
          signType: 'MD5',
          paySign: 'sign123',
        },
      });
      mockRequestPayment.mockImplementation(opts => opts.success({}));

      await requestPayment({ outTradeNo: 'ORDER_006', subscribeAfterPay: false });
      await flushPromises();

      expect(mockSubscribeServiceBookingSuccess).not.toHaveBeenCalled();
      expect(mockSubscribeOrderStatusUpdate).not.toHaveBeenCalled();
    });

    it('should call onFail when payParams is missing', async () => {
      mockPost.mockResolvedValue({ msg: '预下单失败' });

      const onFail = jest.fn();
      await requestPayment({ outTradeNo: 'ORDER_007', onFail });

      expect(onFail).toHaveBeenCalledWith(expect.any(Error));
      expect(mockRequestPayment).not.toHaveBeenCalled();
    });
  });

  describe('createOrderAndPay', () => {
    it('should create order then call requestPayment', async () => {
      mockPost.mockResolvedValueOnce({ outTradeNo: 'ORDER_100' });
      mockPost.mockResolvedValueOnce({
        payParams: {
          timeStamp: '123',
          nonceStr: 'abc',
          packageValue: 'prepay_id=wx123',
          signType: 'MD5',
          paySign: 'sign123',
        },
      });
      mockRequestPayment.mockImplementation(opts => opts.success({}));

      await createOrderAndPay({
        orderData: { serviceId: 1, amount: 100 },
        onSuccess: jest.fn(),
      });

      expect(mockPost).toHaveBeenCalledWith('/api/orders/create-order', { serviceId: 1, amount: 100 });
    });

    it('should handle missing outTradeNo from order creation', async () => {
      mockPost.mockResolvedValue({ msg: '下单失败' });

      const onFail = jest.fn();
      await createOrderAndPay({
        orderData: { serviceId: 1 },
        onFail,
      });

      expect(onFail).toHaveBeenCalledWith(expect.any(Error));
      expect(mockRequestPayment).not.toHaveBeenCalled();
    });

    it('should handle errors and call onFail', async () => {
      const error = new Error('Network error');
      mockPost.mockRejectedValue(error);

      const onFail = jest.fn();
      await expect(
        createOrderAndPay({
          orderData: { serviceId: 1 },
          onFail,
        })
      ).rejects.toThrow('Network error');

      expect(onFail).toHaveBeenCalledWith(error);
    });
  });

  describe('createProductOrderAndPay', () => {
    it('should create product order then call requestPayment with subscribeAfterPay=false', async () => {
      mockPost.mockResolvedValueOnce({ outTradeNo: 'PROD_200' });
      mockPost.mockResolvedValueOnce({
        payParams: {
          timeStamp: '123',
          nonceStr: 'abc',
          packageValue: 'prepay_id=wx456',
          signType: 'MD5',
          paySign: 'sign456',
        },
      });
      mockRequestPayment.mockImplementation(opts => opts.success({}));

      await createProductOrderAndPay({
        orderData: { courseId: 5, amount: 50 },
      });

      expect(mockPost).toHaveBeenCalledWith('/api/orders/create-product-order', { courseId: 5, amount: 50 });
    });

    it('should handle missing outTradeNo from product order creation', async () => {
      mockPost.mockResolvedValue({ msg: '下单失败' });

      const onFail = jest.fn();
      await createProductOrderAndPay({
        orderData: { courseId: 5 },
        onFail,
      });

      expect(onFail).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle errors and call onFail', async () => {
      const error = new Error('Server error');
      mockPost.mockRejectedValue(error);

      const onFail = jest.fn();
      await expect(
        createProductOrderAndPay({
          orderData: { courseId: 5 },
          onFail,
        })
      ).rejects.toThrow('Server error');

      expect(onFail).toHaveBeenCalledWith(error);
    });
  });
});
