import React from 'react';
import { Scroller } from '../../';

/**
 * 最简单的使用示例 - 完全使用默认配置
 */
export const BasicExample: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>基础用法</h2>
      <p>这个示例展示了 Scroller 的最小化用法，所有参数都使用默认值。</p>
      
      <Scroller
        width="100%"
        height="400px"
      >
        <div style={{ 
          padding: '20px', 
          background: 'linear-gradient(135deg, #EBF4FF 0%, #C3DAFE 100%)',
          minWidth: '800px'
        }}>
          <h3>只需设置宽度和高度</h3>
          <p>
            Scroller 组件开箱即用，拥有良好的默认配置。
            只需设置容器宽度和高度，即可获得高性能的滚动体验。
          </p>
          
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              style={{
                margin: '10px 0',
                padding: '15px',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              内容项 {i + 1}
            </div>
          ))}
        </div>
      </Scroller>
      
      <h3>代码示例</h3>
      <pre
        style={{
          background: '#f8f9fb',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto'
        }}
      >{`
import React from 'react';
import { Scroller } from 'react-scroller';

function MyComponent() {
  return (
    <Scroller
      width="100%"
      height="400px"
    >
      <div>
        {/* 你的内容 */}
        {items.map(item => (
          <div key={item.id}>{item.content}</div>
        ))}
      </div>
    </Scroller>
  );
}
      `}</pre>
    </div>
  );
}; 