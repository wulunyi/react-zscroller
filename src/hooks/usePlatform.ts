import { useMemo } from 'react';
import { isIOS, isAndroid, isMobile } from '../utils/platform';

/**
 * 获取当前平台信息的钩子函数
 */
export function usePlatform() {
  return useMemo(() => ({
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isMobile: isMobile()
  }), []);
} 