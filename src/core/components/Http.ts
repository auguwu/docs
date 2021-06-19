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

import { Component, Inject, ComponentAPI, Container, ComponentOrServiceHooks } from '@augu/lilith';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { Server } from 'http';
import { Logger } from 'tslog';
import { join } from 'path';
import express from 'express';
import cors from 'cors';
import next from 'next';

export interface HttpContext {
  container: Container;
  req: express.Request;
  res: express.Response;
}

@Component({
  priority: 1,
  name: 'http'
})
export default class HttpServer implements ComponentOrServiceHooks {
  api!: ComponentAPI;

  @Inject
  private readonly logger!: Logger;

  @Inject
  private readonly next!: ReturnType<typeof next>;

  #apollo!: ApolloServer;
  #server!: Server;

  async load() {
    this.logger.info('✨ Launching documentation to the world~');
    const schema = await buildSchema({
      resolvers: [
        () => null
      ]
    });

    this.#apollo = new ApolloServer({
      schema,
      context: ({ req, res }) => ({
        container: this.api.container,
        req,
        res
      })
    });

    const app = express()
      .use(cors());

    app.get('/assets', express.static(join(process.cwd(), 'static')));

    await this.#apollo.start();
    this.#apollo.applyMiddleware({ app });

    return this.next.prepare()
      .then(() => {
        // Let next render 404s, 500s, and the index route
        app.get('*', (req, res) => this.next.render(req, res, req.url));

        this.#server = app.listen(9876, () =>
          this.logger.info('🚀 (⊃｡•́‿•̀｡)⊃━⭑･ﾟﾟ･*:༅｡.｡༅:*ﾟ:*:✼✿ Now listening on http://localhost:9876; playground -> http://localhost:9876/graphql')
        );
      });
  }

  async dispose() {
    await this.#apollo.stop();
    return this.#server.close() as unknown as void;
  }
}
