/**
 * Copyright (c) Noelware
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

// NOTE: This is not a full declaration file!
// This is used for Camellia only.

/** */
declare module 'jsdoc-api' {
  interface ExplainResult {
    description?: string;
    longname?: string;
    comment: string;
    memberof?: string;
    params?: Record<string, JsDocParam>[];
    scope: string;
    meta: ExplainMeta;
    kind: string;
    name: string;
    undocumented?: boolean;
  }

  interface JsDocParam {
    description: string;
    name: string;
  }

  interface ExplainMeta {
    range: [number, number];
    filename: string;
    lineno: number;
    columnno: string;
    path: string;
    code: ExplainCodeMeta;
    vars: Record<string, null>;
  }

  interface ExplainCodeMeta {
    id: string;
    name: string;
    type: string;
    paramnames: string[];
  }

  // only function i'll use
  export function explainSync({ source }: { source: string }): ExplainResult;
}
