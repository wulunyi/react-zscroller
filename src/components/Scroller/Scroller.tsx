import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePlatform } from '../../hooks';
import { PCScroller } from './PCScroller';
import { MobileScroller } from './MobileScroller';
import type { ScrollerProps } from '../../types';

/**
 * 智能检测平台并使用相应的滚动组件
 */
export const Scroller: React.FC<ScrollerProps> = observer((props) => {
  const { isMobile } = usePlatform();
  
  return isMobile 
    ? <MobileScroller {...props} /> 
    : <PCScroller {...props} />;
}); 