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

import { Router, Route } from '../structures/Routing';
import { safeLoad } from 'js-yaml';
import * as utils from '../util';
import fs from 'fs';

/** Interface for the documentation config */
interface DocumentationConfig {
  /** A list of categories for the sidebar */
  categories: string[];

  /** The title of the document */
  title: string;

  /** A list of pages */
  pages: {
    [x: string]: Page;
  }
}

/** Represents a documentation page */
interface Page {
  /** The title of the document */
  title: string;

  /** The page path */
  page: string;
}

const router = new Router('/');
const config = safeLoad<DocumentationConfig>(fs.readFileSync(utils.getArbitrayPath('documentation', 'config.yml'), 'utf8'));

// GET /
router.addRoute(new Route({
  route: '/',
  async exec(_, res) {
    return res.render('index', {
      categories: config.categories,
      title: 'Homepage'
    });
  }
}));

// All of the pages
for (const [route, page] of Object.entries(config.pages)) {
  if (route === '/') continue; // Skip that due to the router already having that
  router.addRoute(new Route({
    route,
    async exec(_, res) {
      const path = page.page.replace('./', utils.getArbitrayPath('documentation'));
      return res.render('documentation', {
        page: {
          title: page.title,
          path
        }
      });
    }
  }));
}

export default router;