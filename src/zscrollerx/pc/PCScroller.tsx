import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { ScrollerProps } from '../core/types';
import { ScrollStore } from '../core/ScrollStore';

export const PCScroller: React.FC<ScrollerProps> = observer(({ 
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
  
  // 添加在组件开头的变量声明
  const lastWheelTime = useRef(0);
  const lastWheelDelta = useRef(0);
  
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
    
    // 绑定鼠标滚轮事件
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // 检测滚轮事件类型
      const isTrackpad = Math.abs(e.deltaX) < 10 && Math.abs(e.deltaY) < 10;
      
      // 获取滚动增量
      let { deltaX, deltaY } = e;
      
      // 如果按下 Shift 键，交换 X 和 Y 方向
      if (e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const temp = deltaX;
        deltaX = deltaY;
        deltaY = temp;
      }
      
      // 根据设备确定滚动速度，减少阻尼
      let speedFactor = 1;
      
      if (isTrackpad) {
        // 触控板滚动 - 更接近原生
        speedFactor = 1.0;
      } else {
        // 鼠标滚轮 - 更接近原生
        speedFactor = 0.5;
        
        // 调整不同模式下的缩放比例
        if (e.deltaMode === 1) { // DOM_DELTA_LINE
          speedFactor = 14; // 增加行滚动速度
        } else if (e.deltaMode === 2) { // DOM_DELTA_PAGE
          speedFactor = Math.min(
            containerRef.current?.clientHeight || 500,
            500
          );
        }
      }
      
      // 缩放操作
      if (e.ctrlKey || e.metaKey) {
        speedFactor *= 3; // 增加缩放灵敏度
      }
      
      // 应用平滑系数
      deltaX *= speedFactor;
      deltaY *= speedFactor;
      
      // 减少连续滚动阻尼
      if (!isTrackpad) {
        // 连续滚动时应用更小的阻尼
        const now = Date.now();
        if (now - lastWheelTime.current < 200 && lastWheelDelta.current !== 0) {
          // 使用更小的阻尼系数
          if (Math.sign(deltaY) === Math.sign(lastWheelDelta.current)) {
            deltaY *= 0.9; // 减少阻尼，变为0.9
          }
        }
        lastWheelTime.current = now;
        lastWheelDelta.current = deltaY;
      }
      
      // 边界检测
      if (store.scrollX <= 0 && deltaX < 0) {
        deltaX = 0;
      } else if (store.scrollX >= store.maxScrollX && deltaX > 0) {
        deltaX = 0;
      }
      
      if (store.scrollY <= 0 && deltaY < 0) {
        deltaY = 0;
      } else if (store.scrollY >= store.maxScrollY && deltaY > 0) {
        deltaY = 0;
      }
      
      // 应用滚动，减小阈值
      if (deltaX !== 0 || deltaY !== 0) {
        // 显示滚动条
        store.isScrollbarVisible = true;
        
        // 只过滤极小的位移
        if (Math.abs(deltaX) < 0.05) deltaX = 0;
        if (Math.abs(deltaY) < 0.05) deltaY = 0;
        
        store.scrollBy(deltaX, deltaY);
      }
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);
  
  // 处理滚动条拖动
  const handleScrollbarXMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    
    // 获取初始信息
    const indicator = e.currentTarget;
    const scrollbar = indicator.parentElement;
    if (!scrollbar) return;
    
    const scrollbarRect = scrollbar.getBoundingClientRect();
    const indicatorRect = indicator.getBoundingClientRect();
    
    // 计算鼠标在指示器上的相对位置
    const mouseOffsetInIndicator = e.clientX - indicatorRect.left;
    
    store.startDrag();
    
    const handleMouseMove = (e: MouseEvent) => {
      // 计算指示器左边缘的新位置
      const newIndicatorLeft = e.clientX - scrollbarRect.left - mouseOffsetInIndicator;
      
      // 计算最大可移动范围
      const maxTrackWidth = scrollbarRect.width - indicatorRect.width;
      
      // 计算位置百分比 (0-1)
      const percentage = Math.max(0, Math.min(1, newIndicatorLeft / maxTrackWidth));
      
      // 根据百分比设置内容滚动位置
      store.scrollTo(percentage * store.maxScrollX, store.scrollY);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      store.endDrag();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleScrollbarYMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    
    // 获取初始信息
    const indicator = e.currentTarget;
    const scrollbar = indicator.parentElement;
    if (!scrollbar) return;
    
    const scrollbarRect = scrollbar.getBoundingClientRect();
    const indicatorRect = indicator.getBoundingClientRect();
    
    // 计算鼠标在指示器上的相对位置
    const mouseOffsetInIndicator = e.clientY - indicatorRect.top;
    
    store.startDrag();
    
    const handleMouseMove = (e: MouseEvent) => {
      // 计算指示器顶部边缘的新位置
      const newIndicatorTop = e.clientY - scrollbarRect.top - mouseOffsetInIndicator;
      
      // 计算最大可移动范围
      const maxTrackHeight = scrollbarRect.height - indicatorRect.height;
      
      // 计算位置百分比 (0-1)
      const percentage = Math.max(0, Math.min(1, newIndicatorTop / maxTrackHeight));
      
      // 根据百分比设置内容滚动位置
      store.scrollTo(store.scrollX, percentage * store.maxScrollY);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      store.endDrag();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // 处理滚动条轨道点击（快速跳转到点击位置）
  const handleScrollbarXTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 忽略指示器上的点击
    if (e.target !== e.currentTarget) return;
    
    const scrollbar = e.currentTarget;
    const scrollbarRect = scrollbar.getBoundingClientRect();
    
    // 获取指示器元素和计算其宽度
    const indicator = scrollbar.querySelector('.zscrollerx-indicator') as HTMLElement;
    if (!indicator) return;
    
    const indicatorWidth = indicator.offsetWidth;
    
    // 计算点击位置
    const clickPosition = e.clientX - scrollbarRect.left;
    const scrollbarWidth = scrollbarRect.width;
    
    // 计算指示器中心应该在的位置
    const targetIndicatorCenter = clickPosition;
    // 考虑指示器宽度的一半，确保指示器中心位于点击位置
    const indicatorHalfWidth = indicatorWidth / 2;
    
    // 计算点击位置（考虑指示器宽度）
    let percentage = (targetIndicatorCenter - indicatorHalfWidth) / (scrollbarWidth - indicatorWidth);
    percentage = Math.max(0, Math.min(1, percentage));
    
    // 设置滚动位置
    store.scrollTo(percentage * store.maxScrollX, store.scrollY, true);
  };

  const handleScrollbarYTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    
    const scrollbar = e.currentTarget;
    const scrollbarRect = scrollbar.getBoundingClientRect();
    
    // 获取指示器元素和计算其高度
    const indicator = scrollbar.querySelector('.zscrollerx-indicator') as HTMLElement;
    if (!indicator) return;
    
    const indicatorHeight = indicator.offsetHeight;
    
    // 计算点击位置
    const clickPosition = e.clientY - scrollbarRect.top;
    const scrollbarHeight = scrollbarRect.height;
    
    // 计算指示器中心应该在的位置
    const targetIndicatorCenter = clickPosition;
    // 考虑指示器高度的一半，确保指示器中心位于点击位置
    const indicatorHalfHeight = indicatorHeight / 2;
    
    // 计算点击位置（考虑指示器高度）
    let percentage = (targetIndicatorCenter - indicatorHalfHeight) / (scrollbarHeight - indicatorHeight);
    percentage = Math.max(0, Math.min(1, percentage));
    
    // 设置滚动位置
    store.scrollTo(store.scrollX, percentage * store.maxScrollY, true);
  };
  
  return (
    <div 
      ref={containerRef}
      className={`zscrollerx-container ${className}`}
      style={{ ...style, height, width, overflow: 'hidden', position: 'relative' }}
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
          onClick={handleScrollbarXTrackClick}
        >
          <div 
            className="zscrollerx-indicator"
            style={{
              backgroundColor: store.options.scrollbarColor,
              width: `${Math.max(20, (containerRef.current?.clientWidth || 1) / Math.max(contentRef.current?.scrollWidth || 1, 1) * 100)}%`,
              left: `${(store.scrollX / store.maxScrollX) * (100 - Math.max(20, (containerRef.current?.clientWidth || 1) / Math.max(contentRef.current?.scrollWidth || 1, 1) * 100))}%`,
              transform: 'none',
            }}
            onMouseDown={handleScrollbarXMouseDown}
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
          onClick={handleScrollbarYTrackClick}
        >
          <div 
            className="zscrollerx-indicator"
            style={{
              backgroundColor: store.options.scrollbarColor,
              height: `${Math.max(20, (containerRef.current?.clientHeight || 1) / Math.max(contentRef.current?.scrollHeight || 1, 1) * 100)}%`,
              top: `${(store.scrollY / store.maxScrollY) * (100 - Math.max(20, (containerRef.current?.clientHeight || 1) / Math.max(contentRef.current?.scrollHeight || 1, 1) * 100))}%`,
              transform: 'none',
            }}
            onMouseDown={handleScrollbarYMouseDown}
          />
        </div>
      )}
    </div>
  );
}); 