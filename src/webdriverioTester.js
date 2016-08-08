#! /usr/bin/env node

/**
 * @author Sam Pastoriza [@pastorsj](https://github.com/pastorsj)
 */

'use strict'

/**
 * @typedef Result
 * @property {Number} code - the exit code of the command
 * @property {String} stdout - the standard output from command
 */

/**
 * This is the object within the array of objects within the map defined in the init function
 * @typedef {Map of Arrays of Objects} - runningProcesses
 * @property {String} server - The slave server that a test is running on
 * @property {String} test - The test currently running on the slave server
 * @property {String} timestamp - The timestamp tied to that test
 * @property {Boolean} testComplete - Whether the test is complete on the slave server
 */

const Q = require('q')
const path = require('path')
const childProcess = require('child_process')
const http = require('http')
const fs = require('fs-extra')

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
    let testsRunning = this.runningProcesses.get(id)
    let pset = []
    testsRunning.forEach((currentTest) => {
      const server = currentTest.server
      const test = currentTest.test
      const cmd = 'curl -s ' + server + '/status/' + currentTest.timestamp + '-' + test
      pset.push(this.exec(cmd)
      .then((res) => {
        const stdout = res[0]
        if (stdout.toString().toLowerCase() === 'not found') {
          currentTest.testComplete = false
        } else {
          currentTest.testComplete = true
        }
      })
      .catch((err) => {
        throw new Error(err)
      }))
    })
    return Promise.all(pset)
    .then(() => {
      return testsRunning.reduce((current, element) => {
        return current && element.testComplete
      })
    })
    .catch((err) => {
      throw new Error(err)
    })
  },

  /**
   * Combines the screenshots returned from the slave servers
   * @param {Array} tarFiles - The array of tarballs returned from the slave servers
   * @param {String} timestamp - The timestamp that identifies the set of tests being sent from the client
   * @returns {Promise} - Indicates whether the screenshots are all complete or there has been an error.
   */
  combineScreenshots (tarFiles, timestamp) {
    return new Promise((resolve, reject) => {
      try {
        let pset = []
        fs.ensureDirSync(path.join(__dirname, '..', 'build-' + timestamp, 'screenshots'))
        tarFiles.forEach((file) => {
          file = file.substring(file.indexOf('/') + 1)
          let dirname = file.slice(file.indexOf('-') + 1, -4)
          pset.push(this.exec(`bash ${path.join(__dirname, 'tarScreenshots.sh')} ${file} ${timestamp} ${dirname}`))
        })
        return Promise.all(pset)
        .then(() => {
          this.exec(`tar -cf ${timestamp}.tar build-${timestamp}/screenshots/*`)
          .then(() => {
            this.exec(`mv ${timestamp}.tar screenshots/`)
            .then(() => {
              resolve()
            })
            .catch((err) => {
              reject(err)
            })
          })
          .catch((err) => {
            reject(err)
          })
        })
        .catch((err) => {
          reject(err)
        })
      } catch (err) {
        reject(err)
      }
    })
  },

  /**
   * Combines the results of the tests into a single json file. This file will only indicate whether the tests
   * pass, not what the screenshots look like.
   * @param {Number} id - The timestamp identifying the set of tests sent by the client
   * @returns {Promise} - Will return when the results have been combined or it will error out
   */
  combineResults (id) {
    let testsRunning = this.runningProcesses.get(id)
    let pset = []
    testsRunning.forEach((currentTest) => {
      console.log('Timestamp: ', currentTest.timestamp)
      pset.push(this.processResults(currentTest.timestamp, currentTest.server, currentTest.test))
    })
    return Promise.all(pset)
    .then((res) => {
      let exitCode = 0
      let notZeroCodes = []
      let output = ''
      let tarFiles = []
      res.forEach((test) => {
        if (test.exitCode !== 0) {
          exitCode = 1
          notZeroCodes.push({
            test: test.output.slice(test.output.indexOf('-'), -4),
            info: test.info
          })
        }
        tarFiles.push(test.output)
      })
      output = tarFiles[0]
      let timestamp = output.slice(0, output.indexOf('-'))
      output = timestamp + '.tar'
      timestamp = timestamp.substring(timestamp.indexOf('/') + 1)
      let result = {
        exitCode,
        info: exitCode === 1 ? notZeroCodes : 'All Tests Passed',
        output
      }
      return this.combineScreenshots(tarFiles, timestamp).then(() => {
        let jsonFile = path.join(__dirname, '..', 'screenshots', 'output-' + id + '.json')
        fs.writeFileSync(jsonFile, JSON.stringify(result, null, 2))
      })
      .catch((err) => {
        throw new Error(err)
      })
    })
    .catch((err) => {
      throw new Error(err)
    })
  },

  /**
   * Submit the tarball for test
   * @param {String} tarball - The path to the tarball
   * @param {String} server - The protocol/host/port of the server
   * @param {String} test - The test folder
   * @param {String} entryPoint - The directory containing the compiled code (generally the dist directory)
   * @param {String} timestamp1 - The timestamp associated with the test sent from the master server, not the client
   * @returns {Promise} resolved when done
   */
  submitTarball (tarball, server, test, entryPoint, timestamp1) {
    const tarpath = path.join(__dirname, './submitCurl.sh')
    return new Promise((resolve, reject) => {
      console.log(
        `curl -s -F "tarball=@${tarball}" -F "entry-point=${test}/${entryPoint}" -F "tests-folder=${test}" ${server}`)
      return childProcess.exec(
        `bash ${tarpath} ${timestamp1} tests/e2e/tmp ${tarball} ${test} ${entryPoint} ${server}/`,
        (err, stdout, stderr) => {
          if (err) {
            reject(err)
          }
          const timestamp2 = stdout.toString()
          this.runningProcesses.get(timestamp1.toString()).push({
            server,
            test,
            timestamp: timestamp2,
            testComplete: false
          })
          resolve(timestamp1)
        })
    })
  },

  /**
   * Submits a set of tarballs to a set of servers
   * @param {String} entryPoint - The directory containing the compiled code (generally the dist directory)
   * @param {String} timestamp - The timestamp identifying the set of tests sent by the client
   * @param {String} testsFolder - The folder contains all of the tests and tarballs
   * @param {Array} servers - The avalible servers to send tests to
   * @returns {Promise} Resolves with a timestamp or an error
   */
  submitTarballs (entryPoint, timestamp, testsFolder, servers) {
    console.log('Timestamp tarballs: ', timestamp)
    let pset = []
    let buildPath = path.join(__dirname, '..', 'build-' + timestamp, testsFolder)
    this.runningProcesses.set(timestamp.toString(), [])
    let files
    try {
      files = fs.readdirSync(buildPath)
    } catch (err) {
      throw new Error(err)
    }
    files.forEach((element) => {
      let file
      try {
        file = fs.statSync(path.join(buildPath, element))
      } catch (err) {
        throw new Error(err)
      }
      if (file.isFile() && element.endsWith('.tar')) {
        let fname = path.join(buildPath, element).slice(0, -4)
        fname = fname + '-' + timestamp + '.tar'
        fs.rename(path.join(buildPath, element), fname, (err) => {
          if (err) {
            throw new Error(err)
          }
        })
        const server = this.getRandomServer(servers)
        console.log('Submitting Tarball to ', server)
        pset.push(this.submitTarball(path.basename(fname), server, element.slice(0, -4), entryPoint, timestamp).then((timestamp2) => {
          console.log('Timestamp returned: ', timestamp2)
        })
        .catch((err) => {
          console.log('submitTarball fails: ', err)
          throw new Error(err)
        }))
      }
    })
    return Promise.all(pset)
    .then((timestampMaybe) => {
      console.log('Timestamp: ', timestamp)
      console.log('Timestamp array: ', timestampMaybe)
      return timestamp
    })
    .catch((err) => {
      console.log('Submit Tarballs fails here: ', err)
      throw new Error(err)
    })
  },

  /**
   * Fetch the results from the server
   * @param {String} url - the url to fetch results from
   * @returns {Promise} resolved when done
   */
  getResults (url) {
    console.log('curl -s ' + url)
    return this.exec('curl -s ' + url).then((res) => {
      const stdout = res[0]
      const obj = JSON.parse(stdout.toString())
      return obj
    })
  },

  /**
   * Gets a tarball from the given url
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
        return this.getTarball(url)
        .then(() => {
          return results
        })
        .catch((err) => {
          throw new Error(err)
        })
      })
  },

  /**
   * Uses a get request to determine whether the server is availible
   * @param {String} server - The given server to checks
   * @returns {Promise} Resolves with whether the server is availible
   */
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

  /**
   * Checks from a given of servers which servers are availible
   * @returns {Promise} Resolves with a array of availible servers or throws an error
   */
  checkServerAvailibility () {
    let servers
    try {
      servers = JSON.parse(fs.readFileSync(path.join(__dirname, 'servers.json'))).potentialServers
    } catch (e) {
      throw new Error(e)
    }
    let pset = []
    servers.map((server) => {
      pset.push(this.checkServer(server))
    })
    return Promise.all(pset)
    .then((res) => {
      return res.filter((s) => {
        return s !== undefined
      })
    })
    .catch((err) => {
      throw new Error(err)
    })
  },

  /**
   * From an array of servers, it will choose a random server and return it.
   * @param {Array} servers - A list of potential servers
   * @returns {String} A server
   */
  getRandomServer (servers) {
    return servers[Math.floor((Math.random() * servers.length))]
  },

  /**
   * Executes the test suite by sending each test to a different server in the form of a tarball
   * @param {String} filename - The name of the incoming tarball containing all of the tests
   * @param {String} entryPoint - The name of the folder containing the compiled code
   * @param {String} seconds - The timestamp identifying the set of tests to the client
   * @param {String} testsFolder - The folder contain the e2e tests (default is tests/e2e)
   * @returns {Promise} Either returns the timestamp identifying the set of tests to the client or an error
   */
  execute (filename, entryPoint, seconds, testsFolder) {
    return new Promise((resolve, reject) => {
      this.checkServerAvailibility().then((servers) => {
        if (servers.length <= 0) {
          reject('There are no servers availible')
        }
        const cmd = ['bash', path.join(__dirname, './tardir.sh'), filename, entryPoint, seconds, testsFolder + '/tmp']
        childProcess.exec(cmd.join(' '), (err, stdout, stderr) => {
          if (err) {
            reject(err)
          }
          return this.submitTarballs(entryPoint, seconds, testsFolder + '/tmp', servers)
          .then((timestamp) => {
            console.log('Timestamp execute: ', timestamp)
            resolve(timestamp)
          })
          .catch((err) => {
            reject(err)
          })
        })
      })
    })
  }
}

module.exports = ns
