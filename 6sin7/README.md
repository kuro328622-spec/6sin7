# MiniMarkdown Editor

不依赖任何第三方解析库，从零手写 Markdown 解析器并独立发布为 npm 包，编辑器以 npm 依赖方式引入解析器，实现解析与渲染工程解耦。

---

## 技术栈

- **编辑器**：Vue 3 · TypeScript · Vite · Tailwind CSS v4
- **解析引擎**：纯 TypeScript，零依赖，独立 npm 包（ESM + CJS 双格式）
- **测试**：Vitest 单元测试（25 个用例）
- **工程规范**：pnpm Monorepo · Husky · ESLint · Prettier · commitizen

---

## 项目结构

```
6sin7/
├── src/                        # 编辑器前端（Vue 3）
│   └── views/Lab.vue           # 核心编辑器页面
└── packages/
    └── markdown-engine/        # 自研解析引擎（独立 npm 包）
        └── src/
            ├── lexer.ts        # 词法分析：Text → Token 流
            ├── parser.ts       # 语法分析：Token 流 → AST
            ├── renderer.ts     # 渲染：AST → HTML
            └── token.ts        # Token 数据结构定义
```

---

## 解析器架构

解析器采用经典的四层管线设计：

```
Markdown 文本
    ↓  Lexer（词法分析）
  Token 流
    ↓  Parser（语法分析）
    AST
    ↓  Renderer（渲染）
  HTML 字符串
```

### 支持的语法

| 语法 | 示例 |
|------|------|
| 标题 H1-H3 | `# H1` `## H2` `### H3` |
| 粗体 | `**粗体**` |
| 斜体 | `*斜体*` |
| 删除线 | `~~删除线~~` |
| 行内代码 | `` `code` `` |
| 代码块 | ```` ``` ```` 多行代码块 |
| 链接 | `[文字](url)` |
| 图片 | `![alt](url)` |
| 无序列表 | `* 列表项` |
| 有序列表 | `1. 列表项` |
| 引用块 | `> 引用内容` |
| 水平线 | `---` |
| 表格 | `\| 列1 \| 列2 \|` |

---

## 编辑器功能

- **实时预览**：左侧编辑，右侧即时渲染
- **快捷键**：`Ctrl+B` 粗体 · `Ctrl+I` 斜体 · `Ctrl+U` 删除线
- **主题切换**：深色 / 浅色模式
- **自动保存**：内容写入 localStorage，刷新不丢失
- **拖拽上传**：图片拖入编辑区自动生成 Markdown 链接
- **导出**：支持导出为 HTML 文件或打印为 PDF
- **行号显示**：左侧实时行号，随滚动同步
- **字数统计**：顶部实时显示行数与字符数
- **滚动同步**：编辑区与预览区滚动位置联动

---

## 本地运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行单元测试
cd packages/markdown-engine
pnpm test

# 构建解析引擎包
pnpm build
```

---

## npm 包发布

解析引擎以独立 npm 包形式发布，同时支持 ESM 和 CJS 两种格式：

```ts
// ESM
import { MarkdownParser } from '@6sin7/markdown-engine'

// CJS
const { MarkdownParser } = require('@6sin7/markdown-engine')

const parser = new MarkdownParser()
const html = parser.makeHtml('# Hello World')
```

编辑器通过 pnpm workspace 以 `workspace:*` 方式引入，本地开发时直接指向源码，无需发布。