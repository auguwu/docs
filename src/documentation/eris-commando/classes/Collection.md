# class Collection<K, V>
A super old version of discord.js' [Collection](${redirect:github.com/discordjs/discord.js/blob/master/src/util/Collection.js}) instance since Eris' collection kinda doesn't have the features of the extended Map instance.

## Generic Types
- **K**: The key of the collection (can be a string, number, etc)
- **V**: The value type of the collection (can be a class, enum, interface, etc)

## Getters
- `_array`: Returns an Array of all the values injected from `Collection#set`, it'll reset to `null` if any values are added
- `_keyArray`: Returns an Array of all the keys injected from `Collection#set`, it'll reset to `null` if any values are added

## Functions
### Collection#set(key: K, value: V) -> Collection<K, V>
> Appends a new key-pair value to the collection

#### Parameters
- **key** (required): The key of the value that we are inserting
- **value** (required): The value itself

#### Examples
```js
collection.set(0, {}); //> Collection [Map] { 0 => {} }
collection.set('a', {}); //> Collection [Map] { 'a' => {} }
```

### Collection#delete(key: String) -> Boolean
> Deletes a value from the cache with it's respected key.

#### Parameters
- **key** (required): The key that we are deleting

#### Examples
```js
collection.delete(0); //> true (it exists)
collection.delete('b'); //> false (it doesn't exist)
```

### Collection#array() -> V[]
> Returns the values from the values injected and builds a new instance of `Collection#array`

#### Examples
```js
collection.array(); //> [{}, {}]
```

### Collection#keyArray() -> K[]
> Returns the keys that were injected and builds a new instance of `Collection#keyArray`

#### Examples
```js
collection.keyArray(); //> [0, 'a']
```