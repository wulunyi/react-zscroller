import React, { useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { ScrollerStore } from '../../store';
import { ScrollBarX, ScrollBarY } from '../ScrollBar';
import type { ScrollerProps } from '../../types';
import '../../styles/index.css';

export const PCScroller: React.FC<ScrollerProps> = observer(({ 
  children, 
  className = '', 
  style = {}, 
  options = {},
  height = '100%',
  width = '100%',
  store: externalStore
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const localStoreRef = useRef<ScrollerStore>(new ScrollerStore({ ...options, bounceEnabled: false }));
  const store = externalStore || localStoreRef.current;
  
  const lastWheelTime = useRef<number>(0);
  
  // 初始化和清理
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    
    if (!container || !content) return;
    
    // 更新尺寸
    const updateDimensions = () => {
      store.setViewportDimensions(
        container.clientWidth,
        container.clientHeight
      );
      
      store.setContentDimensions(
        content.scrollWidth,
        content.scrollHeight
      );
    };
    
    // 初始化尺寸
    updateDimensions();
    
    // 监听尺寸变化
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);
    resizeObserver.observe(content);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [store]);
  
  // 处理鼠标滚轮事件
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    // 获取滚动增量
    let { deltaX, deltaY } = e;
    
    // 简单检测是否为触摸板
    const isTrackpad = Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10;
    
    // 如果按下 Shift 键，交换 X 和 Y 方向
    if (e.shiftKey) {
      const temp = deltaX;
      deltaX = deltaY;
      deltaY = temp;
    }
    
    // 根据配置项禁用某些方向的滚动
    if (!store.options.scrollingX) deltaX = 0;
    if (!store.options.scrollingY) deltaY = 0;
    
    // 简单的缩放系数
    const scale = isTrackpad ? 1 : 3;
    
    // 应用缩放
    deltaX = Math.round(deltaX * scale);
    deltaY = Math.round(deltaY * scale);
    
    // 直接滚动，不使用动画
    store.scrollBy(deltaX, deltaY);
  }, [store]);
  
  // 监听事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // 添加事件监听器
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);
  
  // 处理滚动容器点击，获取焦点
  const handleContainerClick = useCallback(() => {
    containerRef.current?.focus();
  }, []);
  
  // 处理键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // 箭头键导航
    const arrowSpeed = e.shiftKey ? 50 : 20;
    
    switch (e.key) {
      case 'ArrowUp':
        store.scrollBy(0, -arrowSpeed, true);
        e.preventDefault();
        break;
      case 'ArrowDown':
        store.scrollBy(0, arrowSpeed, true);
        e.preventDefault();
        break;
      case 'ArrowLeft':
        store.scrollBy(-arrowSpeed, 0, true);
        e.preventDefault();
        break;
      case 'ArrowRight':
        store.scrollBy(arrowSpeed, 0, true);
        e.preventDefault();
        break;
      case 'PageUp':
        store.scrollBy(0, -store.viewportHeight * 0.9, true);
        e.preventDefault();
        break;
      case 'PageDown':
        store.scrollBy(0, store.viewportHeight * 0.9, true);
        e.preventDefault();
        break;
      case 'Home':
        store.scrollTo(store.scrollX, 0, true);
        e.preventDefault();
        break;
      case 'End':
        store.scrollTo(store.scrollX, store.maxScrollY, true);
        e.preventDefault();
        break;
    }
  }, [store]);
  
  return (
    <div
      ref={containerRef}
      className={`react-scroller-container ${className}`}
      style={{
        ...style,
        width,
        height,
        outline: 'none'
      }}
      tabIndex={0}
      onClick={handleContainerClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={contentRef}
        className="react-scroller-content"
        style={{
          transform: `translate3d(${-Math.round(store.scrollX)}px, ${-Math.round(store.scrollY)}px, 0px)`
        }}
      >
        {children}
      </div>
      
      {store.maxScrollX > 0 && (
        <ScrollBarX store={store} />
      )}
      
      {store.maxScrollY > 0 && (
        <ScrollBarY store={store} />
      )}
    </div>
  );
}); 