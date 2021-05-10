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
    return Array.from(new Set(
      ...this.aliases.keys(),
      ...shiki.BUNDLED_LANGUAGES.map(lang => lang.id),
      'text'
    ));
  }

  static initHighlighter() {
    if (this._highlighter !== undefined)
      return this._highlighter;

    return shiki.getHighlighter({
      theme: 'nord'
    });
  }

  static render(code: string, lang: string) {
    if (!this.SUPPORTED_LANGUAGES.includes(lang))
      return code;

    if (lang === 'text')
      return this._escapeHtml(code);

    lang = this.aliases.get(lang) ?? lang;
    const result: string[] = [];

    for (const token of this._highlighter.codeToThemedTokens(code, lang, 'nord', { includeExplanation: false })) {
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
