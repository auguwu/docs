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

import { Collection } from '@augu/collections';
import * as shiki from 'shiki';

export default class Highlighter {
  private static _highlighter: shiki.Highlighter;
  private static aliases = new Collection([
    ['typescript', 'ts'],
    ['javascript', 'js'],
    ['sh', 'shellscript']
  ]);

  static get SUPPORTED_LANGUAGES() {
    const languages = ([] as string[]).concat(
      this.aliases.toArray(),
      shiki.BUNDLED_LANGUAGES.map(l => l.id),
      ['text']
    );

    return [...new Set(languages)];
  }

  static async highlighter() {
    if (this._highlighter !== undefined)
      return Promise.resolve(this._highlighter);

    this._highlighter = await shiki.getHighlighter({
      theme: 'nord'
    });

    return this._highlighter;
  }

  static render(code: string, lang: string) {
    if (!this.SUPPORTED_LANGUAGES.includes(lang))
      return code;

    if (lang === 'text')
      return this._escapeHtml(code);

    lang = this.aliases.get(lang) ?? lang;
    const result: string[] = [];

    for (const token of this._highlighter.codeToThemedTokens(code, lang, 'nord', { includeExplanation: false })) {
      console.log(token);
      for (const line of token) {
        result.push(`
          <span style="color:${line.color ?? '#000'}">
            ${this._escapeHtml(line.content)}
          </span>
        `);
      }

      result.push('\n');
    }

    return result.join('\n');
  }

  private static _escapeHtml(code: string) {
    return code.replace(/["'&<>]/, (match) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;' // eslint-disable-line quotes
    })[match as any]);
  }
}
