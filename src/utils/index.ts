export * from './platform';
export * from './gesture';
export * from './animation';

export { isIOS, isAndroid, isMobile } from './platform';

/**
 * 计算基于时间的速度
 */
export function calculateVelocity(
  startX: number, 
  startY: number, 
  endX: number, 
  endY: number, 
  duration: number
): { velocityX: number; velocityY: number } {
  // 至少需要一定的时间来计算有意义的速度
  if (duration <= 0) {
    return { velocityX: 0, velocityY: 0 };
  }
  
  // 计算基于秒的速度
  const velocityX = (endX - startX) / duration;
  const velocityY = (endY - startY) / duration;
  
  return { velocityX, velocityY };
}

/**
 * 根据移动增量确定滚动方向
 */
export function getScrollDirection(deltaX: number, deltaY: number): 'horizontal' | 'vertical' {
  return Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
} 