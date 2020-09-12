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

const ts = require('typescript');

/**
 * Utility class anything TypeScript-related
 * 
 * ### Projects
 * > This is a list of projects that use this class to get block comments
 * 
 * - [@augu/immutable](https://github.com/auguwu/immutable)
 * - [@augu/orchid](https://github.com/auguwu/Orchid)
 * - [@augu/ichigo](https://github.com/auguwu/Ichigo)
 * - [@augu/maru](https://github.com/auguwu/Maru)
 * - [laffey](https://github.com/auguwu/laffey)
 */
module.exports = class TypeScriptUtil {
  /**
   * Gets the current version of TypeScript that we are compiling from
   */
  static get version() {
    return ts.version;
  }

  /**
   * Checks if the compiler version of TypeScript is similar to the one
   * in the package.json file of the libraries
   * 
   * @param {any} pkg The package.json file
   * @returns {boolean} If it's equal to the major version
   */
  static isFriendly(pkg) {
    // If we have a "devDependencies" object in it,
    // most likely we do but, if we don't -- then
    // it's not friendly
    if (!pkg.hasOwnProperty('devDependencies')) return false;

    // If we have "typescript" as a dependency in the
    // "devDependencies" object, if we don't; then
    // it's not friendly
    if (!pkg.devDependencies.hasOwnProperty('typescript')) return false;

    // Now we get the version of it
    const pkgVer = Number(pkg.devDependencies.typescript.split('.')[0]);
    const tsVer  = Number(this.version.split('.')[0]);

    return pkgVer === tsVer;
  }

  /**
   * Compiles many files for type-checking
   * @param {string[]} filenames The filenames
   * @param {ts.CompilerOptions} opts The options to use when compiling
   */
  static getTypeCheckResult(filenames, opts = {}) {
    const program = ts.createProgram(filenames, opts);
    const result  = program.emit();

    const errors = [];
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(result.diagnostics);

    for (let i = 0; i < diagnostics.length; i++) {
      const diagnostic = diagnostics[i];
      if (diagnostic.file) {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        errors.push({
          message,
          file: `${diagnostic.file.fileName}:${line + 1}:${character + 1}`
        });
      } else {
        errors.push({
          message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
          file: null
        });
      }
    }

    return errors;
  }

  /**
   * Checks if a node is exported or not
   * @param {ts.Node} node The node to check
   */
  static isNodeExported(node) {
    return (
      (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0 ||
      (!!node.parent && node.parent.kind === ts.SyntaxKind.ExportKeyword)
    );
  }

  /**
   * Check if a node is public
   * @param {ts.Node} node The node to check
   */
  static isNodePublic(node) {
    return (
      node.kind === ts.SyntaxKind.PublicKeyword &&
      (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Public) !== 0
    );
  }

  /**
   * Check if a node is private
   * @param {ts.Node} node The node to check
   */
  static isNodePrivate(node) {
    return (
      node.kind === ts.SyntaxKind.PrivateKeyword &&
      (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Private) !== 0
    );
  }

  /**
   * Check if a node is protected
   * @param {ts.Node} node The node to check
   */
  static isNodeProtected(node) {
    return (
      node.kind === ts.SyntaxKind.ProtectedKeyword &&
      (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Protected) !== 0
    );
  }

  /**
   * Gets the block comments of a source file
   * @param {string[]} filenames The filesnames
   * @param {ts.CompilerOptions} opts The options to use when compiling
   */
  static getBlockComments(filenames, opts = {}) {
    const result = { success: true, reports: [], comments: [] };

    /**
     * Inline function to report a message
     * @param {ts.SourceFile} sourceFile The source file
     * @param {ts.Node} node The node to report on
     * @param {string} message The message itself
     */
    function report(node, message) {
      const file = node.getSourceFile();
      const { line, character } = file.getLineAndCharacterOfPosition(node.getStart());
      result.reports.push({
        message,
        file: `${file.fileName}:${line + 1}:${character + 1}`
      });
    }

    const results = this.getTypeCheckResult(filenames, opts);
    if (results.length) return { success: false, reports: results, comments: [] };

    const program = ts.createProgram(filenames, opts);
    const checker = program.getTypeChecker();
    const sourceFiles = program.getSourceFiles();
    
    /**
     * Visits the source file
     * @param {ts.Node} node The node to check from
     */
    const visit = (node) => {
      const children = node.getChildCount();
      
      if (children > 0) ts.forEachChild(node, visit);
      if (this.isNodeExported(node)) {
        if (!node.name) {
          report(node, `Node ${ts.SyntaxKind[node.kind]} doesn't have a name appended`);
          return;
        }

        const symbol = checker.getSymbolAtLocation(node.name);
        if (symbol) {
          result.comments.push({
            returnValue: null,
            description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
            constructor: true,
            accessor: false,
            parent: null,
            params: [],
            method: false,
            type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)),
            name: symbol.getName()
          });
        } else {
          report(node, `Unable to get symbol for exported node "${node.name}"`);
          return;
        }
      }

      if (ts.isMethodDeclaration(node)) {
        if (!node.name) {
          report(node, 'Method doesn\'t have a name attached');
          return;
        }

        if (!node.parent) {
          report(node, 'Method doesn\'t have a parent component attached');
          return;
        }

        const symbol = checker.getSymbolAtLocation(node.name);
        const parent = checker.getSymbolAtLocation(node.parent.name);
        if (symbol) {
          const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
          const params = type.getConstructSignatures();
          console.log(params);

          const accessType = this.isNodePublic(node) 
            ? 'public' 
            : this.isNodePrivate(node) 
              ? 'private'
              : this.isNodeProtected(node)
                ? 'protected'
                : 'unknown';
                
          result.comments.push({
            returnValue: null,
            description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
            constructor: false,
            accessType,
            accessor: false,
            parent: result.comments.find(comment => comment.name === parent.getName()),
            params: [],
            method: true,
            type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)),
            name: symbol.getName()
          });
        } else {
          report(node, 'Method doesn\'t have a parent componet attached');
          return;
        }
      }
    };

    for (let i = 0; i < sourceFiles.length; i++) {
      const sourceFile = sourceFiles[i];
      if (
        // If it's a declaration file (.d.ts)
        sourceFile.isDeclarationFile && 

        // If it's not a lib-related typings file
        !sourceFile.fileName.includes('lib.') &&

        // If it's not anything starting with @types
        !sourceFile.fileName.includes('@types')
      ) ts.forEachChild(sourceFile, visit);
    }

    return result;
  }
};

/*
      if (ts.isPropertyAssignment(node) && node.name) {
        const symbol = checker.getSymbolAtLocation(node.name);
        if (symbol) result.comments.push({
          comment: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
          type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)),
          name: symbol.getName()
        });
      } else {
        report(node, `Node ${ts.SyntaxKind[node.kind]} was not a property assignment or it didn't have a name`);
      }
*/
