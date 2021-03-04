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

import MarkdownEngine from '../renderers/Markdown';
import type Renderer from './Renderer';
import TSEngine from '../renderers/TypeScript';

/** declaration interface of a [Project] */
interface ProjectInfo {
  /** The description of the project */
  description: string;

  /** GitHub repository URL */
  repository: string;

  /** Use the README.md file as a homepage (default: true) */
  useReadme?: boolean;

  /** Renderer type to use */
  renderer: 'markdown' | 'typescript';

  /** The name of the project */
  name: string;
}

export default class Project {
  public ['constructor']!: typeof Project;

  public rendererType: 'markdown' | 'typescript';
  public description:  string;
  public repository:   string;
  public useReadme:    boolean;
  public directory:    string;
  public name:         string;

  #engine!: Renderer;

  constructor(
    directory: string,
    meta: ProjectInfo
  ) {
    this.constructor.validateMetadata(meta);

    this.rendererType = meta.renderer;
    this.description  = meta.description;
    this.repository   = meta.repository;
    this.useReadme    = meta.useReadme ?? true;
    this.directory    = directory;
    this.name         = meta.name;
  }

  private static validateMetadata(info: ProjectInfo) {
    if (!info.name || !info.description || !info.repository)
      throw new TypeError('Missing the following keys: name, description, repository');

    if (info.renderer !== undefined) {
      if (typeof info.renderer !== 'string')
        throw new TypeError(`[docs.json / "renderer"] Expected 'string' but received ${typeof info.renderer}`);

      if (!['markdown', 'typescript'].includes(info.renderer))
        throw new TypeError(`Renderer "${info.renderer}" is not supported at this time. (supported: markdown, typescript)`);
    }
  }

  /**
   * Returns the rendering engine to use
   */
  getRenderEngine() {
    if (this.#engine)
      return this.#engine;

    switch (this.rendererType) {
      case 'typescript':
        return (this.#engine ??= new TSEngine(this));

      case 'markdown':
        return (this.#engine ??= new MarkdownEngine(this));

      default:
        throw new TypeError(); // shouldn't go here but it's whatever
    }
  }
}
