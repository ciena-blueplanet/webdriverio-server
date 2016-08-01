#! /usr/bin/env node

/**
 * @author Adam Meadows [@job13er](https://github.com/job13er)
 * @copyright 2015 Ciena Corporation. All rights reserved
 */

'use strict'

/**
 * @typedef Result
 * @property {Number} code - the exit code of the command
 * @property {String} stdout - the standard output from command
 */

const _ = require('lodash')
const Q = require('q')
const path = require('path')
const childProcess = require('child_process')
const sleep = require('sleep')
const http = require('http')
const fs = require('fs')

/**
 * Helper for creating a promise (so I don't need to disable new-cap everywhere)
 * @param {*} resolution - what to resolve the promise with
 * @returns {Promise} the promise
 */
function makePromise (resolution) {
  return Q(resolution) // eslint-disable-line new-cap
}

/** @alias tester */
const ns = {
  /**
   * Initialize the module
   * @returns {tester} the tester instance
   */
  init () {
    // this is on the object for eaiser mocking
    this.exec = Q.denodeify(childProcess.exec)
    // This will keep track of the slave servers that are running the e2e tests
    this.runningProcesses = new Map()
    return this
  },

  /**
   * This polls each slave server and checks to see whether the tests are finished.
   * @param {Number} id - The unique id identifying a set of tests
   * @returns {Boolean} Whether all of the tests are ready
   */
  getExisting (id) {
    /**
     * testsRunning => [
     *  {
     *    server: "localhost:4000",
     *    test: "homepage-e2e",
     *    testComplete: false
     *  }
     * ]
     */
    let testsRunning = this.runningProcesses.get(id)
    let pset = []
    testsRunning.forEach((currentTest) => {
      const server = currentTest.server
      const test = currentTest.test
      const cmd = 'curl -s ' + server + '/status/?id=' + id + '&test=' + test
      pset.push(this.exec(cmd).then((res) => {
        const stdout = res[0]
        if (stdout.toString().toLowerCase() === 'not found') {
          console.log('For test = ' + test + ' on the server ' + server + ', test was not found')
          currentTest.testComplete = false
        } else {
          currentTest.testComplete = true
        }
      }))
    })
    return Promise.all(pset).then(() => {
      return testsRunning.reduce((current, element) => current && element.testComplete)
    })
  },

  combineResults (id) {
    let testsRunning = this.runningProcesses.get(id)
    let pset = []
    testsRunning.forEach((currentTest) => {
      const server = currentTest.server
      const test = currentTest.test
      pset.push(this.processResults(id, server, test))
    })
    Promise.all(pset).then((res) => {
      return
    })
  },

  /**
   * Submit the tarball for test
   * @param {String} tarball - The path to the tarball
   * @param {String} server - the protocol/host/port of the server
   * @param {String} test - the test folder
   * @returns {Promise} resolved when done
   */
  submitTarball (tarball, server, test, entryPoint) {
    console.log('Submitting bundle to ' + server + ' for test...')

    const cmd = [
      'curl',
      '-s',
      '-F',
      '"tarball=' + tarball + '"',
      '-F',
      '"entry-point=' + entryPoint + '/"',
      '-F',
      '"tests-folder=' + process.env['E2E_TESTS_DIR'] + '/' + test + '"',
      server + '/'
    ]

    console.log('Running command: ' + cmd.join(' '))

    return this.exec(cmd.join(' ')).then((res) => {
      const stdout = res[0]
      const timestamp = stdout.toString()
      this.runningProcesses.get(timestamp).push({
        server,
        test,
        testComplete: false
      })
      console.log('TIMESTAMP: ' + timestamp)
      return timestamp
    })
  },

  /**
   * Fetch the results from the server
   * @param {String} url - the url to fetch results from
   * @returns {Promise} resolved when done
   */
  getResults (url) {
    return this.exec('curl -s ' + url).then((res) => {
      const stdout = res[0]
      console.log('Parsing results...')
      const obj = JSON.parse(stdout.toString())
      return obj
    })
  },

  /**
   * obvious
   * @param {String} url - the URL to get the tarball from
   * @returns {Promise} resolved when done
   */
  getTarball (url) {
    return this.exec('curl -s -O ' + url)
  },

  /**
   * Parse and output the results
   * @param {String} timestamp - the timestamp of the results we're processing
   * @param {String} server - the protocol/host/port of the server
   * @param {String} testsDir - The name of the e2e test that we are testing
   * @returns {Promise} resolved when done
   */
  processResults (timestamp, server, testsDir) {
    const url = server + '/screenshots/output-' + timestamp + '-' + testsDir + '.json'

    return this.getResults(url)
      .then((results) => {
        const url = server + '/' + results.output
        return this.getTarball(url).then(() => {
          return results
        })
      })
  },

  checkServer (server) {
    return new Promise((resolve, reject) => {
      let splitServer = server.split(':')
      http.get({
        host: splitServer[0],
        port: splitServer[1] || '3000'
      }, () => {
        resolve(server)
      }).on('error', (e) => {
        resolve()
      })
    })
  },

  checkServerAvailibility () {
    let servers
    try {
      servers = JSON.parse(fs.readFileSync(path.join(__dirname, 'servers.json'))).potentialServers
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
    let pset = []
    servers.map((server) => {
      pset.push(this.checkServer(server))
    })
    return Promise.all(pset).then((res) => {
      return res
    })
  },

  getRandomServer (servers) {
    return servers[Math.floor((Math.random() * servers.length))]
  },

  submitTarballs (filename, entryPoint, timestamp, testsFolder, servers) {
    // Go through the testsFolder directory and find all the tar files._
    // Submit each tarball and wait for the results.
    let pset = []
    let buildPath = path.join(__dirname, '..', 'build-' + timestamp, testsFolder)
    console.log('Build Path: ' + buildPath)
    fs.readdir(buildPath, (err, files) => {
      if (err) {
        console.log(err)
        process.exit(1)
      }
      files.forEach((element) => {
        fs.stat(path.join(buildPath, element), (err, file) => {
          if (err) {
            process.exit(1)
          }
          if (file.isFile() && element.endsWith('.tar')) {
            let fname = path.join(buildPath, element).slice(0, -4)
            fname = fname + '-' + timestamp + '.tar'
            fs.rename(path.join(buildPath, element), fname, (err) => {
              if (err) {
                console.log(err)
                process.exit(1)
              }
            })
            const server = this.getRandomServer(servers)
            pset.push(this.submitTarball(path.basename(fname), server, element, entryPoint))
          }
        })
      })
    })
    return Promise.all(pset).then(() => {
      return timestamp
    })
  },

  execute (filename, entryPoint, seconds, testsFolder) {
    // Get List of Availible servers here
    return this.checkServerAvailibility().then((servers) => {
      // Execute tardir.sh
      // This creates a set of tarballs from the tmp directory
      console.log('Servers availible: ' + servers)
      console.log('Executing tar script')
      const cmd = [path.join(__dirname, './tardir.sh'), filename, entryPoint, seconds, testsFolder + '/tmp']
      console.log('Command ' + cmd.join(' '))
      childProcess.exec(cmd.join(' '), (err, stdout, stderr) => {
        if (err) {
          console.log('Error: ' + err)
        }
        console.log('Printing!!!')
        console.log(filename)
        console.log(entryPoint)
        console.log(seconds)
        console.log(testsFolder)
        return this.submitTarballs(filename, entryPoint, seconds, testsFolder + '/tmp', servers).then((timestamp) => {
          return timestamp
        })
      })
    })
  }
}

module.exports = ns
