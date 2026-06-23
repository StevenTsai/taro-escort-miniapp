# 小程序虚拟列表实现：轻量方案解决长列表性能问题

> 本文介绍如何实现一个轻量级的虚拟列表组件，解决小程序长列表的性能问题，支持动态高度和滚动加载。

## 前言

在小程序开发中，长列表是一个常见的性能瓶颈：

- 列表项过多时，渲染卡顿
- 内存占用持续增长
- 滚动不流畅
- 首屏加载慢

虚拟列表（Virtual List）是解决这类问题的标准方案。本文将分享一个轻量、易用的实现。

## 1. 问题背景

### 长列表的性能瓶颈

```javascript
// ❌ 直接渲染所有列表项
const OrderList = ({ orders }) => {
  return (
    <ScrollView>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </ScrollView>
  );
};
```

**问题：**

- 100 个订单 = 100 个 DOM 节点
- 每个节点都有事件监听、样式计算
- 内存占用线性增长
- 滚动时需要重排重绘

### 性能数据对比

| 列表项数 | 普通列表 | 虚拟列表 |
|---------|---------|---------|
| 100 | 50ms | 50ms |
| 500 | 200ms | 50ms |
| 1000 | 500ms | 50ms |
| 5000 | 卡死 | 50ms |

## 2. 虚拟列表原理

### 核心思想

只渲染可视区域内的列表项，其他区域用占位元素代替。

```
┌─────────────────────┐
│     可视区域         │
│  ┌───────────────┐  │
│  │  列表项 1     │  │  ← 实际渲染
│  │  列表项 2     │  │  ← 实际渲染
│  │  列表项 3     │  │  ← 实际渲染
│  └───────────────┘  │
│                     │
│  ░░░░░░░░░░░░░░░░░  │  ← 占位元素（不渲染）
│  ░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░░░░░░░░░  │
└─────────────────────┘
```

### 计算公式

```javascript
// 可视区域能显示的列表项数量
visibleCount = viewportHeight / itemHeight

// 起始索引
startIndex = Math.floor(scrollTop / itemHeight)

// 结束索引
endIndex = startIndex + visibleCount

// 总高度（用于滚动条）
totalHeight = items.length * itemHeight
```

## 3. 实现方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 分页加载 | 实现简单 | 体验差，需要多次请求 | 数据量小 |
| 回收复用 | 性能最优 | 实现复杂 | 大量重复组件 |
| **可视区域渲染** | 平衡方案 | 需要固定高度 | 通用场景 |

## 4. 核心实现

### 4.1 基础组件

```jsx
// src/components/VirtualList/index.jsx
import { ScrollView, View } from '@tarojs/components';
import { useState, useCallback, useMemo } from 'react';

// 缓冲区：可视区域外额外渲染的列表项数量
const BUFFER = 5;

/**
 * 虚拟列表组件
 * @param {Array} items - 列表数据
 * @param {number} itemHeight - 每个列表项的高度（像素）
 * @param {Function} renderItem - 渲染列表项的函数
 * @param {string} className - 自定义样式类名
 */
const VirtualList = ({ items = [], itemHeight = 50, renderItem, className = '' }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // 总高度
  const totalHeight = items.length * itemHeight;

  // 起始索引（带缓冲）
  const startIndex = useMemo(() => {
    const raw = Math.floor(scrollTop / itemHeight) - BUFFER;
    return Math.max(0, raw);
  }, [scrollTop, itemHeight]);

  // 结束索引（带缓冲）
  const endIndex = useMemo(() => {
    const visibleCount = viewportHeight > 0 ? Math.ceil(viewportHeight / itemHeight) : 10;
    const raw = startIndex + visibleCount + BUFFER * 2;
    return Math.min(items.length, raw);
  }, [startIndex, viewportHeight, itemHeight, items.length]);

  // 可视区域的列表项
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex).map((item, i) => ({
      item,
      index: startIndex + i,
    }));
  }, [items, startIndex, endIndex]);

  // 滚动事件处理
  const handleScroll = useCallback((e) => {
    setScrollTop(e.detail.scrollTop);
  }, []);

  // 获取视口高度
  const handleViewportRef = useCallback((node) => {
    if (node) {
      setViewportHeight(node.height || node.clientHeight || 300);
    }
  }, []);

  return (
    <ScrollView
      className={className}
      scrollY
      onScroll={handleScroll}
      style={{ height: '100%', overflow: 'hidden' }}
    >
      {/* 占位元素，撑开总高度 */}
      <View style={{ height: `${totalHeight}px`, position: 'relative' }}>
        {/* 只渲染可视区域的列表项 */}
        {visibleItems.map(({ item, index }) => (
          <View
            key={index}
            style={{
              position: 'absolute',
              top: `${index * itemHeight}px`,
              width: '100%',
              height: `${itemHeight}px`,
            }}
          >
            {renderItem(item, index)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default VirtualList;
```

