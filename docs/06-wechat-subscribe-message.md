# 微信订阅消息完整封装：从申请模板到用户授权的全流程

> 本文详细介绍微信订阅消息的完整实现流程，包括模板申请、权限请求、状态管理、发送时机等核心内容。

## 前言

微信订阅消息是小程序触达用户的重要方式，但实现起来有不少坑：

- 模板申请流程复杂
- 用户授权机制特殊（一次性订阅）
- 数量限制（每个模板只弹一次）
- 发送时机需要精确控制

本文将分享一个经过生产验证的订阅消息封装方案。

## 1. 订阅消息 vs 模板消息

### 历史演变

| 时期 | 机制 | 特点 |
|------|------|------|
| 2020 年前 | 模板消息 | 支付后可推送，无限制 |
| 2020 年后 | 订阅消息 | 需要用户授权，一次性 |

### 现有机制

**一次性订阅消息：**
- 用户每次点击"订阅"只能授权一次
- 授权后可发送一条消息
- 用完即止，需要再次授权

**长期订阅消息（仅政务、公共服务）：**
- 用户一次授权，可多次发送
- 限制严格，普通小程序无法申请

### 限制与挑战

```
❌ 不能自动推送（必须用户主动订阅）
❌ 每个模板只能订阅一次（用完即止）
❌ 一次最多订阅 3 个模板
❌ 用户可以拒绝订阅
```

## 2. 模板申请流程

### 申请步骤

1. 登录微信公众平台
2. 进入「功能」→「订阅消息」
3. 选择「选用模板」
4. 搜索或创建模板
5. 获取模板 ID

### 模板设计建议

**常用模板类型：**

| 模板 | 用途 | 关键词 |
|------|------|--------|
| 订单状态更新 | 支付、发货、完成 | 订单号、状态、时间 |
| 服务预约成功 | 预约确认 | 服务名称、时间、地点 |
| 服务即将开始 | 提前提醒 | 服务名称、时间、地点 |
| 服务完成通知 | 完成确认 | 服务名称、评价链接 |

**模板示例：**

```
【服务预约成功通知】
预约服务：{{service_name.DATA}}
预约时间：{{appointment_time.DATA}}
服务地点：{{location.DATA}}
温馨提示：{{remark.DATA}}
```

## 3. 封装设计

### 设计目标

```
✅ 环境检测（仅微信小程序可用）
✅ 数量限制（一次最多 3 个）
✅ 统一的授权接口
✅ 批量订阅支持
✅ 订阅状态检查
```

### API 设计

```javascript
// 单个模板订阅
await subscribeOrderStatusUpdate();

// 批量订阅
await subscribeCommonMessages();

// 检查订阅设置
const settings = await checkSubscribeSetting();
```

## 4. 核心实现

### 4.1 模板 ID 管理

```javascript
// src/utils/subscribe.js
import Taro from '@tarojs/taro';

// 模板 ID（从微信公众平台获取）
const TEMPLATE_IDS = {
  // 订单状态变更通知
  ORDER_STATUS_UPDATE: 'your_template_id_1',
  // 服务完成通知
  SERVICE_COMPLETE: 'your_template_id_2',
  // 服务即将开始提醒
  SERVICE_REMINDER: 'your_template_id_3',
  // 服务预约成功通知
  SERVICE_BOOKING_SUCCESS: 'your_template_id_4',
};
```

**建议：** 将模板 ID 放在配置文件中，方便维护。

### 4.2 基础订阅函数

```javascript
/**
 * 请求订阅消息权限
 * @param {Array} tmplIds - 需要订阅的消息模板 ID 数组
 * @returns {Promise} 订阅结果
 */
export const requestSubscribeMessage = (tmplIds) => {
  // 1. 检查是否在微信小程序环境
  if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
    console.warn('订阅消息功能仅在微信小程序环境下可用');
    return Promise.resolve({ errMsg: 'not in weapp environment' });
  }

  // 2. 检查 tmplIds 参数
  if (!Array.isArray(tmplIds) || tmplIds.length === 0) {
    return Promise.reject(new Error('tmplIds must be a non-empty array'));
  }

  // 3. 限制一次最多订阅 3 个模板消息
  if (tmplIds.length > 3) {
    console.warn('一次最多只能订阅3个模板消息，已自动截取前3个');
    tmplIds = tmplIds.slice(0, 3);
  }

  // 4. 调用订阅 API
  return new Promise((resolve, reject) => {
    Taro.requestSubscribeMessage({
      tmplIds,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        console.error('订阅消息授权失败', err);
        reject(err);
      },
    });
  });
};
```

**关键点：**

1. **环境检测** — 仅在微信小程序环境可用
2. **数量限制** — 一次最多 3 个模板
3. **Promise 化** — 支持 async/await

