/* eslint-disable react/no-unescaped-entities */
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

import styles from '../styles/index.module.scss';
import Image from 'next/image';

export default function Owo() {
  const year = new Date().getFullYear();

  return (
    <>
      <div className={styles['old-container']}>
        <div className={styles['old-container-content']}>
          <div className='container-left'>
            <Image
              src='https://cdn.floofy.dev/images/August.png'
              className={styles.avatar}
              alt='avy'
              width={234}
              height={234}
              draggable='false'
            />
          </div>

          <div className={styles['container-right']}>
            {/* eslint-disable-next-line */}
            <h1 className={styles['heading-1']}>{`Noel's Documentation Site`}</h1>
            <h2 className={styles['heading-2']}>
              Welcome to my documentation site, yea this seems like my boring ol' website,
              but what else am I supposed to put here?
            </h2>
          </div>
        </div>
      </div>
    </>
  );
}
