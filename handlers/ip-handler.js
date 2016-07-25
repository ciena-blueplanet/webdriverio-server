'use strict'
const fs = require('fs')
const path = require('path')

const DeveloperHandler = require('../handlers/developers-handler.js')
const processUpload = require('../src/process-upload')

const IPHandler = {
  startTest: function (req, res) {
    console.log('Starting the test')
    const filename = req.files.tarball.name
    const entryPoint = req.body['entry-point'] || 'demo'
    const testsFolder = req.body['tests-folder'] || 'tests/e2e'
    processUpload.newFile(filename, entryPoint, testsFolder, res)
  },
  checkIP: function (req, res) {
    console.log('Checking IP')
    return new Promise((resolve, reject) => {
      const ip = req.headers['x-forwarded-for'].toString()
      if (!ip) {
        reject(`Please set headers for proxy connections using nginx!\n
        A helpful article on setting this up: https://www.digitalocean.com/community/tutorials/
        understanding-nginx-http-proxying-load-balancing-buffering-and-caching`)
      }
      let fileContents
      try {
        fileContents = JSON.parse(fs.readFileSync(path.join(__dirname, 'info.json'))).ip
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
      if (fileContents.indexOf(ip) !== -1) {
        DeveloperHandler.get(request).then((res) => {
          reject('Your account is restricted. Your username is ' + username + ' and your token is ' + token)
        })
        .catch((err) => {
          if (err.toString() === 'The token submitted does not match the token returned.') {
            resolve(true)
          } else {
            reject(err)
          }
        })
      }
    })
  },
  post: function (req, res) {
    console.log('Posting')
    if (!req.headers) {
      res.send('Error: Headers do not exist')
      res.end()
    } else {
      this.checkIP(req)
      .then((result) => {
        if (result === true) {
          this.startTest(req, res)
        } else {
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
          } else {
            DeveloperHandler.get(request).then(() => {
              this.startTest(req, res)
            }).catch((err) => {
              console.log('Error 2: ' + err)
              res.send(err)
              res.end()
            })
          }
        }
      })
      .catch((err) => {
        if (err) {
          console.log('Error 3: ' + err)
          res.send(err)
          res.end()
        }
      })
    }
  }
}

module.exports = IPHandler
