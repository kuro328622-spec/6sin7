// packages/markdown-engine/src/token.ts
export type Nesting = 1 | 0 | -1; // 1: 开始标签, 0: 自闭合, -1: 结束标签

export class Token {
  type: string;      // 例如: 'heading_open', 'paragraph_close', 'inline'
  tag: string;       // 例如: 'h1', 'p', 'strong'
  nesting: Nesting;  // 层级状态
  level: number;     // 嵌套深度
  content: string;   // 文本内容
  markup: string;    // 原始符号，如 '#' 或 '**'
  children: Token[] | null = null; // 【关键】用于存放子节点，构建 AST 树
  block: boolean;    // 是否为块级元素
  map: [number, number] | null = null; // 【核心】记录源代码行号 [start, end]，用于增量解析优化

  constructor(type: string, tag: string, nesting: Nesting) {
    this.type = type;
    this.tag = tag;
    this.nesting = nesting;
    this.level = 0;
    this.content = '';
    this.markup = '';
    this.children = null;
    this.block = false;
    this.map = null;
  }
}
