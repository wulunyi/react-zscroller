import React from 'react';

export interface ScrollerStore {
  scrollX: number;
  scrollY: number;
  maxScrollX: number;
  maxScrollY: number;
  isDragging: boolean;
  isMomentumScrolling: boolean;
  isScrolling: boolean;
  isScrollbarVisible: boolean;
  isScrollbarHovered: boolean;
  
  contentWidth: number;
  contentHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  
  options: Required<ScrollOptions>;
  
  scrollTo(x: number, y: number, animate?: boolean, duration?: number): void;
  scrollBy(deltaX: number, deltaY: number, animate?: boolean): void;
  startDrag(): void;
  endDrag(velocityX: number, velocityY: number): void;
  setContentDimensions(width: number, height: number): void;
  setViewportDimensions(width: number, height: number): void;
  setScrollPosition(x: number, y: number): void;
  calculateThumbSizeRatio(): number;
  showScrollbars(): void;
  hideScrollbars(): void;
  setScrollbarHovered(hovered: boolean): void;
  finishWheelScrolling(): void;
}

export type ScrollDirection = 'horizontal' | 'vertical' | 'both' | 'none';

export interface ScrollPosition {
  x: number;
  y: number;
}

export interface ScrollDimensions {
  content: {
    width: number;
    height: number;
  };
  viewport: {
    width: number;
    height: number;
  };
}

export interface ScrollOptions {
  /** 是否启用水平滚动 */
  scrollingX?: boolean;
  /** 是否启用垂直滚动 */
  scrollingY?: boolean;
  /** 是否启用回弹效果 */
  bounceEnabled?: boolean;
  /** 是否启用动量滚动 */
  momentum?: boolean;
  /** 动量滚动的减速因子 */
  momentumFactor?: number;
  /** 滚动条尺寸 */
  scrollbarSize?: number;
  /** 滚动条颜色 */
  scrollbarColor?: string;
  /** 滚动条默认透明度 */
  scrollbarOpacity?: number;
  /** 滚动条激活状态透明度 */
  scrollbarActiveOpacity?: number;
  /** 是否锁定滚动方向 */
  lockDirection?: boolean;
  /** 鼠标滚轮滚动速度 */
  wheelScrollSpeed?: number;
  /** 是否启用滚轮平滑滚动 */
  smoothWheel?: boolean;
  /** 滚动时的回调函数 */
  onScroll?: (x: number, y: number) => void;
  /** 开始滚动时的回调函数 */
  onScrollStart?: () => void;
  /** 结束滚动时的回调函数 */
  onScrollEnd?: () => void;
  /** 动画持续时间（毫秒） */
  animationDuration?: number;
  /** 滚轮动画持续时间（毫秒） */
  wheelAnimationDuration?: number;
  /** 滚动条显示模式: 'never'(从不显示), 'always'(始终显示), 'scrolling'(滚动时显示), 'hover'(悬停时显示) */
  scrollbarMode?: 'never' | 'always' | 'scrolling' | 'hover';
  /** 是否只显示滚动条指示器而隐藏轨道 */
  indicatorOnly?: boolean;
  /** 滚动条消失延迟(毫秒) */
  scrollbarFadeDelay?: number;
}

export interface ScrollerProps {
  /** 组件子元素 */
  children: React.ReactNode;
  /** 滚动容器宽度 */
  width?: string | number;
  /** 滚动容器高度 */
  height?: string | number;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 滚动配置选项 */
  options?: ScrollOptions;
  /** 外部提供的滚动状态管理器 */
  store?: ScrollerStore;
} 