<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// 尝试引入你的自研包
import { MarkdownParser } from '@6sin7/markdown-engine'

const parser = new MarkdownParser()
const inputText = ref(`# 6sin7 实验室全功能演示

> 这是一个 **手写解析器** 渲染出的引用块。
> 支持样式嵌套，比如 *斜体* 和 **粗体**。

---

### 1. 基础语法测试
* **加粗文字**：使用 \`**内容**\`
* *斜体文字*：使用 \`*内容*\`
* \`行内代码\`：使用反引号
* [项目 GitHub 链接](https://github.com/kuro328622-spec/6sin7)

### 2. 块级元素测试
* 上面的 H1, H2, H3 标题
* 你正在看的这个无序列表
* 下方的水平分割线

---

### 3. 实时交互与持久化
你在左侧修改任何文字，右侧都会**秒级响应**。
同时，由于我们实现了 \`localStorage\` 自动保存，即使你**刷新页面**，内容也不会丢失。

---
**测试完毕，请开始你的创作！**`);

// 实时渲染
const previewHtml = computed(() => {
  return parser.makeHtml(inputText.value)
})

onMounted(() => {
  console.log('解析器实例:', parser)
})
</script>

<template>
  <div class="min-h-screen bg-[#0f172a] p-8 font-sans">
    <div class="max-w-6xl mx-auto grid grid-cols-2 gap-6">
      <div class="flex flex-col gap-2">
        <label class="text-slate-500 text-xs font-bold uppercase tracking-widest">Markdown Source</label>
        <textarea
          v-model="inputText"
          class="h-[600px] w-full p-6 bg-[#1e293b] text-slate-300 border border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 font-mono leading-relaxed"
        ></textarea>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-slate-500 text-xs font-bold uppercase tracking-widest">Real-time Preview</label>
        <div 
          class="h-[600px] w-full p-8 bg-slate-900/50 border border-slate-800 rounded-xl overflow-y-auto"
          v-html="previewHtml"
        ></div>
      </div>
    </div>
  </div>
</template>