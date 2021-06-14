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

import stringify from 'rehype-stringify';
import LRUCache from 'lru-cache';
import markdown from 'remark-parse';
import mdToHtml from 'remark-rehype';
import unified from 'unified';
import gfm from 'remark-gfm';
import raw from 'rehype-raw';
import log from '../singletons/logger';

// simple module to convert highlight-js -> shiki
const rehypeCodeblock = (visitor: any) => {
  const _visitor = (node: any) => {
    console.log(node);
  };

  return () => (tree: any) => visitor(tree, 'code', _visitor);
};

export default class MarkdownRenderer {
  private readonly cache = new LRUCache<string, string>({ max: 100_000, maxAge: 518400000 });
  public compiler = unified()
    .use(markdown)
    .use(gfm)
    .use(mdToHtml, { allowDangerousHtml: true, passThrough: ['raw'] })
    .use(raw);

  private get logger() {
    return log.getChildLogger({ name: 'camellia :: renderers :: markdown' });
  }

  async init() {
    this.logger.info('rendering...');

    // why are you a module AAAAAAAAAA
    const { visit } = await import('unist-util-visit');
    this.compiler.use(rehypeCodeblock(visit)).use(stringify).freeze(); // make it a freezed processor

    return this.compiler.process('# Hello world?\n> What is this...?\n\n```js\nvar x = y;```')
      .then(r => r.contents.toString());
  }
}