### 4.3 业务订阅函数

```javascript
/**
 * 请求订阅订单状态更新消息
 * @returns {Promise} 订阅结果
 */
export const subscribeOrderStatusUpdate = () => {
  return requestSubscribeMessage([TEMPLATE_IDS.ORDER_STATUS_UPDATE]);
};

/**
 * 请求订阅服务预约成功消息
 * @returns {Promise} 订阅结果
 */
export const subscribeServiceBookingSuccess = () => {
  return requestSubscribeMessage([TEMPLATE_IDS.SERVICE_BOOKING_SUCCESS]);
};

/**
 * 请求订阅服务提醒消息
 * @returns {Promise} 订阅结果
 */
export const subscribeServiceReminder = () => {
  return requestSubscribeMessage([TEMPLATE_IDS.SERVICE_REMINDER]);
};

/**
 * 批量订阅常用消息（一次最多 3 个）
 * @returns {Promise} 订阅结果
 */
export const subscribeCommonMessages = () => {
  return requestSubscribeMessage([
    TEMPLATE_IDS.ORDER_STATUS_UPDATE,
    TEMPLATE_IDS.SERVICE_COMPLETE,
    TEMPLATE_IDS.SERVICE_REMINDER,
  ]);
};
```

### 4.4 订阅状态检查

```javascript
/**
 * 检查用户订阅设置
 * @returns {Promise} 用户订阅设置
 */
export const checkSubscribeSetting = () => {
  // 检查是否在微信小程序环境
  if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
    return Promise.resolve({ errMsg: 'not in weapp environment' });
  }

  return new Promise((resolve, reject) => {
    Taro.getSetting({
      withSubscriptions: true,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        console.error('获取订阅设置失败', err);
        reject(err);
      },
    });
  });
};
```

**返回值示例：**

```javascript
{
  subscriptionsSetting: {
    mainSwitch: true, // 总开关
    itemSettings: {
      'template_id_1': 'accept', // 已授权
      'template_id_2': 'reject', // 已拒绝
      'template_id_3': 'ban',    // 被禁用
    }
  }
}
```

## 5. 使用示例

### 5.1 支付成功后订阅

```javascript
// src/utils/payment.js
import { subscribeServiceBookingSuccess, subscribeOrderStatusUpdate } from '@/utils/subscribe';

export const requestPayment = async (options) => {
  const { outTradeNo, onSuccess, subscribeAfterPay = true } = options;

  // ... 支付逻辑 ...

  Taro.requestPayment({
    // ... 支付参数 ...
    success: async () => {
      // 支付成功后订阅消息
      if (subscribeAfterPay) {
        try {
          await subscribeServiceBookingSuccess();
          await subscribeOrderStatusUpdate();
        } catch (_e) {
          // 订阅失败不影响支付流程
        }
      }
      if (onSuccess) onSuccess(result);
    },
  });
};
```

### 5.2 页面中订阅

```jsx
import { subscribeServiceReminder } from '@/utils/subscribe';

const OrderDetailPage = () => {
  const handleSubscribe = async () => {
    try {
      const res = await subscribeServiceReminder();

      // 检查订阅结果
      if (res[TEMPLATE_IDS.SERVICE_REMINDER] === 'accept') {
        Taro.showToast({ title: '订阅成功' });
      } else if (res[TEMPLATE_IDS.SERVICE_REMINDER] === 'reject') {
        Taro.showToast({ title: '您已拒绝订阅' });
      } else if (res[TEMPLATE_IDS.SERVICE_REMINDER] === 'ban') {
        Taro.showModal({
          title: '订阅被禁用',
          content: '请在设置中开启订阅消息权限',
          confirmText: '去设置',
          success: (modalRes) => {
            if (modalRes.confirm) {
              Taro.openSetting();
            }
          },
        });
      }
    } catch (error) {
      Taro.showToast({ title: '订阅失败' });
    }
  };

  return (
    <View>
      <Button onClick={handleSubscribe}>订阅服务提醒</Button>
    </View>
  );
};
```

### 5.3 批量订阅

```jsx
import { subscribeCommonMessages } from '@/utils/subscribe';

const ProfilePage = () => {
  const handleSubscribeAll = async () => {
    try {
      const res = await subscribeCommonMessages();

      // 统计订阅结果
      const accepted = Object.values(res).filter((v) => v === 'accept').length;
      const rejected = Object.values(res).filter((v) => v === 'reject').length;

      Taro.showModal({
        title: '订阅结果',
        content: `成功订阅 ${accepted} 个，拒绝 ${rejected} 个`,
        showCancel: false,
      });
    } catch (error) {
      Taro.showToast({ title: '订阅失败' });
    }
  };

  return (
    <View>
      <Button onClick={handleSubscribeAll}>一键订阅常用消息</Button>
    </View>
  );
};
```

