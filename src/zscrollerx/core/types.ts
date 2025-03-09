import { ReactNode } from 'react';

export interface ScrollOptions {
  // 基础配置
  bounceEnabled?: boolean;      // 是否允许回弹效果
  scrollingX?: boolean;         // 允许横向滚动
  scrollingY?: boolean;         // 允许纵向滚动
  lockDirection?: boolean;      // 锁定滚动方向 
  
  // 样式配置
  scrollbarSize?: number;       // 滚动条大小
  scrollbarColor?: string;      // 滚动条颜色
  scrollbarOpacity?: number;    // 滚动条不活动时透明度
  scrollbarActiveOpacity?: number; // 滚动条活动时透明度
  
  // 回调函数
  onScroll?: (x: number, y: number) => void;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
  
  // 高级配置
  momentum?: boolean;           // 是否启用动量滚动
  momentumFactor?: number;      // 动量因子
}

export interface ScrollerProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  options?: ScrollOptions;
  height?: number | string;
  width?: number | string;
} 