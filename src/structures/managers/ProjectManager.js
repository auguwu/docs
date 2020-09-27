/**
 * Copyright (c) 2019-2020 August
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

const { createLogger } = require('../Logger');
const { Collection } = require('@augu/immutable');
const util = require('../../util');
const tar = require('tar');

const Projects = {
  '@augu/immutable': {
    downloadUrl: 'https://registry.npmjs.org/@augu/immutable/-/immutable-$VERSION$.tgz',
    version: '$VERSION$',
    docsUrl: 'https://docs.augu.dev/immutable',
    npmUrl: 'https://npmjs.com/package/@augu/immutable'
  },
  '@augu/orchid': {
    downloadUrl: 'https://registry.npmjs.org/@augu/orchid/-/orchid-$VERSION$.tgz',
    version: '$VERSION$',
    docsUrl: 'https://docs.augu.dev/orchid',
    npmUrl: 'https://npmjs.com/package/@augu/orchid'
  },
  '@augu/dotenv': {
    downloadUrl: 'https://registry.npmjs.org/@augu/dotenv/-/dotenv-$VERSION$.tgz',
    version: '$VERSION$',
    docsUrl: 'https://docs.augu.dev/dotenv',
    npmUrl: 'https://npmjs.com/package/@augu/dotenv'
  }
};
