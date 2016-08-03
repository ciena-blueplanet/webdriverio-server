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
    this.runningProcesses = new Map()
    // This will keep track of the slave servers that are running the e2e tests
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
     *    timestamp: "03498520938",
     *    testComplete: false
     *  }
     * ]
     */
    let testsRunning = this.runningProcesses.get(id)
    let pset = []
    testsRunning.forEach((currentTest) => {
      const server = currentTest.server
      const test = currentTest.test
      const cmd = 'curl -s ' + server + '/status/' + currentTest.timestamp + '-' + test
      pset.push(this.exec(cmd).then((res) => {
        const stdout = res[0]
        if (stdout.toString().toLowerCase() === 'not found') {
          currentTest.testComplete = false
        } else {
          currentTest.testComplete = true
        }
      }))
    })
    return Promise.all(pset).then(() => {
      return testsRunning.reduce((current, element) => {
        return current && element.testComplete
      })
    })
  },

  combineScreenshots (tarFiles, timestamp) {
    return new Promise((resolve, reject) => {
      try {
        let pset = []
        fs.ensureDirSync(path.join(__dirname, '..', 'build-' + timestamp, 'screenshots'))
        tarFiles.forEach((file) => {
          file = file.substring(file.indexOf('/') + 1)
          pset.push(this.exec('bash ' + path.join(__dirname, 'tarScreenshots.sh') + ' ' + file + ' ' + timestamp))
        })
        return Promise.all(pset).then(() => {
          this.exec('tar -cf ' + timestamp + '.tar build-' + timestamp + '/screenshots/*').then(() => {
            resolve()
          })
        })
        .catch((err) => {
          console.log(err)
          reject(err)
        })
      } catch (e) {
        console.log(e)
      }
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
      console.log('Final result!: ', res)
      console.log('This is the place where we need to complete the testing')
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
        info: exitCode === 1 ? notZeroCodes : 'All Tests Passed',
        output
      }
      this.combineScreenshots(tarFiles, timestamp)
      fs.writeFileSync(path.join(__dirname, '..', 'screenshots', 'output-' + id + '.json'), JSON.stringify(result, null, 2))
    })
  },

  /**
   * Submit the tarball for test
   * @param {String} tarball - The path to the tarball
   * @param {String} server - the protocol/host/port of the server
   * @param {String} test - the test folder
   * @returns {Promise} resolved when done
   */
  submitTarball (tarball, server, test, entryPoint, timestamp1) {
    const tarpath = path.join(__dirname, './submitCurl.sh')
    return new Promise((resolve, reject) => {
      childProcess.exec(
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

  submitTarballs (filename, entryPoint, timestamp, testsFolder, servers) {
    // Go through the testsFolder directory and find all the tar files._
    // Submit each tarball and wait for the results.
    let pset = []
    let buildPath = path.join(__dirname, '..', 'build-' + timestamp, testsFolder)
    this.runningProcesses.set(timestamp.toString(), [])
    let files
    try {
      files = fs.readdirSync(buildPath)
    } catch (e) {
      console.log(e)
      process.exit(1)
    }
    files.forEach((element) => {
      let file
      try {
        file = fs.statSync(path.join(buildPath, element))
      } catch (e) {
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
        pset.push(this.submitTarball(path.basename(fname), server, element.slice(0, -4), entryPoint, timestamp)
        .then((timestamp) => {
        })
        .catch((err) => {
          console.log(err)
          process.exit(1)
        }))
      }
    })
    return Promise.all(pset).then((timestampMaybe) => {
      console.log('Timestamp being returned: ' + timestamp)
      return timestamp
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
        return this.getTarball(url)
        .then(() => {
          return results
        })
        .catch((err) => {
          console.log(err)
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

  execute (filename, entryPoint, seconds, testsFolder) {
    return new Promise((resolve, reject) => {
      this.checkServerAvailibility().then((servers) => {
        const cmd = ['bash', path.join(__dirname, './tardir.sh'), filename, entryPoint, seconds, testsFolder + '/tmp']
        childProcess.exec(cmd.join(' '), (err, stdout, stderr) => {
          if (err) {
            reject(err)
          }
          return this.submitTarballs(filename, entryPoint, seconds, testsFolder + '/tmp', servers).then((timestamp) => {
            resolve(timestamp)
          })
        })
      })
    })
  }
}

module.exports = ns
