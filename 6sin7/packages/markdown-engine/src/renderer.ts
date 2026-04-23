// packages/markdown-engine/src/renderer.ts
import { Token } from './token';

export class Renderer {
  /**
   * 行内解析：处理粗体、斜体、代码、链接
   */
// 找到 parseInline 方法，修改链接正则
private parseInline(text: string): string {
  return text
    // 1. 解析粗体
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white px-0.5">$1</strong>')
    // 2. 解析斜体
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-200 px-0.5">$1</em>')
    // 3. 解析行内代码
    .replace(/`(.*?)`/g, '<code class="bg-slate-700 px-1 rounded text-pink-400 font-mono text-sm">$1</code>')
    // 4. 【核心修复】：解析链接，并强行对 URL ($2) 进行 trim()
    .replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
      const cleanUrl = url.trim(); // 彻底干掉 URL 末尾的任何空格
      return `<a href="${cleanUrl}" target="_blank" class="text-sky-400 underline decoration-sky-400/30 hover:text-sky-300 transition-colors">${text}</a>`;
    });
}
  /**
   * 渲染主函数：将 AST 树转换为 HTML 字符串
   * 【核心】：通过递归处理 children 实现无限嵌套支持
   */
  render(tokens: Token[]): string {
    let html = '';
    for (const token of tokens) {
      // 1. 处理行内文本节点
      if (token.type === 'inline') {
        html += this.parseInline(token.content);
        continue;
      }

      // 2. 渲染块级元素的开始标签
      html += this.renderOpenTag(token);

      // 3. 【递归】：如果有子节点，深入渲染子节点
      if (token.children && token.children.length > 0) {
        html += this.render(token.children);
      }

      // 4. 渲染结束标签（仅针对有 nesting=1 的节点）
      if (token.nesting === 1) {
        html += this.renderCloseTag(token);
      }
    }
    return html;
  }

  private renderOpenTag(token: Token): string {
    switch (token.type) {
      case 'heading_open':
        const colorClass = 
          token.tag === 'h1' ? 'text-sky-400 text-3xl' : 
          token.tag === 'h2' ? 'text-emerald-400 text-2xl' : 'text-violet-400 text-xl';
        return `<${token.tag} class="font-black my-4 ${colorClass}">`;
      
      case 'paragraph_open':
        return `<p class="text-slate-300 mb-4 leading-relaxed">`;
      
      case 'list_item_open':
        return `<li class="list-disc list-inside text-slate-300 ml-6 mb-2">`;
      
      case 'blockquote_open':
        return `<blockquote class="border-l-4 border-slate-500 bg-slate-800/50 py-2 px-4 my-4 italic text-slate-400">`;
      
      case 'hr':
        return `<hr class="border-slate-700 my-8">`;
      
      default:
        return '';
    }
  }

  private renderCloseTag(token: Token): string {
    return `</${token.tag}>`;
  }
}
