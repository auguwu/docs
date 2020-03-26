# sys.getCPUCount -> [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
> **Returns the amount of CPU cores you have.**

```js
sys.getCPUCount(); // 8
```

# sys.getFreeMemory -> [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
> **Returns the system's free memory in bytes**

```js
sys.getFreeMemory(); // 2750000000000
```

# sys.getTotalMemory -> [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
> **Returns the total memory of the hard drive in bytes**

```js
sys.getTotalMemory(); // 5750000000000
```

# sys.getCPUUsage -> [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
> **Returns the current CPU's usage as a percent**

```js
sys.getCPUUsage(); // '0.37%'
```

# sys.getPlatform -> [Platform](#typedef-platform)
> **Returns the current machine's operating system**

```js
sys.getPlatform(); // 'Windows'
```

# sys.free -> [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
> **Returns the free amount from the `free` Unix command**

::: warning
This command only works with Unix subsystems!

It will bring up a warning in the console if not used properly!
:::

```js
sys.free(sys.Constants.FreeFlags.megabytes); //> 69696969
```

# sys.getLoadAvg -> [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
> **Returns the load average time**

```js
sys.getLoadAvg(15); //> 0.205858
```

# sys.getCPUInfo -> [CPUInfo](#struct-cpuinfo)
> **Returns an object of the current CPU's information**

```js
sys.getCPUInfo(); // { firstModel: '...', lastModel: '...', idle: 488219038, free: 923273827831 }
```

# sys.getFilesystemInfo -> [FilesystemInfo](#struct-filesysteminfo)
> **Gets the file system's statistics from the `df` Unix command.**

::: warning
This function is only allowed in Unix subsystems!
:::

```js
sys.getFilesystemInfo(); // {...}
```

# sys.getProcesses -> [Array&lt;Processes&gt;](#struct-processes)
> **Returns an Array of processes**

::: warning
Windows-equlivent of this function is `sys.getWindowsServices`
:::

```js
sys.getProcesses(5); // [...]
```

# sys.getUnixUptime -> [UnixUptime](#struct-unixuptime)
> **Returns an Object from the `uptime` Unix command**

::: warning
This function only works with Unix systems.
:::

```js
sys.getUnixUptime(); // { uptime: 5932498302189, users: 2, loads: [0.24, 0.23, 0.45] }
```

# sys.getWindowsWorkstation -> [Workstation](#struct-workstation)
> **Returns an object of the current Windows workstation.**

::: warning
This function only works with Microsoft Windows
:::

```js
sys.getWindowsWorkstation(); //> {...}
```

# sys.getWindowsServices -> [Array&lt;String&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
> **Returns an Array of services that are running in the background**

::: warning
This function only works with Microsoft Windows
:::

```js
sys.getWindowsServices(); // [...]
```

# sys.getMotherboard -> [Motherboard](#struct-motherboard)
> **Returns an Object of the motherboard information**

::: warning
This function only works with Microsoft Windows
:::

```js
sys.getMotherboard(); // {...}
```

# typedef Platform
```ts
type Platform = 'Windows' | 'Macintosh' | 'Android' | 'Linux' | 'Unknown';
```

# struct CPUInfo
```rust
struct CPUInfo {
  firstModel: String
  lastModel: String
  total: Number
  idle: Number
}
```

# struct FilesystemInfo
```rust
struct FilesystemInfo {
  usedPercentage: String
  mountedRoot: String
  avaliable: String
  mounted: String
  used: String
  size: String
  type: String
}
```

# struct Processes
```rust
struct Processes {
  command: String
  time: String
  cpu: String
}
```

# struct UnixUptime
```rust
struct UnixUptime {
  uptime: String
  users: Int
  loads: Int[]
}
```

# struct Workstation
```rust
struct Workstation {
  serverMessageBlocks: Int
  bytesTransmitted: Int
  bytesReceived: Int
  desktopName: String
  writeOp: Int
  readOp: Int
  since: String
}
```

# struct Motherboard
```rust
struct Motherboard {
  serialNumber: String
  manufacturer: String
  product: String
}
```