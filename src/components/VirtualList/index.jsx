import { ScrollView, View } from '@tarojs/components';
import { useState, useCallback, useMemo } from 'react';

const BUFFER = 5;

const VirtualList = ({ items = [], itemHeight = 50, renderItem, className = '' }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const totalHeight = items.length * itemHeight;

  const startIndex = useMemo(() => {
    const raw = Math.floor(scrollTop / itemHeight) - BUFFER;
    return Math.max(0, raw);
  }, [scrollTop, itemHeight]);

  const endIndex = useMemo(() => {
    const visibleCount = viewportHeight > 0 ? Math.ceil(viewportHeight / itemHeight) : 10;
    const raw = startIndex + visibleCount + BUFFER * 2;
    return Math.min(items.length, raw);
  }, [startIndex, viewportHeight, itemHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex).map((item, i) => ({
      item,
      index: startIndex + i,
    }));
  }, [items, startIndex, endIndex]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.detail.scrollTop);
  }, []);

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
      <View style={{ height: `${totalHeight}px`, position: 'relative' }}>
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
