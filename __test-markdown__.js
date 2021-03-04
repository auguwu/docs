// test markdown

const unified = require('unified');
const github = require('remark-github');
const remark = require('remark-parse');
const gfm = require('remark-gfm');

const vfile = require('to-vfile');

const compiler = unified()
  .use(github, { repository: 'auguwu/Wumpcord' })   // adds references to issues, prs, etc
  .use(remark)   // ast generation
  .use(gfm)      // github flavoured markdown syntax
  .freeze();     // don't add anymore plugins

let tree = null;

console.log(require('util').inspect(compiler.parse('__**Hello world!**__'), { depth: null }));

//const _vfile = compiler.processSync(vfile.readSync('README.md'));
//console.log(`Read contents of ${_vfile.cwd}/${_vfile.history[0]}`);
//console.log('AST generation', require('util').inspect(tree, { depth: null }));
