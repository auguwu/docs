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
import { mkdir } from 'fs/promises';
import ts from 'typescript';
import { readdir } from '@augu/utils';
import execAsync from '../utils/execAsync';

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

        // Change directory
        const currDir = process.cwd();
        process.chdir(join(process.cwd(), '..', '.camellia', 'typescript', `${project.name}_${branches[j]}`));

        // Get reflection on project
        const reflection = app.convert();
        if (reflection !== undefined) {
          this.logger.info(`retrieved reflection for ${project.name} (branch: ${branches[j]})`);
          await app.generateJson(reflection, join(process.cwd(), '..', 'reflection', `${project.name}_${branches[j]}`, 'out.json'));
        }

        // put it back to the actual current directory
        process.chdir(currDir);
      }
    }
  }

  async _createGitBranchCache(name: string, githubUri: string, branch: string) {
    this.logger.info(`cloning "${githubUri}" to "${name}:${branch}"`);
    const CACHE_DIR = join(process.cwd(), '..', '.camellia', 'typescript');
    if (!existsSync(CACHE_DIR))
      await mkdir(CACHE_DIR, { recursive: true });

    await execAsync(`git clone ${githubUri} "${name}_${branch}" -b ${branch}`, {
      cwd: join(process.cwd(), '..', '.camellia', 'typescript')
    });

    await execAsync('npm install', {
      cwd: join(process.cwd(), '..', '.camellia', 'typescript', `${name}_${branch}`)
    });
  }

  async _createApplication(name: string, branch: string) {
    this.logger.info(`created typedoc app for "${name}" under branch ${branch}.`);
    const app = new typedoc.Application();
    const CACHE_DIR = join(process.cwd(), '..', '.camellia', 'typescript', `${name}_${branch}`);

    app.bootstrap({
      entryPoints: ['src/**/*.ts'],
      excludeInternal: true,
      excludePrivate: true,
      excludeProtected: true,
      includeVersion: true,
      readme: 'README.md',
      gitRemote: branch
    });

    const files = await readdir(join(CACHE_DIR, 'src'));
    console.log(files);

    app.options.setCompilerOptions(
      files,
      {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.CommonJS,
        lib: ['ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', 'ESNext']
          .map(lib => `lib.${lib.toLowerCase()}.d.ts`),

        declaration: false,
        strict: true,
        noImplicitAny: false, // because fuck you :D
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        newLine: ts.NewLineKind.LineFeed,
        noEmitOnError: true,
        forceConsistentCasingInFileNames: true,
        removeComments: true,

        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        rootDir: join(CACHE_DIR, 'src'),
        outDir: join(CACHE_DIR, 'build'),
        types: ['node', '@augu/utils']
      },
      []
    );

    this.appCache.set(`${name}:${branch}`, app);
    return app;
  }
}
