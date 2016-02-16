/**
 * @author Adam Meadows [@job13er](https://github.com/job13er)
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/* global expect */

'use strict'

/**
 * @typedef Resolver
 * @param {Function} resolve - resolve the promise
 * @param {Function} reject - reject the promise
 * @param {Function} notify - notify of progress on the promise
 */

const _ = require('lodash')
const Q = require('q')

/** @exports testUtils */
const ns = {

  // Less than ideal, but these methods are included also in lib/jasmine/index.6.js where they are included
  // in an ES6 module. Once node supports ES6 modules, we can remove this duplication -- ARM

  /**
   * Create a Promise that can be resolved by the given resolver object
   * @param {Resolver} resolver - the reference of the resolver to update (methods don't have to exist)
   * @returns {Q.Promise} the promise that is created
   */
  makePromise (resolver) {
    /* eslint-disable new-cap */
    return Q.Promise(function (resolve, reject, notify) {
      resolver.resolve = resolve
      resolver.reject = reject
      resolver.notify = notify
    })
    /* eslint-enable new-cap */
  },

  /**
   * Use setTimeout to give up control flow for the given number of milliseconds
   * This is useful when you want to give a promise a chance to be resolved before continuing
   * @param {Function} done - the jasmine async done() method from the spec
   * @param {Number} [milliseconds=0] - the time to wait
   * @param {Function} [callback] - will be called before done() so you can expect() stuff
   * @param {Function} [timeoutFn] - optional replacement to setTimeout (for testing in nodejs)
   */
  wait (done, milliseconds, callback, timeoutFn) {
    if (!milliseconds) {
      milliseconds = 0
    }

    if (timeoutFn === undefined) {
      timeoutFn = setTimeout
    }

    timeoutFn(() => {
      if (callback) {
        callback()
      }
      done()
    }, milliseconds)
  },

  /**
   * Call done() once the given promise is resolved
   * @param {Function} done - the jasmine async done() method from the spec
   * @param {Q.promise} promise - wait till this is resolved before calling done()
   * @param {Function} [callback] - will be called before done() on resolution so you can expect() stuff
   * @param {Function} [errback] - will be called before done() on rejection so you can expect() stuff
   */
  waitForPromise (done, promise, callback, errback) {
    promise.then(
      (data) => {
        if (callback) {
          callback(data)
        }
        done()
      },
      (err) => {
        if (errback) {
          errback(err)
        }
        done()
      }
    ).done()
  }
}

// ------------------------------------------------------------------------------------------------
// E2E Test Utilities
// ------------------------------------------------------------------------------------------------

ns.e2e = {

  /**
   * @typedef Screenshot
   * @property {String} name - should be dash-separated as it will be used as part of a filename
   * @property {String} [elem] - the jQuery selector for element to screenshot (i.e. 'body' or '.navbar')
   * @property {Number} [width] - the fixed pixel width of the screenshot
   * @property {Number} [height] - the fixed pixel height of the screenshot
   * @property {Number} [x] - take screenshot at exact x,y position (requires width/height)
   * @property {Number} [y] - take screenshot at exact x,y position (requires width/height)
   * @property {String[]|Object[]} [exclude] - an array of selectors or objects with x,y values which span a polygon
   */

  /**
   * @typedef TestConfig
   * @property {Object} selenium - selenium server info
   * @property {String} selenium.host - the hostname of the selenium server
   * @property {Number} selenium.port - the port number for the selenium server
   * @property {String} selenium.browser - the browser to use with selenium
   * @property {Object} http - http-server info
   * @property {String} http.host - the http-server hostname
   * @property {Number} http.port - the http-server port
   * @property {String} http.entryPoint - the URL path we want to start at
   * @property {String} selniumServer - backward-compatible selenium server URL for older projects
   * @property {String} url - backward-compatible http-server URL (including port)
   */

  /**
   * Initialize webdriverio and webdrivercss (should be called in your beforeEach())
   * @param {Object} webdriverio - the webdriverio module [require('webdriverio')]
   * @param {Object} webdrivercss - the webdrivercss module [require('webdrivercss')]
   * @param {TestConfig} testConfig - the config for these specs
   * @param {Object} [wdIoOpts] - the webdriverio options defaults will be used if not provided
   * @param {Object} [wdCssOpts] - the webdrivercss options defaults will be used if not provided
   * @returns {WebdriverIoClient} a webdriverio client instance
   */
  init (webdriverio, webdrivercss, testConfig, wdIoOpts, wdCssOpts) {
    if (wdIoOpts === undefined) {
      wdIoOpts = {}
    }

    if (wdCssOpts === undefined) {
      wdCssOpts = {}
    }

    _.defaults(wdIoOpts, {
      desiredCapabilities: {browserName: testConfig.selenium.browser},
      host: testConfig.selenium.host,
      port: testConfig.selenium.port,
      logLevel: 'silent'
    })

    _.defaults(wdCssOpts, {
      screenshotRoot: 'tests/e2e/screenshots',
      failedComparisonsRoot: 'tests/e2e/screenshots/diff',
      misMatchTolerance: 0.1
    })

    const client = webdriverio.remote(wdIoOpts)
    client.init()
    webdrivercss.init(client, wdCssOpts)
    this.addCommands(client)

    return client
  },

  /**
   * Add the 'verifyScreenshots' command to the webdriverio client
   * @param {WebdriverIoClient} client - the webdriverio client
   */
  addCommands (client) {
    client.addCommand('verifyScreenshots', (name, screenshots, cb) => {
      // this is a little odd, but webdriverio adds an additional callback argument at the end for chaining
      // http://webdriver.io/guide/usage/customcommands.html
      // [Update] Apparently this is not happening anymore.
      // const callback = arguments[arguments.length - 1]

      const screenshotsCopy = _.clone(screenshots)
      client.webdrivercss(name, screenshotsCopy, (err, res) => {
        expect(err).toBeFalsy()
        _.forEach(screenshots, (screenshot) => {
          const result = res[screenshot.name][0]
          const msg = 'Visual difference found for "' + screenshot.name + '" \n'
          expect(result.isWithinMisMatchTolerance).toBeTruthy(msg + JSON.stringify(result, null, 4))
        })
        cb()
      })
    })
  },

  /**
   * Construc the base URL from the testConfig
   * @param {TestConfig} testConfig - the e2ee spec configuration
   * @param {String} [extra] - extra URL path
   * @returns {String} the full URL
   */
  getUrl (testConfig, extra) {
    const http = testConfig.http
    let entryPoint = http.entryPoint

    // Prevent double forward slash in URL
    if (entryPoint.length !== 0 && entryPoint[0] === '/') {
      entryPoint = entryPoint.substring(1)
    }

    let url = `http://${http.host}:${http.port}/${entryPoint}`
    if (extra) {
      // Prevent double forward slash in URL
      if (url[url.length - 1] === '/' && extra[0] === '/') {
        extra = extra.substring(1)
      }

      url = url + extra
    }

    return url
  }
}

module.exports = ns
