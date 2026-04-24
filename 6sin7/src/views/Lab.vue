<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { MarkdownParser } from '@6sin7/markdown-engine'

const parser = new MarkdownParser()

// ── 主题 ──────────────────────────────────────────────
const isDark = ref(true)
function toggleTheme() {
  isDark.value = !isDark.value
}

// ── localStorage 自动保存 ─────────────────────────────
const STORAGE_KEY = 'minimarkdown-content'
const defaultContent = `# 6sin7 实验室全功能演示

> 这是一个 **手写解析器** 渲染出的引用块。
> 支持样式嵌套，比如 *斜体* 和 **粗体**。

---

### 1. 基础语法测试
* **加粗文字**：使用 \`**内容**\`
* *斜体文字*：使用 \`*内容*\`
* \`行内代码\`：使用反引号
* [项目 GitHub 链接](https://github.com/kuro328622-spec/6sin7)

### 2. 有序列表
1. 第一步：安装依赖
2. 第二步：启动开发服务器
3. 第三步：开始编写

### 3. 表格语法
| 语法 | 示例 | 说明 |
|------|------|------|
| 粗体 | **文字** | 两侧加 ** |
| 斜体 | *文字* | 两侧加 * |
| 删除线 | ~~文字~~ | 两侧加 ~~ |
| 链接 | [文字](url) | 标准链接语法 |

### 4. 代码块
\`\`\`
const parser = new MarkdownParser()
const html = parser.makeHtml('# Hello')
console.log(html)
\`\`\`

### 5. 实时交互与持久化
你在左侧修改任何文字，右侧都会**秒级响应**。
由于实现了 \`localStorage\` 自动保存，即使**刷新页面**，内容也不会丢失。

---
**测试完毕，请开始你的创作！**`

const inputText = ref(localStorage.getItem(STORAGE_KEY) ?? defaultContent)

watch(inputText, (val) => {
  localStorage.setItem(STORAGE_KEY, val)
})

// ── 实时渲染 ──────────────────────────────────────────
const previewHtml = computed(() => parser.makeHtml(inputText.value))

// ── 字数统计 ──────────────────────────────────────────
const charCount = computed(() => inputText.value.length)
const lineCount = computed(() => inputText.value.split('\n').length)

// ── 行号 ──────────────────────────────────────────────
const lineNumbers = computed(() => {
  const count = inputText.value.split('\n').length
  return Array.from({ length: count }, (_, i) => i + 1)
})

// ── Ctrl+B/I/U 快捷键 ────────────────────────────────
const textarea = ref<HTMLTextAreaElement | null>(null)

function wrapSelection(before: string, after: string) {
  const el = textarea.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = inputText.value.slice(start, end)
  const newText =
    inputText.value.slice(0, start) +
    before + selected + after +
    inputText.value.slice(end)
  inputText.value = newText
  nextTick(() => {
    el.selectionStart = start + before.length
    el.selectionEnd = end + before.length
    el.focus()
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (!(e.ctrlKey || e.metaKey)) return
  if (e.key === 'b') { e.preventDefault(); wrapSelection('**', '**') }
  if (e.key === 'i') { e.preventDefault(); wrapSelection('*', '*') }
  if (e.key === 'u') { e.preventDefault(); wrapSelection('~~', '~~') }
}

// ── 拖拽上传图片 ──────────────────────────────────────
const isDragging = ref(false)

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? [])
  const imageFiles = files.filter(f => f.type.startsWith('image/'))
  if (imageFiles.length === 0) return
  imageFiles.forEach(file => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      const mdImage = `![${file.name}](${base64})\n`
      const el = textarea.value
      if (!el) return
      const start = el.selectionStart
      const end = el.selectionEnd
      inputText.value =
        inputText.value.slice(0, start) + mdImage + inputText.value.slice(end)
      nextTick(() => {
        el.selectionStart = start + mdImage.length
        el.selectionEnd = start + mdImage.length
        el.focus()
      })
    }
    reader.readAsDataURL(file)
  })
}

// ── 滚动同步 ──────────────────────────────────────────
const previewRef = ref<HTMLDivElement | null>(null)
const lineNumberRef = ref<HTMLDivElement | null>(null)
let isSyncingScroll = false

