// packages/markdown-engine/src/renderer.ts
import { Token } from './token';

export class Renderer {
  /**
   * 行内解析：处理删除线、粗体、斜体、代码、链接、行内图片
   */
  private parseInline(text: string): string {
    return text
      // 1. 解析删除线（必须最先，避免被 * 规则干扰）
      .replace(/~~(.*?)~~/g, '<del style="text-decoration:line-through;color:var(--md-muted)">$1</del>')
      // 2. 解析粗体
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:700;color:var(--md-strong)">$1</strong>')
      // 3. 解析斜体
      .replace(/\*(.*?)\*/g, '<em style="font-style:italic;color:var(--md-em)">$1</em>')
      // 4. 解析行内代码
      .replace(/`(.*?)`/g, '<code style="background:var(--md-code-bg);color:var(--md-code-text);padding:0 4px;border-radius:4px;font-family:monospace;font-size:0.875em">$1</code>')
      // 5. 解析行内图片（段落内的图片）
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
        return `<img src="${url.trim()}" alt="${alt}" style="max-width:100%;border-radius:6px;margin:4px 0">`
      })
      // 6. 解析链接
      .replace(/\[(.*?)\]\((.*?)\)/g, (_, linkText, url) => {
        const cleanUrl = url.trim();
        return `<a href="${cleanUrl}" target="_blank" style="color:var(--md-link);text-decoration:underline">${linkText}</a>`;
      });
  }

  /**
   * 渲染主函数：将 AST 树转换为 HTML 字符串
   */
  render(tokens: Token[]): string {
    let html = '';
    for (const token of tokens) {
      // 1. 行内文本节点
      if (token.type === 'inline') {
        if (token.markup === 'code_block') {
          // 代码块内容直接输出，不经过 parseInline
          html += token.content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
        } else {
          html += this.parseInline(token.content)
        }
        continue;
      }

      // 2. 自闭合块级元素（无子节点）
      if (token.nesting === 0) {
        html += this.renderSelfClosing(token);
        continue;
      }

      // 3. 渲染开始标签
      html += this.renderOpenTag(token);

      // 4. 递归渲染子节点
      if (token.children && token.children.length > 0) {
        html += this.render(token.children);
      }

      // 5. 渲染结束标签
      if (token.nesting === 1) {
        html += this.renderCloseTag(token);
      }
    }
    return html;
  }

  private renderSelfClosing(token: Token): string {
    switch (token.type) {
      case 'hr':
        return `<hr style="border-color:var(--md-border);margin:2rem 0">`

      case 'image':
        return `<img src="${token.markup}" alt="${token.content}" style="max-width:100%;border-radius:6px;margin:1rem 0;display:block">`

      case 'table': {
        const { headers, rows } = JSON.parse(token.content) as {
          headers: string[]
          rows: string[][]
        }
        const thCells = headers
          .map(h => `<th style="padding:8px 12px;border:1px solid var(--md-border);background:var(--md-quote-bg);color:var(--md-heading);font-weight:700;text-align:left">${this.parseInline(h)}</th>`)
          .join('')
        const bodyRows = rows
          .map(row => {
            const tds = row
              .map(cell => `<td style="padding:8px 12px;border:1px solid var(--md-border);color:var(--md-text)">${this.parseInline(cell)}</td>`)
              .join('')
            return `<tr>${tds}</tr>`
          })
          .join('')
        return `<table style="border-collapse:collapse;width:100%;margin:1rem 0">
  <thead><tr>${thCells}</tr></thead>
  <tbody>${bodyRows}</tbody>
</table>`
      }

      default:
        return ''
    }
  }

  private renderOpenTag(token: Token): string {
    switch (token.type) {
      case 'heading_open': {
        const size =
          token.tag === 'h1' ? '1.875rem' :
          token.tag === 'h2' ? '1.5rem' : '1.25rem'
        return `<${token.tag} style="font-weight:900;margin:1rem 0;font-size:${size};color:var(--md-heading)">`
      }

      case 'paragraph_open':
        return `<p style="color:var(--md-text);margin-bottom:1rem;line-height:1.75">`

      case 'list_item_open':
        if (token.markup === 'ordered') {
          return `<li style="color:var(--md-text);margin-left:1.5rem;margin-bottom:0.5rem;list-style-type:decimal">`
        }
        return `<li style="color:var(--md-text);margin-left:1.5rem;margin-bottom:0.5rem;list-style-type:disc">`

      case 'blockquote_open':
        return `<blockquote style="border-left:4px solid var(--md-border);background:var(--md-quote-bg);padding:0.5rem 1rem;margin:1rem 0;font-style:italic;color:var(--md-muted)">`

      case 'code_block_open':
        return `<pre style="background:var(--md-code-bg);border-radius:8px;padding:1rem;margin:1rem 0;overflow-x:auto"><code style="color:var(--md-code-text);font-family:monospace;font-size:0.875em;white-space:pre">`

      default:
        return ''
    }
  }

  private renderCloseTag(token: Token): string {
    if (token.type === 'code_block_open') {
      return `</code></pre>`
    }
    return `</${token.tag}>`
  }
}