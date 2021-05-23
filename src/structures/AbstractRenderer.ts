/**
 * Copyright (c) Noelware
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

/**
 * Interface to determine a "rendered" result.
 */
export interface RenderResult {
  editThisDocUri?: string;
  githubUri?: string;
  content: string;
}

/**
 * Represents a [AbstractRenderer], which is a renderer tool to
 * render anything under the renderer container. All renderers
 * must implement the `render(): Promise<RenderResult>` function,
 * to render out content and return `RenderResult`, which is a special
 * interface to determine errors or the result.
 *
 * Implementations are with TypeScript, JavaScript, Kotlin, and Markdown.
 *
 * - **TypeScript** uses **typedoc** under the hood to serialize all JSDoc
 * to a JSON file and the renderer picks it's children from anything in the module tree.
 *
 * - **JavaScript** uses the **jsdoc-api** package under the hood to serialize
 * all JSDoc and creates a "AST" (Abstract Syntax Tree), and the renderer will serialize
 * that to what is expected.
 *
 * - **Kotlin** is not yet implemented.
 *
 * - **Markdown** uses `remark` under the hood with MDX utilities.
 *
 * A renderer is implemented like this:
 * ```ts
 * import { Renderer, AbstractRenderer, RenderResult } from '../structures';
 *
 * \@Renderer('name') // remove the `\`, it's used for documentation
 * export default class MyRenderer implements AbstractRenderer {
 *    render() {
 *      return Promise.resolve<RenderResult>({
 *         editThisDocUri: 'https://github.com/Noelware/camellia/edit/master/src/structures/AbstractRenderer.ts',
 *         githubUri: 'https://github.com/Noelware/camellia/edit/master/src/structures/AbstractRenderer.ts#L62',
 *         content: '... insert some content here ...'
 *      });
 *   }
 * }
 * ```
 */
export interface AbstractRenderer<T extends any[] = any[]> {
  /**
   * Implemented render function to render out stuff to return a [RenderResult].
   */
  render(...args: T): Promise<RenderResult>;

  /**
   * Initialize this [AbstractRenderer]
   */
  init(...args: any[]): Promise<void>;
}