function handleEditorScroll() {
  if (isSyncingScroll) return
  const el = textarea.value
  const preview = previewRef.value
  const lineNum = lineNumberRef.value
  if (!el || !preview) return

  isSyncingScroll = true
  const ratio = el.scrollTop / (el.scrollHeight - el.clientHeight || 1)
  preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight)
  if (lineNum) lineNum.scrollTop = el.scrollTop
  requestAnimationFrame(() => { isSyncingScroll = false })
}

// ── HTML 导出 ─────────────────────────────────────────
function exportHtml() {
  const html = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>导出文档</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.75; color: #1e293b; }
    h1 { font-size: 1.875rem; font-weight: 900; margin: 1rem 0; color: #0284c7; }
    h2 { font-size: 1.5rem; font-weight: 900; margin: 1rem 0; color: #0284c7; }
    h3 { font-size: 1.25rem; font-weight: 900; margin: 1rem 0; color: #0284c7; }
    p { margin-bottom: 1rem; }
    li { margin-left: 1.5rem; margin-bottom: 0.5rem; }
    ul li { list-style-type: disc; }
    ol li { list-style-type: decimal; }
    blockquote { border-left: 4px solid #cbd5e1; background: #f1f5f9; padding: 0.5rem 1rem; margin: 1rem 0; font-style: italic; color: #64748b; }
    code { background: #e2e8f0; color: #db2777; padding: 0 4px; border-radius: 4px; font-family: monospace; font-size: 0.875em; }
    pre { background: #e2e8f0; border-radius: 8px; padding: 1rem; margin: 1rem 0; overflow-x: auto; }
    pre code { background: none; padding: 0; color: #1e293b; }
    a { color: #0284c7; text-decoration: underline; }
    del { text-decoration: line-through; color: #64748b; }
    img { max-width: 100%; border-radius: 6px; margin: 1rem 0; display: block; }
    hr { border-color: #cbd5e1; margin: 2rem 0; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th { padding: 8px 12px; border: 1px solid #cbd5e1; background: #f1f5f9; font-weight: 700; text-align: left; color: #0284c7; }
    td { padding: 8px 12px; border: 1px solid #cbd5e1; }
  </style>
</head>
<body>${previewHtml.value}</body>
</html>`
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'document.html'
  a.click()
  URL.revokeObjectURL(url)
}

// ── PDF 导出 ──────────────────────────────────────────
function exportPdf() {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(`<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>导出 PDF</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.75; color: #1e293b; }
    h1 { font-size: 1.875rem; font-weight: 900; margin: 1rem 0; color: #0284c7; }
    h2 { font-size: 1.5rem; font-weight: 900; margin: 1rem 0; color: #0284c7; }
    h3 { font-size: 1.25rem; font-weight: 900; margin: 1rem 0; color: #0284c7; }
    p { margin-bottom: 1rem; }
    li { margin-left: 1.5rem; margin-bottom: 0.5rem; }
    ul li { list-style-type: disc; }
    ol li { list-style-type: decimal; }
    blockquote { border-left: 4px solid #cbd5e1; background: #f1f5f9; padding: 0.5rem 1rem; margin: 1rem 0; font-style: italic; color: #64748b; }
    code { background: #e2e8f0; color: #db2777; padding: 0 4px; border-radius: 4px; font-family: monospace; }
    pre { background: #e2e8f0; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th { padding: 8px 12px; border: 1px solid #cbd5e1; background: #f1f5f9; font-weight: 700; text-align: left; }
    td { padding: 8px 12px; border: 1px solid #cbd5e1; }
    a { color: #0284c7; }
    del { text-decoration: line-through; color: #64748b; }
    img { max-width: 100%; border-radius: 6px; margin: 1rem 0; display: block; }
    hr { border-color: #cbd5e1; margin: 2rem 0; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
${previewHtml.value}
<script>window.onload = () => { window.print(); window.close(); }<\/script>
</body>
</html>`)
  printWindow.document.close()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div :class="isDark ? 'min-h-screen bg-[#0f172a] p-8 font-sans' : 'min-h-screen bg-gray-100 p-8 font-sans'">
    <div class="max-w-7xl mx-auto">

      <!-- 顶部工具栏 -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-4">
          <span class="text-slate-500 text-xs font-mono">MiniMarkdown Editor</span>
          <!-- 字数统计 -->
          <span :class="isDark ? 'text-slate-600 text-xs font-mono' : 'text-slate-400 text-xs font-mono'">
            {{ lineCount }} 行 · {{ charCount }} 字符
          </span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-slate-600 text-xs font-mono hidden sm:inline">
            Ctrl+B 粗体 &nbsp;·&nbsp; Ctrl+I 斜体 &nbsp;·&nbsp; Ctrl+U 删除线
          </span>
          <button
            @click="exportHtml"
            :class="isDark
              ? 'px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-600 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors'
              : 'px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-500 transition-colors'"
          >导出 HTML</button>
          <button
            @click="exportPdf"
            :class="isDark
              ? 'px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-600 text-slate-400 hover:border-violet-500 hover:text-violet-400 transition-colors'
              : 'px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-300 text-slate-600 hover:border-violet-500 hover:text-violet-500 transition-colors'"
          >导出 PDF</button>
          <button
            @click="toggleTheme"
            :class="isDark
              ? 'px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-600 text-slate-400 hover:border-sky-500 hover:text-sky-400 transition-colors'
              : 'px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-300 text-slate-600 hover:border-sky-500 hover:text-sky-500 transition-colors'"
          >{{ isDark ? '☀️ Light' : '🌙 Dark' }}</button>
        </div>
      </div>

      <!-- 编辑器双栏 -->
      <div class="grid grid-cols-2 gap-6">

        <!-- 左侧：行号 + 编辑区 -->
        <div class="flex flex-col gap-2">
          <label :class="isDark ? 'text-slate-500 text-xs font-bold uppercase tracking-widest' : 'text-slate-400 text-xs font-bold uppercase tracking-widest'">
            Markdown Source
          </label>
          <div class="flex rounded-xl overflow-hidden"
            :class="isDark ? 'border border-slate-700' : 'border border-slate-300'"
          >
            <!-- 行号列 -->
            <div
              ref="lineNumberRef"
              class="overflow-hidden select-none flex-shrink-0 text-right pr-3 pl-3"
              :class="isDark ? 'bg-[#161e2e] text-slate-600' : 'bg-slate-100 text-slate-400'"
              style="font-family:monospace;font-size:0.875rem;line-height:1.625rem;min-width:2.5rem;padding-top:1.5rem;padding-bottom:1.5rem;height:600px;overflow-y:hidden"
            >
              <div v-for="n in lineNumbers" :key="n" style="line-height:1.625rem">{{ n }}</div>
            </div>
            <!-- 编辑区 -->
            <textarea
              ref="textarea"
              v-model="inputText"
              @scroll="handleEditorScroll"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleDrop"
              class="h-[600px] w-full p-6 focus:outline-none font-mono resize-none leading-relaxed"
              :class="[
                isDark ? 'bg-[#1e293b] text-slate-300' : 'bg-white text-slate-800',
                isDragging ? 'ring-2 ring-sky-400' : ''
              ]"
              style="font-size:0.875rem;line-height:1.625rem"
            ></textarea>
          </div>
          <span class="text-slate-600 text-xs font-mono">
            💡 可直接拖拽图片到编辑区自动生成 Markdown 链接
          </span>
        </div>

        <!-- 右侧：预览区 -->
        <div class="flex flex-col gap-2">
          <label :class="isDark ? 'text-slate-500 text-xs font-bold uppercase tracking-widest' : 'text-slate-400 text-xs font-bold uppercase tracking-widest'">
            Real-time Preview
          </label>
          <div
            ref="previewRef"
            class="h-[600px] w-full p-8 rounded-xl overflow-y-auto border"
            :class="isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'"
            :style="isDark ? {
              '--md-text': '#cbd5e1',
              '--md-strong': '#ffffff',
              '--md-em': '#e2e8f0',
              '--md-muted': '#94a3b8',
              '--md-heading': '#38bdf8',
              '--md-link': '#38bdf8',
              '--md-border': '#475569',
              '--md-quote-bg': 'rgba(30,41,59,0.5)',
              '--md-code-bg': '#334155',
              '--md-code-text': '#f472b6',
            } : {
              '--md-text': '#1e293b',
              '--md-strong': '#0f172a',
              '--md-em': '#334155',
              '--md-muted': '#64748b',
              '--md-heading': '#0284c7',
              '--md-link': '#0284c7',
              '--md-border': '#cbd5e1',
              '--md-quote-bg': '#f1f5f9',
              '--md-code-bg': '#e2e8f0',
              '--md-code-text': '#db2777',
            }"
            v-html="previewHtml"
          ></div>
        </div>

      </div>
    </div>
  </div>
</template>