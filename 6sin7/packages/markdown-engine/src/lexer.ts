// packages/markdown-engine/src/lexer.ts
import { Token } from './token';

export class Lexer {
  private tokens: Token[] = [];

  lex(text: string): Token[] {
    this.tokens = [];
    // 兼容 Windows (\r\n) 和 Unix (\n) 换行符
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 【关键修改】：不再跳过空行，而是直接处理有内容的行
      if (line.trim() === '') continue; 

      // 1. 处理引用块
      const quoteMatch = line.match(/^> ?(.*)/);
      if (quoteMatch) {
        const qOpen = new Token('blockquote_open', 'blockquote', 1);
        qOpen.map = [i, i + 1];
        qOpen.block = true;
        this.tokens.push(qOpen);
        
        const innerContent = quoteMatch[1];
        const innerListMatch = innerContent.match(/^(\* )(.+)/);
        if (innerListMatch) {
          const liOpen = new Token('list_item_open', 'li', 1);
          liOpen.map = [i, i + 1];
          this.tokens.push(liOpen);
          
          const tInline = new Token('inline', '', 0);
          tInline.content = innerListMatch[2].trim();
          tInline.map = [i, i + 1];
          this.tokens.push(tInline);
          
          this.tokens.push(new Token('list_item_close', 'li', -1));
        } else {
          const tInline = new Token('inline', '', 0);
          tInline.content = innerContent.trim();
          tInline.map = [i, i + 1];
          this.tokens.push(tInline);
        }
        
        this.tokens.push(new Token('blockquote_close', 'blockquote', -1));
        continue;
      }

      // 2. 匹配标题 H1-H3
      const headingMatch = line.match(/^(#{1,3}) (.*)/);
      if (headingMatch) {
        const tag = `h${headingMatch[1].length}`;
        const tOpen = new Token('heading_open', tag, 1);
        tOpen.map = [i, i + 1];
        tOpen.block = true;
        this.tokens.push(tOpen);

        const tInline = new Token('inline', '', 0);
        tInline.content = headingMatch[2].trim();
        tInline.map = [i, i + 1];
        this.tokens.push(tInline);

        this.tokens.push(new Token('heading_close', tag, -1));
        continue;
      }

      // 3. 匹配无序列表
      const listMatch = line.match(/^(\* )(.+)/);
      if (listMatch) {
        const liOpen = new Token('list_item_open', 'li', 1);
        liOpen.map = [i, i + 1];
        liOpen.block = true;
        this.tokens.push(liOpen);

        const tInline = new Token('inline', '', 0);
        tInline.content = listMatch[2].trim();
        tInline.map = [i, i + 1];
        this.tokens.push(tInline);

        this.tokens.push(new Token('list_item_close', 'li', -1));
        continue;
      }

      // 4. 匹配水平线
      if (line.trim() === '---') {
        const hr = new Token('hr', 'hr', 0);
        hr.map = [i, i + 1];
        hr.block = true;
        this.tokens.push(hr);
        continue;
      }

      // 5. 默认段落
      const pOpen = new Token('paragraph_open', 'p', 1);
      pOpen.map = [i, i + 1];
      pOpen.block = true;
      this.tokens.push(pOpen);

      const pInline = new Token('inline', '', 0);
      pInline.content = line.trim();
      pInline.map = [i, i + 1];
      this.tokens.push(pInline);

      this.tokens.push(new Token('paragraph_close', 'p', -1));
    }
    return this.tokens;
  }
}