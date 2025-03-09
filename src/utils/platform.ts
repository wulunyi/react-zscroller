/**
 * 检测是否为移动设备
 * @returns 是否为移动设备
 */
export function detectMobilePlatform(): boolean {
  // 检测用户代理
  const userAgentCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );
  
  // 检测触摸能力
  const hasTouchCapability = typeof window !== 'undefined' && (
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error DocumentTouch 可能不在类型定义中
    (window.DocumentTouch && document instanceof DocumentTouch)
  );
  
  // 检测屏幕尺寸
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  return userAgentCheck || hasTouchCapability || isSmallScreen;
}

/**
 * 检测当前环境是否为 iOS 设备
 */
export const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/**
 * 检测当前环境是否为 Android 设备
 */
export const isAndroid = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
};

/**
 * 检测当前环境是否为移动设备
 */
export const isMobile = (): boolean => {
  return isIOS() || isAndroid() || 
    (typeof navigator !== 'undefined' && 
     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}; 