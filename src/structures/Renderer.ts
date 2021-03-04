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

import type Project from './Project';

interface RenderResult {
  contents: string[];
  files: string[];
}

export default abstract class Renderer {
  public directory: string;
  public project: Project;

  constructor(directory: string, project: Project) {
    this.directory = directory;
    this.project   = project;
  }

  /**
   * Renders all of the content in the directory specified
   * and returns what was rendered and what files were rendered.
   *
   * @remarks
   * This function is O(N)-complexity, the bigger the data set is,
   * the longer it'll take. Use `Renderer.renderFile` to render
   * a single file in the directory.
   */
  abstract render(): Promise<RenderResult>;

  /**
   * Render content from a file in the directory specified
   * and returns what was rendered.
   */
  abstract renderFile(file: string): Promise<string>;
}
