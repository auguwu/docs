/**
 * Copyright (c) 2020 August (Chris)
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

import { Server as HttpServer } from 'http';
import { promises as fs } from 'fs';
import { Collection } from '@augu/immutable';
import { Router } from './Routing';
import { Logger } from './Logger';
import * as utils from '../util';
import onRequest from './hooks/onRequest';
import express from 'express';
import cors from 'cors';

export class Server {
  private _server!: HttpServer;
  public requests: number;
  public routers: Collection<Router>;
  public logger: Logger;
  public app: express.Application;

  /**
   * Create a new `Server` instance
   * @param port The port to use
   */
  constructor(public port: number) {
    this.requests = 0;
    this.routers = new Collection();
    this.logger = new Logger('Server');
    this.app = express();

    this.addMiddleware(); // Inject the middleware first
  }

  /**
   * Injects all middleware to the express app
   */
  private addMiddleware() {
    this.app.disable('X-Powered-By'); // Remove the "X-Powered-By" header
    this.app.use(cors()); // Implement CORS

    // If the top solution doesn't work, use this hacky solution
    this.app.use((_, res, next) => {
      res.removeHeader('X-Powered-By');
      next();
    });
  }

  /**
   * Builds all of the routers
   */
  private async addRoutes() {
    const cwd = utils.getArbitrayPath('routes');
    const files = await fs.readdir(cwd);
    if (!files.length) {
      this.logger.warn('Missing routes directory, exiting...');
      process.exit(1);
    }

    this.logger.info(`Building ${files.length} routes...`);
    for (const f of files) {
      // Lazily import the router
      const router: Router = (await import(utils.getArbitrayPath('routes', f))).default;
      
      if (!(router instanceof Router)) {
        this.logger.warn(`File ${f.split('.')[0]} was not an instance of the Router!`);
        continue;
      }

      this.routers.set(router.route, router);
      for (const route of router.avaliable.values()) {
        this.logger.info(`Implementing the onRequest hook on ${route.route}`);
        this.app.get(route.route, async (req, res) => {
          try {
            this.requests++;
            await onRequest.apply(this, [route, req, res]);
          } catch(ex) {
            this.logger.error(`Unable to request to route ${route.route}:`, ex);
            res.render('error', {
              statusCode: 500,
              message: 'Unable to fulfill the request.',
              error: ex.message
            });
          }
        });
      }

      this.logger.info(`Built router ${router.route} with ${router.avaliable.size} routes!`);
    }
  }

  /**
   * Launches the server to the world!
   */
  async launch() {
    this.logger.info('Building all routes...');
    await this.addRoutes();

    this._server = this.app.listen(this.port, () =>
      this.logger.info(`Now listening on port ${this.port}! (http://127.0.0.1:${this.port})`)
    );
  }

  /**
   * Disposes the server connection
   */
  dispose() {
    this.logger.warn('Disposing server connection...');
    this.routers.clear();
    this._server.close();

    this.logger.warn('Closed all connections.');
  }
}