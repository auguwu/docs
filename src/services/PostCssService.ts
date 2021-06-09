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

import { readFile, writeFile, mkdir } from 'fs/promises';
import { Service, Inject } from '@augu/lilith';
import { pluralize } from '@augu/utils';
import { existsSync } from 'fs';
import { Logger } from 'tslog';
import { join } from 'path';
import postcss from 'postcss';

@Service({
  priority: 0,
  name: 'postcss'
})
export default class PostCSSService {
  private static COMPILE_FROM = join(process.cwd(), 'static', 'scss', 'style.scss');
  private static COMPILE_TO = join(process.cwd(), 'static', 'css', 'style.min.css');

  @Inject
  private readonly logger!: Logger;
  private readonly compiler = postcss([
    require('autoprefixer'),
    require('cssnano'),
    require('tailwindcss')
  ]);

  async load() {
    this.logger.info('Compiling stylesheets...');

    if (!existsSync(join(process.cwd(), 'static', 'css'))) {
      await mkdir(join(process.cwd(), 'static', 'css'));
    }

    const contents = await readFile(PostCSSService.COMPILE_FROM, { encoding: 'utf8' });
    const result = await this.compiler.process(contents, {
      syntax: require('postcss-scss'),
      from: PostCSSService.COMPILE_FROM,
      to: PostCSSService.COMPILE_TO
    });

    const warnings = result.warnings();
    this.logger.info(`✔ Compiled stylesheets in ${PostCSSService.COMPILE_TO}`);

    if (warnings.length > 0) {
      this.logger.warn(`⚠️ Received ${warnings.length} ${pluralize('warning', warnings.length)}, printing below:`);
      for (let i = 0; i < warnings.length; i++) {
        const warning = warnings[i];
        if (warning.node !== undefined) {
          console.warn(`\n${warning.node.error(warning.text, {
            plugin: (warning.node as any).plugin,
            index: (warning as any).index,
            word: (warning as any).word
          })}`);
        } else {
          console.warn(`\n${(warning as any).plugin !== undefined ? `${(warning as any).plugin}: ${warning.text}` : warning.text}`);
        }
      }
    }

    await writeFile(PostCSSService.COMPILE_TO, result.css);
  }
}
