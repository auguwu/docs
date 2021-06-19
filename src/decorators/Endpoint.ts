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

/**
 * Represents the metadata from `getEndpointMeta(target)`.
 */
export interface EndpointMeta {
  /**
   * The prefix to use
   */
  prefix: string;
}

/**
 * The endpoint tag
 */
export const ENDPOINT_TAG = '椿: endpoint';

export const getEndpointMeta = (target: any): EndpointMeta | undefined => Reflect.getMetadata(ENDPOINT_TAG, target);
export function Endpoint(prefix: string): ClassDecorator {
  return target => Reflect.defineMetadata(ENDPOINT_TAG, ({
    prefix
  } as EndpointMeta), target);
}
