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

// Based off of https://github.com/microsoft/tsdoc/blob/master/api-demo/src/advancedDemo.ts

import { TSDocConfigFile } from '@microsoft/tsdoc-config';
import { readFileSync } from 'fs';
import { readdir } from '@augu/utils';
import Logger from '../Logger';
import tsdoc from '@microsoft/tsdoc';

export default class TypeScriptRenderer {
  private compiler!: tsdoc.TSDocParser;
  private directory: string;
  private config: TSDocConfigFile | null = null;
  private logger = Logger.get();

  constructor(directory: string) {
    this.directory = directory;
    this.configure();
  }

  private configure() {
    this.logger.debug(`Attempting to load tsdoc.json in directory ${this.directory}...`);

    // Load tsdoc.json in root directory
    if (TSDocConfigFile.findConfigPathForFolder(this.directory) !== '')
      this.config = TSDocConfigFile.loadForFolder(this.directory);

    this.logger.debug(this.config !== null ? 'Loaded tsdoc.json!' : 'No tsdoc.json file was present, ignoring');

    const definition = new tsdoc.TSDocConfiguration();
    this.config?.configureParser(definition);
    this.compiler = new tsdoc.TSDocParser(definition);

    this.logger.debug('Initialized compiler!');
  }

  async render(file: string) {
    // todo: uwu
  }
}
