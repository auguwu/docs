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
import { Application } from 'typedoc';
import { join } from 'path';
import log from '../core/singletons/logger';
import ts from 'typescript';

/**
 * Represents the parser for parsing q Typedoc project reflection. This is used
 * to query from the GraphQL if the project is using the TypeScript renderer.
 *
 * Example query might be like:
 * ```graphql
 * {
 *    tsProject(name: "lilith") {
 *       # You can use `all` to return everything
 *
 *       classes {
 *          name
 *       }
 *    }
 * }
 * ```
 */
export default class Parser {
  private logger = log.getChildLogger({
    name: '椿 ("camellia") ~ typedoc'
  });

  constructor(
    private rootDir: string,
    private name: string
  ) {}

  render() {
    this.logger.info(`Rendering project ${this.name} from directory ${this.rootDir}`);

    const app = new Application();
    app.bootstrap({
      excludeNotDocumented: true,
      excludeProtected: true,
      excludeInternal: true,
      excludePrivate: true,
      highlightTheme: 'nord',
      entryPoints: [
        // TODO: add custom entry points?
        join(this.rootDir, 'src', 'index.ts')
      ],

      // TODO: custom tsconfig path from project `docs.yml` file?
      tsconfig: join(this.rootDir, 'tsconfig.json'),
      name: this.name
    });

    // Since Typedoc can't locate the config file,
    // we'll do it ourself! The code used is from Typedoc
    // itself, so credit to them :D
    let isFatalError = false;
    const tsconfig = ts.getParsedCommandLineOfConfigFile(
      join(this.rootDir, 'tsconfig.json'),
      {},
      {
        ...ts.sys,
        onUnRecoverableConfigFileDiagnostic: (error) => {
          this.logger.fatal(error);
          isFatalError = true;
        }
      }
    );

    if (!tsconfig || isFatalError) {
      this.logger.fatal(`Unable to find tsconfig.json in ${app.options.getValue('tsconfig')}.`);
      return null;
    }

    app.options.setCompilerOptions(
      tsconfig.fileNames,
      tsconfig.options,
      tsconfig.projectReferences
    );

    // Set the compiler options so Typedoc can give us
    // a reflection of the project.
    const reflection = app.convert();
    const ast = app.serializer.toObject(reflection);

    if (!ast) {
      this.logger.fatal('Unable to get project reflection AST.');
      return null;
    }

    // Now we parse through the reflection! This is gonna be fun?
    // ...right? end my suffering.
    const tree = {
      enumerations: [],
      typeAliases: [],
      namespaces: [],
      interfaces: [],
      functions: [],
      variables: [],
      classes: []
    };

    if (!ast.children) {
      this.logger.fatal('AST didn\'t include any children to traverse');
      return null;
    }

    // First thing I tested is an [EnumerationNode].
    const enumeration = ast.children.filter(s => s.kind === 4)[0];

    return tree;
  }
}

/*
  get isPrivate(): boolean {
      return this.hasFlag(ReflectionFlag.Private);
  }

  get isProtected(): boolean {
      return this.hasFlag(ReflectionFlag.Protected);
  }

  get isPublic(): boolean {
      return this.hasFlag(ReflectionFlag.Public);
  }

  get isStatic(): boolean {
      return this.hasFlag(ReflectionFlag.Static);
  }

  get isExternal(): boolean {
      return this.hasFlag(ReflectionFlag.External);
  }

  get isOptional(): boolean {
      return this.hasFlag(ReflectionFlag.Optional);
  }

  get isRest(): boolean {
      return this.hasFlag(ReflectionFlag.Rest);
  }

  get hasExportAssignment(): boolean {
      return this.hasFlag(ReflectionFlag.ExportAssignment);
  }

  get isAbstract(): boolean {
      return this.hasFlag(ReflectionFlag.Abstract);
  }

  get isConst() {
      return this.hasFlag(ReflectionFlag.Const);
  }

  get isLet() {
      return this.hasFlag(ReflectionFlag.Let);
  }

  get isReadonly() {
      return this.hasFlag(ReflectionFlag.Readonly);
  }
*/
