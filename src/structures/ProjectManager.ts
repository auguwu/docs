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

import { readdir, sleep } from '@augu/utils';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import TTLCache from './TTLCache';
import { join } from 'path';
import Loggaby from 'loggaby';
import * as fs from 'fs/promises';

export enum ProjectModuleType {
  /** If we should use @microsoft/tsdoc to render out documentation */
  TypeScript = 'typescript',

  /** If we should use JSDoc to render out documentation */
  JavaScript = 'javascript',

  /** If we should use markdown-it to render out documentation */
  Markdown = 'markdown'
}

export interface Project {
  /** The type to render out documentation */
  moduleType: ProjectModuleType;

  /** GitHub URL for getting documentation */
  githubUrl: string;

  /**
   * Any branches to clone, if this is set, `.cache` will have subdirectories
   * for each branch.
   *
   * @default ['master']
   */
  branches?: string[];

  /** The name of the project */
  name: string;
}

interface DocManifest {
  directories: string | string[];
  branch: string;
  name: string;
}

interface RenderResult {
  directories: string[];
  renderer: ProjectModuleType;
  contents: { content: string; file: string; }[];
  meta: DocManifest[];
}

const projects: Project[] = [
  {
    moduleType: ProjectModuleType.TypeScript,
    githubUrl: 'https://github.com/auguwu/collections',
    name: 'collections'
  },
  {
    moduleType: ProjectModuleType.JavaScript,
    githubUrl: 'https://github.com/auguwu/dotenv',
    name: 'dotenv'
  },
  {
    moduleType: ProjectModuleType.TypeScript,
    githubUrl: 'https://github.com/auguwu/Wumpcord',
    branches: ['indev', 'master'],
    name: 'Wumpcord'
  },
  {
    moduleType: ProjectModuleType.TypeScript,
    githubUrl: 'https://github.com/auguwu/orchid',
    name: 'orchid'
  },
  {
    moduleType: ProjectModuleType.Markdown,
    githubUrl: 'https://github.com/auguwu/cute.floofy.dev',
    name: 'ShareX'
  },
  {
    moduleType: ProjectModuleType.TypeScript,
    githubUrl: 'https://github.com/auguwu/http-core',
    name: 'http'
  },
  {
    moduleType: ProjectModuleType.TypeScript,
    githubUrl: 'https://github.com/auguwu/utils',
    name: 'Utilities'
  }
];

function _convert(r: string | string[]) {
  return typeof r === 'string' ? [r] : r;
}

export default class ProjectManager {
  #logger = new Loggaby<'success'>({
    levels: [
      {
        name: 'success',
        color: 'green',
        call: 'success'
      }
    ]
  });

  #cache: TTLCache<RenderResult> = new TTLCache(this.refresh.bind(this));
  #cacheDir: string = join(__dirname, '..', '.cache');

  async init() {
    this.#logger.debug('Now loading projects...');

    if (!existsSync(this.#cacheDir))
      await fs.mkdir(this.#cacheDir);

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      this.#logger.debug(`Found project '${project.name}', now cloning...`);

      const branches = project.branches ?? ['master'];
      const docsDir: string[] = [];

      if (branches.length === 1) {
        this.#logger.debug(`Project '${project.name}' only need to generate from the master branch.`);
        execSync(`git clone ${project.githubUrl} ${project.name}`, {
          cwd: join(this.#cacheDir)
        });

        // make sure git done it's thing
        await sleep(2000);
        docsDir.push(join(this.#cacheDir, project.name, 'docs'));
      } else {
        this.#logger.debug(`Project '${project.name}' only needs to generate from ${branches.join(', ')} branches.`);
        for (let ii = 0; ii < branches.length; ii++) {
          execSync(`git clone ${project.githubUrl} -b ${branches[ii]} ${project.name}:${branches[ii]}`, { cwd: join(this.#cacheDir) });

          await sleep(2000);
          docsDir.push(join(this.#cacheDir, `${project.name}:${branches[ii]}`, 'docs'));
        }
      }

      this.#logger.success(`Loaded doc cache for project ${project.name}`);
      const docsMeta: DocManifest[] = [];

      if (docsDir.length === 1) {
        if (!existsSync(join(docsDir[0], 'docs.json'))) {
          this.#logger.fatal(`Project "${project.name}" is missing \`docs.json\` in ${docsDir[0]}`);
          continue;
        }

        const files = await readdir(docsDir[0]);
        try {
          const data = JSON.parse(files[0]);

          data.branch = 'master';
          docsMeta.push(data);
        } catch(ex) {
          this.#logger.fatal(`Project "${project.name}"'s manifest not a JSON blob`);
          continue;
        }
      } else {
        const hasManifest = docsDir.some(e => existsSync(join(e, 'docs.json')));
        if (!hasManifest) {
          const denied = docsDir.filter(e => !existsSync(join(e, 'docs.json')));
          this.#logger.fatal(`Project "${project.name}"'s branches has no 'docs/docs.json' file (${denied.length} | ${denied.join(';')})`);

          continue;
        }

        for (let j = 0; j < docsDir.length; j++) {
          const files = await readdir(docsDir[j]);
          try {
            const data = JSON.parse(files[0]);
            docsMeta.push(data);
          } catch(ex) {
            this.#logger.fatal(`Project "${project.name}"'s manifest not a JSON blob`);
            continue;
          }
        }
      }

      this.#logger.success(`Loaded docs.json from ${branches.length === 1 ? 'the master branch' : `branches ${branches.join(', ')}`}`);
      this.#logger.debug('Now rendering documentation...');

      const directories = docsMeta.length === 1 ? _convert(docsMeta[0].directories) : docsMeta.map(val => _convert(val.directories)).flat();
      const result = await this.render(docsMeta.length === 1 ? [docsMeta[0]] : docsMeta, directories, project.moduleType);

      this.#cache.add(project.name, result);
      this.#logger.success(`Rendered ${result.contents.length} files from ${result.directories.length} directories in project "${project.name}"`);
    }
  }

  async refresh() {
    this.#logger.debug('Re-rendering...');
    this.#cache.cache.forEach(async (render, key) => {
      const result = await this.render(render.meta, render.directories, render.renderer);
      this.#cache.cache.set(key, result);
    });
  }

  async render(
    meta: DocManifest[],
    directories: string[],
    renderer: ProjectModuleType
  ) {
    const result: RenderResult = { meta, directories, renderer, contents: [] };
    for (let i = 0; i < directories.length; i++) {
      const directory = directories[i];
      const files = await readdir(directory);

      this.#logger.debug(`Found ${files.length} to render (renderer=${renderer})`);
      for (const file of files) {
        const contents = await fs.readFile(file, { encoding: 'utf8' });
        const render = renderer === ProjectModuleType.JavaScript
          ? '_renderJSDoc'
          : renderer === ProjectModuleType.TypeScript
            ? '_renderTSDoc'
            : '_renderMarkdown';

        const rendered = await (this[render] as (contents: string) => Promise<string>)(contents) as unknown as string;
        result.contents.push({ content: rendered, file });
      }
    }

    return result;
  }

  private _renderTSDoc(contents: string) {
    // todo
  }

  private _renderJSDoc(contents: string) {
    // todo
  }

  private _renderMarkdown(contents: string) {
    // todo
  }
}
