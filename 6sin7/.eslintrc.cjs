module.exports = {
  // 环境配置：支持浏览器和 Node.js（Vite 环境需要）
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  // 扩展规则集
  extends: [
    'eslint:recommended', // ESLint 官方推荐规则
    'plugin:vue/vue3-recommended', // Vue 3 推荐规则（最严格级别）
    'plugin:@typescript-eslint/recommended', // TS 推荐规则
    'prettier' // 必须放在最后！用于关闭与 Prettier 冲突的格式规则
  ],
  // 解析器配置
  parser: 'vue-eslint-parser', // 首先使用 vue 解析器
  parserOptions: {
    parser: '@typescript-eslint/parser', // 对于 <script> 标签内的代码使用 TS 解析器
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['vue', '@typescript-eslint'],
  // 自定义规则定义 (0: off, 1: warn, 2: error)
  rules: {
    // Vue 相关规则
    'vue/multi-word-component-names': 'off', // 允许单个单词命名组件（如 Index.vue）
    'vue/no-v-html': 'off', // 后面你要做 Markdown 渲染，需要用到 v-html

    // TypeScript 相关规则
    '@typescript-eslint/no-explicit-any': 'warn', // 尽量避免使用 any，但先给个警告
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // 没用的变量报错，除非以 _ 开头

    // 通用逻辑规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
