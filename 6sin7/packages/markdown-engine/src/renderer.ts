import { Token } from './token';

export class Renderer {
  /**
   * 行内解析：处理粗体、斜体、代码、链接
   */
  private parseInline(text: string): string {
    return text
      // 1. 解析粗体: **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white px-0.5">$1</strong>')
      // 2. 解析斜体: *text* (注意：必须放在粗体后面匹配)
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-200 px-0.5">$1</em>')
      // 3. 解析行内代码: `code`
      .replace(/`(.*?)`/g, '<code class="bg-slate-700 px-1 rounded text-pink-400 font-mono text-sm">$1</code>')
      // 4. 解析链接: [text](url)
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-sky-400 underline decoration-sky-400/30 hover:text-sky-300 transition-colors">$1</a>');
  }

  /**
   * 渲染主函数：将 Token 数组转换为 HTML 字符串
   */
  render(tokens: Token[]): string {
    let html = '';

    for (const token of tokens) {
      // 1. 标题渲染
      if (token.type === 'heading_open') {
        const colorClass = 
          token.tag === 'h1' ? 'text-sky-400 text-3xl' : 
          token.tag === 'h2' ? 'text-emerald-400 text-2xl' : 'text-violet-400 text-xl';
        html += `<${token.tag} class="font-black my-4 ${colorClass}">`;
      } 
      else if (token.type === 'heading_close') {
        html += `</${token.tag}>`;
      } 

      // 2. 段落渲染
      else if (token.type === 'paragraph_open') {
        html += `<p class="text-slate-300 mb-4 leading-relaxed">`;
      } 
      else if (token.type === 'paragraph_close') {
        html += `</p>`;
      }

      // 3. 列表项渲染
      else if (token.type === 'list_item_open') {
        html += `<li class="list-disc list-inside text-slate-300 ml-6 mb-2">`;
      } 
      else if (token.type === 'list_item_close') {
        html += `</li>`;
      }

      // 4. 引用块渲染 (新增)
      else if (token.type === 'blockquote_open') {
        html += `<blockquote class="border-l-4 border-slate-500 bg-slate-800/50 py-2 px-4 my-4 italic text-slate-400">`;
      } 
      else if (token.type === 'blockquote_close') {
        html += `</blockquote>`;
      }

      // 5. 水平线渲染 (新增)
      else if (token.type === 'hr') {
        html += `<hr class="border-slate-700 my-8">`;
      }

      // 6. 行内内容处理
      else if (token.type === 'inline') {
        html += this.parseInline(token.content);
      }
    }

    return html;
  }
}