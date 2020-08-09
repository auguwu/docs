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
const { promises: fs } = require('fs');
const { Collection } = require('@augu/immutable');
const { Signale } = require('signale');
const { join } = require('path');

/**
 * Represents the container for all plugins
 * @extends {Collection<import('../Plugin')>}
 */
module.exports = class PluginManager extends Collection {
  /**
   * Creates a new [PluginManager] instance
   * @param {import('../Server')} server The server instance
   */
  constructor(server) {
    super();

    /**
     * The server instance
     * @type {import('../Server')}
     */
    this.server = server;

    /**
     * The logger instance
     * @type {import('signale').Signale}
     */
    this.logger = new Signale({ scope: 'Plugins' });

    /**
     * The path to find all of the plugins
     * @type {string}
     */
    this.path = getArbitrayPath('plugins');
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

    for (const file of files) {
      const Plugin = require(join(this.path, file));
      /** @type {import('../Plugin')} */
      const plugin = new Plugin();

      this.set(plugin.name, plugin);
      this.server.app.register(plugin.fastifyPlugin);
    }
  }
};