import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // 强制使用空字符串，确保请求走 Vite 代理
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(''),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 16888,
    host: true,
    open: true,
    proxy: {
      '/api': {
        // 开发环境使用本地后端
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
})
