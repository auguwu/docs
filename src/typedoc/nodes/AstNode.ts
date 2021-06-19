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

import type { DeclarationReflection } from 'typedoc/dist/lib/serialization/schema';
import { ASTNodeKind } from '../constants';
import { firstUpper } from '@augu/utils';

type FlagResult = () => boolean;
export interface NodeFlags {
  exportAssignment: boolean;
  protected: boolean;
  external: boolean;
  optional: boolean;
  abstract: boolean;
  readonly: boolean;
  private: boolean;
  public: boolean;
  static: boolean;
  const: boolean;
  rest: boolean;
  let: boolean;
}

export default class ASTNode<Kind extends ASTNodeKind = ASTNodeKind> {
  public isExportAssignment!: FlagResult;
  public isProtected!: FlagResult;
  public isExternal!: FlagResult;
  public isOptional!: FlagResult;
  public isAbstract!: FlagResult;
  public isReadonly!: FlagResult;
  public isPrivate!: FlagResult;
  public isPublic!: FlagResult;
  public isStatic!: FlagResult;
  public isConst!: FlagResult;
  public isRest!: FlagResult;
  public isLet!: FlagResult;

  public comment?: string;
  public source!: string;

  constructor(
    private flags: NodeFlags,
    private kind: Kind,
    private data: DeclarationReflection,
    public parent?: ASTNode
  ) {
    for (const key of Object.keys(flags)) {
      this[`is${firstUpper(key)}`] = function (this: ASTNode<Kind>) {
        return this.flags[key] === true;
      };
    }
  }

  // Parses repeative things
  parse() {
    // TODO: This
  }
}
