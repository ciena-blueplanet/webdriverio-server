# webdriverio-server

[![npm version](https://badge.fury.io/js/webdriverio-server.svg)](http://badge.fury.io/js/webdriverio-server)
[![build status](https://travis-ci.org/ciena-blueplanet/webdriverio-server.svg?branch=master)](https://travis-ci.org/ciena-blueplanet/webdriverio-server)

If you want a remote server to do selenium testing, this is a better way

## Terminology

**Canonical screen-shot:** Producing screen-shots that can be compared between different
computers can be quite difficult. Often subtle differences in systems, such as what fonts are 
installed can result in widely varying screen-shots. Therefore the *right thing to do* when using 
`webdrivercss` is to have a **known-good** system to produce all screen-shots. One approach to this 
is to set up `webdriverio-server` on a dedicated server somewhere and have `webdriverio-client` send 
all requests for selenium tests to that machine. Another approach is to use a system that can 
consistently produce the same machine each time (e.g. using Docker). This way developers can each 
have their own independent systems for running tests which are identical to each other and to the 
CI system.

**Test server:** There will be a dedicated server process that can either run locally or on another machine 
for the purposes of getting testing requests, processing them, and sending back results.

## Setup

There are two use-cases for implementing webdriverio-server:

1. Running tests on a laptop (Mac OS/X) in order to watch the progress and to visually inspect how a test is executing. Note that this will *not* produce canonical screenshots that can be used across a team.

1. Running tests for the purpose of creating canonical screen-shots that can be checked in as part of a pull-request.

### Installing on OS/X

Install the following dependencies:

- [NodeJS >= 5.3 (including NPM)](https://github.com/creationix/nvm)
- [Dependencies](https://github.com/webdriverio/webdrivercss) of webdrivercss
- Java
- Chrome web browser installed

Next install webdriverio-server and run the init script:

```bash
npm install -g webdriverio-server
webdriverio-server-init local
```

Now you're ready to run the web service which will respond to test-upload requests:

```bash
DEBUG=server PORT=3000 webdriverio-server
```

In this case, you'll be sending test requests to localhost on port 3000.

### Installing on Docker

If you want to share screenshots between developers, you'll need to set up a testing system that 
produces 100% consistent images. This can be done by doing the above steps on a dedicated server 
or by setting up a Docker system on developer systems and the CI system. The canonical setup requires 
that you have Docker installed with appropriate permissions for running user.

```bash
npm install -g webdriverio-server
webdriverio-server-init docker
```

To start the testing server, use the run command:

```bash
$ docker run -Pd webdriverio-server
34a841cb50a0555e40060367c862d50f823c0edcd0a2fe6537b5666f7588e73d
```

To stop the test container, run `docker stop` with the image id that docker provided, e.g.

```bash
$ docker stop 34a841cb50a0555e40060367c862d50f823c0edcd0a2fe6537b5666f7588e73d
34a841cb50a0555e40060367c862d50f823c0edcd0a2fe6537b5666f7588e73d
```

In this case, you'll be sending test requests to the docker server. Note that docker maps ports on the container 
to random ports on the host machine. To find out what ports 

## Using the server

Now that you have a running webdriverio-server, you need to be able to submit tests to it. This is not a trivial 
procedure. You will need to set up your testing directory properly and to submit a tarball to the server with your 
entire site in it, packaged up properly with the existing screenshots, if applicable.

To make this easier, utilize the [webdriverio-client](https://github.com/ciena-blueplanet/webdriverio-client) to make test requests.