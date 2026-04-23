// packages/markdown-engine/src/__tests__/parser.test.ts
import { describe, it, expect } from 'vitest';
import { MarkdownParser } from '../index';

describe('Markdown Engine 核心解析测试', () => {
  const parser = new MarkdownParser();

  it('1. 基础标题解析：应生成正确的 H1 标签', () => {
    const input = '# Hello World';
    const html = parser.makeHtml(input);
    expect(html).toContain('<h1');
    expect(html).toContain('Hello World');
    expect(html).toContain('text-sky-400'); // 验证 Tailwind 样式是否注入
  });

  it('2. 嵌套语法支持：引用块内嵌套列表', () => {
    const input = '> * 嵌套项';
    const html = parser.makeHtml(input);
    
    // 验证嵌套结构：blockquote 应该包含 li 标签
    expect(html).toContain('<blockquote');
    expect(html).toContain('<li');
    expect(html).toContain('嵌套项');
    
    // 深度验证：li 标签是否在 blockquote 闭合之前出现
    const bqOpenIndex = html.indexOf('<blockquote');
    const liIndex = html.indexOf('<li');
    const bqCloseIndex = html.indexOf('</blockquote>');
    expect(bqOpenIndex).toBeLessThan(liIndex);
    expect(liIndex).toBeLessThan(bqCloseIndex);
  });

// packages/markdown-engine/src/__tests__/parser.test.ts

  it('3. 行内样式解析：粗体与链接', () => {
    // 确保这里没有多余的空格干扰
    const input = '这是 **加粗** 和 [链接](https://google.com )'; 
    const html = parser.makeHtml(input);
    
    expect(html).toContain('<strong');
    expect(html).toContain('加粗');
    // 这里的断言也要精准
    expect(html).toContain('href="https://google.com"' );
  });


  it('4. AST 结构验证：确保 Parser 正确构建了树', () => {
    // 我们可以直接测试内部的 Lexer 和 Parser 逻辑
    // @ts-ignore (通过访问私有成员进行深度 AST 结构测试)
    const tokens = parser['lexer'].lex('# Title');
    // @ts-ignore
    const ast = parser['parser'].parse(tokens);
    
    // 验证 AST 根节点
    expect(ast.length).toBe(1);
    expect(ast[0].type).toBe('heading_open');
    // 核心验证：标题内容是否作为 children 存在（证明了 AST 的层级关系）
    expect(ast[0].children).not.toBeNull();
    expect(ast[0].children!.length).toBe(1);
    expect(ast[0].children![0].type).toBe('inline');
    expect(ast[0].children![0].content).toBe('Title');
  });

  it('5. 增量解析坐标验证：检查 map 属性', () => {
    const input = 'Line 1\n\nLine 3';
    // @ts-ignore
    const tokens = parser['lexer'].lex(input);
    
    // 过滤掉空行，找到段落 Token
    const pTokens = tokens.filter(t => t.type === 'paragraph_open');
    
    // 核心验证：确保 map 属性不为 null 且坐标正确
    expect(pTokens[0].map).not.toBeNull();
    expect(pTokens[0].map).toEqual([0, 1]); 
    
    expect(pTokens[1].map).not.toBeNull();
    expect(pTokens[1].map).toEqual([2, 3]); 
  });
});
