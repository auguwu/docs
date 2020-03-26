# Ichigo
> **The main class to control the use of the RPC server.**

## Constructor
```js
new Ichigo(clientID: String);
```

## Ichigo.expecting: [Collection](/immutable/Collection)&lt;[ExpectingMessage](#struct-expectingmessage)&gt;
> **Returns the expecting messages that were requested**

## Ichigo.ipc: [DiscordIPC](/ichigo/DiscordIPC)
> **Returns the IPC controller**

## Ichigo.connect(): void
> **Connects to the IPC server**

```js
Ichigo.connect();
```

## Ichigo.send&lt;T&gt;(cmd: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), args: Array&lt;[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)&gt;): [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;T&gt;
> **Sends a message to Discord's RPC server and returns a fulfilled or rejected Promise.**

```js
Ichigo.send(Constants.RequestCommand.SetActivity, { ... }); // Promise
```

## Ichigo.setActivity(activity: [Activity](#struct-activity)): [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;void&gt;
> **Sets a RPC status to the current user authenicated**

```js
Ichigo.setActivity({
  instance: false,
  state: 'State',
  details: 'Details',
  timestamps: {
    start: new Date().getTime()
  }
});
```

# struct ExpectingMessage&lt;T = any&gt;
```ts
interface ExpectingMessage<T = any> {
  resolve(value: T | PromiseLike<T>): void;
  reject(error?: T): void;
}
```

# struct Activity
```ts
interface Activity {
  /**
   * The state of the RPC being used
   * 
   * **NOTE**: The state is on the bottom of the text
   */
  state?: string;

  /**
   * The details of the RPC being used
   * 
   * **NOTE**: The details is on the top of the text
   */
  details?: string;

  /**
   * If the RPC is an instance of something
   */
  instance?: boolean;

  /**
   * Timestamps object, to check on the `Elapsed`/`Ends At` text of the RPC
   */
  timestamps?: {
    /**
     * The start of the timestamp
     */
    start?: number;

    /**
     * The end of the timestamp
     */
    end?: number;
  }

  /**
   * Any assets to use when a user is using the RPC
   */
  assets?: {
    /**
     * The image key to use
     */
    large_image?: string;

    /**
     * The text when the large image is hovered
     */
    large_text?: string;

    /**
     * The small image key
     */
    small_image?: string;

    /**
     * The text when the small image key is hovered
     */
    small_text?: string;
  }

  /**
   * The party object, the ability to join/spectate on games
   */
  party?: {
    /**
     * The ID of the party
     */
    id?: any;

    /**
     * The size of the party
     */
    size?: number[];
  }

  /**
   * Any secret keys to use when a user joins/spectates/matches on a game
   */
  secrets?: {
    /**
     * The join key, when a user can join the game
     */
    join?: string;

    /**
     * The spectate key, when a user can spectate on a user during a match
     */
    spectate?: string;

    /**
     * The match key, when a user can join the other user's match
     */
    match?: string;
  }
}
```