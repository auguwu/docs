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

import { InvalidProjectStructureException, MissingRequiredKeyException } from './errors';
import { ParsedAST, ASTGenerator } from './ast';
import { createLogger, ILogger } from '@augu/logging';
import { promises as fs } from 'fs';
import { join } from 'path';
import { colors } from 'leeks.js';

interface DocProject {
  includes?: string[];

  pages: {
    [x: string]: string;
  };

  name: string;
}

interface GeneratorResult {
  includes?: { [x: string]: ParsedAST; }
  pages: { [x: string]: ParsedAST; }
}

async function readDocGenerator(directory: string) {
  try {
    const contents = await fs.readFile(join(directory, 'docs.json'), { encoding: 'utf8' });
    const value = JSON.parse(contents) as DocProject;

    validateProject(value);
    return value;
  } catch(ex) {
    if (ex instanceof InvalidProjectStructureException) throw ex;
    if (ex instanceof MissingRequiredKeyException) throw ex;

    throw new TypeError('docs.json couldn\'t be serialised as a JSON blob');
  }
}

function validateProject(project: DocProject) {
  const required = ['name', 'pages'];
  const typeofs = {
    include: 'array',
    pages: 'object',
    name: 'string'
  };

  for (let i = 0; i < required.length; i++) {
    if (!project.hasOwnProperty(required[i])) throw new MissingRequiredKeyException(required[i]);
  }

  for (const [key, type] of Object.entries(typeofs)) {
    if (type === 'array') {
      if (typeof project[key] !== 'undefined' && !Array.isArray(project[key])) throw new InvalidProjectStructureException(key, `expected = array, received = ${typeof project[key]}`);
    } else {
      if (typeof project[key] !== type) throw new InvalidProjectStructureException(key, `expected = ${type}, received = ${typeof project[key]}`);
    }
  }
}

export class Generator {
  private logger: ILogger = createLogger({ namespace: 'Generator', transports: [] });
  private docs!: DocProject;

  constructor(private directory: string) {} // eslint-disable-line

  async generate() {
    // validate docs.json file
    this.logger.info(`validating docs.json in ${colors.green(this.directory)}... :mag:`);

    try {
      this.docs = await readDocGenerator(this.directory);
    } catch(ex) {
      if (ex instanceof InvalidProjectStructureException) {
        this.logger.error('invalid "docs.json" file', ex);
        return null;
      }

      if (ex instanceof MissingRequiredKeyException) {
        this.logger.error(`missing required key: ${ex.key}`);
        return null;
      }

      this.logger.error('some other error occured, view below for stacktrace', ex);
      return null;
    }

    // generate since we validated
    this.logger.info(`generating all markdown to html from ${colors.green(this.directory)}... :sparkles:`);

    // results of this generator
    const results: GeneratorResult = {
      includes: undefined,
      pages: {}
    };

    const ast = new ASTGenerator();

    // grab included files
    if (this.docs.includes) {
      this.logger.debug(`found ${this.docs.includes.length} include functions to grab ast of!`);
      results.includes = {};

      for (let i = 0; i < this.docs.includes.length; i++) {
        const include = this.docs.includes[i].replace(/~\//g, this.directory);
        this.logger.debug(`found ${colors.gray(include)} file [${i + 1}/${this.docs.includes.length}]`);

        const parsed = ast.compile(include);

        this.logger.debug(`grabbed ast of ${colors.gray(include)}`, parsed);
        results.includes![include] = parsed;
      }
    }

    // parse pages
    for (let [path, file] of Object.entries(this.docs.pages)) {
      this.logger.debug(`found file ${colors.gray(file)} for endpoint ${path}`);
      file = file.replace(/~\//g, this.directory);

      const parsed = ast.compile(file);
      this.logger.debug(`compiled ast of page ${colors.gray(file)}`, parsed);
      results.pages[path] = parsed;
    }

    return results;
  }
}
