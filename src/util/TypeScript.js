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
      (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Public) !== 0 &&
      (!!node.parent && node.parent.kind === ts.SyntaxKind.PublicKeyword)
    );
  }

  /**
   * Check if a node is private
   * @param {ts.Node} node The node to check
   */
  static isNodePrivate(node) {
    return (
      (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Private) !== 0 &&
      (!!node.parent && node.parent.kind === ts.SyntaxKind.PrivateKeyword)
    );
  }

  /**
   * Check if a node is protected
   * @param {ts.Node} node The node to check
   */
  static isNodeProtected(node) {
    return (
      (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Protected) !== 0 &&
      (!!node.parent && node.parent.kind === ts.SyntaxKind.ProtectedKeyword)
    );
  }

  /**
   * Get the module's name
   * @param {ts.ModuleBlock} parent The parent node 
   */
  static getModuleName(parent) {
    if (parent.kind !== ts.SyntaxKind.ModuleBlock) return 'unknown';

    const text = parent.parent.getText();
    const name = text.split('\r\n')[0];

    const ModuleRegex = /declare module /i;
    const NamespaceRegex = /declare namespace /i;
    const CombinedRegex = /declare module |declare namespace /i;

    return {
      type: ModuleRegex.test(name) 
        ? 'module' 
        : NamespaceRegex.test(name) 
          ? 'namespace' 
          : 'none',
      name: name
        .replace(CombinedRegex, '')
        .replace(/'/g, '')
        .replace(/"/g, '')
        .replace(/{/g, '')
        .trim()
    };
  }

  /**
   * Gets the block comments of a source file
   * @param {string[]} filenames The filesnames
   * @param {ts.CompilerOptions} opts The options to use when compiling
   */
  static getBlockComments(filenames, opts = {}) {
    const result = { success: true, reports: [], comments: [], module: 'unknown' };

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

      // Checks with the compiler if `node` has the `export` keyword
      if (this.isNodeExported(node)) {
        if (ts.isClassDeclaration(node)) {
          if (!node.name) {
            report(node, `Node @ "${ts.SyntaxKind[node.kind]}" doesn't include a name`);
            return;
          }

          let accessor = 'public';
          if (this.isNodeProtected(node)) accessor = 'protected';
          else if (this.isNodePrivate(node)) accessor = 'private';
          else if (this.isNodePublic(node)) accessor = 'public';

          const symbol = checker.getSymbolAtLocation(node.name);
          if (!symbol) return report(node, `"${accessor} ${node.name.escapedText}@${ts.SyntaxKind[node.kind]}" didn't provide any type-checking, skipping`);          
        
          const comment = {
            accessor,
            type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)),
            docs: {},
            kind: ts.SyntaxKind[node.kind],
            name: node.name.escapedText,
            mod: this.getModuleName(node.parent)
          };

          const constructorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
          const constructors = constructorType
            .getConstructSignatures()
            .map(signature => ({
              documentation: ts.displayPartsToString(signature.getDocumentationComment(checker)),
              returnType: checker.typeToString(signature.getReturnType()),
              params: signature.parameters.map(symbol => ({
                documentation: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
                name: symbol.getEscapedName(),
                type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration))
              }))
            }));

          comment.docs.constructors = constructors;
          result.comments.push(comment);
        }

        if (ts.isFunctionDeclaration(node)) {
          if (!node.name) {
            report(node, `Node @ ${ts.SyntaxKind[node.kind]} doesn't have a name attached`);
            return;
          }

          const symbol = checker.getSymbolAtLocation(node.name);
          if (!symbol) {
            report(node, `Unable to fetch symbolic link with node "${node.name.escapedText}@${ts.SyntaxKind[node.kind]}"`);
            return;
          }

          const comment = {
            // It's gonna be public since it's exported
            accessor: 'public',
            type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)),
            docs: {},
            kind: ts.SyntaxKind[node.kind],
            name: node.name.escapedText,
            mod: this.getModuleName(node.parent)
          };

          const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
          const signatures = type.getCallSignatures()
            .map(signature => ({
              documentation: ts.displayPartsToString(signature.getDocumentationComment(checker)),
              returnType: checker.typeToString(signature.getReturnType()),
              params: signature.parameters.map(symbol => ({
                documentation: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
                name: symbol.getEscapedName(),
                type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration))
              }))
            }));

          comment.docs.signatures = signatures;
          result.comments.push(comment);
        }

        if (ts.isVariableDeclaration(node)) {
          if (!node.name) return report(node, `Missing \`name\` property in node @ ${ts.SyntaxKind[node.kind]}`);

          const symbol = checker.getSymbolAtLocation(node.name);
          if (!symbol) return report(node, `Unable to fetch symbolic reference for node "${node.name.escapedText}@${ts.SyntaxKind[node.kind]}"`);

          const comment = {
            accessor: 'public', // it's exported so what did u expect
            type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)),
            docs: {},
            kind: ts.SyntaxKind[node.kind],
            name: node.name.escapedText,
            mod: this.getModuleName(node.parent.parent.parent) // funky town
          };

          result.comments.push(comment);
        }
      }
    }; // reminder that dani is a homosexual

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
