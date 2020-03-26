# Ichigo.DiscordIPC
> **IPC controller used with Ichigo**

## DiscordIPC.clientID: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
> **Returns the client ID to use when using the RPC controller.**

## DiscordIPC.socket: [net.Socket](https://nodejs.org/api/net.html#net_class_net_socket) | null
> **Returns the socket instance of the IPC controller is connected, otherwise it'll be `null`**

## DiscordIPC.send(op: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number), data: { [x: string]: any }): void
> **Sends a message to the RPC server.**

```js
ipc.send(2, {}); // close the connection
```

## DiscordIPC.disconnect(): void
> **Disconnects the IPC controller**

```js
ipc.disconnect();
```

## DiscordIPC.connect(): [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;void&gt;
> **Connects to the RPC server**

```js
ipc.connect();
```