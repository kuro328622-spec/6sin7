// import { Token } from './token';
// import { Lexer } from './lexer';
// import { Renderer } from './renderer';

// // 导出 Token 类型，方便外部使用
// export * from './token';

// export class MarkdownParser {
//   private lexer: Lexer;
//   private renderer: Renderer;

//   constructor() {
//     this.lexer = new Lexer();
//     this.renderer = new Renderer();
//   }

//   /**
//    * 将 Markdown 字符串解析并渲染为 HTML
//    * 这是我们在 Lab.vue 中调用的核心方法
//    */
//   makeHtml(text: string): string {
//     // 1. 词法分析 (Text -> Tokens)
//     const tokens = this.lexer.lex(text);
    
//     // 2. 渲染 (Tokens -> HTML String)
//     return this.renderer.render(tokens);
//   }
// }

// // 默认导出
// export default MarkdownParser;
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Renderer } from './renderer';

export class MarkdownParser {
  private lexer = new Lexer();
  private parser = new Parser(); // 确保名字是 parser
  private renderer = new Renderer();

  makeHtml(text: string): string {
    const tokens = this.lexer.lex(text);
    const ast = this.parser.parse(tokens);
    return this.renderer.render(ast);
  }
}
