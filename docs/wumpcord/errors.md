# Errors
This page will document and show you how to fix any error that you occur in Wumpcord.

## Expected x but received y
If you receive this error, this means you typed a variable on something incorrectly. Let's say we have this line of code:

```js
const { Client } = require('wumpcord');
const bot = new Client('a');
```

We will receive the following error:

```js
TypeError: Expected `object` but received `string`.
```

This means that **Client** was expecting an object to pass in the constructor, yet we passed a string. Refer to [Client](/wumpcord/WebSocketClient)'s constructor documentation on what options you can pass in.

## x items were not an instance of y
If you receive this error, this means you passed in the wrong data type. If we run this line of code:

```js
const { commands } = require('wumpcord');

class MyCommand extends commands.Command {
  constructor() {
    super({
      description: 'Some weird description...',
      inhibitors: ['guild', false],
      name: 'test'
    });
  }

  async run(ctx) {
    return ctx.send('This will fail!');
  }
};

const cmd = new MyCommand(); // this fails!
```

It's saying that when validating, x amount of items have failed the check. To fix it, pass `inhibitors` as an Array of Strings and it'll pass the validation check, like so:

```js
inhibitors: ['guild', 'owner']
```
