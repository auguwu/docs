/**
 * Copyright (c) 2020 August
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

import ts from 'typescript';

interface DiagnosticError {
  message: string;
  file?: string;
}

interface ModuleKind {
  type: string;
  name: string;
}

/**
 * Extension class to help find JSDoc in a `.d.ts` file
 */
export default class TypeScriptCompiler {
  /** Representation of all the files to run at compile-time. */
  private files: string[];

  /**
   * Creates a new [TypeScriptCompiler] instance
   * @param files The files to compile
   */
  constructor(files: string[]) {
    this.files = files;
  }

  /**
   * Gets a list of diagnostic errors from the files
   * @param options The compiler options to create a [ts.Program]
   * @returns The results from the [ts.Program] created
   */
  getDiagnosticErrors(options: ts.CompilerOptions) {
    const program = ts.createProgram(this.files, options);
    const result = program.emit();
    const errors: DiagnosticError[] = [];

    const all = ts.getPreEmitDiagnostics(program).concat(result.diagnostics);
    for (let i = 0; i < all.length; i++) {
      const diagnostic = all[i];
      if (diagnostic.file) {
        const { line, character: char } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

        errors.push({
          message,
          file: `in '${diagnostic.file.fileName}' ('${line}:${char}')`
        });
      } else {
        errors.push({
          message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
        });
      }
    }

    return errors;
  }

  /**
   * Returns the module or namespace's name
   * @param node The node to check
   */
  getModuleName(node: ts.Node): 'unknown' | ModuleKind {
    if (node.parent.kind !== ts.SyntaxKind.ModuleBlock) return 'unknown';

    const nodeText = node.parent.getText().split('\r\n')[0];
    const isModule = nodeText.includes('declare module');
    const isNamespace = nodeText.includes('declare namespace');

    return {
      type: isModule ? 'module' : isNamespace ? 'namespace' : 'unknown',
      name: nodeText
        .replace(/declare module |declare namespace/gi, '')
        .replace(/\'|"/g, '')
        .replace('{', '')
        .trim()
    };
  }
}
