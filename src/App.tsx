import React from 'react'
import { ZScrollerX } from './zscrollerx'
import './App.css'

// 修改后的样式
const zscrollerxStyles = `
  .zscrollerx-container {
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    position: relative;
  }
  
  .zscrollerx-scrollbar {
    position: absolute;
    z-index: 100;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    transition: opacity 0.3s;
  }
  
  .zscrollerx-scrollbar-x {
    left: 2px;
    bottom: 2px;
    right: 2px;
    height: 8px;
  }
  
  .zscrollerx-scrollbar-y {
    top: 2px;
    right: 2px;
    bottom: 2px;
    width: 8px;
  }
  
  .zscrollerx-indicator {
    position: absolute;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 3px;
    cursor: pointer;
    transition: transform 0.1s;
  }
  
  .zscrollerx-scrollbar-x .zscrollerx-indicator {
    height: 100%;
    left: 0;
  }
  
  .zscrollerx-scrollbar-y .zscrollerx-indicator {
    width: 100%;
    top: 0;
  }
  
  .zscrollerx-scrollbar.visible {
    opacity: 1 !important;
  }
  
  .zscrollerx-indicator:hover {
    background: rgba(0, 0, 0, 0.6) !important;
  }
  
  .zscrollerx-indicator:active {
    background: rgba(0, 0, 0, 0.75) !important;
  }
  
  .zscrollerx-scrollbar:hover {
    opacity: 1 !important;
  }
`;

const App: React.FC = () => {
  return (
    <div>
      {/* 添加样式 */}
      <style>{zscrollerxStyles}</style>
      
      <h2>改进版 ZScrollerX</h2>
      <ZScrollerX 
        height="400px"
        width="500px"
        style={{
          border: '1px solid #ccc',
          margin: '20px'
        }}
        options={{
          scrollingX: true,
          scrollingY: true,
          bounceEnabled: false,
          onScroll: (x, y) => console.log('滚动位置:', x, y)
        }}
      >
        <div style={{ 
          height: '1000px', 
          width: '1000px',
          background: 'linear-gradient(45deg, #f0f0f0 25%, #e0e0e0 25%, #e0e0e0 50%, #f0f0f0 50%, #f0f0f0 75%, #e0e0e0 75%)',
          backgroundSize: '40px 40px',
          padding: '20px'
        }}>
          <h2>ZScrollerX 内容</h2>
          <p>基于 mobx 实现的滚动组件</p>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{ margin: '10px 0' }}>
              ZScrollerX 中的第 {i + 1} 行内容
            </div>
          ))}
        </div>
      </ZScrollerX>
    </div>
  )
}

export default App
