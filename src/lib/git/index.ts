/**
 * Copyright (c) 2020 August
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

import { exec } from 'child_process';

interface GitResult {
  success: boolean;
  result: any;
  code: number;
}

/**
 * Asynchronouslly get results of a return value of `git`
 * @param args Any additional arguments to use
 * @param cwd The directory to execute the command
 */
export function git(args: string[], cwd?: string) {
  return new Promise<GitResult>((resolve) => exec(`git ${args.join(' ')}`, cwd ? { cwd } : undefined, (error, stdout, stderr) => {
    if (error || stderr) {
      const std = Buffer.isBuffer(stderr) ? stderr.toString('utf8') || null : stderr;
      return resolve({ success: false, result: std, code: 1 });
    }

    const std = Buffer.isBuffer(stdout) ? stdout.toString('utf8') || null : stdout;
    return resolve({ success: true, result: std?.trim() || '', code: 0 });
  }));
}
