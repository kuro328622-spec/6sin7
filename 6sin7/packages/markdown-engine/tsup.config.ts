import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'], // 同时输出 CJS 和 ESM
  dts: true,             // 生成 .d.ts 类型文件
  splitting: false,
  sourcemap: true,
  clean: true,
})