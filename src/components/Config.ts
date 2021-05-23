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

import { Component, ComponentOrServiceHooks, Inject } from '@augu/lilith';
import { omitUndefinedOrNull } from '@augu/utils';
import { writeFileSync, existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { Logger } from 'tslog';
import { join } from 'path';
import yaml from 'js-yaml';

const NotFoundSymbol = Symbol.for('$camellia::404');

interface Configuration {
  prometheusPort?: number;
  projects: ProjectConfig[];
  host?: string;
  name: string;
}

export interface ProjectConfig {
  branches?: string[];
  github: string;
  type: 'markdown' | 'javascript' | 'typescript' | 'kotlin';
  name: string;
}

@Component({
  priority: 0,
  name: 'config'
})
export default class Config implements ComponentOrServiceHooks {
  @Inject
  private readonly logger!: Logger;
  #config!: OmitUndefinedOrNull<Configuration>;

  async load() {
    const CONFIG_PATH = join(__dirname, '..', '..', 'config.yml');
    if (!existsSync(CONFIG_PATH)) {
      const config = yaml.dump({
        projects: [],
        name: 'camellia'
      }, { indent: 2, noArrayIndent: true });

      writeFileSync(CONFIG_PATH, config);
      return Promise.reject(new SyntaxError('Weird, you didn\'t have a configuration file... So, I may have provided you a default one, if you don\'t mind... >W<'));
    }

    this.logger.info('attempting to load config...');
    const contents = await readFile(CONFIG_PATH, 'utf8');
    const config = yaml.load(contents) as unknown as Configuration;

    this.#config = omitUndefinedOrNull<Configuration>({
      prometheusPort: config.prometheusPort,
      projects: config.projects,
      host: config.host,
      name: config.name
    });

    return Promise.resolve();
  }

  getProperty<K extends ObjectKeysWithSeperator<Configuration>>(key: K): KeyToPropType<Configuration, K> | undefined {
    const nodes = key.split('.');
    let value: any = this.#config;

    for (const frag of nodes) {
      try {
        value = value[frag];
      } catch {
        value = NotFoundSymbol;
      }
    }

    return value === NotFoundSymbol ? undefined : value;
  }
}
