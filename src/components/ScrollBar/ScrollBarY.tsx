import React, { useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import type { ScrollerStore } from '../../store';

interface ScrollBarYProps {
  store: ScrollerStore;
}

export const ScrollBarY: React.FC<ScrollBarYProps> = observer(({ store }) => {
  const isDragging = useRef(false);
  const startMouseY = useRef(0);
  const startScrollY = useRef(0);
  
  // 使用 store 提供的方法计算滑块大小
  const thumbHeight = Math.max(
    20,
    store.calculateThumbSizeRatio() * store.viewportHeight
  );
  const thumbPosition = (store.scrollY / (store.maxScrollY || 1)) * (100 - thumbHeight);
  
  // 处理滑块拖动
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startMouseY.current = e.clientY;
    startScrollY.current = store.scrollY;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      const deltaY = e.clientY - startMouseY.current;
      const scrollFactor = store.maxScrollY / (store.viewportHeight - thumbHeight * store.viewportHeight / 100);
      const newScrollY = startScrollY.current + deltaY * scrollFactor;
      
      store.scrollTo(store.scrollX, newScrollY);
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault(); // 防止文本选择
  }, [store, thumbHeight]);
  
  // 处理轨道点击
  const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // 如果是滑块上的点击，不处理
    if ((e.target as HTMLElement).className.includes('indicator')) {
      return;
    }
    
    const trackRect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientY - trackRect.top) / trackRect.height;
    const targetScrollY = clickPosition * store.maxScrollY;
    
    store.scrollTo(store.scrollX, targetScrollY, true);
  }, [store]);
  
  return (
    <div 
      className={`react-scroller-scrollbar react-scroller-scrollbar-y ${store.isScrollbarVisible || store.isDragging ? 'visible' : ''}`}
      style={{
        opacity: store.isDragging ? store.options.scrollbarActiveOpacity : store.options.scrollbarOpacity,
        width: `${store.options.scrollbarSize}px`,
      }}
      onClick={handleTrackClick}
    >
      <div 
        className="react-scroller-indicator"
        style={{
          backgroundColor: store.options.scrollbarColor,
          height: `${thumbHeight}%`,
          top: `${thumbPosition}%`,
        }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}); 