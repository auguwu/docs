/**
 * Copyright (c) 2020 August
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

const { existsSync, createReadStream, createWriteStream, promises: fs } = require('fs');
const { HttpClient, middleware } = require('@augu/orchid');
const { Collection } = require('@augu/immutable');
const { Signale } = require('signale');
const { join } = require('path');
const zlib = require('zlib');
const util = require('../../util');
const tar = require('tar');

const Projects = {
  '@augu/immutable': {
    downloadUrl: 'https://registry.npmjs.org/@augu/immutable/-/immutable-%VERSION%.tgz',
    apiUrl: 'https://registry.npmjs.org/@augu/immutable'
  },
  '@augu/sysinfo': {
    downloadUrl: 'https://registry.npmjs.org/@augu/sysinfo/-/sysinfo-%VERSION%.tgz',
    apiUrl: 'https://registry.npmjs.org/@augu/sysinfo'
  },
  '@augu/dotenv': {
    downloadUrl: 'https://registry.npmjs.org/@augu/dotenv/-/dotenv-%VERSION%.tgz',
    apiUrl: 'https://registry.npmjs.org/@augu/dotenv'
  },
  '@augu/ichigo': {
    downloadUrl: 'https://registry.npmjs.org/@augu/ichigo/-/ichigo-%VERSION%.tgz',
    apiUrl: 'https://registry.npmjs.org/@augu/ichigo'
  },
  '@augu/orchid': {
    downloadUrl: 'https://registry.npmjs.org/@augu/orchid/-/orchid-%VERSION%.tgz',
    apiUrl: 'https://registry.npmjs.org/@augu/orchid'
  },
  '@augu/maru': {
    downloadUrl: 'https://registry.npmjs.org/@augu/maru/-/maru-%VERSION%.tgz',
    apiUrl: 'https://registry.npmjs.org/@augu/maru'
  },
  laffey: {
    downloadUrl: 'https://registry.npmjs.org/laffey/-/laffey-%VERSION%.tgz',
    apiUrl: 'https://registry.npmjs.org/laffey'
  }
};


/**
 * Represents a service-class for getting all projects'
 * documentation and returning information about them on NPM
 * and GitHub
 */
module.exports = class ProjectsService {
  /**
   * Creates a new [ProjectsService] instance
   */
  constructor() {
    /**
     * The logger instance
     * @type {import('signale').Signale}
     */
    this.logger = new Signale({ scope: 'Projects' });

    /**
     * The cache for everything
     * @type {Collection<{ directory: string; jsdoc: any; name: string; version: string }>}
     */
    this.cache = new Collection();

    /**
     * Orchid instance OwO
     * @type {HttpClient}
     */
    this.http = new HttpClient({
      middleware: [middleware.streams()]
    });
  }

  /**
   * Downloads the tarballs for the projects
   */
  async download() {
    const cacheFolder = util.getArbitrayPath('.cache');
    if (!fs.existsSync(cacheFolder)) await fs.mkdir(cacheFolder);

    for (const project of Object.values(Projects)) {
      try {
        const res = await this.http.request({
          method: 'GET',
          url: project.downloadUrl
        });

        const stream = res.stream();
        stream.pipe(zlib.createGunzip());

        const path = util.getArbitrayPath('.cache', project.name.replace('@augu/', 'augu-'));
        const writer = createWriteStream(path);
        stream.pipe(writer);

        const t = createReadStream(path).pipe(tar.x({
          cwd: util.getArbitrayPath('.cache', 'modules', project.name.replace('@augu/', 'augu-'))
        }));

        t.on('finish', async() => await fs.unlink(path));
        t.on('error', this.logger.error);
      } catch(ex) {
        this.logger.error(`Unable to make directory for project ${project.name}`, ex);
        continue;
      }
    }
  }

  /**
   * Gets the NPM information for all projects
   * @returns {Promise<NPMInfo[]>}
   */
  async getNpmInfo() {
    /** @type {NPMInfo[]} */
    const info = [];

    for (const project of Object.values(Projects)) {
      try {
        const res = await this.http.request({
          method: 'GET',
          url: project.apiUrl
        });

        const data = res.json();
        console.log(data[data.length - 1]);
      } catch(ex) {
        this.logger.error(`Unable to fetch metadata for project ${project.name}`, ex);
      }
    }

    return info;
  }

  /**
   * Creates an Abstract Syntax Tree of a "typings" file from TypeScript
   * @returns {Promise<AST[]>} The tree avaliable
   */
  async getAbstractTree() {
    /** @type {AST[]} */
    const tree = [];
    const cacheDir = util.getArbitrayPath('.cache', 'modules');

    for (const [name, project] of Object.keys(Projects)) {
      const filePath = join(cacheDir, name.replace('@augu/', 'augu-'));

      try {
        const packageJson = await fs.readFile(join(filePath, 'package.json'), { encoding: 'utf8' });
        const pkg = JSON.parse(packageJson);

        const typingsPath = join(filePath, pkg.types);
        const typings = await fs.readFile(typingsPath, { encoding: 'utf8' });

        /** @type {AST} */
        const ast = {
          functions: [],
          getters: [],
          classes: [],
          exports: [],
          file: typingsPath
        };

        for (const line of typings.split('\r\n')) {
          // For reference, check src/ast_test.js
        }
      } catch(ex) {
        this.logger.error(`Unable to get AST for project ${name}`, ex);
        continue;
      }
    }
  }
};

/**
 * @typedef {object} NPMInfo
 * @prop {string} description The description of the library
 * @prop {{ npm: string; node: string; lib: string; }} versions The versions object
 * @prop {number} files The number of files
 * @prop {string} readme The README file
 * 
 * @typedef {object} AST
 * @prop {{ [x: string]: ASTClass | ASTFunction | ASTGetter }} exports A list of all of the exported functions (in that namespace)
 * @prop {{ [x: string]: ASTFunction }} functions The list of all functions (if any; exported or not)
 * @prop {{ [x: string]: ASTGetter }} getters The list of getters avaliable (if any)
 * @prop {{ [x: string]: ASTClass }} classes The list of classes avaliable (if any)
 * @prop {string} namespace The namespace of the project
 * @prop {string} file The file's path
 * 
 * @typedef {object} ASTClass Represents the AST structure for a class
 * @prop {GenericTypes[]} genericTypes A list of the possible generic types avaliable
 * @prop {string | string[]} [constructor] The constructor (or a list of possibilities)
 * @prop {{ [x: string]: ASTFunction }} functions All of the public/private/protected functions
 * @prop {{ [x: string]: ASTGetter }} getters The getters avaliable
 * @prop {string} name The class' name
 * 
 * @typedef {object} ASTGetter Represents the AST structure of a getter
 * @prop {{ type: string; mdnUrl?: string; }} returnValue The return value of the getter
 * @prop {string} description The description of the getter
 * @prop {string} name The getter's name
 * 
 * @typedef {object} ASTFunction Represents the AST structure of a function
 * @prop {{ [x: string]: { type: string; mdnUrl?: string; } }} parameters Object of all the parameters (or an empty one if none found)
 * @prop {GenericTypes[]} genericTypes The possible generic types avaliable
 * @prop {{ type: string; mdnUrl?: string; }} returnValue The return value of the getter
 * @prop {string} name The function's name
 */