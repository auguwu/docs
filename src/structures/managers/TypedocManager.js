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
const typedoc = require('typedoc');
const util = require('../../util');

/**
 * Represents a manager to handle documentation-related stuff in a TypeScript project,
 * we use `typedoc` to generate this
 * 
 * - Target: **ESNext**
 * - Module: **CommonJS**
 */
module.exports = class TypedocManager {
  /**
   * Creates a new [TypedocManager] instance
   * @param {import('../Application')} app The application service
   */
  constructor(app) {
    /**
     * If the manager has been initialised or not
     * @type {boolean}
     */
    this.initialised = false;

    /**
     * The logger of this [TypedocManager]
     */
    this.logger = createLogger('Typedoc', { depth: 2 });

    /**
     * The Typedoc application itself
     * @type {typedoc.Application}
     */
    this.service = new typedoc.Application({
      mode: 'modules',
      target: 'esnext',
      module: 'commonjs',
      expirementalDecorators: true,
      skipLibCheck: false,
      excludePrivate: false,
      exclude: ['**/node_modules/**', '**/*.spec.ts'],
      excludeExternals: true,
      includeDeclarations: true,
      name: 'docs.augu.dev',
      readme: 'none',
      theme: util.getArbitrayPath('theme'),
      logger: (message) => {
        this.logger.info(message);
      }
    });

    /**
     * The application itself
     * @private
     * @type {import('../Application')}
     */
    this.app = app;
  }

  /**
   * Initialises this [TypedocManager]
   */
  load() {
    if (!this.app.projects.initialised) {
      if (this._queueInterval) clearTimeout(this._queueInterval);

      this.logger.warn('Projects manager hasn\'t been initialised, re-queueing in 10 seconds...');
      this._queueInterval = setTimeout(this.load.bind(this), 10000);
    }

    /** @type {import('./ProjectManager').Project[]} */
    const sources = this.app.projects.toArray();

    this.logger.info('Now generating documentation!\n', '-=- Typedoc Information -=-', {
      target: 'ESNext',
      module: 'CommonJS',
      typescript: `v${require('typescript').version}`,
      typedoc: `v${require('../../../node_modules/typedoc/package.json').version}`
    });

    if (!sources.length) {
      this.logger.warn('Missing projects to load, not initialising...');

      this.initialised = true;
      return;
    }

    const source = this.service.expandInputFiles(sources.map(s => s.name));
    const project = this.service.convert(source);

    const success = this.service.generateDocs(project, util.getArbitrayPath('.cache', 'docs'));
    if (success) {
      this.logger.info('Successfully put documentation in "uwu.json"');
      this.initialised = true;
    } else {
      this.logger.warn('Unable to serialise project reflection, try again later');
    }
  }
};
