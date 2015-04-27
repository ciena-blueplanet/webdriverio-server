# webdriverio-server

[![npm version](https://badge.fury.io/js/webdriverio-server.svg)](http://badge.fury.io/js/webdriverio-server)
[![build status](https://travis-ci.org/cyaninc/webdriverio-server.svg?branch=master)](https://travis-ci.org/cyaninc/webdriverio-server)

If you want a remote server to do selenium testing, this is a better way

## Setup

Setting up a new server for selenium testing requires

0. Prerequisites
1. Setting up the build directory
2. Running the selenium server
3. Starting the webdriverio-server node process

### Prerequisites

These instructions assume that you have set up a server (either Mac or Ubuntu) with the following:

- [NodeJS (including NPM)](https://github.com/creationix/nvm)
- [Dependencies](https://github.com/cyaninc/beaker#end-to-end-test-dependencies) of webdrivercss
- You have the current version of the `webdriverio-server` code

### Setting up the build directory

Go to the `build` directory, and issue the following commands:

```
npm install
cd node_modules/karma-jasmine-jquery && node install.js
node node_modules/.bin/webdriver-manager update --standalone
```

### Running the selenium server

In a separate terminal, launch the selenium server:

```
node_modules/bin/webdriver-manager start
```

This process must always be running. Be careful, if you hit `ENTER` while this
process is running, it will cause it to terminate. This process will listen on
port 4444 on your server.


### Starting the webdriver-io server node process

Now you're ready to run the web service which will respond to test-upload requests:

```
node bin/www.js
```
