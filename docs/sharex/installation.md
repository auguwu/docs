---
title: 'ShareX Service ("ume")'
section: 'Configuration'
description: 'Installation process for ume and setting it up with ShareX.'
author: 'Noel (@auguwu)'
---

# Installation
## Prerequisites
Before we go installing **ume**, we will need to install the following programs:

- [Go](https://golang.org) ~ v1.16+
- [Git](https://git-scm.com/) ~ v2.16+
- [MongoDB](https://mongodb.com) ~ v4.2+

There are other tools you can use, but for a private instance, these aren't recommended to be used:

- [Docker](https://docker.com) ~ If you're a masochist and want to run a private instance with Docker.

## Process (normally)
- [Fork](https://github.com/auguwu/ume/fork) the repository to your user.
- Clone the repository to your machine:

```sh
$ git clone https://github.com/$USERNAME/ume
```

###### omit `$USERNAME` with your username on GitHub.

- Run `go get` to fetch all dependencies
- Run `go build` to build the binary to run **ume**.
- Run the binary (`ume.exe` on Windows, `./ume` on UNIX)

## Process (docker)
- [Fork](https://github.com/auguwu/ume/fork) the repository to your user.
- Clone the repository to your machine:

```sh
$ git clone https://github.com/$USERNAME/ume
```

###### omit `$USERNAME` with your username on GitHub.

- Build the image:

```sh
$ docker build . -t ume:latest
```

###### this will create a image called `ume:latest`

- Run the image:

```sh
$ docker run -d -p 3621:3621 ume:latest
```

You should get an error now since it can't connect to MongoDB! This is completely normal on the first
installation, if this is re-occuring, check your instance.

## Configuration
Since ume is written in Go, all environment labels must be written as system environment variables:

|Environment Variable|Type|Default Value|
|--------------------|----|-------------|
|`AUTH`|string|None.|
|`DB`|string|`"ume"`|
|`DB_URL`|string|`mongodb://localhost:27017`|

### Docker
For Docker usage, use the `-e` flags for specifying the environment variables.

```sh
$ docker run -d -p 3621:3621 \
    -e AUTH=...
    -e DB=ume
    -e DB_URL=mongodb://localhost:27017
    ume:latest
```
