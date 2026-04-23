// packages/markdown-engine/src/parser.ts
import { Token } from './token';

export class Parser {
  /**
   * 将平铺的 Token 序列转换为具有层级关系的 AST 树
   * 处理开始标签(1)、结束标签(-1)和自闭合/行内标签(0)
   */
  parse(tokens: Token[]): Token[] {
    const ast: Token[] = [];
    const stack: Token[] = [];

    for (const token of tokens) {
      if (token.nesting === 1) {
        // 1. 开始标签：作为当前父节点的子节点，并入栈
        const parent = stack[stack.length - 1];
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(token);
        } else {
          ast.push(token);
        }
        stack.push(token);
      } else if (token.nesting === -1) {
        // 2. 结束标签：出栈，回到上一层级
        stack.pop();
      } else {
        // 3. 行内内容或自闭合标签：归属于当前父节点，但不入栈
        const parent = stack[stack.length - 1];
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(token);
        } else {
          ast.push(token);
        }
      }
    }
    return ast;
  }
}
