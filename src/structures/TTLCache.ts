/**
 * Copyright (c) 2020-2021 August
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

/**
 * Represents a container of all cache that has a TTL of 1 hour
 * until is refreshed using `TTLCache.refresh`.
 */
export default class TTLCache<P extends object> {
  /** Refresh function to use to refresh cache */
  public refresh: () => Promise<void> | void;
  public cache: Collection<string, P>;

  #refreshInterval: NodeJS.Timer;
  #disabled: boolean = false;

  constructor(refresh: () => Promise<void> | void) {
    this.#refreshInterval = setInterval(() => {
      if (this.#disabled) return;

      refresh();
    }, 3600000).unref();

    this.refresh = refresh;
    this.cache = new Collection();
  }

  add(key: string, value: P) {
    return this.cache.set(key, value);
  }

  dispose() {
    clearInterval(this.#refreshInterval);
    this.cache.clear();
  }

  disable() {
    if (this.#disabled) throw new Error('TTLCache is already disabled');

    this.#disabled = true;
    return this;
  }

  enable() {
    if (!this.#disabled) throw new Error('TTLCache is already enabled');

    this.#disabled = false;
    return this;
  }
}
