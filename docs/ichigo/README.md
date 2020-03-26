# @augu/ichigo
[![npm version](https://badge.fury.io/js/%40augu%2Fichigo.svg)](https://npm.im/@augu/ichigo) [![NPM Downloads](https://img.shields.io/npm/dt/@augu/ichigo.svg?maxAge=3600)](https://npm.im/@augu/ichigo)

> :love_letter: **| [Discord](https://discordapp.com) RPC client made in [TypeScript](https://typescriptlang.org)**

## Example
```js
import { Ichigo } from '@augu/ichigo';
const rpc = new Ichigo('');

rpc.on('open', () => console.log('[Ichigo] Opened connection.'));
rpc.on('error', (error) => console.error('[Ichigo] Unknown error!', error));
rpc.on('ready', () => {
  console.log('[Ichigo] Ready!');
  rpc.setActivity({
    instance: false,
    state: 'State',
    details: 'Details',
    timestamps: {
      start: new Date().getTime()
    }
  });
});
```

## Documentation
- [Ichigo](/ichigo/Ichigo.html)
- [DiscordIPC](/ichigo/DiscordIPC.html)
- [Constants](/ichigo/Constants.html)
- [version](/ichigo/version.html)