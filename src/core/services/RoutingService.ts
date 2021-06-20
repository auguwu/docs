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

import { Service, Inject, ComponentOrServiceHooks } from '@augu/lilith';
import { getEndpointMeta, getRouteMeta } from '../../decorators';
import { Collection } from '@augu/collections';
import HttpServer from '../components/Http';
import { Logger } from 'tslog';
import { join } from 'path';

import type {
  Response,
  Request
} from 'express';

@Service({
  priority: 1,
  children: join(process.cwd(), 'endpoints'),
  name: 'routing'
})
export default class RoutingService extends Collection<string, any> implements ComponentOrServiceHooks<any> {
  @Inject
  private readonly logger!: Logger;

  @Inject
  private readonly http!: HttpServer;

  onChildLoad(endpoint: any) {
    const metadata = getEndpointMeta(endpoint);
    if (!metadata) {
      this.logger.warn(`Endpoint class ${endpoint.constructor.name} is missing a @Endpoint decorator.`);
      return;
    }

    // Get the routes of the endpoint
    const routes = getRouteMeta(endpoint);
    this.logger.info(`Found ${routes.length} routes to add from endpoint class ${endpoint.constructor.name}`);

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      this.logger.debug(`init: GET ${route.path}`);

      const path = metadata.prefix === '/'
        ? route.path
        : `${metadata.prefix === '/' ? '' : metadata.prefix}${route.path}`;

      const handlers = route.middleware;
      handlers.push(async(req: Request, res: Response) => {
        try {
          await route.run.call(endpoint, req, res);
        } catch(ex) {
          this.logger.fatal(`Unable to run route ${path}:`, ex);
          return res.status(500).send('Internal server error.');
        }
      });

      this.http.app.get(path, ...handlers);

      this.logger.info(`✔ GET ${path}.`);
    }
  }
}
