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

import { STATUS_CODES } from 'http';
import * as d from './Dateformat';
import https from 'https';

/** Response object */
interface HttpResponse {
  /** Returns the status code's message */
  statusMessage: string | undefined;

  /** The status code */
  statusCode: number;

  /** Convert the body to JSON */
  json<T = any>(): T;

  /** Leave the body as plain text */
  text(): string;
}

/** Returns a seperator for the correspondant OS */
export const sep: string = process.platform === 'win32' ? '\\' : '/';

/**
 * Returns an arbitray path with the current directory appended
 * @param paths The paths to join with the current path
 */
export const getArbitrayPath = (...paths: string[]) => `${process.cwd()}${sep}${paths.join(sep)}`;

/** Returns a bool if the user is running Node.js v10 or not */
export const isNode10: boolean = Number(process.version.split('.')[0].replace('v', '')) > 10;

/** Returns a string of the user's contribution */
export const dateformat = (date: number | Date) => {
  const instance = new d.Dateformat(date);
  return instance.toString('mm/dd/yyyy hh:MM:ss TT');
};

/**
 * Get the amount of contributions of a file
 * @param filepath The file path from the repository
 */
export function getContributorsFromFile(filepath: string) {
  let res!: HttpResponse;
  const request = https.request({
    protocol: 'https',
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    path: `/repos/auguwu/docs/commits?file=${filepath}`,
    port: 443,
    host: 'api.github.com'
  }, (resp) => {
    let body = Buffer.alloc(0);
    resp
      .on('data', chunk => body = Buffer.concat([body, chunk]))
      .on('error', error => {
        res = {
          statusMessage: STATUS_CODES[500],
          statusCode: 500,
          json() {
            const payload = JSON.stringify({
              statusCode: 500,
              message: 'Unable to fetch from the API',
              error: error.message
            });

            return JSON.parse(payload);
          },
          text() {
            return '';
          }
        };
      }).on('end', () => {
        res = {
          statusMessage: STATUS_CODES[resp.statusCode ?? 200],
          statusCode: resp.statusCode ?? 200,
          json() {
            return JSON.parse(body.toString());
          },
          text() {
            return body.toString();
          }
        };
      });
  });

  request.end(); // End the request
  const data = res.json<any[] | { error: string; statusCode: number; message: string; }>();
  if (data instanceof Object && (<any> data).error) return [];

  return (<any[]> data).map(x => x.commit.author);
}

/**
 * Get all of the author's commits
 * @param author The author's HTML login
 */
export function getContributorCommits(author: string) {
  let res!: HttpResponse;
  const request = https.request({
    protocol: 'https',
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    path: '/repos/auguwu/docs/commits',
    port: 443,
    host: 'api.github.com'
  }, (resp) => {
    let body = Buffer.alloc(0);
    resp
      .on('data', chunk => body = Buffer.concat([body, chunk]))
      .on('error', error => {
        res = {
          statusMessage: STATUS_CODES[500],
          statusCode: 500,
          json() {
            const payload = JSON.stringify({
              statusCode: 500,
              message: 'Unable to fetch from the API',
              error: error.message
            });

            return JSON.parse(payload);
          },
          text() {
            return '';
          }
        };
      }).on('end', () => {
        res = {
          statusMessage: STATUS_CODES[resp.statusCode ?? 200],
          statusCode: resp.statusCode ?? 200,
          json() {
            return JSON.parse(body.toString());
          },
          text() {
            return body.toString();
          }
        };
      });
  });

  request.end(); // End the request
  const data = res.json<any[]>();

  return data.filter(x => x.commit.author.html_url === author).length;
}

export * from './Constants';