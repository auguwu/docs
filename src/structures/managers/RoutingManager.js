/**
 * Copyright (c) 2019-2020 August
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

const { createLogger } = require('../Logger');
const { existsSync } = require('fs');
const { join } = require('path');
const util = require('../../util');

/**
 * Routing manager to handle routing for this application
 */
module.exports = class RoutingManager {
  /**
   * Creates a new [RoutingManager] instance
   * @param {import('../Application')} app The application itself 
   */
  constructor(app) {
    /**
     * If this [RoutingManager] is initialised or not
     * @type {boolean}
     */
    this.initialised = false;

    /**
     * The logger instance
     * @private
     */
    this.logger = createLogger('Routing', { depth: 2 });

    /**
     * The path to load routers
     * @type {string}
     */
    this.path = util.getArbitrayPath('routes');

    /**
     * The application
     * @type {import('../Application')}
     * @private
     */
    this.app = app;
  }

  /**
   * Loads this [RoutingManager] instance
   */
  async load() {
    if (!existsSync(this.path)) {
      this.logger.error(new Error(`Path "${this.path}" doesn't exist, did you install a broken commit?`));
      return;
    }

    const files = await util.recursiveDir(this.path);
    if (!files.length) {
      this.logger.error(new Error('No routes were found'));
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = require(join(this.path, files[i]));
      if (!file.hasOwnProperty('path') || !file.hasOwnProperty('router')) {
        this.logger.error(new Error(`File "${files[i]}" doesn't include exported values: "path" or "router"`));
        continue;
      }

      this.app.service.use(file.path === '' ? '/' : `/${file.path}`, file.router);
      this.logger.info(`Initialised router for path "${file.path === '' ? '/' : `/${file.path}`}"`);
    }

    this.initialised = true;
  }
};
