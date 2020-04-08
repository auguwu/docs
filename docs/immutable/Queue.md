# class Queue&lt;T = any&gt;
> **Queue-based collection to fetch, requeue, and do other stuff!**

## Constructor
```js
new Queue<T>(cache: T[] = []);
```

## Queue.enqueue(item: T): void
> **Queue up an item into the cache.**

```js
queue.enqueue('a string');
```

## Queue.tick(func: (item: T) => void): void
> **Runs all of the queue values that was put with `enqueue`**

```js
queue.tick(console.log);
```

## Queue.peek(): T
> **Peek at the last value of the queue**

```js
queue.peek(); // 'a string'
```

## Queue.peekAt(index: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)): T | null
> **Peek at an index of the cache**

```js
queue.peekAt(0); // 'a string'
queue.peekAt(5); // null
```

## Queue.size(): [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
> **Get the size of the cache**

```js
queue.size(); // 1
```