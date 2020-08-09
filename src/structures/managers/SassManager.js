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

const { recursiveDir, getArbitrayPath } = require('../../util');
const { promises: fs, existsSync } = require('fs');
const { render: sassRender } = require('sass');
const { join, dirname } = require('path');
const { Signale } = require('signale');

/**
 * Returns a Promise function for [sass.render]
 * @param {import('sass').Options} opts Any options to use
 * @returns {() => Promise<string>} A function of the promisified version of [sass.render]
 */
const promisifyRender = (opts) => 
  () => new Promise((resolve, reject) => sassRender(opts, (error, data) => {
    if (error) return reject(error);
    else return resolve(data.css.toString());
  }));

/**
 * Represents the manager for handling .scss files
 * @extends {Collection<import('../Routing').Router>}
 */
module.exports = class SassManager {
  /**
   * Creates a new [SassManager] instance
   * @param {import('../Server')} server The server instance
   */
  constructor(server) {
    /**
     * The server instance
     * @type {import('../Server')}
     */
    this.server = server;

    /**
     * The logger instance
     * @type {import('signale').Signale}
     */
    this.logger = new Signale({ scope: 'Sass' });

    /**
     * The path to find all of the .scss files
     * @type {string}
     */
    this.path = getArbitrayPath('static', 'scss');
  }

  /**
   * Loads all the plugins
   */
  async load() {
    const stats = await fs.lstat(this.path);
    if (!stats.isDirectory()) {
      this.logger.error(`Path "${this.path}" was not a valid directory`);
      return;
    }

    const files = await recursiveDir(this.path);
    if (!files.length) {
      this.logger.error(`No files were found in path "${this.path}"`);
      return;
    }

    const index = files.indexOf('styles.scss');
    if (index === -1) {
      this.logger.error('Missing "styles.scss" file');
      return;
    }

    // Credit: https://github.com/powercord-org/powercord/blob/v2/src/fake_node_modules/powercord/compilers/scss.js
    const file = files[index];
    const contents = await fs.readFile(file, { encoding: 'utf8' });
    const render = promisifyRender({
      data: contents,
      importer: (url, prev) => {
        url = url.replace('file:///', '');
        if (existsSync(url)) return { file: url };

        const prevFile = prev === 'stdin' ? 'styles.scss' : prev.replace(/https?:\/\/(?:[a-z]+\.)/i, '');
        return { file: join(dirname(prevFile), url).replace(/\\/g, '/') };
      }
    });

    const cssDir = getArbitrayPath('static', 'css');
    try {
      const css = await render();
      await fs.writeFile(join(cssDir, 'styles.css'), css);
    } catch(ex) {
      this.logger.error('Unable to compile styles:', ex);
    }
  }
};