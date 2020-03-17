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

import { Request, Response } from 'express';
import { Collection } from '@augu/immutable';
import { Server } from './Server';

/** Object of all options for `Route` */
interface RouteOptions {
  /** The function to run the route */
  exec(this: Server, req: Request, res: Response): Promise<any>;

  /** The route itself */
  route: string;
}

export class Route {
  public callee: ((this: Server, req: Request, res: Response) => Promise<any>);
  public route: string;

  /**
   * Constructs a new `Route` instance
   * @param options Any additional options
   */
  constructor(options: RouteOptions) {
    this.callee = options.exec;
    this.route = options.route;
  }
}

export class Router {
  public avaliable: Collection<Route>;
  public route: string;

  /**
   * Creates a new `Router` instance
   * @param route The main path to use
   */
  constructor(route: string) {
    this.avaliable = new Collection();
    this.route = route;
  }

  /**
   * Adds the route to the main collection
   * @param route The route to inject
   */
  addRoute(route: Route) {
    const path = route.route === '/' ? this.route : `${this.route === '/' ? '' : this.route}${route.route}`;
    route.route = path; // Update the route with the injected route from the router

    this.avaliable.set(path, route);
    return this;
  }
}