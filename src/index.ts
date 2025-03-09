// 组件导出
export { Scroller } from './components/Scroller';
export { PCScroller } from './components/Scroller/PCScroller';
export { MobileScroller } from './components/Scroller/MobileScroller';

// Hooks 导出
export { useScroller } from './hooks/useScroller';

// 工具函数导出
export { isIOS, isAndroid, isMobile } from './utils/platform';

// 类型导出
export type {
  ScrollerProps,
  ScrollOptions,
  ScrollDirection,
  ScrollPosition,
  ScrollDimensions
} from './types';

// Store 导出
export { ScrollerStore } from './store'; 