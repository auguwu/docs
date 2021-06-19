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

/* eslint-disable camelcase */

import { writeFileSync, existsSync } from 'fs';
import { Component, Inject } from '@augu/lilith';
import { readFile } from 'fs/promises';
import { Logger } from 'tslog';
import { join } from 'path';
import yaml from 'js-yaml';

const NOT_FOUND_SYMBOL = Symbol.for('$camellia::config::not.found');

interface Configuration {
  projects?: ProjectConfig[];
  host?: string;
}

interface ProjectConfig {
  branches?: string[];
  githubUrl: string;
  name: string;
}

@Component({
  priority: 0,
  name: 'config'
})
export default class Config {
  private config!: Configuration;

  @Inject
  private logger!: Logger;

  async load() {
    if (!existsSync(join(__dirname, '..', '..', 'config.yml'))) {
      const config = yaml.dump({

      }, {
        indent: 2,
        noArrayIndent: false
      });

      writeFileSync(join(__dirname, '..', '..', 'config.yml'), config);
      return Promise.reject(new SyntaxError('Weird, you didn\'t have a configuration file... So, I may have provided you a default one, if you don\'t mind... >W<'));
    }

    this.logger.info('Loading configuration...');
    const contents = await readFile(join(__dirname, '..', '..', 'config.yml'), 'utf8');
    const config = yaml.load(contents) as unknown as Configuration;

    this.config = config;

    // resolve the promise
    return Promise.resolve();
  }

  getProperty<K extends ObjectKeysWithSeperator<Configuration>>(key: K): KeyToPropType<Configuration, K> | undefined {
    const nodes = key.split('.');
    let value: any = this.config;

    for (const frag of nodes) {
      try {
        value = value[frag];
      } catch {
        value = NOT_FOUND_SYMBOL;
      }
    }

    return value === NOT_FOUND_SYMBOL ? undefined : value;
  }
}
