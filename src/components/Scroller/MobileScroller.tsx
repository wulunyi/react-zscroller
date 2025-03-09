import React, { useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { ScrollerStore } from '../../store';
import { ScrollBarX, ScrollBarY } from '../ScrollBar';
import { calculateVelocity, getScrollDirection } from '../../utils';
import type { ScrollerProps } from '../../types';
import '../../styles/index.css';

export const MobileScroller: React.FC<ScrollerProps> = observer(({ 
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
  // 如果提供了外部 store，则使用它，否则创建新的
  const localStoreRef = useRef<ScrollerStore>(new ScrollerStore({ 
    ...options, 
    bounceEnabled: options.bounceEnabled !== undefined ? options.bounceEnabled : true 
  }));
  const store = externalStore || localStoreRef.current;
  
  // 触摸跟踪状态
  const touchState = useRef({
    isTouching: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startTime: 0,
    touchMoves: [] as { x: number; y: number; time: number }[],
    lockedDirection: null as 'horizontal' | 'vertical' | null,
  });
  
  // 初始化尺寸
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
  
  // 处理触摸开始
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    
    const state = touchState.current;
    
    state.isTouching = true;
    state.startX = touch.clientX;
    state.startY = touch.clientY;
    state.lastX = touch.clientX;
    state.lastY = touch.clientY;
    state.startTime = Date.now();
    state.touchMoves = [{ x: touch.clientX, y: touch.clientY, time: state.startTime }];
    state.lockedDirection = null;
    
    store.startDrag();
  }, [store]);
  
  // 处理触摸移动
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const state = touchState.current;
    
    if (!state.isTouching) return;
    
    const touch = e.touches[0];
    const now = Date.now();
    const deltaX = touch.clientX - state.lastX;
    const deltaY = touch.clientY - state.lastY;
    
    // 记录触摸点用于计算速度
    state.touchMoves.push({ x: touch.clientX, y: touch.clientY, time: now });
    if (state.touchMoves.length > 5) {
      state.touchMoves.shift();
    }
    
    // 如果启用了方向锁定且尚未锁定方向
    if (store.options.lockDirection && !state.lockedDirection) {
      // 只有在移动距离足够大时才锁定方向
      const totalDeltaX = touch.clientX - state.startX;
      const totalDeltaY = touch.clientY - state.startY;
      
      if (Math.abs(totalDeltaX) > 10 || Math.abs(totalDeltaY) > 10) {
        state.lockedDirection = getScrollDirection(totalDeltaX, totalDeltaY);
      }
    }
    
    // 根据锁定方向过滤增量
    let scrollDeltaX = deltaX;
    let scrollDeltaY = deltaY;
    
    if (state.lockedDirection === 'horizontal') {
      scrollDeltaY = 0;
    } else if (state.lockedDirection === 'vertical') {
      scrollDeltaX = 0;
    }
    
    // 应用滚动
    store.scrollBy(-scrollDeltaX, -scrollDeltaY);
    
    // 更新最后位置
    state.lastX = touch.clientX;
    state.lastY = touch.clientY;
  }, [store]);
  
  // 处理触摸结束
  const handleTouchEnd = useCallback(() => {
    const state = touchState.current;
    
    if (!state.isTouching) return;
    
    state.isTouching = false;
    
    // 计算速度
    if (state.touchMoves.length >= 2) {
      const lastMove = state.touchMoves[state.touchMoves.length - 1];
      const firstMove = state.touchMoves[0];
      const duration = lastMove.time - firstMove.time;
      
      if (duration > 0) {
        const { velocityX, velocityY } = calculateVelocity(
          firstMove.x,
          firstMove.y,
          lastMove.x,
          lastMove.y,
          duration
        );
        
        // 结束拖动，传递速度用于动量滚动
        store.endDrag(-velocityX, -velocityY);
        return;
      }
    }
    
    store.endDrag(0, 0);
  }, [store]);
  
  return (
    <div
      ref={containerRef}
      className={`react-scroller-container ${className}`}
      style={{
        ...style,
        width,
        height,
        touchAction: 'none' // 防止浏览器默认触摸行为
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        ref={contentRef}
        className="react-scroller-content"
        style={{
          transform: `translate(${-store.scrollX}px, ${-store.scrollY}px)`
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