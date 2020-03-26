# Ichigo.Constants
> **Namespace of all constant values used through out Ichigo.**

## enum Ichigo.Constants.OPCodes
> **The OPCodes to send IPC messages from Discord to Ichigo**

```ts
enum OPCodes {
  HANDSHAKE = 0,
  FRAME = 1,
  CLOSE = 2,
  PING = 3,
  PONG = 4
}
```

## enum Ichigo.Constants.RequestCommand
> **Enum of all the request commands we can use**

```ts
enum RequestCommand {
  SetActivity = 'SET_ACTIVITY'
}
```