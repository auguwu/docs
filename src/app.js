const { readFileSync } = require('fs');
const { join } = require('path');
const TSUtil = require('./util/TypeScript');
const ts = require('typescript');

console.log(`== TypeScript v${TSUtil.version} | Friendly?: ${TSUtil.isFriendly(require('../package.json')) ? 'yes' : 'no'} ==`);

const filenames = [join(__dirname, 'test', 'file.d.ts')];
const { success, reports, comments } = TSUtil.getBlockComments(filenames, {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.CommonJS,
  lib: [
    'lib.es2015.d.ts',
    'lib.es2016.d.ts',
    'lib.es2017.d.ts',
    'lib.es2018.d.ts',
    'lib.es2019.d.ts',
    'lib.es2020.d.ts',
    'lib.esnext.d.ts',
  ],
  declaration: false,
  strict: true,
  noImplicitAny: true,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  allowSyntheticDefaultImports: true,
  esModuleInterop: true,
  experimentalDecorators: true,
  emitDeclarationMetadata: true,
});

console.log(`Success: ${success ? 'Yes' : 'No'}`);
console.log(`Received ${comments.length} comments`);

if (reports.length) {
  for (let i = 0; i < reports.length; i++) console.error(`[${i + 1}/${reports.length} | ${reports[i].file || 'global'}] ${reports[i].message}`);
}

if (comments.length) {
  for (let i = 0; i < comments.length; i++) console.log(`[${i + 1}/${comments.length}]\n${JSON.stringify(comments[i])}`);
}
