/**
 * 椿 / Camellia is the documentation site for Noelware
 * Copyright (c) 2021-present Noelware
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import type { DocProjectConfig } from '../../util/types';
import { Service, Inject } from '@augu/lilith';
import { Collection } from '@augu/collections';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { Logger } from 'tslog';
import simpleGit from 'simple-git/promise';
import { load } from 'js-yaml';
import { join } from 'path';
import Config from '../components/Config';

interface Project extends Pick<DocProjectConfig, 'name' | 'repository'> {
  directory: string | string[];
  renderer: any;
  branches: string | string[];
  config?: DocProjectConfig;
}

const RENDERERS = {
  typescript: {},
  markdown: {},
  kotlin: {}
};

@Service({
  priority: 0,
  name: 'projects'
})
export default class ProjectService extends Collection<string, Project> {
  @Inject
  private readonly logger!: Logger;

  @Inject
  private readonly config!: Config;

  async load() {
    const projects = this.config.getProperty('projects');
    if (projects === undefined || projects.length > 0) {
      throw new Error('Missing `projects` configuration.');
    }

    for (const project of projects) {
      const directories = project.branches !== undefined
        ? Array.isArray(project.branches)
          ? project.branches.map(branch => join(process.cwd(), '..', '.camellia', project.name, branch))
          : join(process.cwd(), '..', '.camellia', project.name, project.branches)
        : join(process.cwd(), '..', '.camellia', project.name, 'master');

      const renderCls = RENDERERS[project.renderer];
      if (!renderCls)
        throw new Error(`Unknown renderer -> ${project.renderer}`);

      const p: Project = {
        directory: directories,
        renderer: new renderCls(),
        branches: project.branches !== undefined ? project.branches : 'master',
        repository: project.githubUrl,
        name: project.name
      };

      // Clone the repository
      if (project.branches !== undefined) {
        if (Array.isArray(project.branches)) {
          for (let i = 0; i < project.branches.length; i++) {
            const branch = project.branches[i];
            this.logger.info(`Cloning ${project.githubUrl} as branch ${branch}...`);

            const git = simpleGit(join(process.cwd(), '..', '.camellia', project.name));
            await git.clone(project.githubUrl, join(process.cwd(), '..', '.camellia', project.name, branch), {
              branch
            });

            // Check if the project has a docs/docs.yml
            if (
              existsSync(join(process.cwd(), '.camellia', project.name, branch, 'docs')) &&
              existsSync(join(process.cwd(), '.camellia', project.name, branch, 'docs', 'docs.yml'))
            ) {
              const contents = await readFile(join(process.cwd(), '.camellia', project.name, branch, 'docs', 'docs.yml'), { encoding: 'utf-8' });
              const config = load(contents) as unknown as DocProjectConfig;

              p.config = config;
            } else {
              throw new TypeError('Missing docs/docs.yml file.');
            }
          }
        } else {
          this.logger.info(`Cloning ${project.githubUrl} as branch ${project.branches}...`);

          const git = simpleGit(join(process.cwd(), '..', '.camellia', project.name));
          await git.clone(project.githubUrl, join(process.cwd(), '..', '.camellia', project.name, project.branches), {
            branch: project.branches
          });

          // Check if the project has a docs/docs.yml
          if (
            existsSync(join(process.cwd(), '.camellia', project.name, project.branches, 'docs')) &&
            existsSync(join(process.cwd(), '.camellia', project.name, project.branches, 'docs', 'docs.yml'))
          ) {
            const contents = await readFile(join(process.cwd(), '.camellia', project.name, project.branches, 'docs', 'docs.yml'), { encoding: 'utf-8' });
            const config = load(contents) as unknown as DocProjectConfig;

            p.config = config;
          } else {
            throw new TypeError('Missing docs/docs.yml file.');
          }
        }
      } else {
        this.logger.info(`Cloning ${project.githubUrl} as branch master...`);

        const git = simpleGit(join(process.cwd(), '..', '.camellia', project.name));
        await git.clone(project.githubUrl, join(process.cwd(), '..', '.camellia', project.name, 'master'), {
          branch: 'master'
        });

        // Check if the project has a docs/docs.yml
        if (
          existsSync(join(process.cwd(), '.camellia', project.name, 'master', 'docs')) &&
          existsSync(join(process.cwd(), '.camellia', project.name, 'master', 'docs', 'docs.yml'))
        ) {
          const contents = await readFile(join(process.cwd(), '.camellia', project.name, 'master', 'docs', 'docs.yml'), { encoding: 'utf-8' });
          const config = load(contents) as unknown as DocProjectConfig;

          p.config = config;
        } else {
          throw new TypeError('Missing docs/docs.yml file.');
        }
      }

      // Now we render out the result!
      await p.renderer.init(join(process.cwd(), '.camellia', project.name));
      this.set(p.name, p);
    }
  }
}
