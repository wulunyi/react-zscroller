import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// 在 ESM 中获取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactScroller',
      fileName: 'react-scroller'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'mobx', 'mobx-react-lite'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'mobx': 'mobx',
          'mobx-react-lite': 'mobxReactLite'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  // 添加开发服务器配置
  server: {
    port: 3000,
    open: true
  }
})
