import React, { useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import type { ScrollerStore } from '../../store';

interface ScrollBarYProps {
  store: Pick<ScrollerStore, 
    'scrollX' | 
    'scrollY' | 
    'maxScrollY' | 
    'viewportHeight' | 
    'contentHeight' |
    'isDragging' | 
    'isScrollbarVisible' | 
    'isScrolling' |
    'isScrollbarHovered' |
    'options' | 
    'scrollTo' |
    'calculateThumbSizeRatio' |
    'setScrollbarHovered' |
    'hideScrollbars'
  >;
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
      
      // 拖动结束后延迟一小段时间再触发隐藏滚动条的逻辑
      if (store.options.scrollbarMode === 'scrolling') {
        setTimeout(() => {
          // 确保没有新的滚动或拖动发生
          if (!store.isDragging && !store.isScrolling && !store.isScrollbarHovered) {
            store.hideScrollbars();
          }
        }, store.options.scrollbarFadeDelay);
      }
      
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
  
  // 添加鼠标悬停处理
  const handleMouseEnter = useCallback(() => {
    // 通知store鼠标正在滚动条上
    store.setScrollbarHovered(true);
  }, [store]);
  
  const handleMouseLeave = useCallback(() => {
    // 通知store鼠标离开滚动条
    store.setScrollbarHovered(false);
  }, [store]);
  
  return (
    <div 
      className={`react-scroller-scrollbar react-scroller-scrollbar-y ${
        store.isScrollbarVisible ? 'visible' : ''
      } ${store.isDragging ? 'active' : ''}`}
      style={{
        width: `${store.options.scrollbarSize}px`
      }}
      onClick={handleTrackClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="react-scroller-indicator"
        style={{
          height: `${thumbHeight}%`,
          top: `${thumbPosition}%`,
        }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}); 