/**
 * Copyright (c) 2020-2021 August
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

import { readdir } from '@augu/utils';
import unified from 'unified';
import github from 'remark-github';
import remark from 'remark-parse';
import Logger from '../Logger';
import gfm from 'remark-gfm';

export default class MarkdownRenderer {
  private directory: string;
  private compiler: unified.FrozenProcessor;
  private logger = Logger.get();

  constructor(directory: string) {
    this.directory = directory;
    this.compiler = unified()
      .use(github())
      .use(remark)
      .use(gfm)
      .freeze(); // freeze the compiler so no plugins are added
  }

  /**
   * Render all the contents in the directory and return the result
   *
   * @remarks
   * Works in O(N) complexity, so the larger the files, the larger
   * the renderer takes to load. Use `MarkdownRenderer.renderFile`
   * to render the Markdown from a specific file.
   *
   * @returns The registry provided or `undefined` if any errors occur
   */
  async render() {
    this.logger.debug(`Told to render all contents in directory "${this.directory}"`);
  }

  /**
   * Renders a specific file and returns the contents
   *
   * @remarks
   * If you need to traverse over all the files in the directory
   * this renderer is in, use `MarkdownRenderer.render` to render
   * all files and returns the registry for all of them. Note that method
   * works in O(N) complexity; it'll take longer to render all files
   * than this method.
   *
   * @returns The registry provided or `null` if we couldn't get the registry
   */
  async renderFile(file: string) {
    // todo: owo
  }
}
