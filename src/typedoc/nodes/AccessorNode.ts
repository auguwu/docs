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

import { ASTNodeKind } from '../constants';

export interface SignatureLike {
  toString(): string;

  name: string;
  type: string;
}

/**
 * Represents an AST node for a getter/setter.
 */
export class AccessorNode {
  public signatures: SignatureLike[] = [];
  public kind: ASTNodeKind = ASTNodeKind.Accessor;

  parse(data: any) {
    const signature = data.getSignature !== undefined ? data.getSignature : data.setSignature;
    if (signature === undefined)
      throw new TypeError('cannot consume getter / setter from node.');

    for (let i = 0; i < signature.length; i++) {
      const sign = signature[i];
      const isSetter = sign.parameters !== undefined;

      this.signatures.push({
        toString() {
          return isSetter ? `
            set ${sign.name}(): any;
          ` : `
            get ${sign.name}(): any;
          `;
        },

        name: sign.name,
        type: sign.type
      });
    }
  }
}

/*\
					"getSignature": [
						{
							"id": 84,
							"name": "[toStringTag]",
							"kind": 524288,
							"kindString": "Get signature",
							"flags": {},
							"type": {
								"type": "intrinsic",
								"name": "string"
							}
						}
					]
*/
