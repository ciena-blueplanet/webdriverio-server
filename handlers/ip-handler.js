'use strict'
const fs = require('fs')
const path = require('path')

const DeveloperHandler = require('../handlers/developers-handler.js')
const processUpload = require('../src/process-upload')

const IPHandler = {
  startTest: function (req, res) {
    const filename = req.files.tarball.name
    const entryPoint = req.body['entry-point'] || 'demo'
    const testsFolder = req.body['tests-folder'] || 'tests/e2e'
    processUpload.newFile(filename, entryPoint, testsFolder, res)
  },
  checkIP: function (req, res) {
    return new Promise((resolve, reject) => {
      const ip = req.headers['x-forwarded-for'].toString()
      if (!ip) {
        reject(`Please set headers for proxy connections using nginx!\n
        A helpful article on setting this up: https://www.digitalocean.com/community/tutorials/
        understanding-nginx-http-proxying-load-balancing-buffering-and-caching`)
      }
      let fileContents
      try {
        fileContents = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'info.json'))).ip
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
