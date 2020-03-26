# @augu/sysinfo
[![npm version](https://badge.fury.io/js/%40augu%2Fsysinfo.svg)](https://npm.im/@augu/sysinfo) [![NPM Downloads](https://img.shields.io/npm/dt/@augu/sysinfo.svg?maxAge=3600)](https://npm.im/@augu/sysinfo) 

> :gear: **| Utilties to get information on your machine.**

## Example
```js
const sys = require('@augu/sysinfo');

sys.getCPUUsage(); //> 0.36%
```

## Is this library safe?
This library is 100% safe, it doesn't execute malicous commands. If you still don't trust it, then don't use it.

## Functions
- [sys.Constants](/sysinfo/Constants)
- [sys.version](/sysinfo/version)
- [sys.getCPUCount](/sysinfo/functions.html#sys-getcpucount-number)
- [sys.getFreeMemory](/sysinfo/functions.html#sys-getfreememory-number)
- [sys.getTotalMemory](/sysinfo/functions.html#sys-gettotalmemory-number)
- [sys.getCPUUsage](/sysinfo/functions.html#sys-getcpuusage-string)
- [sys.getPlatform](/sysinfo/functions.html#sys-getcpucount-platform)
- [sys.free](/sysinfo/functions.html#sys-free-number)
- [sys.getLoadAvg](/sysinfo/functions.html#sys-getloadavg-number)
- [sys.getCPUInfo](/sysinfo/functions.html#sys-getcpuinfo-cpuinfo)
- [sys.getFilesystemInfo](/sysinfo/functions.html#sys-getfilesysteminfo-fsinfo)
- [sys.getProcesses](/sysinfo/functions.html#sys-getprocesses-processes)
- [sys.getUnixUptime](/sysinfo/functions.html#sys-getunixuptime-string)
- [sys.getWindowsWorkstation](/sysinfo/functions.html#sys-getwindowsworkstation-workstation)
- [sys.getWindowsServices](/sysinfo/functions.html#sys-getwindowsservices-services)
- [sys.getMotherboard](/sysinfo/functions.html#sys-getmotherboard-motherboardinfo)