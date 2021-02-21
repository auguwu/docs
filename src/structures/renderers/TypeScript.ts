/**
 * Copyright (c) 2020-2021 August
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Based off of https://github.com/microsoft/tsdoc/blob/master/api-demo/src/advancedDemo.ts
// isDeclarationKind and getJSDocCommentRanges is also stolen from ^

import { TSDocConfigFile } from '@microsoft/tsdoc-config';
import * as tsconfig from 'tsconfig';
import { readdir } from '@augu/utils';
import * as tsdoc from '@microsoft/tsdoc';
import { join } from 'path';
import Logger from '../Logger';
import ts from 'typescript';

interface CommentNode {
  textRange: tsdoc.TextRange;
  node: ts.Node;
}

interface CommentNodeRegistry {
  comments: Comment[];
  nodes: CommentNode[];
  file: string;
}

interface Comment {
  deprecated?: string;
  returns?: string;
  summary: string;
  params?: Parameter[];
  sees?: string[];
}

interface Parameter {
  description: string;
  name: string;
}

function _convertESLib() {
  return ['ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', 'ESNext'].map(file =>
    `lib.${file.toLowerCase()}.d.ts`
  );
}

function _walkAstAndGetComments(node: ts.Node, comments: CommentNode[]) {
  const source = node.getSourceFile().getFullText();
  if (isDeclarationKind(node.kind)) {
    const commentRange = getJSDocCommentRanges(node, source);
    for (const comment of commentRange)
      comments.push({
        textRange: tsdoc.TextRange.fromStringRange(source, comment.pos, comment.end),
        node
      });
  }

  return node.forEachChild(child => _walkAstAndGetComments(child, comments));
}

function isDeclarationKind(kind: ts.SyntaxKind): boolean {
  return (
    kind === ts.SyntaxKind.ArrowFunction ||
    kind === ts.SyntaxKind.BindingElement ||
    kind === ts.SyntaxKind.ClassDeclaration ||
    kind === ts.SyntaxKind.ClassExpression ||
    kind === ts.SyntaxKind.Constructor ||
    kind === ts.SyntaxKind.EnumDeclaration ||
    kind === ts.SyntaxKind.EnumMember ||
    kind === ts.SyntaxKind.ExportSpecifier ||
    kind === ts.SyntaxKind.FunctionDeclaration ||
    kind === ts.SyntaxKind.FunctionExpression ||
    kind === ts.SyntaxKind.GetAccessor ||
    kind === ts.SyntaxKind.ImportClause ||
    kind === ts.SyntaxKind.ImportEqualsDeclaration ||
    kind === ts.SyntaxKind.ImportSpecifier ||
    kind === ts.SyntaxKind.InterfaceDeclaration ||
    kind === ts.SyntaxKind.JsxAttribute ||
    kind === ts.SyntaxKind.MethodDeclaration ||
    kind === ts.SyntaxKind.MethodSignature ||
    kind === ts.SyntaxKind.ModuleDeclaration ||
    kind === ts.SyntaxKind.NamespaceExportDeclaration ||
    kind === ts.SyntaxKind.NamespaceImport ||
    kind === ts.SyntaxKind.Parameter ||
    kind === ts.SyntaxKind.PropertyAssignment ||
    kind === ts.SyntaxKind.PropertyDeclaration ||
    kind === ts.SyntaxKind.PropertySignature ||
    kind === ts.SyntaxKind.SetAccessor ||
    kind === ts.SyntaxKind.ShorthandPropertyAssignment ||
    kind === ts.SyntaxKind.TypeAliasDeclaration ||
    kind === ts.SyntaxKind.TypeParameter ||
    kind === ts.SyntaxKind.VariableDeclaration ||
    kind === ts.SyntaxKind.JSDocTypedefTag ||
    kind === ts.SyntaxKind.JSDocCallbackTag ||
    kind === ts.SyntaxKind.JSDocPropertyTag
  );
}

function getJSDocCommentRanges(node: ts.Node, text: string): ts.CommentRange[] {
  const commentRanges: ts.CommentRange[] = [];

  switch (node.kind) {
    case ts.SyntaxKind.Parameter:
    case ts.SyntaxKind.TypeParameter:
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.ArrowFunction:
    case ts.SyntaxKind.ParenthesizedExpression:
      commentRanges.push(...(ts.getTrailingCommentRanges(text, node.pos) || []));
      break;
  }
  commentRanges.push(...(ts.getLeadingCommentRanges(text, node.pos) || []));

  // True if the comment starts with '/**' but not if it is '/**/'
  return commentRanges.filter(
    (comment) =>
      text.charCodeAt(comment.pos + 1) === 0x2a /* ts.CharacterCodes.asterisk */ &&
      text.charCodeAt(comment.pos + 2) === 0x2a /* ts.CharacterCodes.asterisk */ &&
      text.charCodeAt(comment.pos + 3) !== 0x2f /* ts.CharacterCodes.slash */
  );
}

export default class TypeScriptRenderer {
  private compiler!: tsdoc.TSDocParser;
  private directory: string;
  private config: TSDocConfigFile | null = null;
  private logger = Logger.get();

  constructor(directory: string) {
    this.directory = directory;
    this.configure();
  }

  private configure() {
    this.logger.debug(`Attempting to load tsdoc.json in directory ${this.directory}...`);

    // Load tsdoc.json in root directory
    if (TSDocConfigFile.findConfigPathForFolder(this.directory) !== '')
      this.config = TSDocConfigFile.loadForFolder(this.directory);

    this.logger.debug(this.config !== null ? 'Loaded tsdoc.json!' : 'No tsdoc.json file was present, ignoring');

    const definition = new tsdoc.TSDocConfiguration();
    this.config?.configureParser(definition);
    this.compiler = new tsdoc.TSDocParser(definition);

    this.logger.debug('Initialized compiler!');
  }

