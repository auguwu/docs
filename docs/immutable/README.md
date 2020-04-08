# @augu/immutable
[![npm version](https://badge.fury.io/js/%40augu%2Fimmutable.svg)](https://npm.im/@augu/immutable) [![NPM Downloads](https://img.shields.io/npm/dt/@augu/immutable.svg?maxAge=3600)](https://npm.im/@augu/immutable) 

> :pencil2: **| Collections library made in [TypeScript](https://typescriptlang.org)**

## Example
```js
const { Collection } = require('@augu/immutable');
const collection = Collection.from(['a', 'b', 'c']);

collection.get(0); // 'a'
collection.find(x => x === 'b'); // 'b'
collection.filter(x => x === 'c'); // ['c']
collection.map(x => x); // ['a', 'b', 'c']
```

## Documentation
- [Collection](/immutable/Collection.html)
- [Queue](/immutable/Queue.html)
- [Pair](/immutable/Pair.html)
- [version](/immutable/version.html)