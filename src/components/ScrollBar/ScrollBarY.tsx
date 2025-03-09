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
    'hideScrollbars' |
    'startDrag' |
    'endDrag'
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
    store.startDrag(); // 通知 store 开始拖动
    startMouseY.current = e.clientY;
    startScrollY.current = store.scrollY;
    
    // 使用 RAF 进行更流畅的拖动
    let animationFrameId: number | null = null;
    let lastClientY = e.clientY;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      // 保存当前鼠标位置
      lastClientY = e.clientY;
      
      // 使用 requestAnimationFrame 优化滚动性能
      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(() => {
          const deltaY = lastClientY - startMouseY.current;
          const scrollFactor = store.maxScrollY / (store.viewportHeight - thumbHeight * store.viewportHeight / 100);
          const newScrollY = startScrollY.current + deltaY * scrollFactor;
          
          store.scrollTo(store.scrollX, newScrollY);
          animationFrameId = null;
        });
      }
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
      
      // 取消可能存在的动画帧
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // 告诉 store 拖动结束
      store.endDrag(0, 0);
      
      // 强制延迟隐藏滚动条(仅在scrolling模式)
      if (store.options.scrollbarMode === 'scrolling') {
        setTimeout(() => {
          if (!store.isScrolling && !store.isDragging) {
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
      } ${store.isDragging ? 'active' : ''} ${
        store.options.indicatorOnly ? 'indicator-only' : ''
      }`}
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