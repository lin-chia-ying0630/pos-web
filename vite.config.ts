import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    // 單元測試使用 jsdom 模擬瀏覽器環境，E2E 測試則交給 Playwright。
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**', 'storybook-static/**'],
    globals: true,
    css: true
  },
  server: {
    port: 5173,
    // Quick Tunnel 每次會產生不同的 trycloudflare.com 子網域；只允許該網域，不關閉 Host 檢查。
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  }
})
