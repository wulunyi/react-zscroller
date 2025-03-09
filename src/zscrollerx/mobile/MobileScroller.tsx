import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { ScrollerProps } from '../core/types';
import { ScrollStore } from '../core/ScrollStore';

export const MobileScroller: React.FC<ScrollerProps> = observer(({ 
  children, 
  className = '', 
  style = {}, 
  options = {},
  height = '100%',
  width = '100%'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const storeRef = useRef<ScrollStore>(new ScrollStore(options));
  const store = storeRef.current;
  
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
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // 处理触摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    store.startDrag();
    
    const touch = e.touches[0];
    const startX = touch.pageX;
    const startY = touch.pageY;
    const startScrollX = store.scrollX;
    const startScrollY = store.scrollY;
    let lastX = startX;
    let lastY = startY;
    let lastTime = Date.now();
    let velocityX = 0;
    let velocityY = 0;
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      const currentX = touch.pageX;
      const currentY = touch.pageY;
      const now = Date.now();
      const elapsed = now - lastTime;
      
      // 计算速度（用于动量滚动）
      if (elapsed > 0) {
        velocityX = (lastX - currentX) / elapsed;
        velocityY = (lastY - currentY) / elapsed;
      }
      
      // 更新滚动位置
      const deltaX = startX - currentX;
      const deltaY = startY - currentY;
      
      store.scrollTo(
        startScrollX + deltaX,
        startScrollY + deltaY
      );
      
      lastX = currentX;
      lastY = currentY;
      lastTime = now;
      
      e.preventDefault();
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      // 结束拖动，传入速度用于动量滚动
      store.endDrag(velocityX, velocityY);
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };
  
  return (
    <div 
      ref={containerRef}
      className={`zscrollerx-container ${className}`}
      style={{ ...style, height, width, overflow: 'hidden', position: 'relative' }}
      onTouchStart={handleTouchStart}
    >
      <div 
        ref={contentRef} 
        className="zscrollerx-content"
        style={{ 
          transform: `translate3d(${-store.scrollX}px, ${-store.scrollY}px, 0)`,
          position: 'absolute',
          minWidth: '100%',
          minHeight: '100%'
        }}
      >
        {children}
      </div>
      
      {/* X 轴滚动条 */}
      {store.options.scrollingX && store.maxScrollX > 0 && (
        <div 
          className={`zscrollerx-scrollbar zscrollerx-scrollbar-x ${store.isScrollbarVisible || store.isDragging ? 'visible' : ''}`}
          style={{
            opacity: store.isDragging ? store.options.scrollbarActiveOpacity : store.options.scrollbarOpacity,
          }}
        >
          <div 
            className="zscrollerx-indicator"
            style={{
              backgroundColor: store.options.scrollbarColor,
              width: `${Math.max(20, (containerRef.current?.clientWidth || 1) / Math.max(contentRef.current?.scrollWidth || 1, 1) * 100)}%`,
              transform: `translateX(${(store.scrollX / Math.max(store.maxScrollX, 1)) * (100 - Math.max(20, (containerRef.current?.clientWidth || 1) / Math.max(contentRef.current?.scrollWidth || 1, 1) * 100))}%)`,
            }}
          />
        </div>
      )}
      
      {/* Y 轴滚动条 */}
      {store.options.scrollingY && store.maxScrollY > 0 && (
        <div 
          className={`zscrollerx-scrollbar zscrollerx-scrollbar-y ${store.isScrollbarVisible || store.isDragging ? 'visible' : ''}`}
          style={{
            opacity: store.isDragging ? store.options.scrollbarActiveOpacity : store.options.scrollbarOpacity,
          }}
        >
          <div 
            className="zscrollerx-indicator"
            style={{
              backgroundColor: store.options.scrollbarColor,
              height: `${Math.max(20, (containerRef.current?.clientHeight || 1) / Math.max(contentRef.current?.scrollHeight || 1, 1) * 100)}%`,
              transform: `translateY(${(store.scrollY / Math.max(store.maxScrollY, 1)) * (100 - Math.max(20, (containerRef.current?.clientHeight || 1) / Math.max(contentRef.current?.scrollHeight || 1, 1) * 100))}%)`,
            }}
          />
        </div>
      )}
    </div>
  );
}); 