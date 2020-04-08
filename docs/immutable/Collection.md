# Collection&lt;T&gt;
> **Immutable class to store key-value pairs.**

## Constructor
```ts
new Collection(from: { [x: string]: number | string | symbol } | Array<T>);
```

## Collection.empty: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
> **Returns a bool if the collection is empty**

```js
collection.empty; // true
```

## Collection.add(value: T): void
> **Adds a value to the collection with the key index as the collection size**

```js
collection.add('a');
```

## Collection.filter(predicate: (item: T) -> [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)): Array&lt;T&gt;
> **Filter out anything from the predicate function and return a new array of the values that returned `true` from the predicate function.**

```js
collection.filter(x => x.valuable); // [...]
```

## Collection.map&lt;S&gt;(predicate: (item: T) -> S): Array&lt;S&gt;
> **Map out anything from the predicate and form a new Array**

```js
collection.filter(x => x.isValuable()); // [...]
```

## Collection.random(): T | null
> **Returns a random value from the collection or `null` if the collection is empty**

```js
collection.random(); // SampleClass { 0: 'abcdef' }
```

## Collection.merge(): [Collection&lt;T&gt;](#collection-t)
> **Make a duplicate collection**

::: warn
This method might be replaced with `Collection.duplicate()`
:::

```js
collection.merge(otherColl); // Collection [Map] { ... }
```

## Collection.partition(predicate: (item: T) -> [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)): [[Collection&lt;T&gt;](#collection-t), [Collection&lt;T&gt;](#collection-t)]
> **Partition a collection into 2 arrays that return `true` or `false` from the predicate function.**

```js
collection.partition(x => x.isValuable()); // [Collection [Map] {}, Collection [Map] {}]
```

## Collection.reduce&lt;S&gt;(accumulator: (curr: T, prev: S) -> S, initialValue?: S): S
> **Reduce anything from it's current value with it's previous value**

```ts
collection.reduce<string[]>((curr, prev) => curr.concat(prev), []); // [...]
```

## Collection.first(): T | undefined
## Collection.first(amount: number): Array&lt;T&gt;
> **Returns the first value from the collection**

```js
collection.first(); // 'a'
```

## Collection.last(): T | undefined
## Collection.last(amount: number): Array&lt;T&gt;
> **Returns the last value from the collection**

```js
collection.last(); // 'a'
```

## Collection.find(predicate: (item: T) -> [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)): T | undefined
> **Finds any value from the collection from it's predicate function**

```js
collection.find(x => x === 't'); // 't'
collection.find(x => x === 'x'); // undefined
```

## (static) Collection.from(values?: Array&lt;T&gt; | { [x: string]: string | number | string }): [Collection&lt;T&gt;](#collection-t)
> **Statically make a new collection without using the `new` keyword.**

```js
Collection.from({ x: 'b' }); // Collection [Map] { x => 'b' }
Collection.from(['a', 'b']); // Collection [Map] { 0 => 'a', 1 => 'b' }
```