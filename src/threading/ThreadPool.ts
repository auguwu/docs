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

import { join } from 'path';
import type { Logger } from 'tslog';
import { Worker } from 'worker_threads';
import parentLog from '../singletons/logger';

interface ThreadQueueItem<D> {
  op: number;
  d?: D;
}

export default class ThreadPool {
  public lastDispatchedAt: number = 0;
  public lastExecutedAt: number = 0;

  private logger: Logger;
  public workers: Set<Worker>;
  public queue: ThreadQueueItem<any>[] = [];

  constructor() {
    this.logger = parentLog.getChildLogger({ name: 'camellia :: threading' });
    this.workers = new Set();
  }

  get latency() {
    return this.lastExecutedAt === 0 || this.lastDispatchedAt === 0
      ? 0
      : this.lastExecutedAt - this.lastDispatchedAt;
  }

  execute<D>(file: string, data: ThreadQueueItem<D>) {
    this.logger.warn(`Executing file "${file}"...`);

    const logger = this.logger.getChildLogger({ name: `camellia :: threading :: ${file}` });
    return new Promise<void>((resolve, reject) => {
      const worker = new Worker(join(process.cwd(), '..', 'threading_scripts', `${file}.js`), { workerData: data });
      this.workers.add(worker);

      worker.on('error', (error) => {
        this.workers.delete(worker);
        return reject(error);
      });

      worker.on('message', (msg: string) => logger.info(msg));
      worker.on('exit', () => {
        this.workers.delete(worker);
        return resolve();
      });
    });
  }
}
