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

import Document, { NextScript, Head, Html, Main, DocumentContext } from 'next/document';

export default class PawDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initial = await Document.getInitialProps(ctx);
    return { ...initial };
  }

  render() {
    return <Html lang='en'>
      <Head>
        <link rel='shortcut icon' href='https://cdn.floofy.dev/images/trans.png' />
        <link rel='icon' href='https://cdn.floofy.dev/images/trans.png' />
        <meta charSet='UTF-8' />
        <meta name='description' content='Documentation for all of my projects that arent TypeScript or Kotlin. ❀ܓ(｡◠ ꇴ ◠｡ )' />
        <meta name='theme-color' content='#DAA2C6' />
        <meta property='og:description' content='Documentation for all of my projects that arent TypeScript or Kotlin. ❀ܓ(｡◠ ꇴ ◠｡ )' />
        {/* eslint-disable-next-line quotes */}
        <meta property='og:title' content={`Noel's Documentation 💐`} />
        <meta property='og:image' content='https://cdn.floofy.dev/images/trans.png' />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://docs.floofy.dev' />

        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='true' />
        <link href='https://fonts.googleapis.com/css2?family=Indie+Flower&family=JetBrains+Mono&family=Nunito&family=Quicksand:wght@500&display=swap' rel='stylesheet' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>;
  }
}
