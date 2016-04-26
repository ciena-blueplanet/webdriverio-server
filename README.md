# webdriverio-server

[![npm version](https://badge.fury.io/js/webdriverio-server.svg)](http://badge.fury.io/js/webdriverio-server)
[![build status](https://travis-ci.org/ciena-blueplanet/webdriverio-server.svg?branch=master)](https://travis-ci.org/ciena-blueplanet/webdriverio-server)

If you want a remote server to do selenium testing, this is a better way

## Setup

Setting up a new server for selenium testing requires

1. Prerequisites
1. Installation
1. Starting the webdriverio-server node process

### Prerequisites

These instructions assume that you have set up a server (either Mac or Ubuntu) with the following:

- [NodeJS >= 5.3 (including NPM)](https://github.com/creationix/nvm)
- [Dependencies](https://github.com/webdriverio/webdrivercss) of webdrivercss
- Java runtime environment (ubuntu: `sudo apt-get install -y openjdk-7-jre`)
- Chrome web browser installed

In order to facilitate this for an Ubuntu 14.04 server, the following command can be used:

```
wget -q0- https://raw.githubusercontent.com/ciena-blueplanet/webdriverio-server/master/bin/bootstrap/ubuntu/14.04.sh | bash
```

This will configure a new system capable of running `webdriverio-server` using `xvfb` to allow headless execution of
the Chrome browser to capture screenshots.

### Installation

    npm install -g webdriverio-server
    webdriverio-server-init

The first line will install both the `webdriverio-server` and `webdriver-manager` alongside it. The second line will
initialize the build environment for the `webriverio-server`.

### Starting the webdriver-io server node process

Now you're ready to run the web service which will respond to test-upload requests:

    webdriverio-server

If you'd like to override the port being listened to, or perhaps get some verbose debugging output, you can turn
those on using environment variables

    PORT=3001 DEBUG=server webdriverio-server

## Using the server

The best way to use the server is to utilize the [webdriverio-client](https://github.com/ciena-blueplanet/webdriverio-client) to make test requests.

For an example usage of the client, take a look at [ember-frost-checkbox](https://github.com/ciena-frost/ember-frost-checkbox.git)
