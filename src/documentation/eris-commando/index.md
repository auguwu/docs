# eris-commando
**eris-commando** is a NPM library that is a command framework for the [Eris](${redirect:abal.moe/Eris}) library.

## Example Bot
```js
const { CommandoClient } = require('eris-commando');
const { sep } = require('path');

new CommandoClient({
  token: '',
  prefix: '!',
  commands: `${process.cwd()}${sep}commands`,
  events: `${process.cwd()}${sep}events`,
  invite: 'discord.gg/invite',
  owner: [],
  tasks: `${process.cwd()}${sep}tasks`,
  options: {}
}).setup();
```

## Install
```sh
# Yarn
$ yarn add eris-commando

# NPM
$ npm i eris-commando
```

## Classes
- [Collection](${redirect:/eris-commando/classes/Collection})
- [Command](${redirect:/eris-commando/classes/Command})
- [CommandMessage](${redirect:/eris-commando/classes/CommandMessage})
- [CommandoClient](${redirect:/eris-commando/CommandoClient})
- [Event](${redirect:/eris-commando/classes/Event})
- [MessageCollector](${redirect:/eris-commando/classes/MessageCollector})
- [Task](${redirect:/eris-commando/classes/Task})

## Type Definitions
- [CommandMeta](${redirect:/eris-commando/typedefs/CommandMeta})
- [CommandoClientOptions](${redirect:/eris-commando/typedefs/CommandoClientOptions})
- [EventMeta](${redirect:/eris-commando/typedefs/EventMeta})
- [MessageCollectorOptions](${redirect:/eris-commando/typedefs/MessageCollectorOptions})
- [TaskMeta](${redirect:/eris-commando/typedefs/TaskMeta})