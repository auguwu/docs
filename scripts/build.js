/**
 * Copyright (c) 2020 August (Chris)
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

const rimraf = require('rimraf');
const leeks = require('leeks.js');
const util = require('util');
const ora = require('ora');
const sys = require('@augu/sysinfo');
const cp = require('child_process');

/**
 * Logs a message to the console
 * @param {'info' | 'error' | 'warn'} type The type to send
 * @param  {...any} message The message to send
 */
const log = (type, ...message) => {
  let lvlText;
  switch (type) {
    case 'info': lvlText = leeks.colors.cyan(`[INFO/${process.pid}]`); break;
    case 'warn': lvlText = leeks.colors.yellow(`[WARN/${process.pid}]`); break;
    case 'error': lvlText = leeks.colors.red(`[ERROR/${process.pid}]`); break;
    default: lvlText = leeks.colors.grey(`[${type}/${process.pid}]`); break;
  }

  const date = new Date();
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);
  const seconds = `0${date.getSeconds()}`.slice(-2);
  const msg = message.map(x => x instanceof Object ? util.inspect(x) : x);

  process.stdout.write(`${leeks.colors.grey(`[${hours}:${minutes}:${seconds}]`)} ${lvlText} => ${msg.join('\n')}\n`);
};

/**
 * Main function to start the build script
 */
function main() {
  return new Promise((resolve, reject) => {
    const os = sys.getPlatform();
    log('info', `Detected operating system: ${os}`);
    const spinner1 = ora('Checking if system has TypeScript or ESLint installed globally...\n').start();

    let hasESLint = true;
    let hasTS = true;

    const es = cp.execSync('npm list -g eslint', { encoding: 'utf8' }).split('\n');
    const ts = cp.execSync('npm list -g typescript', { encoding: 'utf8' }).split('\n');

    es.shift();
    ts.shift();

    const esPackage = es.shift();
    let tsPackage = ts.shift();

    // Since TypeScript includes in other packages (i.e: typedoc), we redeclare `tsPackage`
    for (let i = 0; i < ts.length; i++) {
      if (ts[i].includes('`-- typescript')) {
        tsPackage = ts[i];
        break; // Break the loop so it wont be infinite
      }
    }

    // Check if they have "`-- (empty)" from 'npm list'
    if (esPackage === '`-- (empty)') {
      hasESLint = false;
    } else if (tsPackage === '`-- (empty)') {
      hasTS = false;
    }

    // Destroy the spinner instance
    spinner1.stop();

    // TODO: Use node_modules
    if (!hasESLint || !hasTS) {
      log('error', !hasESLint ? 'Missing the ESLint package (npm i -g eslint)' : 'Missing the TypeScript package (npm i -g typescript)');
      return reject(1);
    }

    const [, eslintVersion] = esPackage.split('@');

    const spinner2 = ora(`Now linting the repository (version=${eslintVersion.trim()})\n`).start();
    try {
      cp.execSync('eslint src --ext .ts --fix', { cwd: process.cwd() });
      log('info', 'Linted the repository!');
    } catch(ex) {
      log('error', 'Unable to lint the repository', ex);
      return reject(1);
    }
    
    spinner2.stop();
    const [, tsVersion] = tsPackage.split('@');
    const spinner3 = ora(`Now compiling TypeScript... (version=${tsVersion.trim()})`);

    // TODO: Care when we have an outdated TypeScript version
    try {
      rimraf.sync('./build');
      cp.execSync('tsc', { encoding: 'utf8', cwd: process.cwd() });
      spinner3.stop();

      log('info', 'Compiled TypeScript with no errors!');
      return resolve(0);
    } catch(ex) {
      log('error', 'Unable to build TypeScript', ex.stdout);
      return reject(0);
    }
  });
}

main()
  .then(process.exit)
  .catch(process.exit);