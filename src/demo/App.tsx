import React, { useState, useCallback, useRef } from 'react';
import { Scroller, PCScroller, MobileScroller, useScroller } from '../';
import './styles/App.css';

export const App: React.FC = () => {
  // 创建一个自定义滚动器的示例
  const { store, scrollTo } = useScroller({
    scrollingX: true,
    scrollingY: true,
    momentum: true,
    wheelScrollSpeed: 5,
    smoothWheel: true,
    animationDuration: 300,
    wheelAnimationDuration: 150
  });
  
  // 用于控制内容颜色的状态
  const [colorScheme, setColorScheme] = useState<'blue' | 'green' | 'purple'>('blue');
  
  // 滚动到指定位置的处理函数
  const handleScrollToBottom = useCallback(() => {
    scrollTo(0, store.maxScrollY, true);
  }, [scrollTo, store.maxScrollY]);
  
  const handleScrollToTop = useCallback(() => {
    scrollTo(0, 0, true);
  }, [scrollTo]);
  
  // 切换颜色主题
  const handleChangeTheme = useCallback(() => {
    setColorScheme(prev => {
      if (prev === 'blue') return 'green';
      if (prev === 'green') return 'purple';
      return 'blue';
    });
  }, []);
  
  // 给不同的示例设置不同的颜色
  const getContentClass = (type: string) => {
    if (type === 'auto') {
      return `content-large theme-${colorScheme}`;
    }
    if (type === 'pc') {
      return 'content-large theme-blue';
    }
    return 'content-large theme-green';
  };
  
  return (
    <div className="app">
      <header>
        <h1>React Scroller</h1>
        <p>高性能滚动组件演示</p>
      </header>
      
      <section className="demo-section">
        <h2>智能检测平台</h2>
        <div className="description">
          <p>Scroller 组件会自动检测当前设备，并使用最适合的滚动实现。</p>
          <div className="controls">
            <button onClick={handleChangeTheme}>切换主题</button>
            <button onClick={handleScrollToTop}>滚动到顶部</button>
            <button onClick={handleScrollToBottom}>滚动到底部</button>
          </div>
        </div>
        <div className="demo-container">
          {/* 传递 store 给 Scroller 组件 */}
          <Scroller
            width="100%"
            height="400px"
            store={store} // 传入外部创建的 store
            options={{
              scrollingX: true,
              scrollingY: true,
              momentum: true,
              wheelScrollSpeed: 5,
              smoothWheel: true,
              animationDuration: 300,
              wheelAnimationDuration: 150,
              onScroll: (x, y) => console.log(`滚动位置: x=${x}, y=${y}`),
              onScrollStart: () => console.log('开始滚动'),
              onScrollEnd: () => console.log('结束滚动')
            }}
          >
            <div className={getContentClass('auto')}>
              <h3>滚动组件核心功能</h3>
              <p>这个示例展示了 React Scroller 的主要功能和 API 用法</p>
              
              <div className="code-example">
                <h4>基础用法</h4>
                <pre>{`
// 基本用法
import { Scroller } from 'react-scroller';

<Scroller
  width="100%"
  height="400px"
  options={{
    scrollingX: true,
    scrollingY: true,
    momentum: true
  }}
>
  {/* 您的内容 */}
</Scroller>
                `}</pre>
              </div>
              
              <div className="code-example">
                <h4>使用 Hook API</h4>
                <pre>{`
// 使用 Hook API 进行更灵活的控制
import { useScroller } from 'react-scroller';

function MyComponent() {
  const { store, scrollTo, scrollBy } = useScroller({
    momentum: true,
    wheelScrollSpeed: 8
  });
  
  // 滚动到底部
  const handleScrollToBottom = () => {
    scrollTo(0, store.maxScrollY, true);
  };
  
  return (
    <>
      <button onClick={handleScrollToBottom}>
        滚动到底部
      </button>
      
      <div ref={containerRef}>
        {/* 内容... */}
      </div>
    </>
  );
}
                `}</pre>
              </div>
              
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="content-item">
                  滚动内容项 {i + 1}
                </div>
              ))}
            </div>
          </Scroller>
        </div>
      </section>
      
      <section className="demo-section">
        <h2>平台特定组件</h2>
        <div className="demos-row">
          <div className="demo-half">
            <h3>PC 滚动组件</h3>
            <p>针对鼠标和键盘优化</p>
            <PCScroller
              width="100%"
              height="300px"
              options={{
                scrollingX: true,
                scrollingY: true,
                bounceEnabled: false,
                momentum: true,
                wheelScrollSpeed: 8,
                smoothWheel: true
              }}
            >
              <div className={getContentClass('pc')}>
                <h4>桌面端特性</h4>
                <p>支持键盘导航和滚轮</p>
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="content-item">
                    PC 内容项 {i + 1}
                  </div>
                ))}
              </div>
            </PCScroller>
          </div>
          
          <div className="demo-half">
            <h3>移动端滚动组件</h3>
            <p>针对触摸交互优化</p>
            <MobileScroller
              width="100%"
              height="300px"
              options={{
                scrollingX: true,
                scrollingY: true,
                bounceEnabled: true,
                momentum: true
              }}
            >
              <div className={getContentClass('mobile')}>
                <h4>移动端特性</h4>
                <p>支持触摸滑动和回弹效果</p>
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="content-item">
                    移动端内容项 {i + 1}
                  </div>
                ))}
              </div>
            </MobileScroller>
          </div>
        </div>
      </section>
      
      {/* 添加默认配置示例 */}
      <section className="demo-section">
        <h2>默认配置示例</h2>
        <div className="description">
          <p>不传递任何配置参数，体验组件的默认行为和样式。</p>
        </div>
        <div className="demo-container">
          <Scroller
            width="100%"
            height="300px"
            // 不传任何 options 参数，使用所有默认值
          >
            <div className="content-large theme-purple">
              <h4>默认配置</h4>
              <p>这个示例展示了 Scroller 组件的默认行为：</p>
              <ul className="feature-list">
                <li>默认启用水平和垂直滚动</li>
                <li>默认禁用回弹效果</li>
                <li>默认启用惯性滚动</li>
                <li>默认启用平滑滚轮滚动</li>
                <li>默认使用优化的动画时间</li>
                <li>默认滚轮速度设置为 5</li>
              </ul>
              
              <div className="code-example">
                <h4>最简代码</h4>
                <pre>{`
<Scroller
  width="100%"
  height="300px">
  <div>
    {/* 你的内容 */}
  </div>
</Scroller>
                `}</pre>
              </div>
              
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="content-item">
                  默认配置内容项 {i + 1}
                </div>
              ))}
            </div>
          </Scroller>
        </div>
      </section>
      
      <footer>
        <p>React Scroller - 一个高性能的滚动组件</p>
        <p>支持 PC 和移动端、自定义滚动条和动画</p>
      </footer>
    </div>
  );
}; 