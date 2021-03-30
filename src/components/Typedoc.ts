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

import { Component, Inject } from '@augu/lilith';
import { Application } from 'typedoc';
import { Logger } from 'tslog';
import { join } from 'path';
import Projects from './Projects';

export default class Typedoc implements Component {
  public priority: number = 1;
  private app!: Application;
  public name: string = 'typedoc';

  @Inject
  private projects!: Projects;

  @Inject
  private logger!: Logger;

  load() {
    this.logger.info(`Loading in ${this.projects.size} projects...`);
    this.app = new Application();
    this.app.bootstrap({
      highlightTheme: 'nord',
      tsconfig: join(__dirname, '..', '..', 'tsconfig.json'),
      logger: msg => this.logger.silly(`TypeDoc: ${msg}`),
      readme: join(__dirname, '..', '..', 'static', 'index.md'),
      name: 'docs.floofy.dev'
    });

    console.log(this.app);

    //const sauce = this.app.expandInputFiles([
    //  '../../static/cache/**/*.ts'
    //]);
  }
}
