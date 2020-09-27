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

const { existsSync, createWriteStream, createReadStream, promises: fs } = require('fs');
const { createLogger } = require('../Logger');
const { Collection } = require('@augu/immutable');
const { join } = require('path');
const orchid = require('@augu/orchid');
const util = require('../../util');
const tar = require('tar');
const { createGunzip } = require('zlib');

/**
 * List of projects to withold documentation
 * @type {{ [x: string]: Project }}
 */
const Projects = {
  '@augu/immutable': {
    downloadUrl: 'https://registry.npmjs.org/@augu/immutable/-/immutable-$VERSION$.tgz',
    stargazers: 0,
    downloads: 0,
    githubUrl: 'auguwu/immutable',
    version: '$VERSION$',
    docsUrl: 'https://docs.augu.dev/immutable',
    npmUrl: 'https://npmjs.com/package/@augu/immutable',
    name: 'Immutable'
  },
  '@augu/orchid': {
    downloadUrl: 'https://registry.npmjs.org/@augu/orchid/-/orchid-$VERSION$.tgz',
    stargazers: 0,
    downloads: 0,
    githubUrl: 'auguwu/orchid',
    version: '$VERSION$',
    docsUrl: 'https://docs.augu.dev/orchid',
    npmUrl: 'https://npmjs.com/package/@augu/orchid',
    name: 'Orchid'
  },
  '@augu/ichigo': {
    downloadUrl: 'https://registry.npmjs.org/@augu/ichigo/-/ichigo-$VERSION$.tgz',
    stargazers: 0,
    downloads: 0,
    githubUrl: 'auguwu/ichigo',
    version: '$VERSION$',
    docsUrl: 'https://docs.augu.dev/ichigo',
    npmUrl: 'https://npmjs.com/package/@augu/ichigo',
    name: 'Ichigo'
  },
  '@augu/dotenv': {
    downloadUrl: 'https://registry.npmjs.org/@augu/dotenv/-/dotenv-$VERSION$.tgz',
    stargazers: 0,
    downloads: 0,
    githubUrl: 'auguwu/dotenv',
    version: '$VERSION$',
    docsUrl: 'https://docs.augu.dev/dotenv',
    npmUrl: 'https://npmjs.com/package/@augu/dotenv',
    name: 'dotenv'
  },
  '@augu/maru': {
    downloadUrl: 'https://registry.npmjs.org/@augu/maru/-/maru-$VERSION$.tgz',
    stargazers: 0,
    downloads: 0,
    githubUrl: 'auguwu/maru',
    version: '$VERSION$',
    docsUrl: 'https://docs.augu.dev/maru',
    npmUrl: 'https://npmjs.com/package/@augu/maru',
    name: 'Maru'
  },
  'laffey': {
    downloadUrl: 'https://registry.npmjs.org/laffey/-/laffey-$VERSION$.tgz',
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

    this.http.use(orchid.middleware.streams());
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

      if (res1.statusCode === 403) {
        if (this.ratelimitReset) clearTimeout(this.ratelimitReset);

        this.logger.warn('Reached a ratelimited state, retrying later...');
        this.logger.debug('', '-=- Ratelimit Debug Info -=-', {
          remaining: Number(res1.headers['x-ratelimit-remaining']),
          reset: Number(res1.headers['x-ratelimit-reset'] * 1000),
          limit: Number(res1.headers['x-ratelimit-limit'])
        });

        this.ratelimitReset = setTimeout(async () => {
          this.logger.info('Retrying to build projects manager...');
          await this.load();
        }, Date.now() - Number(res1.headers['x-ratelimit-reset'] * 1000));

        break;
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

      // Now we clone it in a ".cache" folder for typedoc
      const destination = join(process.cwd(), '..', '.cache');
      const directory = join(destination, `${project.name.toLowerCase()}.tar.gz`);

      const files = await util.recursiveDir(destination, destination);
      for (let i = 0; i < files.length; i++) await fs.unlink(files[i]);

      if (!existsSync(destination)) await fs.mkdir(destination);

      this.logger.info(`Extracting local cache to "${destination}"...`);
      const res3 = await this
        .http
        .get(project.downloadUrl.replace('$VERSION$', project.version))
        .stream();
      
      const stream = res3.stream();

      try {
        await this.extract(directory, destination, stream);
      } catch(ex) {
        this.logger.error('Unable to extract tarball', ex);
      }
    }
  }

  /**
   * Private function to extract a .tar.gz file
   * @param {string} path The path to extract from
   * @param {string} dest The destination
   * @param {import('http').IncomingMessage} stream The incoming stream
   * @returns {Promise<void>} Empty promise
   */
  extract(path, dest, stream) {
    return new Promise((resolve, reject) => {
      const gunzip = createGunzip();
      gunzip.on('error', reject);

      stream.pipe(gunzip);

      const writer = createWriteStream(path);
      stream.pipe(writer);

      const tarStream = createReadStream(path).pipe(tar.x({
        cwd: dest
      }));

      tarStream.once('finish', resolve);
      tarStream.on('error', reject);
    });
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
