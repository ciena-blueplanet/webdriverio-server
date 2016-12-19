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

### Installation

    npm install -g webdriverio-server
    webdriverio-server-init

The first line will install both the `webdriverio-server` and `webdriver-manager` alongside it. The second line will
initialize the build environment for the `webriverio-server`.

### Setting up the server

To setup the server, refer to SETUP.md.

This will configure a new system capable of running `webdriverio-server` using `xvfb` to allow headless execution of
the Chrome browser to capture screenshots.

### Starting the webdriver-io server node process

Now you're ready to run the web service which will respond to test-upload requests:

    webdriverio-server

If you'd like to override the port being listened to, or perhaps get some verbose debugging output, you can turn
those on using environment variables

    PORT=3001 DEBUG=server webdriverio-server

### Running the webdriverio-server on your localhost

1. First install [Graphics Magick](http://www.graphicsmagick.org/README.html). It is a critical dependency for screenshot processing.
2. Next, fork and clone the webdriverio-server code from the ciena-blueplanet repository and make any changes.
3. If you are not already in the top level of the webdriverio-server directory, go there (cd webdriverio-server)
4. Once you have made satisfactory changes or you just want to run the server on your localhost, download a project that utilizes e2e tests (see below for examples on using the server)
5. Run ```npm start``` on the webdriverio-server code
6. If you are running a project that is already configured to run e2e tests, you can run those now. If not, configure your project 
using the (webdriverio-client)[https://github.com/ciena-blueplanet/webdriverio-client] package. Instructions on configuring your project to run e2e tests can 
be found in the README.md in the webdriverio-client repo on GitHub


## Using the server

The best way to use the server is to utilize the [webdriverio-client](https://github.com/ciena-blueplanet/webdriverio-client) to make test requests.

For an example usage of the client, take a look at [ember-frost-checkbox](https://github.com/ciena-frost/ember-frost-checkbox.git)

# Running the Front End Application

    cd webdriverio-app
    npm install
    npm start

Navigate to localhost:4200 to view the current version of the website

# Frequently Asked Questions

#### Communication Diagrams
![Use Case 1](https://github.com/pastorsj/webdriverio-server/blob/webdriverio-app/resources/UseCase1.png)

![Use Case 2](https://github.com/pastorsj/webdriverio-server/blob/webdriverio-app/resources/UseCase2.png)

