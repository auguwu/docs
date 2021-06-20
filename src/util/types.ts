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
 * Represents the `docs.yml` structure.
 */
export interface DocProjectConfig {
  description: string;
  repository: string;
  renderer: 'typescript' | 'kotlin' | 'markdown';
  sidebar?: SidebarConfig;
  navbar?: NavbarConfig;
  index?: IndexPageConfig;
  pages?: PagesConfig[];
  emoji: string;
  name: string;
}

//#region Kotlin
export interface KotlinDocProjectConfig extends DocProjectConfig {
  renderer: 'kotlin';
  kotlin?: KotlinProjectConfig;
}

interface KotlinProjectConfig {
  subprojects?: KotlinDocSubprojectConfig[];
  taskCmd?: string;
}

interface KotlinDocSubprojectConfig {
  description: string;
  taskCmd: string;
  name: string;
}

//#endregion Kotlin

//#region TypeScript
export interface TSDocProjectConfig extends DocProjectConfig {
  typescript?: TypeScriptProjectConfig;
  renderer: 'typescript';
}

// TODO: support monorepos (if I ever do decide to use one)
interface TypeScriptProjectConfig {
  entryPoints?: string[];
  tsconfig: string;
  rootDir: string;
}
//#endregion TypeScript

interface IndexPageConfig {
  middle?: boolean;
  badges?: BadgeConfig[];
}

interface BadgeConfig {
  alt: string;
  url: string;
}

interface SidebarConfig {
  emoji?: string | FAIconConfig;
  name: string;
  url: string;
}

interface FAIconConfig {
  brand?: string;
  icon: string;
}

interface PagesConfig {
  description: string;
  endpoints?: string[];
  endpoint?: string;
  name: string;
}

interface NavbarConfig {
  right?: NavbarContentConfig[];
  emoji: FAIconConfig | string;
  left?: NavbarContentConfig[];
  name: string;
}

interface NavbarContentConfig {
  name?: string;
  icon?: string;
  url: string;
}
