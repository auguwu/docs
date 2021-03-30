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

import 'source-map-support/register';
import 'reflect-metadata';

import logger from './singletons/logger';
import app from './container';

(async function main() {
  logger.info('Initializing docs...');
  try {
    await app.verify();
  } catch(ex) {
    logger.error('Unable to verify application state');
    logger.fatal(ex);

    process.exit(1);
  }

  logger.info('Application state has been verified');
  process.on('SIGINT', () => {
    logger.warn('Received CTRL+C call, exiting');

    app.dispose();
    process.exit(0);
  });
})();

process.on('unhandledRejection', error => console.error('Unhandled promise rejection has occured\n', error));
process.on('uncaughtException', error => console.error('Uncaught exception has occured\n', error));