### 5.4 检查订阅状态

```jsx
import { checkSubscribeSetting } from '@/utils/subscribe';

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const res = await checkSubscribeSetting();
    setSettings(res.subscriptionsSetting);
  };

  const handleOpenSetting = () => {
    Taro.openSetting();
  };

  return (
    <View>
      <View>订阅总开关：{settings?.mainSwitch ? '开启' : '关闭'}</View>
      {!settings?.mainSwitch && (
        <Button onClick={handleOpenSetting}>去开启</Button>
      )}
    </View>
  );
};
```

## 6. 最佳实践

### 6.1 订阅时机

| 时机 | 场景 | 推荐模板 |
|------|------|---------|
| 支付成功后 | 订单相关 | 订单状态更新、服务预约成功 |
| 预约成功后 | 服务相关 | 服务提醒、服务完成 |
| 个人中心 | 用户主动 | 批量订阅 |
| 设置页面 | 管理订阅 | 检查状态 |

### 6.2 用户拒绝处理

```javascript
const handleSubscribe = async () => {
  try {
    const res = await subscribeOrderStatusUpdate();

    if (res[TEMPLATE_IDS.ORDER_STATUS_UPDATE] === 'reject') {
      // 用户拒绝，引导开启
      Taro.showModal({
        title: '订阅消息',
        content: '您已拒绝接收订单通知，是否去设置中开启？',
        confirmText: '去设置',
        success: (modalRes) => {
          if (modalRes.confirm) {
            Taro.openSetting();
          }
        },
      });
    }
  } catch (error) {
    // 用户可能关闭了弹窗，静默处理
    console.log('用户取消订阅');
  }
};
```

### 6.3 订阅次数用完

```javascript
const handleSubscribe = async () => {
  try {
    const res = await subscribeServiceReminder();

    // 检查是否是 ban 状态（次数用完或被禁用）
    if (res[TEMPLATE_IDS.SERVICE_REMINDER] === 'ban') {
      Taro.showModal({
        title: '订阅次数已用完',
        content: '您已订阅过该消息，无需重复订阅',
        showCancel: false,
      });
    }
  } catch (error) {
    console.error('订阅失败:', error);
  }
};
```

### 6.4 提高用户授权率

1. **解释价值** — 在订阅前说明消息的价值
2. **适时触发** — 在用户有明确需求时触发（如支付后）
3. **不要频繁弹出** — 避免打扰用户
4. **提供管理入口** — 让用户可以管理订阅

```jsx
const OrderPage = () => {
  const handlePay = async () => {
    // 支付前说明
    Taro.showModal({
      title: '订阅订单通知',
      content: '订阅后可接收订单状态更新，是否订阅？',
      success: (res) => {
        if (res.confirm) {
          // 用户同意，执行支付并订阅
          createOrderAndPay({
            orderData: { ... },
            subscribeAfterPay: true,
          });
        } else {
          // 用户拒绝，只支付不订阅
          createOrderAndPay({
            orderData: { ... },
            subscribeAfterPay: false,
          });
        }
      },
    });
  };
};
```

## 7. 常见问题

### Q1: 为什么订阅弹窗没有出现？

可能原因：
1. 不在微信小程序环境
2. 模板 ID 无效
3. 用户已拒绝且未开启
4. 总开关被关闭

### Q2: 订阅次数用完了怎么办？

- 一次性订阅：用完即止，需要用户再次主动订阅
- 引导用户在设置中查看订阅状态

### Q3: 测试环境如何配置？

1. 使用真实微信小程序
2. 配置有效的模板 ID
3. 在真机上测试

### Q4: 如何获取模板 ID？

1. 登录微信公众平台
2. 进入「功能」→「订阅消息」
3. 选择或创建模板
4. 复制模板 ID

## 8. 总结

本文介绍的订阅消息封装方案解决了以下问题：

1. **环境检测** — 仅在微信小程序环境可用
2. **数量限制** — 一次最多 3 个模板
3. **统一接口** — 简化调用方式
4. **状态管理** — 处理各种订阅状态
5. **用户体验** — 优雅处理拒绝和禁用

完整代码已开源，欢迎 Star 和贡献。

## 相关文章

- [微信小程序支付封装：统一下单到 Promise 化](./03-wechat-payment-encapsulation.md)
- [Taro 4 + React 18 实战：从零搭建医疗陪诊小程序](./01-taro-react18-medical-miniapp.md)

## 开源项目

完整代码已开源：[医疗陪诊小程序](https://github.com/StevenTsai/taro-escort-miniapp)

---

> 作者：Steven
> 原文链接：https://juejin.cn/post/xxx
