/**
 * Copyright (c) Noelware
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

import { Renderer, AbstractRenderer, RenderResult } from '../structures';
import type { ProjectConfig } from '../components/Config';
import { Logger } from 'tslog';
import { Inject } from '@augu/lilith';
import LRUCache from 'lru-cache';
import * as typedoc from 'typedoc';
import { exec } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
import { mkdir, rmdir } from 'fs/promises';

@Renderer('typescript')
export default class TypeScriptRenderer implements AbstractRenderer<[string, string]> {
  @Inject
  private readonly logger!: Logger;

  private readonly appCache: LRUCache<string, typedoc.Application> = new LRUCache(100_000);
  private readonly cache: LRUCache<string, RenderResult> = new LRUCache(100_000); // it shouldn't go that high but u never know lol

  async render(project: string, path: string): Promise<any> {
    return Promise.resolve();
  }

  async init(projects: ProjectConfig[]) {
    this.logger.info(`Told to initialize ${projects.length} project using the TypeScript renderer.`);
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const branches = project.branches ?? ['master'];

      for (let j = 0; j < branches.length; j++) {
        await this._createGitBranchCache(project.name, project.github, branches[j]);
        const app = await this._createApplication(project.name, branches[j]);
      }
    }
  }

  async _createGitBranchCache(name: string, githubUri: string, branch: string) {
    this.logger.info(`cloning "${githubUri}" to "${name}:${branch}"`);
    const CACHE_DIR = join(process.cwd(), '..', '.camellia', 'typescript');
    if (!existsSync(CACHE_DIR))
      await mkdir(CACHE_DIR, { recursive: true });

    const child = exec(`git clone ${githubUri} "${name}_${branch}" -b ${branch} `, {
      cwd: join(process.cwd(), '..', '.camellia', 'typescript')
    });

    child.stdout?.on('data', chunk => this.logger.info(`\n${chunk}`));
    child.stderr?.on('data', chunk => this.logger.info(`\n${chunk}`));

    child.once('exit', code =>
      this.logger.info(code === 0 ? `Cloned to "${join(CACHE_DIR, `${name}_${branch}`)}" successfully.` : 'Didn\'t create.')
    );
  }

  async _createApplication(name: string, branch: string) {
    this.logger.info(`created typedoc app for "${name}" under branch ${branch}.`);
    const app = new typedoc.Application();
    app.bootstrap();

    this.appCache.set(`${name}:${branch}`, app);
  }
}
