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

// Definitions for "js-yaml"
// Project: https://github.com/nodeca/js-yaml
// Definitions by:
//   - August <august@augu.dev>

declare module 'js-yaml' {
  namespace yaml {
    //* Exported Functions and Constants
    export function load<T>(content: string, options?: LoadOptions): T;
    export function load(content: string, options?: LoadOptions): any;
    export function safeLoad<T>(content: string, options?: LoadOptions): T;
    export function safeLoad(content: string, options?: LoadOptions): any;
    export function safeLoadAll(content: string, iterator?: (doc: any) => void | undefined, options?: LoadOptions): any[];
    export function safeLoadAll<T>(content: string, iterator?: (doc: any) => void | undefined, options?: LoadOptions): T[];
    export function loadAll(content: string, iterator?: (doc: any) => void | undefined, options?: LoadOptions): any[];
    export function loadAll<T>(content: string, iterator?: (doc: any) => void | undefined, options?: LoadOptions): T[];
    export function safeDump(obj: any, options?: DumpOptions): string;
    export function safeDump<T>(obj: T, options?: DumpOptions): string;
    export function dump(obj: any, options?: DumpOptions): string;
    export function dump<T>(obj: T, options?: DumpOptions): string;
    export let FAILSAFE_SCHEMA: Schema;
    export let JSON_SCHEMA: Schema;
    export let CORE_SCHEMA: Schema;
    export let DEFAULT_SAFE_SCHEMA: Schema;
    export let DEFAULT_FULL_SCHEMA: Schema;
    export let MINIMAL_SCHEMA: Schema;
    export let SAFE_SCHEMA: Schema;

    //* Exported Types and Classes
    export class Type {
      constructor(tag: string, options?: TypeConstructorOptions);
      public kind: 'sequence' | 'scalar' | 'mapping' | null;
      public instanceOf: object | null;
      public predicate: ((data: object) => boolean) | null;
      public represent: ((data: object) => any | { [x: string]: (data: object) => any }) | null;
      public defaultStyle: string | null;
      public styleAliases: { [x: string]: any };
      public resolve(data: any): boolean;
      public construct(data: any): any;
    }

    export class Schema implements SchemaDefinition {
      constructor(def: SchemaDefinition);
      static create(types: Type[] | Type): Schema;
      static create(schemas: Schema[] | Schema, types: Type[] | Type): Schema;
    }

    export interface LoadOptions {
      filename?: string;
      onWarning?(this: null, e: YAMLException): void;
      schema?: SchemaDefinition;
      json?: boolean;
    }

    export interface DumpOptions {
      indent?: number;
      noArrayIndent?: boolean;
      skipInvalid?: boolean;
      flowLevel?: number;
      styles?: { [x: string]: any; };
      schema?: SchemaDefinition;
      sortKeys?: boolean | ((a: any, b: any) => number);
      lineWidth?: number;
      noRefs?: boolean;
      noCompatMode?: boolean;
      condenseFlow?: boolean;
    }

    export interface TypeConstructorOptions {
      kind?: 'sequence' | 'scalar' | 'mapping';
      resole?: (data: any) => boolean;
      construct?: (data: any) => any;
      instanceOf?: object;
      predicate?: (data: object) => boolean;
      represent?: ((data: object) => any) | { [x: string]: (data: object) => any };
      defaultStyle?: string;
      styleAliases?: { [x: string]: any; };
    }

    export interface SchemaDefinition {
      implicit?: any[];
      explicit?: Type[];
      include?: Schema[];
    }

    export class YAMLException extends Error {
      constructor(reason?: any, mark?: any);
      toString(compact?: boolean): string;
    }
  }
  
  export = yaml; // Export as the "yaml" namespace
}