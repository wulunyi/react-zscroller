# react-zscroller

高性能的 React 滚动组件，提供接近原生的滚动体验。分别为 PC 端和移动端提供了优化的滚动实现。

## 特点

- 高性能，流畅的滚动体验
- 针对 PC 和移动端分别优化
- 支持自定义配置
- 自动检测滚动方向
- 自定义滚动条样式
- 基于 MobX 状态管理

## 安装

```bash
npm install react-zscroller
# 或
yarn add react-zscroller
```

## 基本用法

### 直接使用特定平台组件

```jsx
import { PCScroller, MobileScroller } from 'react-zscroller';

// PC 端使用
function PCComponent() {
  return (
    <PCScroller 
      height="400px"
      width="100%"
      options={{
        scrollingX: true,
        scrollingY: true,
        bounceEnabled: false
      }}
    >
      <div>PC 端滚动内容</div>
    </PCScroller>
  );
}

// 移动端使用
function MobileComponent() {
  return (
    <MobileScroller 
      height="100vh"
      width="100%"
      options={{
        scrollingX: true,
        scrollingY: true,
        bounceEnabled: true
      }}
    >
      <div>移动端滚动内容</div>
    </MobileScroller>
  );
}
```

### 自动检测设备类型

```jsx
import React from 'react';
import { PCScroller, MobileScroller } from 'react-zscroller';

function ResponsiveScroller(props) {
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    // 检测是否为移动设备
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;
      
      const isMobileViewport = window.innerWidth <= 768;
      
      setIsMobile(isTouchDevice || isMobileViewport);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // 根据设备类型选择合适的滚动组件
  const Scroller = isMobile ? MobileScroller : PCScroller;
  
  return (
    <Scroller {...props} />
  );
}

export default ResponsiveScroller;
```

## 配置选项

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| scrollingX | boolean | true | 是否启用水平滚动 |
| scrollingY | boolean | true | 是否启用垂直滚动 |
| bounceEnabled | boolean | false (PC) / true (移动端) | 是否启用回弹效果 |
| momentum | boolean | true | 是否启用动量滚动 |
| momentumFactor | number | 0.9 | 动量滚动的减速因子 |
| scrollbarSize | number | 6 | 滚动条尺寸 |
| scrollbarColor | string | rgba(0,0,0,0.4) | 滚动条颜色 |
| onScroll | function | - | 滚动时的回调函数 |
| onScrollStart | function | - | 开始滚动时的回调函数 |
| onScrollEnd | function | - | 结束滚动时的回调函数 |

## 许可证

MIT
