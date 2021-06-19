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
 * The kind of the AST node
 */
export enum ASTNodeKind {
  Project,
  Namespace = 1 << 1,
  Variable = 1 << 2,
  Function = 1 << 3,
  Enumeration = 1 << 4,
  EnumerationMember = 1 << 5,
  Constructor = 1 << 6,
  Class = 1 << 7,
  Accessor = 1 << 8,
  Method = 1 << 9,
  TypeParameter = 1 << 10,
  Property = 1 << 11,
  Parameter = 1 << 12,
  CallSignature = 1 << 13,
  TypeAlias = 1 << 14,
  Interface = 1 << 15
}
