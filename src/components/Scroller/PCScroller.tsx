import React, { useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { ScrollerStore } from '../../store';
import { ScrollBarX, ScrollBarY } from '../ScrollBar';
import type { ScrollerProps } from '../../types';
import '../../styles/index.css';
import { autorun } from 'mobx';

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
  const scrollbarTimer = useRef<number | null>(null);
  
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
      
      // 如果不是 always 模式，确保初始时滚动条是隐藏的
      if (store.options.scrollbarMode !== 'always') {
        store.hideScrollbars();
      } else {
        store.showScrollbars();
      }
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
  
  // 修改 showScrollbars 和 hideScrollbars 方法
  const showScrollbars = useCallback(() => {
    // 清除可能存在的隐藏定时器
    if (scrollbarTimer.current !== null) {
      clearTimeout(scrollbarTimer.current);
      scrollbarTimer.current = null;
    }
    
    // 使用 store 的方法显示滚动条，而不是直接修改属性
    store.showScrollbars();
  }, [store]);

  const hideScrollbars = useCallback(() => {
    // 如果是 always 模式或鼠标正在滚动条上，直接返回不做任何处理
    if (store.options.scrollbarMode === 'always' || store.isScrollbarHovered) {
      return;
    }
    
    // 清除可能存在的隐藏定时器
    if (scrollbarTimer.current !== null) {
      clearTimeout(scrollbarTimer.current);
    }
    
    // 设置新的隐藏定时器
    scrollbarTimer.current = window.setTimeout(() => {
      // 再次检查，确保鼠标不在滚动条上
      if (!store.isDragging && !store.isScrollbarHovered) {
        store.hideScrollbars();
      }
      scrollbarTimer.current = null;
    }, store.options.scrollbarFadeDelay);
  }, [store]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (scrollbarTimer.current !== null) {
        clearTimeout(scrollbarTimer.current);
        scrollbarTimer.current = null;
      }
    };
  }, []);

  // 修改悬停处理函数
  const handleMouseEnter = useCallback(() => {
    if (store.options.scrollbarMode === 'hover') {
      showScrollbars();
    }
  }, [store, showScrollbars]);

  const handleMouseLeave = useCallback(() => {
    if (store.options.scrollbarMode === 'hover') {
      hideScrollbars();
    }
  }, [store, hideScrollbars]);

  // 监听滚动事件，手动处理滚动条隐藏
  useEffect(() => {
    // 添加一个变量来跟踪上次滚动位置
    let lastX = store.scrollX;
    let lastY = store.scrollY;
    let inactivityTimer: number | null = null;
    
    const disposer = autorun(() => {
      const x = store.scrollX;
      const y = store.scrollY;
      
      // 检测滚动位置是否变化
      const hasScrolled = x !== lastX || y !== lastY;
      lastX = x;
      lastY = y;
      
      if (store.options.scrollbarMode !== 'never') {
        // 有滚动发生时显示滚动条
        if (hasScrolled) {
          showScrollbars();
          
          // 清除现有的不活动计时器
          if (inactivityTimer) {
            clearTimeout(inactivityTimer);
            inactivityTimer = null;
          }
          
          // 设置一个新的计时器来检测滚动停止
          if (store.options.scrollbarMode === 'scrolling' || 
              (store.options.scrollbarMode === 'hover' && !store.isScrolling)) {
            inactivityTimer = window.setTimeout(() => {
              if (!store.isDragging) {
                hideScrollbars();
              }
              inactivityTimer = null;
            }, 100); // 短暂停顿后判断滚动是否完全停止
          }
        }
      }
    });
    
    return () => {
      disposer();
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [store, showScrollbars, hideScrollbars]);
  
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
      
      {store.options.scrollbarMode !== 'never' && store.maxScrollX > 0 && (
        <ScrollBarX store={store} />
      )}
      
      {store.options.scrollbarMode !== 'never' && store.maxScrollY > 0 && (
        <ScrollBarY store={store} />
      )}
    </div>
  );
}); 