/**
 * 计算缓动动画进度
 * @param t 当前进度(0-1)
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * 计算弹性缓动进度
 * @param t 当前进度(0-1)
 */
export function easeOutElastic(t: number): number {
  const p = 0.3;
  return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
}

/**
 * 平滑的三次缓动
 * @param t 当前进度(0-1)
 */
export function smoothEasing(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
} 