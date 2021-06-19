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

import constants from '../../util/Constants';
import { join } from 'path';
import next from 'next';

export default next({
  quiet: constants.environment !== 'development',
  dir: join(process.cwd(), 'app'),
  dev: constants.environment !== 'production',

  conf: {
    productionBrowserSourceMaps: true,
    poweredByHeader: false,
    trailingSlash: true,
    images: {
      domains: [
        'cdn.floofy.dev'
      ]
    },

    eslint: {
      dirs: ['./src/app/components', './src/app/pages']
    },

    // add this here so next doesn't cry :^)
    future: Object.create({}),
    experimental: {
      workerThreads: true
    }
  }
});
