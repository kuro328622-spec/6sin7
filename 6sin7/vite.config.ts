import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'
import { fileURLToPath, URL } from 'node:url'
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // 1. 自动导入 API (如 ref, reactive 等)
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    // 2. 自动按需导入组件 (这步最关键，否则 el-button 只是普通标签)
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    // 3. 自动导入样式 (处理按需引入时的样式问题)
    ElementPlus({}),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@6sin7/markdown-engine': fileURLToPath(new URL('./packages/markdown-engine/src/index.ts', import.meta.url))
    },
  },
  server: {
    port:6742
  }
})