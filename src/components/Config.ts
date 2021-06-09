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

import { Component, Inject, ComponentOrServiceHooks } from '@augu/lilith';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { Logger } from 'tslog';
import { join } from 'path';
import yaml from 'js-yaml';

interface Configuration {
  prometheusPort?: number;
  projects?: ProjectConfig[];
  host?: string;
  name: string;
}

interface ProjectConfig {
  branches: string | string[];
  github: string;
  name: string;
}

const __NOT_FOUND__ = Symbol.for('$camellia::config::404');

@Component({
  priority: 0,
  name: 'config'
})
export default class Config implements ComponentOrServiceHooks {
  @Inject
  private readonly logger!: Logger;
  #config!: Configuration;

  async load() {
    const path = join(process.cwd(), '..', 'config.yml');
    if (!existsSync(path)) {
      const config: Configuration = {
        projects: [],
        name: 'camellia'
      };

      const contents = yaml.dump(config, {
        noArrayIndent: false,
        skipInvalid: true,
        sortKeys: true,
        quotingType: "'" // eslint-disable-line quotes
      });

      await writeFile(path, contents);
      throw new SyntaxError(`Well well, that seems... obviously weird... No config path was found in "${path}"? Why why do you got to make me do this? Well, I created one for you anyway, please edit it to your liking...`);
    }

    this.logger.info('attempting to load config...');
    const contents = await readFile(path, { encoding: 'utf-8' });
    const config = yaml.load(contents) as unknown as Configuration;

    this.logger.info(`found config at path "${path}"`);
    this.#config = config;
  }

  getPropertyOrNull<K extends ObjectKeysWithSeperator<Configuration>>(key: K): KeyToPropType<Configuration, K> | null {
    const nodes = key.split('.');
    let value: any = this.#config;

    for (let i = 0; i < nodes.length; i++) {
      try {
        value = value[nodes[i]];
      } catch {
        value = __NOT_FOUND__;
      }
    }

    return value === __NOT_FOUND__ ? null : value;
  }

  getProperty<K extends ObjectKeysWithSeperator<Configuration>>(key: K) {
    const value = this.getPropertyOrNull(key);
    if (value === null)
      throw new TypeError(`Node \`${key}\` was not found in config.`);

    return value;
  }
}
