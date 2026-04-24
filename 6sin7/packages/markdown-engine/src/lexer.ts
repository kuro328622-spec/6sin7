// packages/markdown-engine/src/lexer.ts
import { Token } from './token';

export class Lexer {
  private tokens: Token[] = [];

  lex(text: string): Token[] {
    this.tokens = [];
    const lines = text.split(/\r?\n/);
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 跳过空行
      if (line.trim() === '') {
        i++;
        continue;
      }

      // 1. 代码块 ```
      if (line.trim().startsWith('```')) {
        const lang = line.trim().slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        const codeOpen = new Token('code_block_open', 'pre', 1);
        codeOpen.map = [i, i + 1];
        codeOpen.block = true;
        codeOpen.markup = lang;
        this.tokens.push(codeOpen);

        const codeInline = new Token('inline', '', 0);
        codeInline.content = codeLines.join('\n');
        codeInline.map = [i, i + 1];
        codeInline.markup = 'code_block';
        this.tokens.push(codeInline);

        this.tokens.push(new Token('code_block_close', 'pre', -1));
        i++;
        continue;
      }

      // 2. 表格：检测到 | 开头且下一行是分隔行（|---|---|）
      if (line.trim().startsWith('|') && i + 1 < lines.length) {
        const nextLine = lines[i + 1]?.trim() ?? '';
        const isSeparator = /^\|[-| :]+\|$/.test(nextLine);
        if (isSeparator) {
          // 解析表头
          const headers = this.parseTableRow(line);
          i += 2; // 跳过表头行和分隔行

          // 解析数据行
          const rows: string[][] = [];
          while (i < lines.length && lines[i].trim().startsWith('|')) {
            rows.push(this.parseTableRow(lines[i]));
            i++;
          }

          const tableToken = new Token('table', 'table', 0);
          tableToken.block = true;
          tableToken.map = [i, i + 1];
          // 把表头和数据行存进 content（JSON 序列化）
          tableToken.content = JSON.stringify({ headers, rows });
          this.tokens.push(tableToken);
          continue;
        }
      }

      // 3. 引用块
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
        i++;
        continue;
      }

      // 4. 标题 H1-H3
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
        i++;
        continue;
      }

      // 5. 无序列表
      const unorderedMatch = line.match(/^(\* )(.+)/);
      if (unorderedMatch) {
        const liOpen = new Token('list_item_open', 'li', 1);
        liOpen.map = [i, i + 1];
        liOpen.block = true;
        liOpen.markup = 'bullet';
        this.tokens.push(liOpen);

        const tInline = new Token('inline', '', 0);
        tInline.content = unorderedMatch[2].trim();
        tInline.map = [i, i + 1];
        this.tokens.push(tInline);

        this.tokens.push(new Token('list_item_close', 'li', -1));
        i++;
        continue;
      }

      // 6. 有序列表
      const orderedMatch = line.match(/^(\d+)\. (.+)/);
      if (orderedMatch) {
        const liOpen = new Token('list_item_open', 'li', 1);
        liOpen.map = [i, i + 1];
        liOpen.block = true;
        liOpen.markup = 'ordered';
        liOpen.content = orderedMatch[1];
        this.tokens.push(liOpen);

        const tInline = new Token('inline', '', 0);
        tInline.content = orderedMatch[2].trim();
        tInline.map = [i, i + 1];
        this.tokens.push(tInline);

        this.tokens.push(new Token('list_item_close', 'li', -1));
        i++;
        continue;
      }

      // 7. 水平线
      if (line.trim() === '---') {
        const hr = new Token('hr', 'hr', 0);
        hr.map = [i, i + 1];
        hr.block = true;
        this.tokens.push(hr);
        i++;
        continue;
      }

      // 8. 图片 ![alt](url) — 独占一行时作为块级处理
      const imgMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imgMatch) {
        const img = new Token('image', 'img', 0);
        img.map = [i, i + 1];
        img.block = true;
        img.content = imgMatch[1];
        img.markup = imgMatch[2];
        this.tokens.push(img);
        i++;
        continue;
      }

      // 9. 默认段落
      const pOpen = new Token('paragraph_open', 'p', 1);
      pOpen.map = [i, i + 1];
      pOpen.block = true;
      this.tokens.push(pOpen);

      const pInline = new Token('inline', '', 0);
      pInline.content = line.trim();
      pInline.map = [i, i + 1];
      this.tokens.push(pInline);

      this.tokens.push(new Token('paragraph_close', 'p', -1));
      i++;
    }

    return this.tokens;
  }

  // 解析一行表格：| 列1 | 列2 | 列3 | → ['列1', '列2', '列3']
  private parseTableRow(line: string): string[] {
    return line
      .trim()
      .replace(/^\||\|$/g, '') // 去掉首尾的 |
      .split('|')
      .map(cell => cell.trim());
  }
}