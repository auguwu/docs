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

import { Application, TSConfigReader, TypeDocReader } from 'typedoc';
import { Component, Inject } from '@augu/lilith';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { Logger } from 'tslog';
import { mkdir } from 'fs/promises';
import { exec } from 'child_process';
import Projects from './Projects';

export default class Typedoc implements Component {
  public priority: number = 1;
  public name: string = 'typedoc';

  @Inject
  private projects!: Projects;

  @Inject
  private logger!: Logger;

  async load() {
    this.logger.info(`Loading in ${this.projects.size} projects...`);
    for (const project of this.projects.values()) {
      const app = new Application();
      app.options.addReader(new TypeDocReader());
      app.options.addReader(new TSConfigReader());

      app.bootstrap({
        excludeProtected: true,
        highlightTheme: 'nord',
        excludePrivate: true,
        entryPoints: [resolve(process.cwd(), '..', 'static', 'cache', project.escapedName, 'branch_master', 'src')],
        tsconfig: resolve(process.cwd(), '..', 'static', 'cache', project.escapedName, 'branch_master', 'tsconfig.json'),
        logger: (msg: string) => this.logger.silly(`Typedoc [${project.name}]:    ${msg}`),
        readme: resolve(process.cwd(), '..', 'static', 'cache', project.escapedName, 'branch_master', 'README.md'),
        name: project.name
      });

      const reflection = app.convert();
      if (reflection !== undefined) {
        this.logger.info(`Typedoc [${project.name}]:    Created project reflection, now exporting...`);
        if (!existsSync(join(process.cwd(), '..', 'static', 'docs', project.escapedName, 'branch_master')))
          await mkdir(join(process.cwd(), '..', 'static', 'docs', project.escapedName, 'branch_master'), { recursive: true });

        await app.generateDocs(reflection, join(process.cwd(), '..', 'static', 'docs', project.escapedName, 'branch_master'));
      }
    }

    return Promise.resolve(); // resolve
  }
}
