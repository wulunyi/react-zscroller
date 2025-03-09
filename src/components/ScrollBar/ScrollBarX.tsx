import React, { useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import type { ScrollerStore } from '../../store';

interface ScrollBarXProps {
  store: Pick<ScrollerStore, 
    'scrollX' | 
    'scrollY' | 
    'maxScrollX' | 
    'viewportWidth' | 
    'contentWidth' |
    'isDragging' | 
    'isScrollbarVisible' | 
    'isScrolling' |
    'isScrollbarHovered' |
    'options' | 
    'scrollTo' |
    'setScrollbarHovered' |
    'hideScrollbars' |
    'startDrag' |
    'endDrag'
  >;
}

export const ScrollBarX: React.FC<ScrollBarXProps> = observer(({ store }) => {
  const isDragging = useRef(false);
  const startMouseX = useRef(0);
  const startScrollX = useRef(0);
  
  // 计算滑块位置和宽度
  const thumbWidth = Math.max(20, (store.viewportWidth / store.contentWidth) * 100);
  const thumbPosition = (store.scrollX / (store.maxScrollX || 1)) * (100 - thumbWidth);
  
  // 处理滑块拖动
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    store.startDrag(); // 通知 store 开始拖动
    startMouseX.current = e.clientX;
    startScrollX.current = store.scrollX;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      const deltaX = e.clientX - startMouseX.current;
      const scrollFactor = store.maxScrollX / (store.viewportWidth - thumbWidth * store.viewportWidth / 100);
      const newScrollX = startScrollX.current + deltaX * scrollFactor;
      
      store.scrollTo(newScrollX, store.scrollY);
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
      
      // 告诉 store 拖动结束
      store.endDrag(0, 0);
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault(); // 防止文本选择
  }, [store, thumbWidth]);
  
  // 处理轨道点击
  const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // 如果是滑块上的点击，不处理
    if ((e.target as HTMLElement).className.includes('indicator')) {
      return;
    }
    
    const trackRect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - trackRect.left) / trackRect.width;
    const targetScrollX = clickPosition * store.maxScrollX;
    
    store.scrollTo(targetScrollX, store.scrollY, true);
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
      className={`react-scroller-scrollbar react-scroller-scrollbar-x ${
        store.isScrollbarVisible ? 'visible' : ''
      } ${store.isDragging ? 'active' : ''} ${
        store.options.indicatorOnly ? 'indicator-only' : ''
      }`}
      style={{
        height: `${store.options.scrollbarSize}px`,
      }}
      onClick={handleTrackClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="react-scroller-indicator"
        style={{
          width: `${thumbWidth}%`,
          left: `${thumbPosition}%`,
        }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}); 