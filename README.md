# React-Scroller

React-Scroller 是一个高性能的 React 滚动容器组件，同时支持 PC 和移动端，具有流畅的滚动效果和丰富的自定义选项。

## 特性

- 🖥️ 自动检测平台并使用最佳滚动实现
- 📱 同时支持鼠标滚轮、触摸板、触摸屏和键盘导航
- ⚡ 硬件加速滚动，使用 transform 而非 scrollTop 实现高性能滚动
- 🎨 完全可自定义的滚动条样式
- 🔄 动量滚动和回弹效果
- 🎯 支持滚动到指定位置的 API
- 🧩 支持外部状态控制

## 安装

```bash
npm install react-scroller
# 或
yarn add react-scroller
```

## 基本用法

```jsx
import { Scroller } from 'react-scroller';

function App() {
  return (
    <Scroller
      width="100%"
      height="400px"
      options={{
        scrollingX: true,
        scrollingY: true,
        momentum: true,
        scrollbarMode: 'scrolling'
      }}
    >
      <div className="content">
        {/* 你的滚动内容 */}
      </div>
    </Scroller>
  );
}
```

## 滚动条显示模式

组件支持多种滚动条显示模式:

- `'always'` - 滚动条始终可见
- `'scrolling'` - 仅在滚动时显示，停止后消失
- `'hover'` - 鼠标悬停在容器上时显示
- `'never'` - 从不显示滚动条

## 新增：只显示指示器模式

现在支持只显示滚动条滑块而隐藏轨道背景:

```jsx
<Scroller
  options={{
    indicatorOnly: true,
    scrollbarMode: 'always' // 或其他模式
  }}
>
  {/* 内容 */}
</Scroller>
```

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|-------|------|
| scrollingX | boolean | true | 是否允许水平滚动 |
| scrollingY | boolean | true | 是否允许垂直滚动 |
| momentum | boolean | true | 是否启用动量滚动 |
| momentumFactor | number | 0.92 | 动量滚动的减速因子 |
| bounceEnabled | boolean | false | 是否允许回弹效果 |
| scrollbarMode | 'never' \| 'always' \| 'scrolling' \| 'hover' | 'scrolling' | 滚动条显示模式 |
| indicatorOnly | boolean | false | 是否只显示滚动条指示器，隐藏轨道 |
| scrollbarFadeDelay | number | 500 | 滚动条消失延迟(毫秒) |
| scrollbarSize | number | 6 | 滚动条宽度(像素) |
| wheelScrollSpeed | number | 5 | 鼠标滚轮滚动速度 |
| smoothWheel | boolean | true | 是否启用滚轮平滑滚动 |
| onScroll | (x, y) => void | - | 滚动时的回调函数 |
| onScrollStart | () => void | - | 开始滚动时的回调函数 |
| onScrollEnd | () => void | - | 结束滚动时的回调函数 |

## 自定义滚动行为

你可以使用 `useScroller` hook 来创建自定义的滚动行为:

```jsx
import { useScroller, Scroller } from 'react-scroller';

function ScrollToExample() {
  const { store, scrollTo } = useScroller({
    scrollingY: true,
    momentum: true
  });
  
  const handleScrollToBottom = () => {
    scrollTo(0, store.maxScrollY, true); // 平滑滚动到底部
  };
  
  return (
    <>
      <button onClick={handleScrollToBottom}>滚动到底部</button>
      <Scroller store={store} height="400px">
        <div className="content">
          {/* 长内容 */}
        </div>
      </Scroller>
    </>
  );
}
```

## 许可

MIT
