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

const { promises: fs } = require('fs');
const { execSync } = require('child_process');
const { join } = require('path');
const { sep } = require('./Constants');

/**
 * Recursives a directory to return all files from a directory
 * @param {string} root The root directory
 * @param {string} [path='.'] The path to get from (left empty)
 * @returns {Promise<string[]>} An array of all the files that was found 
 * @credit https://github.com/profile-place/api/blob/master/lib/util.js#L6-L25
 */
const recursiveDir = async(root, path = '.') => {
  let files = [];
  const fullPath = join(root, path);
  let filenames;

  try {
    filenames = await fs.readdir(fullPath);
  } catch(ex) {
    return files;
  }

  for (let i = 0; i < filenames.length; i++) {
    const file = filenames[i];
    const current = join(fullPath, file);
    const relative = join(path, file);
    const stats = await fs.lstat(current);

    if (stats.isDirectory()) {
      const subfiles = await recursiveDir(root, relative);
      files = files.concat(subfiles);
    } else {
      files.push(relative);
    }
  }

  return files;
};

/**
 * Gets the latest commit hash
 * @returns {string} A string of the hash or `null` if it can't find the .git folder
 */
const getCommitHash = () => execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().slice(0, 8);

/**
 * Escapes any zeros in the `time` declaration
 * @param {number} time The time
 */
const escapeTime = (time) => `0${time}`.slice(-2);

/**
 * Joins the current directory with any other appending directories
 * @param {...string} paths The paths to conjoin
 * @returns {string} The paths conjoined 
 */
const getArbitrayPath = (...paths) => `${process.cwd()}${sep}${paths.join(sep)}`;

/**
* If the OS is running Node.js 10 or higher
*/
const isNode10 = () => {
  const ver = process.version.split('.')[0].replace('v', '');
  const num = Number(ver);

  return !isNaN(num) || num === 10 || num > 10;
};

module.exports = {
  recursiveDir,
  getArbitrayPath,
  getCommitHash,
  escapeTime,
  isNode10
};
