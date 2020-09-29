/**
 * Copyright (c) 2019-2020 August
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

const { createLogger } = require('../Logger');
const { Collection } = require('@augu/immutable');
const orchid = require('@augu/orchid');

/**
 * List of projects to withold documentation
 * @type {{ [x: string]: Project }}
 */
const Projects = {
  '@augu/immutable': {
    downloadUrl: (version) => `https://registry.npmjs.org/@augu/immutable/-/immutable-${version}.tgz`,
    stargazers: 0,
    downloads: 0,
    githubUrl: 'auguwu/immutable',
    version: '$VERSION$',
    docsUrl: 'https://docs.augu.dev/immutable',
    npmUrl: 'https://npmjs.com/package/@augu/immutable',
    name: 'Immutable'
  },
  '@augu/orchid': {
    downloadUrl: (version) => `https://registry.npmjs.org/@augu/orchid/-/orchid-${version}.tgz`,
    stargazers: 0,
    downloads: 0,
    githubUrl: 'auguwu/orchid',
    version: '$VERSION$',
    docsUrl: 'https://docs.augu.dev/orchid',
    npmUrl: 'https://npmjs.com/package/@augu/orchid',
    name: 'Orchid'
  },
  '@augu/ichigo': {
    downloadUrl: (version) => `https://registry.npmjs.org/@augu/ichigo/-/ichigo-${version}.tgz`,
    stargazers: 0,
    downloads: 0,
    githubUrl: 'auguwu/ichigo',
    version: '$VERSION$',
    docsUrl: 'https://docs.augu.dev/ichigo',
    npmUrl: 'https://npmjs.com/package/@augu/ichigo',
    name: 'Ichigo'
  },
  '@augu/dotenv': {
    downloadUrl: (version) => `https://registry.npmjs.org/@augu/dotenv/-/dotenv-${version}.tgz`,
    stargazers: 0,
    downloads: 0,
    githubUrl: 'auguwu/dotenv',
    version: '$VERSION$',
    docsUrl: 'https://docs.augu.dev/dotenv',
    npmUrl: 'https://npmjs.com/package/@augu/dotenv',
    name: 'dotenv'
  },
  '@augu/maru': {
    downloadUrl: (version) => `https://registry.npmjs.org/@augu/maru/-/maru-${version}.tgz`,
    stargazers: 0,
    downloads: 0,
    githubUrl: 'auguwu/maru',
    version: '$VERSION$',
    docsUrl: 'https://docs.augu.dev/maru',
    npmUrl: 'https://npmjs.com/package/@augu/maru',
    name: 'Maru'
  },
  'laffey': {
    downloadUrl: (version) => `https://registry.npmjs.org/laffey/-/laffey-${version}.tgz`,
    stargazers: 0,
    downloads: 0,
    githubUrl: 'auguwu/laffey',
    version: '$VERSION$',
    docsUrl: 'https://docs.augu.dev/laffey',
    npmUrl: 'https://npmjs.com/package/laffey',
    name: 'laffey'
  }
};

/**
 * Represents a class to handle anything project-related
 * @extends {Collection<Project>}
 */
module.exports = class ProjectsManager extends Collection {
  /**
   * Creates a new [ProjectsManager] instance
   */
  constructor() {
    super(Projects);
    
    /**
     * The logger for this [ProjectsManager]
     * @private
     */
    this.logger = createLogger('Projects', { depth: 2 });

    /**
     * The HTTP client to use to make requests
     */
    this.http = new orchid.HttpClient({
      agent: `docs.augu.dev (v${require('../../../package.json').version}, https://github.com/auguwu/docs)`
    });
  }

  /**
   * Loads this [ProjectManager]
   */
  async load() {
    this.logger.info('Now initialising...');

    for (const [key, project] of this) {
      this.logger.info(`Now building ${project.name}'s information...`);

      // Fetch basic GitHub information
      const res1 = await this.http.get(`https://api.github.com/repos/${project.githubUrl}`);
      const gh = res1.json();

      this.logger.debug('', '-=- Ratelimit Debug Info -=-', {
        remaining: Number(res1.headers['x-ratelimit-remaining']),
        reset: Number(res1.headers['x-ratelimit-reset'] * 1000),
        limit: Number(res1.headers['x-ratelimit-limit'])
      });

      if (res1.statusCode === 403) {
        this.logger.warn('Reached a ratelimited state, retrying later...');
        continue;
      }

      if (gh.private) {
        this.logger.warn(`Project "${project.name}" has gone private, skipping`);
        continue;
      }

      this.logger.debug(`Received information from GitHub (${res1.statusCode})`, {
        description: gh.description,
        stargazers: gh.stargazers_count,
        repository: gh.full_name,
        createdAt: new Date(gh.created_at),
        lastPushedAt: new Date(gh.pushed_at),
        updatedAt: new Date(gh.updated_at),
        language: gh.language,
        issues: gh.open_issues // includes prs and issues
      });

      project.lastPushedAt = new Date(gh.pushed_at);
      project.description = new Date(gh.description);
      project.stargazers = gh.stargazers_count;
      project.createdAt = new Date(gh.created_at);
      project.updatedAt = new Date(gh.updated_at);
      project.language = gh.language;
      project.issues = gh.open_issues; // includes prs and issues

      this.logger.info(`Populated information for ${project.name}, now getting version...`);
      const res2 = await this.http.get(`https://raw.githubusercontent.com/${project.githubUrl}/${gh.default_branch}/package.json`);
      const pkg = res2.json();

      this.logger.debug(`Received version "${pkg.version}" for project "${project.githubUrl}" (branch: ${gh.default_branch})`);
      project.version = pkg.version;

      this.set(key, project);
    }
  }
};

/**
 * @typedef {object} Project
 * @prop {Date} lastPushedAt
 * @prop {string} description
 * @prop {string} downloadUrl
 * @prop {number} stargazers
 * @prop {number} downloads
 * @prop {Date} createdAt
 * @prop {Date} updatedAt
 * @prop {string} githubUrl
 * @prop {string} language
 * @prop {string} version
 * @prop {string} docsUrl
 * @prop {string} npmUrl
 * @prop {string} name
 */
