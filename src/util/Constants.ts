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

import { execSync } from 'child_process';

type Environment = 'development' | 'production';

/**
 * Represents the constants for Camellia.
 */
interface Constants {
  environment: Environment;
  commitHash: string | null;
  version: string;
  node: string;
}

const constants: Constants = {
  environment: process.env.NODE_ENV as Environment ?? 'development',
  commitHash: (() => {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim().slice(0, 7);
    } catch {
      return null;
    }
  })(),

  version: require('../../package.json').version,
  node: process.env.REGION ?? 'unknown'
};

export default Object.freeze(constants);
