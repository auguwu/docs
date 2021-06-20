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

import { registerEnumType } from 'type-graphql';

export enum ProjectRendererType {
  TypeScript = 'typescript',
  Markdown = 'markdown',
  Kotlin = 'kotlin'
}

registerEnumType(ProjectRendererType, {
  name: 'ProjectRendererType',
  description: 'The project renderer type to use for retrieving doc data.',
  valuesConfig: {
    TypeScript: {
      description: 'Returns information about a TypeScript project, it can return any class/type alias/interface metadata.'
    },

    Markdown: {
      description: 'Returns the structure of a Markdown doc project.'
    },

    Kotlin: {
      description: 'Returns the structure of a Kotlin doc project. It can provide the Markdown content or pieces of it.'
    }
  }
});
