'use strict'
const GitHubAPI = require('github')
const oauth = require('oauth').OAuth2
const fs = require('fs')
const path = require('path')
const OAuth = oauth
const DeveloperHandler = require('../handlers/developers-handler.js')

const githubAPI = require('../handlers/github-api-handler')

function generateToken (n) {
  const s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  if (isNaN(n) && n <= 0) {
    throw new Error('n must be of type Number and >= 0')
  } else {
    return Array.apply(null, Array(n)).map(function () { return s.charAt(Math.floor(Math.random() * s.length)) }).join('')
  }
}

const deploymentURL = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'))).url

const MINIMUM_ACCOUNT_LIFETIME = 6

function destroySession (req) {
  req.session.destroy((err) => {
    if (err) {
      console.error(err)
    }
  })
}

const AuthorizationHandler = {
  init: function () {
    this.OAuth2 = new OAuth(process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET, 'https://github.com/', 'login/oauth/authorize', 'login/oauth/access_token')
    this.github = new GitHubAPI({
      debug: false,
      protocol: 'https',
      host: 'api.github.com',
      headers: {
        'user-agent': 'Ciena Developers'
      },
      timeout: 5000
    })
  },
  get: function (req, res) {
    res.writeHead(303, {
      Location: this.OAuth2.getAuthorizeUrl({
        'redirect_uri': 'http://' + deploymentURL + '/auth/callback',
        scope: ''
      })
    })
    res.end()
  },
  post: function (req, res) {
    return new Promise((resolve, reject) => {
      if (req.session && req.session.user) {
        const token = generateToken(30)
        const username = req.session.user
        let request = {
          query: {
            username,
            token: '!'
          }
        }
        DeveloperHandler.get(request)
        .then((result) => {
          if (result === '!') {
            request = {
              body: {
                developer: {
                  username,
                  token
                }
              }
            }
            return DeveloperHandler.post(request)
            .then((result) => {
              destroySession(req)
              res.send({
                username,
                token
              })
              res.end()
              resolve({
                username,
                token
              })
            })
            .catch((err) => {
              if (err) {
                destroySession(req)
                res.send({redirect: '/#/auth/denied?reason=7', error: err})
                reject({redirect: '/#/auth/denied?reason=7', error: err})
              }
            })
          } else {
            reject('You already an account')
            throw new Error('You already an account')
          }
        })
        .catch((err) => {
          if (err) {
            destroySession(req)
            res.send({redirect: '/#/auth/denied?reason=4'})
            reject({redirect: '/#/auth/denied?reason=4'})
          }
        })
      } else {
        res.send({redirect: '/#/auth/denied?reason=9'})
        reject({redirect: '/#/auth/denied?reason=9'})
      }
    })
  },
  getCallback: function (req, res) {
    const code = req.query.code
    this.OAuth2.getOAuthAccessToken(code, {}, (err, accessToken, refreshToken) => {
      if (err) {
        throw err
      }
      // authenticate github API
      this.github.authenticate({
        type: 'oauth',
        token: accessToken
      })
      this.github.users.get({
      }, (err, result) => {
        if (err) {
          res.redirect('/#/auth/denied?reason=8')
          res.end()
        }
        // Account must be open for longer than 6 months
        const reviewStartTime = new Date()
        const accountOpened = new Date(result.created_at)
        const user = result.login
        req.session.user = user
        reviewStartTime.setMonth(reviewStartTime.getMonth() - MINIMUM_ACCOUNT_LIFETIME)
        if (reviewStartTime.getTime() < accountOpened.getTime()) {
          destroySession(req)
          res.redirect('/#/auth/denied?reason=1')
        } else {
          githubAPI.verify(this.github, res, user, reviewStartTime, req)
        }
      })
    })
  }
}

module.exports = AuthorizationHandler
