/**
 * 计算滑动手势的速度
 * @param startX 开始X坐标
 * @param startY 开始Y坐标
 * @param endX 结束X坐标
 * @param endY 结束Y坐标
 * @param duration 持续时间(毫秒)
 */
export function calculateVelocity(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  duration: number
): { velocityX: number; velocityY: number } {
  if (duration === 0) {
    return { velocityX: 0, velocityY: 0 };
  }
  
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const velocityX = deltaX / duration;
  const velocityY = deltaY / duration;
  
  return { velocityX, velocityY };
}

/**
 * 确定主滑动方向
 * @param deltaX X方向位移
 * @param deltaY Y方向位移
 */
export function getScrollDirection(deltaX: number, deltaY: number): 'horizontal' | 'vertical' {
  return Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
} 