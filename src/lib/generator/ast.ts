// Modified version of "markdown-ast" to include other stuff yet be like GitHub Markdown
// Project: https://github.com/aleclarson/markdown-ast

import { existsSync, promises as fs } from 'fs';
import { ILogger, createLogger } from '@augu/logging';

export type ASTNode =
  | BoldNode
  | BorderNode
  | BreakNode
  | CodeblockNode
  | CodespanNode
  | ErrorNode
  | EOLNode
  | IncludeNode
  | ImageNode
  | ItalicNode
  | InfoNode
  | LinkNode
  | LinkDefinitionNode
  | ListNode
  | QuoteNode
  | StrikeNode
  | TextNode
  | TitleNode
  | WarningNode;

export type NodeTypes = {
  [P in ASTNode['type']]: Extract<ASTNode, { type: P }>;
};

export interface Block {
  block: ASTNode[];
}

export interface BoldNode extends Block {
  style: '**' | '__';
  type: 'bold';
}

export interface BorderNode extends Block {
  content: string;
  type: 'border';
}

export interface BreakNode extends Block {
  content: string;
  type: 'break';
}

export interface CodeblockNode {
  indentSize: number;
  syntax: string;
  code: string;
  type: 'codeblock';
}

export interface CodespanNode {
  code: string;
  type: 'codespan';
}

export interface ErrorNode {
  message: string;
  type: 'error';
}

export interface EOLNode {
  type: 'eol';
}

export interface IncludeNode {
  path: string;
  type: 'include';
}

export interface ImageNode {
  type: 'image';
  alt: string;
  url: string;
  ref: string;
}

export interface ItalicNode extends Block {
  style: '*' | '_';
  type: 'italic';
}

export interface InfoNode {
  content: string;
  type: 'info';
}

export interface LinkNode extends Block {
  type: 'link';
  url: string;
  ref: string;
}

export interface LinkDefinitionNode {
  type: 'linkdef';
  key: string;
  url: string;
}

export interface ListNode extends Block {
  indentSize: number;
  bullet: string;
  type: 'list';
}

export interface QuoteNode extends Block {
  type: 'quote';
}

export interface StrikeNode extends Block {
  style: '~~';
  type: 'strikethrough';
}

export interface TextNode extends Block {
  content: string;
  type: 'text';
}

export interface TitleNode extends Block {
  rank: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  type: 'title';
}

export interface WarningNode extends Block {
  content: string;
  type: 'warning';
}

export class ASTGenerator {
  private logger: ILogger = createLogger({ namespace: 'AST', transports: [] });

  private isEscaped(str: string) {
    const escaped = '\\\\'.charCodeAt(0);
    let i = str.length;
    let n = 0;

    while (i && str.charCodeAt(--i) === escaped) n++;
    return (n % 2) === 1;
  }

  private search(input: string, target: any, cursor: number) {
    let i = cursor - 1;
    while (true) { // eslint-disable-line no-constant-condition
      let start = i;
      i = input.indexOf(target, i + 1);

      if (i < 0) return -1;
      if (!this.isEscaped(input.slice(start, i))) return i;
    }
  }

  async compile(file: string, top: ASTNode[] = []) {
    if (!existsSync(file)) throw new TypeError(`file "${file}" doesn't exist`);

    const contents = await fs.readFile(file, { encoding: 'utf8' });
    const blocks: ASTNode[] = [];
    let prevNode: ASTNode;

    const addText = (text: string) =>
      prevNode && prevNode.type === 'text'
        ? ((prevNode.content += text), prevNode)
        : addNode({ type: 'text', content: text } as any);

    const addNode = (node: ASTNode) => {
      let len = blocks.length;
      (len ? (blocks[len - 1] as any).block : top).push(node);

      return (prevNode = node);
    };

    const addBlock = (node: ASTNode) => {
      if (node.type === 'link') node = { type: 'link', block: node.block, url: '', ref: '' };

      return addNode(node);
    };

    const flush = (filter: ((node: ASTNode) => boolean) = () => true) => {
      for (let i = blocks.length; --i >= 0;) {
        const node = blocks[i];
        if (!filter(node)) return node;

        addBlock(blocks.pop()!);
      }
    };

    let cursor = 0;
    const lexer = /(^([*_-])\\\\s*\\2(?:\\\\s*\\2)+$)|(?:^(\\\\s*)([>*+-]|\\d+[.\\)])\\\\s+)|(?:^``` *(\\w*)\\n([\\\\s\\\\s]*?)```$)|(^(?:(?:\\t|    )[^\\n]*(?:\\n|$))+)|(\\!?\\[)|(\\](?:(\\(|\\[)|\\:\\\\s*(.+)$)?)|(?:^([^\\\\s].*)\\n(\\-{3,}|={3,})$)|(?:^(#{1,6})(?:[ \\t]+(.*))?$)|(?:`([^`].*?)`)|(  \\n|\\n\\n)|(__|\\*\\*|[_*]|~~)||\<% include\('\w+'\) %>$|\<%include\('\w+'\)%>$/gm;
    let move = (offset: number) => (lexer.lastIndex = cursor = offset);

  }
}
