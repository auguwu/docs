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

import { Component, Inject } from '@augu/lilith';
import { Logger } from 'tslog';
import http from 'http';

export default class HttpServer implements Component {
  public priority: number = 2;
  private server!: http.Server;
  public name: string = 'http';

  @Inject
  private logger!: Logger;

  load() {
    this.logger.info('Initializing server...');
    this.server = http.createServer((req, res) => this.onRequest.call(this, req, res));

    this.server.once('listening', () => this.logger.info('Listening at http://localhost:17093'));
    this.server.on('error', e => this.logger.fatal(e));

    this.server.listen(17093);
  }

  dispose() {
    return this.server.close();
  }

  private onRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    if (req.url! === '/favicon.ico') {
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.statusCode = 404;

      return res.end(JSON.stringify({
        message: 'favicon.ico was not found.'
      }));
    }

    console.log(req.url);
    return res.end('{"uwu":"owo"}');
  }
}
