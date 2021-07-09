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

import { readFileSync } from 'fs';
import graymatter from 'gray-matter';
import * as shiki from 'shiki';
import LRUCache from 'lru-cache';
import { join } from 'path';
import marked from 'marked';

let highlighter!: shiki.Highlighter;
const cache = new LRUCache<string, Record<'contents' | 'author' | 'title' | 'description', any>>({
  max: 100_000,
  maxAge: 604800000 // 1 week of cache
});

const initHighlighter = async () => {
  if (highlighter !== undefined)
    return;

  (highlighter = await shiki.getHighlighter({
    theme: 'nord'
  }));
};

export const getDocFromCache = async (path: string): Promise<Record<string, any>> => {
  await initHighlighter();

  // if (cache.has(path))
  //   return cache.get(path)!;

  // Not in cache or expired
  const contents = readFileSync(join(process.cwd(), 'docs', path)).toString('utf-8');
  const { data: doc, content } = graymatter(contents);

  marked.use({
    renderer: {
      code(code, lang) {
        return highlighter.codeToHtml(code, lang);
      },

      heading(text, level, raw, slugger) {
        if (level === 3 && text.startsWith('%{')) {
          const t = text.slice(2, text.length - 1);
          const [method, path] = t.split(';');

          return `<h${level}>${method.slice(8)} ${path.slice(6)}</h${level}>`;
        } else {
          if (marked.defaults.headerIds) {
            return `<h${level} id="${marked.defaults.headerPrefix} ${slugger.slug(raw)}">${text}</h${level}>`;
          } else {
            return `<h${level}>${text}</h${level}>`;
          }
        }
      }
    },

    // renderer: {
    //   code(code, lang) {
    //     return highlighter.codeToHtml(code, lang);
    //   },

    //   heading(text, level) {
    //     const tailwindClass = {
    //       0: 'text-sans text-4xl pb-3',
    //       1: 'text-sans text-3xl pb-3',
    //       2: 'text-sans text-2xl pb-3',
    //       3: 'text-sans text-xl pb-3',
    //       4: 'text-sans text-lg pb-3',
    //       5: 'text-sans text-lg pb-3',
    //       6: 'text-sans text-sm pb-3'
    //     }[level];

    //     return `<h${level} class="${tailwindClass ?? ''}">${text}</h${level}`;
    //   },

    //   ...marked.defaults.renderer
    // },

    smartLists: true,
    smartypants: true
  });

  // Render the markdown
  const result = {
    ...doc,
    contents: marked(content)
  };

  cache.set(path, result as any);
  return result;
};
