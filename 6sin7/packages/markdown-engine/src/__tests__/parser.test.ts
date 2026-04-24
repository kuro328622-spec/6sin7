// packages/markdown-engine/src/__tests__/parser.test.ts
import { describe, it, expect } from 'vitest';
import { MarkdownParser } from '../index';

describe('Markdown Engine 核心解析测试', () => {
  const parser = new MarkdownParser();

  // ── 原有测试 ──────────────────────────────────────────

  it('1. 基础标题解析：应生成正确的 H1 标签', () => {
    const html = parser.makeHtml('# Hello World');
    expect(html).toContain('<h1');
    expect(html).toContain('Hello World');
  });

  it('2. 嵌套语法支持：引用块内嵌套列表', () => {
    const html = parser.makeHtml('> * 嵌套项');
    expect(html).toContain('<blockquote');
    expect(html).toContain('<li');
    expect(html).toContain('嵌套项');
    const bqOpenIndex = html.indexOf('<blockquote');
    const liIndex = html.indexOf('<li');
    const bqCloseIndex = html.indexOf('</blockquote>');
    expect(bqOpenIndex).toBeLessThan(liIndex);
    expect(liIndex).toBeLessThan(bqCloseIndex);
  });

  it('3. 行内样式解析：粗体与链接', () => {
    const html = parser.makeHtml('这是 **加粗** 和 [链接](https://google.com )');
    expect(html).toContain('<strong');
    expect(html).toContain('加粗');
    expect(html).toContain('href="https://google.com"');
  });

  it('4. AST 结构验证：确保 Parser 正确构建了树', () => {
    // @ts-ignore
    const tokens = parser['lexer'].lex('# Title');
    // @ts-ignore
    const ast = parser['parser'].parse(tokens);
    expect(ast.length).toBe(1);
    expect(ast[0].type).toBe('heading_open');
    expect(ast[0].children).not.toBeNull();
    expect(ast[0].children!.length).toBe(1);
    expect(ast[0].children![0].type).toBe('inline');
    expect(ast[0].children![0].content).toBe('Title');
  });

  it('5. 增量解析坐标验证：检查 map 属性', () => {
    // @ts-ignore
    const tokens = parser['lexer'].lex('Line 1\n\nLine 3');
    const pTokens = tokens.filter((t: { type: string }) => t.type === 'paragraph_open');
    expect(pTokens[0].map).not.toBeNull();
    expect(pTokens[0].map).toEqual([0, 1]);
    expect(pTokens[1].map).not.toBeNull();
    expect(pTokens[1].map).toEqual([2, 3]);
  });

  // ── 行内语法测试 ──────────────────────────────────────

  it('6. 删除线：~~text~~ 应渲染为 del 标签', () => {
    const html = parser.makeHtml('~~删除的文字~~');
    expect(html).toContain('<del');
    expect(html).toContain('line-through');
    expect(html).toContain('删除的文字');
  });

  it('7. 斜体：*text* 应渲染为 em 标签', () => {
    const html = parser.makeHtml('*斜体文字*');
    expect(html).toContain('<em');
    expect(html).toContain('斜体文字');
  });

  it('8. 行内代码：`code` 应渲染为 code 标签', () => {
    const html = parser.makeHtml('这是 `inline code` 示例');
    expect(html).toContain('<code');
    expect(html).toContain('inline code');
  });

  it('9. 粗体与删除线混用：不互相干扰', () => {
    const html = parser.makeHtml('**粗体** 和 ~~删除~~');
    expect(html).toContain('<strong');
    expect(html).toContain('<del');
  });

  // ── 块级语法测试 ──────────────────────────────────────

  it('10. 无序列表：* 开头应渲染为 li 标签（bullet 类型）', () => {
    const html = parser.makeHtml('* 列表项一\n* 列表项二');
    expect(html).toContain('<li');
    expect(html).toContain('list-style-type:disc');
    expect(html).toContain('列表项一');
    expect(html).toContain('列表项二');
  });

  it('11. 有序列表：1. 开头应渲染为 li 标签（decimal 类型）', () => {
    const html = parser.makeHtml('1. 第一项\n2. 第二项\n3. 第三项');
    expect(html).toContain('<li');
    expect(html).toContain('list-style-type:decimal');
    expect(html).toContain('第一项');
    expect(html).toContain('第二项');
    expect(html).toContain('第三项');
  });

  it('12. 有序列表与无序列表：list-style 类型不同', () => {
    const orderedHtml = parser.makeHtml('1. 有序项');
    const unorderedHtml = parser.makeHtml('* 无序项');
    expect(orderedHtml).toContain('list-style-type:decimal');
    expect(unorderedHtml).toContain('list-style-type:disc');
  });

  it('13. 图片（块级）：独占一行的 ![alt](url) 应渲染为 img 标签', () => {
    const html = parser.makeHtml('![示例图片](https://example.com/img.png)');
    expect(html).toContain('<img');
    expect(html).toContain('src="https://example.com/img.png"');
    expect(html).toContain('alt="示例图片"');
  });

  it('14. 图片（行内）：段落内的 ![alt](url) 应正确渲染', () => {
    const html = parser.makeHtml('这是一张图片 ![logo](https://example.com/logo.png) 在段落中');
    expect(html).toContain('<img');
    expect(html).toContain('src="https://example.com/logo.png"');
  });

  it('15. 代码块：``` 包裹的内容应渲染为 pre>code', () => {
    const input = '```\nconst x = 1\nconsole.log(x)\n```';
    const html = parser.makeHtml(input);
    expect(html).toContain('<pre');
    expect(html).toContain('<code');
    expect(html).toContain('const x = 1');
    expect(html).toContain('console.log(x)');
  });

  it('16. 代码块：内容不应被行内规则解析（* 不变成 em）', () => {
    const input = '```\n**不应加粗** ~~不应删除线~~\n```';
    const html = parser.makeHtml(input);
    expect(html).not.toContain('<strong');
    expect(html).not.toContain('<del');
  });

  it('17. 水平线：--- 应渲染为 hr 标签', () => {
    const html = parser.makeHtml('---');
    expect(html).toContain('<hr');
  });

  it('18. 标题层级：H1/H2/H3 字号不同', () => {
    const h1 = parser.makeHtml('# 一级标题');
    const h2 = parser.makeHtml('## 二级标题');
    const h3 = parser.makeHtml('### 三级标题');
    expect(h1).toContain('1.875rem');
    expect(h2).toContain('1.5rem');
    expect(h3).toContain('1.25rem');
  });

  // ── 边界情况测试 ──────────────────────────────────────

  it('19. 空字符串：不应报错，返回空字符串', () => {
    const html = parser.makeHtml('');
    expect(html).toBe('');
  });

  it('20. 多空行：空行应被跳过，不产生多余标签', () => {
    const html = parser.makeHtml('第一段\n\n\n\n第二段');
    const pCount = (html.match(/<p/g) || []).length;
    expect(pCount).toBe(2);
  });

  it('21. 链接 URL 末尾空格应被清除', () => {
    const html = parser.makeHtml('[链接](https://example.com )');
    expect(html).toContain('href="https://example.com"');
    expect(html).not.toContain('href="https://example.com "');
  });

  // ── 表格测试 ──────────────────────────────────────────

  it('22. 表格：基础三列表格应渲染为 table/thead/tbody', () => {
    const input = `| 姓名 | 年龄 | 城市 |\n|------|------|------|\n| 张三 | 18 | 北京 |\n| 李四 | 20 | 上海 |`;
    const html = parser.makeHtml(input);
    expect(html).toContain('<table');
    expect(html).toContain('<thead');
    expect(html).toContain('<tbody');
    expect(html).toContain('<th');
    expect(html).toContain('<td');
  });

  it('23. 表格：表头内容正确渲染', () => {
    const input = `| 名称 | 价格 |\n|------|------|\n| 苹果 | 5元 |`;
    const html = parser.makeHtml(input);
    expect(html).toContain('名称');
    expect(html).toContain('价格');
  });

  it('24. 表格：数据行内容正确渲染', () => {
    const input = `| 名称 | 价格 |\n|------|------|\n| 苹果 | 5元 |\n| 香蕉 | 3元 |`;
    const html = parser.makeHtml(input);
    expect(html).toContain('苹果');
    expect(html).toContain('5元');
    expect(html).toContain('香蕉');
    expect(html).toContain('3元');
  });

  it('25. 表格：单元格内支持行内语法（粗体）', () => {
    const input = `| 名称 | 说明 |\n|------|------|\n| **重要** | 测试 |`;
    const html = parser.makeHtml(input);
    expect(html).toContain('<strong');
    expect(html).toContain('重要');
  });
});