  private async getCompilerOptions() {
    let compilerOptions!: ts.CompilerOptions;

    const resolveCfg = await tsconfig.resolve(this.directory);
    if (typeof resolveCfg !== 'string') {
      this.logger.error(`Couldn't resolve "tsconfig.json" in root directory "${this.directory}", disabling...`);
      return null;
    }

    const config = tsconfig.loadSync(this.directory);
    compilerOptions = config.config.compilerOptions;

    return {
      compilerOptions,
      path: config.path!
    };
  }

  private async typeCheck(files: string[]) {
    const compilerOptions = await this.getCompilerOptions() ?? { compilerOptions: {}, path: '' };
    const program = ts.createProgram(files, {
      ...compilerOptions?.compilerOptions,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.CommonJS,
      lib: _convertESLib(),
      declaration: false,
      strict: true,
      noImplicitAny: false,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      newLine: ts.NewLineKind.LineFeed,
      noEmitOnError: true,
      forceConsistentCasingInFileNames: true,
      noEmit: true // let's not emit files
    });

    const result = program.emit();
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(result.diagnostics);

    //for (let i = 0; i < diagnostics.length; i++) {
    //  const diagnostic = diagnostics[i];

    // get the source file (if any >w>)
    //  if (diagnostic.file) {
    //    const { line, character: char } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
    //    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n', 2);

    //    this.logger.error(`❌ [${diagnostic.file.fileName}:${line}:${char}]\n${message}`);
    //  } else {
    //    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n', 2);
    //    this.logger.error(`❌ [unknown.ts:0:0]:\n${message}`);
    //  }
    //}

    return { success: true, program };
  }

  private walkAstAndReturnRegistry(registry: CommentNodeRegistry) {
    for (const comment of registry.nodes) {
      const context = this.compiler.parseRange(comment.textRange);
      const _rawComment = context.docComment;
      const sourceFile = comment.node.getSourceFile();
      for (const message of context.log.messages) {
        const location = sourceFile.getLineAndCharacterOfPosition(message.textRange.pos);
        this.logger.error(`❌ [${sourceFile.fileName}:${location.line + 1}:${location.character + 1} (${message.messageId})] ${message.toString()}`);
      }

      function renderNode(node: tsdoc.DocNode) {
        let result = '';
        if (node instanceof tsdoc.DocExcerpt)
          result += node.content.toString();

        for (const children of node.getChildNodes())
          result += renderNode(children);

        return result;
      }

      const summary = renderNode(_rawComment.summarySection);
      const params = _rawComment.params.blocks.map(param => renderNode(param));
      const returnBlock = _rawComment.returnsBlock !== undefined ? renderNode(_rawComment.returnsBlock) : undefined;
      const seesBlock = _rawComment.seeBlocks.map(block => renderNode(block));
      const deprecated = _rawComment.deprecatedBlock !== undefined ? renderNode(_rawComment.deprecatedBlock) : undefined;

      registry.comments.push({
        deprecated: deprecated?.trim().replace(/@deprecated /g, ''),
        summary: summary.trim(),
        params: params.map(r => r.trim()).map(param => {
          const [, name, ...desc] = param.split(' ');
          return { name, description: desc.join(' ') };
        }),
        returns: returnBlock?.trim().replace(/@returns /g, ''),
        sees: seesBlock?.map(r => r.trim())
      });
    }
  }

  /**
   * Render all the contents in the directory and return the result
   *
   * @remarks
   * Works in O(N) complexity, so the larger the files, the larger
   * the renderer takes to load. Use `TypeScriptRenderer.renderFile`
   * to render the comments of a specific file.
   *
   * @deprecated Use `owo.my.uwu()` instead!
   * @returns The registry provided or `undefined` if any errors occur
   */
  async render() {
    this.logger.debug(`Told to render all contents in directory "${this.directory}"`);
    const files = await readdir(this.directory); // must be top level for .ts files because yes

    this.logger.debug(`Found ${files.length} files in "${this.directory}", rendering...`);

    const { success: typeCheckSuccess, program } = await this.typeCheck(files);
    if (!typeCheckSuccess)
      return null;

    // we don't have any errors, yay! let's walk the ast and fetch what we can!
    const registries: CommentNodeRegistry[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sourceFile = program.getSourceFile(file);
      if (sourceFile === undefined) {
        this.logger.error(`Unable to retrieve source file for "${file}"`);
        continue;
      }

      const comments: CommentNode[] = [];
      _walkAstAndGetComments(sourceFile, comments);

      const registry: CommentNodeRegistry = {
        comments: [],
        nodes: comments,
        file
      };

      this.logger.debug(`Found ${comments.length} comments in file "${file}", now invoking TSDoc...`);
      this.walkAstAndReturnRegistry(registry);
      registries.push(registry);
    }

    return registries;
  }

  /**
   * Returns the raw render registry for a specific file
   * @returns The registry for the file
   */
  async renderFile(file: string) {
    this.logger.debug(`Told to render file "${file}"`);
    const { success, program } = await this.typeCheck([file]);

    if (!success)
      return null;

    const sourceFile = program.getSourceFile(file);
    if (sourceFile === undefined) {
      this.logger.error('Unable to fetch source file');
      return null;
    }

    const registry: CommentNodeRegistry = {
      comments: [],
      nodes: [],
      file
    };

    _walkAstAndGetComments(sourceFile, registry.nodes);
    this.walkAstAndReturnRegistry(registry);

    return registry;
  }
}
