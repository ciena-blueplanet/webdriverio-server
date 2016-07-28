'use strict'
const fs = require('fs')
const path = require('path')

const DeveloperHandler = require('../handlers/developers-handler.js')
const processUpload = require('../src/process-upload')

const IPHandler = {
  /**
   * Starts the e2e tests once a developers credentials are verified or travis is running the tests
   * @param {Object} req - The express formatted object containing the files and the tarball
   * @param {Object} res - The response object containing any errors produced during the testing process
   */
  startTest: function (req, res) {
    const filename = req.files.tarball.name
    const entryPoint = req.body['entry-point'] || 'demo'
    const testsFolder = req.body['tests-folder'] || 'tests/e2e'
    processUpload.newFile(filename, entryPoint, testsFolder, res)
  },
  /**
   * Checks the IP of the incoming tarball
   * @param {Object} req - The express formatted object containing the files and credentials
   * @returns {Promise} A promise that will either resolve if the credentials passed are authentic
   * or reject if there are errors
   */
  checkIP: function (req) {
    return new Promise((resolve, reject) => {
      const ip = req.headers['x-forwarded-for']
      if (!ip) {
        reject(`Please set headers for proxy connections using nginx!\n
        A helpful article on setting this up: https://www.digitalocean.com/community/tutorials/
        understanding-nginx-http-proxying-load-balancing-buffering-and-caching`)
      }
      let fileContents
      try {
        fileContents = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'info.json'))).trustedIpAddresses
      } catch (e) {
        resolve(false)
      }
      const username = req.headers.username
      const token = req.headers.token
      const request = {
        query: {
          username,
          token
        }
      }
      if (fileContents.indexOf(ip.toString()) !== -1) {
        DeveloperHandler.get(request).then(() => {
          reject('Your account is restricted. Your username is ' + username + ' and your token is ' + token)
        })
        .catch((err) => {
          if (err.toString() === 'The token submitted does not match the token returned.') {
            resolve(true)
          } else {
            reject(err)
          }
        })
      } else {
        resolve(false)
      }
    })
  },
  checkUsername: function (req, res) {
    return new Promise((resolve, reject) => {
      const username = req.headers.username
      const token = req.headers.token
      const request = {
        query: {
          username,
          token
        }
      }
      if (!username || !token) {
        res.send(`Your config.json file must contain a valid username and token.\n
        Please visit wdio.bp.cyaninc.com to sign up to become an authorized third party developer for Ciena.`)
        res.end()
        reject()
      } else {
        DeveloperHandler.get(request).then(() => {
          this.startTest(req, res)
          resolve()
        }).catch((err) => {
          if (err) {
            res.send(err)
            res.end()
            reject()
          }
        })
      }
    })
  },
  /**
   * This will start e2e tests if the credentials given are correct
   * @param {Object} req - The express formatted object containing the files and credentials
   * @param {Object} res - The response object containing any errors produced during the checking process
   * @returns {Promise} A promise that will either resolve after the tests are finished
   * or reject if there are errors
   */
  post: function (req, res) {
    return new Promise((resolve, reject) => {
      if (!req.headers) {
        res.send('Error: Headers do not exist')
        res.end()
        reject()
      } else {
        this.checkIP(req)
        .then((result) => {
          if (result === true) {
            this.startTest(req, res)
            resolve()
          } else {
            this.checkUsername(req, res).then(() => {
              resolve()
            })
            .catch(() => {
              reject()
            })
          }
        })
        .catch((err) => {
          if (err) {
            res.send(err)
            res.end()
            reject()
          }
        })
      }
    })
  }
}

module.exports = IPHandler
