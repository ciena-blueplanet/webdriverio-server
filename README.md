# webdriverio-server

[![npm version](https://badge.fury.io/js/webdriverio-server.svg)](http://badge.fury.io/js/webdriverio-server)
[![build status](https://travis-ci.org/cyaninc/webdriverio-server.svg?branch=master)](https://travis-ci.org/cyaninc/webdriverio-server)

If you want a remote server to do selenium testing, this is a better way

## Setup

Setting up a new server for selenium testing requires

1. Prerequisites
1. Installation
1. Running the selenium server
1. Starting the webdriverio-server node process

### Prerequisites

These instructions assume that you have set up a server (either Mac or Ubuntu) with the following:

- [NodeJS (including NPM)](https://github.com/creationix/nvm)
- [Dependencies](https://github.com/cyaninc/beaker#end-to-end-test-dependencies) of webdrivercss

### Installation

    npm install -g webdriverio-server

This will install both the `webdriverio-server` and `webdriver-manager` alongside it to be able to run selenium.

### Running the selenium server

In a separate terminal, launch the selenium server:

    webdriver-manager start

This process must always be running. Be careful, if you hit `ENTER` while this
process is running, it will cause it to terminate. This process will listen on
port 4444 on your server.


### Starting the webdriver-io server node process

Now you're ready to run the web service which will respond to test-upload requests:

    webdriverio-server

## Using the server

The script below assumes your project has a `demo/` directory which contains an `index.html` and a `bundle/` directory.
If you're using `beaker` and you have a `webpack` project, this is already true. If you have an `app` project, you
can replace the `tar` line with the following to first copy just what you want into a `demo` directory first.

```bash
mkdir demo
cp -a index.html bundle demo
tar --exclude='*map' -czf test.tar.gz spec demo/index.html demo/bundle
rm -rf demo
```

```bash
PORT=3000
SERVER=my-webdriverio-server

echo "Creating bundle..."
tar --exclude='*map' -czf test.tar.gz spec demo/index.html demo/bundle
echo "Submitting bundle to server for test..."
curl -s -F "tarball=@test.tar.gz" -F "entry-point=/demo/#/main/" http://$SERVER:$PORT/ > test-output.json
echo "Parsing results..."
rm -f test.tar.gz
cat test-output.json | python -c 'import sys,json;data=json.loads(sys.stdin.read()); sys.exit(data["exitCode"])'
RESULT=$?
echo "Retrieving screenshots..."
FILENAME=$(cat test-output.json | python -c 'import sys,json;data=json.loads(sys.stdin.read()); print(data["output"])')
curl -s -O http://$SERVER:$PORT/$FILENAME
tar -xf $(basename $FILENAME) 2>/dev/null
rm -f $(basename $FILENAME)
if [ $RESULT -eq 0 ]
then
    echo "Tests pass."
else
    cat test-output.json | python -c 'import sys,json;data=json.loads(sys.stdin.read()); print(data["info"])'
    echo ERRORS Encountered.
    exit 2
fi
```
