import React, { useEffect, useRef } from 'react'
import './App.css'

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<ZScroller | null>(null)

  return (
    <div ref={containerRef} style={{ 
      height: '400px', 
      width: '500px',
      overflow: 'hidden',
      position: 'relative',
      border: '1px solid #ccc',
      margin: '20px'
    }}>
      <div style={{ 
        height: '1000px', 
        width: '1000px',
        background: 'linear-gradient(45deg, #f0f0f0 25%, #e0e0e0 25%, #e0e0e0 50%, #f0f0f0 50%, #f0f0f0 75%, #e0e0e0 75%)',
        backgroundSize: '40px 40px',
        padding: '20px'
      }}>
        <h2>滚动内容</h2>
        <p>可以上下左右滚动查看更多内容</p>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ margin: '10px 0' }}>
            这是第 {i + 1} 行内容
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