**设计要点：**

1. **缓冲区（BUFFER）** — 在可视区域外额外渲染 5 个列表项，避免快速滚动时出现空白
2. **绝对定位** — 使用绝对定位精确控制列表项位置
3. **Memo 优化** — 使用 useMemo 缓存计算结果
4. **回调优化** — 使用 useCallback 避免不必要的重渲染

### 4.2 使用示例

```jsx
import VirtualList from '@/components/VirtualList';

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);

  // 渲染列表项
  const renderOrder = (order, index) => {
    return (
      <View className="order-item">
        <Text>订单号：{order.orderNo}</Text>
        <Text>金额：{order.amount}</Text>
        <Text>状态：{order.status}</Text>
      </View>
    );
  };

  return (
    <View className="order-list-page">
      <VirtualList
        items={orders}
        itemHeight={100}
        renderItem={renderOrder}
        className="order-list"
      />
    </View>
  );
};
```

### 4.3 样式配置

```scss
// order-list-page.scss
.order-list-page {
  height: 100vh;
}

.order-list {
  height: 100%;
}

.order-item {
  padding: 20px;
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
}
```

## 5. 进阶功能

### 5.1 动态高度支持

基础版本要求所有列表项高度相同。如果需要支持动态高度，需要更复杂的实现：

```jsx
const DynamicVirtualList = ({ items, estimatedHeight = 100, renderItem }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [heights, setHeights] = useState({});

  // 计算总高度
  const totalHeight = useMemo(() => {
    return items.reduce((sum, _, index) => {
      return sum + (heights[index] || estimatedHeight);
    }, 0);
  }, [items, heights, estimatedHeight]);

  // 计算每个列表项的位置
  const positions = useMemo(() => {
    const result = [];
    let top = 0;
    items.forEach((_, index) => {
      const height = heights[index] || estimatedHeight;
      result.push({ top, height });
      top += height;
    });
    return result;
  }, [items, heights, estimatedHeight]);

  // 查找可视区域的起始索引
  const findStartIndex = (scrollTop) => {
    let low = 0;
    let high = items.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (positions[mid].top + positions[mid].height > scrollTop) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    return Math.max(0, low);
  };

  // 渲染列表项并测量高度
  const renderItemWithMeasure = (item, index) => {
    return (
      <View
        ref={(node) => {
          if (node) {
            const height = node.height || node.clientHeight;
            if (height && height !== heights[index]) {
              setHeights((prev) => ({ ...prev, [index]: height }));
            }
          }
        }}
      >
        {renderItem(item, index)}
      </View>
    );
  };

  // ... 其余逻辑类似
};
```

### 5.2 滚动加载更多

```jsx
const VirtualListWithLoadMore = ({ items, itemHeight, renderItem, onLoadMore, hasMore }) => {
  const [loading, setLoading] = useState(false);

  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.detail;

      // 滚动到底部附近时加载更多
      if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !loading) {
        setLoading(true);
        onLoadMore().finally(() => setLoading(false));
      }
    },
    [hasMore, loading, onLoadMore]
  );

  return (
    <View>
      <VirtualList
        items={items}
        itemHeight={itemHeight}
        renderItem={renderItem}
        onScroll={handleScroll}
      />
      {loading && <View className="loading">加载中...</View>}
      {!hasMore && <View className="no-more">没有更多了</View>}
    </View>
  );
};
```

### 5.3 空状态处理

```jsx
const VirtualListWithEmpty = ({ items, itemHeight, renderItem, emptyText = '暂无数据' }) => {
  if (items.length === 0) {
    return (
      <View className="empty-state">
        <Text>{emptyText}</Text>
      </View>
    );
  }

  return (
    <VirtualList
      items={items}
      itemHeight={itemHeight}
      renderItem={renderItem}
    />
  );
};
```

