// help me this took 2 hours to do (to get what I want it to do, send help @_@)
const { readFileSync } = require('fs');
const { join } = require('path');

const ast = {
  namespaces: {},
  interfaces: {},
  variables: {},
  functions: {},
  comments: [],
  typedefs: {},
  getters: {},
  classes: {},
  exports: {},
  imports: [],
  file: join(process.cwd(), '..', 'node_modules', '@augu', 'immutable', 'index.d.ts')
};

const file = readFileSync(ast.file, { encoding: 'utf8' });
const tree = file.split(/(\r\n|\n|\r)/g).map(line => {
  line = line.trim();
  if (line.startsWith('export')) return line.slice(6).trim();

  const blockComment = line.indexOf('*');
  if (blockComment !== -1) return undefined;
  
  const endBlockComment = line.indexOf('*/');
  if (endBlockComment !== -1) return undefined;

  const index = line.indexOf('\n');
  if (index === -1) return line;
  return line.slice(0, index);
}).filter(s => s !== '');

let index = 0;
let lastLine = null;

while (tree.length > 0) {
  index++;

  const line = tree.shift();
  lastLine = line;

  if (!line) continue;

  // We found an import!
  if (line.includes('import')) {
    const stmt = line.split(' ');
    stmt.shift(); // Removes 'import'

    const block = {};
    const [rBracket, lBracket] = [stmt.indexOf('{'), stmt.indexOf('}')];
    block.destructured = rBracket !== -1 && lBracket !== -1;

    if (rBracket !== -1 && lBracket !== -1) {
      block.isStarImport = false;

      const from = stmt.indexOf('from');
      const classNames = stmt.slice(rBracket, from);
      classNames.shift();
      classNames.pop();

      block.classNames = classNames;
    } else {
      block.isStarImport = stmt.filter(a => a === '*').length > 0;
      
      if (block.isStarImport) {
        const asIndex = stmt.indexOf('as');
        const ns = stmt.slice(asIndex);

        ns.shift();

        block.namespace = ns[0];
        block.module = ns[2].replace('\'', '').replace('\'', '');
      } else {
        block.namespace = arr[0];
        block.module = arr[2].replace('\'', '').replace('\'', '');
      }
    }

    ast.imports.push(block);
  }

  // We found a block comment
  // TODO: support multi-line block comments
  if (line.startsWith('/**')) {
    const end = line.indexOf('*/');
    if (end === -1) continue;
    else {
      const comment = line.slice(4, end).trim();
      ast.comments.push({
        comment,
        line: index
      });
    }
  }

  // We found a normal comment O_o
  if (line.startsWith('//')) {
    const comment = line.slice(3).trim();
    ast.comments.push({
      comment,
      line: index
    });
  }

  // If we found an interface
  if (line.startsWith('interface')) {
    console.log('interface');
  }

  // If we found a typedef
  if (line.startsWith('typedef')) {
    console.log('typedef');
  }

  // If we found a class
  if (line.startsWith('class')) {
    console.log('class');
  }

  // If we found a namespace
  if (line.startsWith('namespace')) {
    console.log('namespace');
  }

  // If we found a function
  if (line.startsWith('function')) {
    console.log('function');
  }

  // If we found a variable
  if (['const', 'var', 'let'].includes(line.split(' ')[0])) {
    console.log('variable');
  }

  // If we found a constructor
  if (line.startsWith('constructor')) {
    console.log('constructor owo');
  }

  // If we found a public/private/protected function
  if (['public', 'private', 'protected'].includes(line.split(' ')[0])) {
    console.log(`${line.split(' ')[0]} function`);
  }
}

console.log(ast);

// For reference OwO
/*
    const stmt = line.split(' ');
    stmt.shift(); // Lets remove 'export' from this list OwO

    const isClass = stmt.indexOf('class') !== -1;
    const isFunction = stmt.indexOf('function') !== -1;
    const isInterface = stmt.indexOf('interface') !== -1;
    const isTypedef = stmt.indexOf('type') !== -1;
    const isNamespace = stmt.indexOf('namespace') !== -1;
    const block = {};

    if (isClass) {
      stmt.shift();

      const name = stmt[0].indexOf('<') !== -1 ? stmt[0].replace(/<[A-Z]/g, '') : stmt[0];

      block.type = 'class';
      block.name = name;
      block.generics = [];
      block.functions = [];
      block.getters = [];
      block.constructors = [];

      ast.classes[name] = block;
    }

    if (isInterface) {
      stmt.shift();

      const name = stmt[0].indexOf('<') !== -1 ? stmt[0].replace(/<[A-Z]/g, '') : stmt[0];

      block.name = name;
      block.items = [];

      ast.interfaces[name] = block;
    }

    if (isFunction) {
      stmt.shift();

      const name = stmt[0].indexOf('<') !== -1 ? stmt[0].replace(/<[A-Z]/g, '') : stmt[0];

      block.name = name;
      block.parameters = [];
      block.returnType = undefined;
      ast.functions[name] = block;
    }

    if (isTypedef) {
      stmt.shift();

      const name = stmt[0].indexOf('<') !== -1 ? stmt[0].replace(/<[A-Z]/g, '') : stmt[0];

      block.name = name;
      block.returnType = undefined;
      ast.typedefs.push(block);
    }

    if (isNamespace) {
      stmt.shift();

      const name = stmt[0].indexOf('<') !== -1 ? stmt[0].replace(/<[A-Z]/g, '') : stmt[0];

      block.name = name;
      block.classes = [];
      block.interfaces = [];
      block.typedefs = [];
      block.exports = [];
      block.variables = [];

      block.namespaces[name] = block;
    }

    if (['const', 'var', 'let'].includes(stmt[0])) {
      block.name = stmt[1].replace(':', '');
      block.returnType = undefined;
      ast.variables[stmt[1].replace(':', '')] = block;
    }
*/