const { readFileSync } = require('fs');
const { join } = require('path');
const TSUtil = require('./util/TypeScript');
const ts = require('typescript');

console.log(`== TypeScript v${TSUtil.version} | Friendly?: ${TSUtil.isFriendly(require('../package.json')) ? 'yes' : 'no'} ==`);

const filenames = [join(__dirname, 'test', 'file.d.ts')];
const result = TSUtil.getBlockComments(filenames, {
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

console.log(`Success: ${result.success ? 'Yes' : 'No'}`);
console.log(`Received ${result.comments.length} comments`);

if (result.reports.length) {
  for (let i = 0; i < result.reports.length; i++) console.error(`[${i + 1}/${result.reports.length} | ${result.reports[i].file || 'global'}] ${result.reports[i].message}`);
}

if (result.comments.length) {
  for (let i = 0; i < result.comments.length; i++) console.log(`[${i + 1}/${result.comments.length}] View below\n`, result.comments[i]);
}
