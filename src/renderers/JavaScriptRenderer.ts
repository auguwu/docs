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

import { Renderer, AbstractRenderer, RenderResult } from '../structures';
import { Logger } from 'tslog';
import { Inject } from '@augu/lilith';
import LRUCache from 'lru-cache';
import jsdoc from 'jsdoc-api';

@Renderer('javascript')
export default class JavaScriptRenderer implements AbstractRenderer {
  @Inject
  private readonly logger!: Logger;
  private readonly cache: LRUCache<string, RenderResult> = new LRUCache(100_000); // it shouldn't go that high but u never know lol

  async render() {
    return Promise.resolve<RenderResult>({
      editThisDocUri: '',
      githubUri: '',
      content: 'insert some content here lmao'
    });
  }
}
