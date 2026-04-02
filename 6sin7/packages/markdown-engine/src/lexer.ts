import { Token } from './token';

export class Lexer {
  private tokens: Token[] = [];

lex(text: string): Token[] {
    this.tokens = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 1. 匹配标题 H1-H3
      const headingMatch = line.match(/^(#{1,3}) (.*)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const tag = `h${level}`;
        const tOpen = new Token('heading_open', tag, 1);
        tOpen.markup = headingMatch[1];
        tOpen.map = [i, i + 1];
        this.tokens.push(tOpen);

        const tInline = new Token('inline', '', 0);
        tInline.content = headingMatch[2];
        tInline.level = 1;
        this.tokens.push(tInline);

        this.tokens.push(new Token('heading_close', tag, -1));
        continue;
      }

      // 2. 匹配无序列表 (* 列表项)
      const listMatch = line.match(/^(\* )(.+)/);
      if (listMatch) {
        const liOpen = new Token('list_item_open', 'li', 1);
        liOpen.map = [i, i + 1];
        this.tokens.push(liOpen);

        const liInline = new Token('inline', '', 0);
        liInline.content = listMatch[2];
        liInline.level = 1;
        this.tokens.push(liInline);

        this.tokens.push(new Token('list_item_close', 'li', -1));
        continue; 
      }

      // 3. 匹配引用块 (> 内容) —— 注意：这里是在 listMatch 的括号外面
      const quoteMatch = line.match(/^> (.*)/);
      if (quoteMatch) {
        this.tokens.push(new Token('blockquote_open', 'blockquote', 1));
        
        const qInline = new Token('inline', '', 0);
        qInline.content = quoteMatch[1];
        qInline.level = 1;
        this.tokens.push(qInline);

        this.tokens.push(new Token('blockquote_close', 'blockquote', -1));
        continue;
      }

      // 4. 匹配水平线 (---)
      if (line.trim() === '---') {
        this.tokens.push(new Token('hr', 'hr', 0));
        continue;
      }

      // 5. 匹配空行
      if (!line.trim()) continue;

      // 6. 默认段落
      const pOpen = new Token('paragraph_open', 'p', 1);
      pOpen.map = [i, i + 1];
      this.tokens.push(pOpen);

      const pInline = new Token('inline', '', 0);
      pInline.content = line;
      pInline.level = 1;
      this.tokens.push(pInline);

      this.tokens.push(new Token('paragraph_close', 'p', -1));
    }

    return this.tokens;
  }
}