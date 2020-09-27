/**
 * Copyright (c) 2019-2020 August
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

const { existsSync, appendFileSync, mkdirSync, writeFileSync, unlinkSync } = require('fs');
const { Collection } = require('@augu/immutable');
const { join } = require('path');
const leeks = require('leeks.js');
const util = require('util');

/**
 * List of loggers available
 * @type {Collection<Logger>}
 */
const loggers = new Collection();

/**
 * Formats the messages to it's string representation
 * @param {number} depth The depth to log objects for
 * @param {...unknown} messages Array of messages to de-compile
 * @returns {string} Returns the String representation of it
 */
function formatMessages(depth, ...messages) {
  /**
   * Closure function to get the string representation of a object or primitive
   * @param {unknown} message The message to get the string representation
   * @returns {string} The string represenation
   */
  function getMessage(message) {
    if (typeof message === 'object' && !Array.isArray(message)) return util.inspect(message, { depth: depth || 2 });
    if (Array.isArray(message)) return `[ ${message.map(getMessage).join(', ')} ]`;
    if (message instanceof Error) return `${message.name}: ${message.message}\n${message.stack || ''}`;

    return message;
  }

  return messages
    .map(getMessage)
    .join('\n');
}

/**
 * Represents a [Logger], which is a container of messages sent
 */
class Logger {
  /**
   * Creates a new [Logger] instance
   * @param {string} name The name of the logger
   * @param {{depth?: number}} opts The options used
   */
  constructor(name, opts = { depth: 2 }) {
    /**
     * The log path
     * @private
     * @type {string}
     */
    this.logPath = join(process.cwd(), 'logs');

    /**
     * The depth to seek Objects
     * @type {number}
     */
    this.depth = opts.depth;

    /**
     * The name of the logger
     * @type {string}
     */
    this.name = name;

    loggers.set(name, this);

    const escapedName = this.name.toLowerCase().replace(/_| /g, '') + '.log';
    if (!existsSync(this.logPath)) mkdirSync(this.logPath);
    if (existsSync(join(this.logPath, escapedName))) {
      unlinkSync(join(this.logPath, escapedName));
      writeFileSync(join(this.logPath, escapedName), '');
    }
  }

  /**
   * Returns the date as a string
   * @private
   */
  getDate() {
    const now = new Date();
    const esc = (type) => `0${type}`.slice(-2);

    const hours = esc(now.getHours());
    const mins  = esc(now.getMinutes());
    const secs  = esc(now.getSeconds());

    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();

    return `[ ${day}/${month}/${year} | ${hours}:${mins}:${secs} ]`;
  }

  /**
   * Writes the message to the console
   * @param {'info' | 'warn' | 'error' | 'debug' | 'request'} level The log level
   * @param {'none' | 'error'} severity The severity of the log
   * @param {...unknown} messages The messages to log
   */
  write(level, severity, ...messages) {
    let lvlText, padding;
    const processor = severity === 'none' ? process.stdout : process.stderr;

    switch (level) {
      case 'info':
        lvlText = leeks.hex('#81D8D0', `[Info / ${process.pid}]`);
        padding = '    ';
        break;

      case 'warn':
        lvlText = leeks.hex('#FFFF8B', `[Warn / ${process.pid}]`);
        padding = '    ';
        break;

      case 'error':
        lvlText = leeks.hex('#B2555F', `[Error / ${process.pid}]`);
        padding = '   ';
        break;

      case 'debug':
        lvlText = leeks.hex('#987DC5', `[Debug / ${process.pid}]`);
        padding = '   ';
        break;

      case 'request':
        lvlText = leeks.hex('#A96E71', `[Request / ${process.pid}]`);
        padding = ' ';
        break;

      default:
        lvlText = leeks.hex('#454545', `[Unknown / ${process.pid}]`);
        padding = ' ';
        break;
    }

    const name = this.name.toLowerCase().replace(/_| /g, '-');
    const message = formatMessages(this.depth, ...messages);
    processor.write(`${leeks.colors.gray(this.getDate())} ${leeks.hex('#FFB9BE', `[${this.name}]`)} ${lvlText}${padding}   ~> ${message}\n`);
    appendFileSync(join(__dirname, 'logs', `${name}.log`), `${this.getDate()} [${this.name}] ${lvlText.replace(/\u001b\[.*?m/g, '')}${padding}   ~> ${message.replace(/\u001b\[.*?m/g, '')}\n`);
  }
}

module.exports = {
  createLogger: (name, opts = { depth: 2 }) => new Logger(name, opts),
  getLogger: (name) => {
    if (!loggers.has(name)) throw new TypeError(`Logger "${name}" doesn't exist`);

    return loggers.get(name);
  }
};
