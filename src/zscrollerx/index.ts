export * from './pc/PCScroller';
export * from './mobile/MobileScroller';
export * from './core/types';
export * from './core/ScrollStore';

// 自动检测环境并提供合适的滚动组件
import { PCScroller } from './pc/PCScroller';
import { MobileScroller } from './mobile/MobileScroller';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : ''
);

export const ZScrollerX = isMobile ? MobileScroller : PCScroller; 