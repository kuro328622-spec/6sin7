import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // 如果报错，请运行 pnpm add -D @types/node
import ElementPlus from 'unplugin-element-plus/vite'
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    ElementPlus({}),
  ],
  resolve: {
    alias: {
      // 告诉 Vite，遇到 @ 就去 src 目录找
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 6742
  }
})