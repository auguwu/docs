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

// Credit: https://github.com/reactjs/express-react-views
import DOMServer from 'react-dom/server';
import React from 'react';

/**
 * Function to add .tsx bindings to the website
 */
export default (function createReactEngine() {
  return (filename: string, props: { [x: string]: any }, cb: (error: Error | null, markup?: string) => void) => {
    let markup = '<!DOCTYPE html>';
    
    try {
      const component = require(filename);
      if (!component.default) return cb(new Error('All components must be use "export default"'));
      markup += DOMServer.renderToStaticMarkup(React.createElement(component.default, props));
    } catch(ex) {
      return cb(ex);
    }

    return cb(null, markup);
  };
})();