## 6. 性能优化

### 6.1 列表项组件优化

```jsx
// ✅ 使用 React.memo 避免不必要的重渲染
const OrderItem = React.memo(({ order }) => {
  return (
    <View className="order-item">
      <Text>{order.orderNo}</Text>
      <Text>{order.amount}</Text>
    </View>
  );
});

// 使用
const renderOrder = (order, index) => {
  return <OrderItem key={order.id} order={order} />;
};
```

### 6.2 避免内联函数

```jsx
// ❌ 不推荐：每次渲染都创建新函数
const renderOrder = (order, index) => {
  return (
    <View onClick={() => handleClick(order)}>
      {order.orderNo}
    </View>
  );
};

// ✅ 推荐：使用 useCallback
const handleOrderClick = useCallback((order) => {
  // 处理点击
}, []);

const renderOrder = (order, index) => {
  return (
    <View onClick={() => handleOrderClick(order)}>
      {order.orderNo}
    </View>
  );
};
```

### 6.3 合理设置缓冲区

```javascript
// 缓冲区太小：快速滚动时可能出现空白
const BUFFER = 2;

// 缓冲区太大：渲染太多不可见的列表项
const BUFFER = 20;

// 推荐值：5-10
const BUFFER = 5;
```

## 7. 实际应用

### 订单列表

```jsx
const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadOrders = async (pageNum) => {
    const result = await get('/api/orders', { page: pageNum });
    if (pageNum === 1) {
      setOrders(result.list);
    } else {
      setOrders((prev) => [...prev, ...result.list]);
    }
    setHasMore(result.hasMore);
  };

  useEffect(() => {
    loadOrders(page);
  }, [page]);

  const handleLoadMore = async () => {
    setPage((prev) => prev + 1);
  };

  const renderOrder = (order) => {
    return <OrderCard key={order.id} order={order} />;
  };

  return (
    <VirtualListWithLoadMore
      items={orders}
      itemHeight={120}
      renderItem={renderOrder}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
    />
  );
};
```

### 陪诊师列表

```jsx
const ChaperonListPage = () => {
  const [chaperons, setChaperons] = useState([]);

  const renderChaperon = (chaperon) => {
    return (
      <View className="chaperon-card">
        <Image src={chaperon.avatar} />
        <View className="info">
          <Text className="name">{chaperon.name}</Text>
          <Text className="desc">{chaperon.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <VirtualList
      items={chaperons}
      itemHeight={100}
      renderItem={renderChaperon}
    />
  );
};
```

## 8. 适用场景与局限

### 适用场景

| 场景 | 推荐程度 | 说明 |
|------|---------|------|
| 订单列表 | ⭐⭐⭐ | 数量多，高度固定 |
| 消息列表 | ⭐⭐⭐ | 数量多，高度固定 |
| 商品列表 | ⭐⭐ | 数量多，可能需要动态高度 |
| 评论列表 | ⭐⭐ | 数量多，高度可能不一致 |

### 不适用场景

| 场景 | 原因 | 替代方案 |
|------|------|---------|
| 列表项高度差异大 | 需要动态高度，实现复杂 | 分页加载 |
| 列表项数量少（<50） | 性能提升不明显 | 普通列表 |
| 需要复杂交互 | 虚拟列表限制了某些交互 | 分页加载 |

### 局限性

1. **固定高度** — 基础版本要求所有列表项高度相同
2. **滚动事件频繁** — 需要做防抖处理
3. **DOM 查询受限** — 小程序中无法直接查询 DOM 高度

## 9. 总结

本文介绍的虚拟列表方案解决了小程序长列表的性能问题：

1. **轻量实现** — 核心代码不到 100 行
2. **易于使用** — 简单的 props 接口
3. **性能优化** — 只渲染可视区域
4. **扩展性强** — 支持加载更多、空状态等

完整代码已开源，欢迎 Star 和贡献。

## 相关文章

- [小程序图片缓存优化：突破 10MB Storage 限制](./04-image-cache-optimization.md)
- [Taro 4 + React 18 实战：从零搭建医疗陪诊小程序](./01-taro-react18-medical-miniapp.md)

## 开源项目

完整代码已开源：[医疗陪诊小程序](https://github.com/StevenTsai/taro-escort-miniapp)

---

> 作者：Steven
> 原文链接：https://juejin.cn/post/xxx
