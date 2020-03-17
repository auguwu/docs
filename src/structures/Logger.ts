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

import { colors, hex } from 'leeks.js';
import { inspect } from 'util';
import * as utils from '../util';

type LogMessage = (string | object)[];

/** Object of the months from `Date#getMonth` */
const MONTHS = {
  // All of the months are 0-indexed
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sept',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec'
};

/** Enum of all log levels */
enum LogLevel {
  INFO,
  WARN,
  ERROR
}

export class Logger {
  public colors: typeof colors;
  public name: string;

  /**
   * Constructs a new instance of the `Logger` class
   * @param name The name of the Logger
   */
  constructor(name: string) {
    /** The colors for easy access */
    this.colors = colors;

    /** The logger name */
    this.name = name;
  }

  /**
   * Function to get the ordinal of any number (i.e: 1 -> 1st)
   * @param {number} int The number to get the ordinal
   * @credit [ThatTonybo/num-ord](https://github.com/ThatTonybo/num-ord)
   */
  getNumberOrdinal(int: number) {
    return int == 1 ? `${int}st` : int == 2 ? `${int}nd` : int == 3 ? `${int}rd` : int >= 4 ? `${int}th` : null;
  }

  /**
   * Returns the current date; humanized
   */
  getDate() {
    const now = new Date(); // Get the current date

    // We do this to prevent: '002'
    const hours = `0${now.getHours()}`.slice(-2);
    const minutes = `0${now.getMinutes()}`.slice(-2);
    const seconds = `0${now.getSeconds()}`.slice(-2);
    const month = MONTHS[now.getMonth()];
    const day = this.getNumberOrdinal(now.getDate()) === null ? '' : this.getNumberOrdinal(now.getDate());
    const year = now.getFullYear();
    const ap = now.getHours() >= 12 ? 'PM' : 'AM';

    return this.colors.gray(`[${month} ${day}, ${year} | ${hours}:${minutes}:${seconds}${ap}]`);
  }

  /**
   * Writes out anything to the terminal
   * @param level The log level to use
   * @param message The message to print
   */
  write(level: LogLevel, ...message: LogMessage) {
    let lvlText!: string;

    switch (level) {
      case LogLevel.INFO: {
        lvlText = this.colors.cyan(`[INFO/${process.pid}]`);
      } break;

      case LogLevel.WARN: {
        lvlText = this.colors.yellow(`[WARN/${process.pid}]`);
      } break;

      case LogLevel.ERROR: {
        lvlText = this.colors.red(`[ERROR/${process.pid}]`);
      } break;
    }

    const name = hex('#A3919C', `[${this.name}]`);
    const msg = message.map(s =>
      s instanceof Object ? inspect(s) : s  
    );

    process.stdout.write(`${this.getDate()} ${lvlText} ${name} => ${msg.join('\n')}\n`);
  }

  /**
   * Writes as the `INFO` level
   * @param message The message instance
   */
  info(...message: LogMessage) {
    return this.write(LogLevel.INFO, ...message);
  }

  /**
   * Writes as the `WARN` level
   * @param message The message instance
   */
  warn(...message: LogMessage) {
    return this.write(LogLevel.WARN, ...message);
  }

  /**
   * Writes as the `ERROR` level
   * @param message The message instance
   */
  error(...message: LogMessage) {
    return this.write(LogLevel.ERROR, ...message);
  }
}