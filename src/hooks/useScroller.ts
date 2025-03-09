import { useState, useCallback } from 'react';
import { ScrollerStore } from '../store';
import type { ScrollOptions } from '../types';

export function useScroller(options: ScrollOptions = {}) {
  const [store] = useState(() => new ScrollerStore(options));
  
  // 滚动到指定位置
  const scrollTo = useCallback((x: number, y: number, animate = false) => {
    store.scrollTo(x, y, animate);
  }, [store]);
  
  // 按增量滚动
  const scrollBy = useCallback((deltaX: number, deltaY: number, animate = false) => {
    store.scrollBy(deltaX, deltaY, animate);
  }, [store]);
  
  // 更新尺寸
  const updateDimensions = useCallback((content: { width: number; height: number }, viewport: { width: number; height: number }) => {
    store.setContentDimensions(content.width, content.height);
    store.setViewportDimensions(viewport.width, viewport.height);
  }, [store]);
  
  return {
    store,
    scrollTo,
    scrollBy,
    updateDimensions
  };
} 