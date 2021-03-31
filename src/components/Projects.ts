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

import { readdirSync, existsSync } from 'fs';
import { Component, Inject } from '@augu/lilith';
import { mkdir, unlink } from 'fs/promises';
import { Collection } from '@augu/collections';
import gitFactory from 'simple-git/promise';
import { Logger } from 'tslog';
import { join } from 'path';
import _rimraf from 'rimraf';

// const escapeName = (text: string) => text.replace(/@augu\//gi, '').toLowerCase();

const rimraf = (path: string) => new Promise<void>((resolve, reject) => _rimraf(path, (error) => error !== undefined ? resolve() : reject(error)));

interface Project {
  cacheDirName?: string;
  escapedName: string;
  branches: string[];
  github: string;
  name: string;
}

const REMOVE_DIRS = [
  '.github',
  '.vscode',
  'docs',
  'examples',
  'tests',
  'scripts'
] as const;

const REMOVE_FILES = [
  '.eslintignore',
  '.eslintrc.json',
  '.gitignore',
  '.npmignore',
  '.travis.yml',
  'esm.mjs',
  'index.d.ts',
  'jest.config.js',
  'renovate.json',
  'tsconfig.test.json'
] as const;

export default class Projects extends Collection<string, Project> implements Component {
  public priority: number = 0;
  public name: string = 'projects';

  @Inject
  private logger!: Logger;

  load() {
    // now it's time for hell
    // todo: use a file for this instead of hard-coding

    this.set('@augu/collections', {
      escapedName: 'collections',
      branches: ['master'],
      github: 'https://github.com/auguwu/collections',
      name: '@augu/collections'
    });

    this.set('wumpcord', {
      escapedName: 'wumpcord',
      branches: ['master', 'index'],
      github: 'https://github.com/auguwu/Wumpcord',
      name: 'wumpcord'
    });

    return this.init();
  }

  private async init() {
    const CACHE_DIR = join(__dirname, '..', '..', 'static', 'cache');
    if (!existsSync(CACHE_DIR))
      await mkdir(CACHE_DIR);

    for (const project of this.values()) {
      this.logger.debug(`Projects: Initializing project ${project.name}...`);
      if (!existsSync(join(CACHE_DIR, project.escapedName)))
        await mkdir(join(CACHE_DIR, project.escapedName));

      this.logger.debug(`Projects [${project.name}]: Created Git factory.`);
      const git = gitFactory(join(CACHE_DIR, project.escapedName));
      for (const branch of project.branches.filter(r => r === 'master')) { // yea sucks but simple-git has no -b support?
        if (existsSync(join(CACHE_DIR, project.escapedName, `branch_${branch}`))) {
          this.logger.debug(`Projects [${project.name}/${branch}]: Repository already exists, now pulling changes...`);
          await git.pull();
        } else {
          this.logger.debug(`Projects [${project.name}/${branch}]: Repository already exists, now pulling changes...`);
          await git.clone(project.github, `branch_${branch}`);
        }
      }

      this.logger.debug(`Projects [${project.name}]: Setup ${project.branches.length} branches successfully(?)`);
      this.logger.debug(`Projects [${project.name}]: Now cleaning...`);

      const files = readdirSync(join(CACHE_DIR, project.escapedName, 'branch_master'));
      for (let i = 0; i < files.length; i++) {
        if (REMOVE_DIRS.includes(files[i] as any))
          await rimraf(join(CACHE_DIR, project.escapedName, 'branch_master', files[i]));

        if (REMOVE_FILES.includes(files[i] as any))
          await unlink(join(CACHE_DIR, project.escapedName, 'branch_master', files[i]));
      }

      this.logger.debug(`Projects [${project.name}]: Cleaned successfully`);
    }
  }
}
