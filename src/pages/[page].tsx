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

import { GetStaticPathsResult, GetStaticProps, GetStaticPropsResult } from 'next';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getDocFromCache } from '../lib/docs';

interface DocumentPageProps {
  description: string;
  section?: string;
  contents: string;
  author: string;
  title: string;
  icon: string;
}

const authors = {
  'Noel (@auguwu)': 'https://cdn.floofy.dev/images/August.png'
};

export const getStaticPaths = async (): Promise<GetStaticPathsResult> => ({
  paths: [
    '/hana/',
    '/sharex/'
  ],
  fallback: true
});

export const getStaticProps: GetStaticProps = async ({ params }): Promise<GetStaticPropsResult<DocumentPageProps>> => {
  const docs = await getDocFromCache(`${params.page}/index.md`);

  return {
    props: {
      description: docs.description,
      contents: docs.contents,
      author: docs.author,
      title: docs.title,
      icon: authors[docs.author]
    }
  };
};

export default function DocumentationPage({ title, description, contents, author, icon, section }: DocumentPageProps) {
  const router = useRouter();

  return <>
    <Head>
      <title>{section !== undefined ? `💐 ${title} • ${section}` : title}</title>
      <meta charSet='UTF-8' />

      <meta property='description' content={description} />
      <meta property='theme-color' content='#7590F2' />
      <meta
        property='og:description'
        content={description}
      />

      <meta
        property='og:title'
        content={section !== undefined ? `💐 ${title} • ${section}` : title}
      />

      <meta
        property='og:image'
        content='https://cdn.floofy.dev/images/trans.png'
      />

      <meta property='og:type' content='website' />
      <meta property='og:url' content={`https://docs.floofy.dev/${router.pathname}`} />
    </Head>

    <article className='container container-main'>
      <main dangerouslySetInnerHTML={{ __html: contents }}></main>
      <br />
      <br />
    </article>
  </>;
}
