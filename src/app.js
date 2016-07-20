'use strict'

const debug = require('debug')('server')
const express = require('express')
const fs = require('fs')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const multer = require('multer')
const GitHubAPI = require('github')
const DeveloperHandler = require('../handlers/developers-handler.js')
const oauth = require('oauth').OAuth2
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const md5 = require('blueimp-md5')
const session = require('express-session')

const app = express()

const developers = require('../routes/developers')
const githubAPI = require('../handlers/github-api-handler')

const processUpload = require('./process-upload')

const OAuth = oauth
const OAuth2 = new OAuth(process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET, 'https://github.com/', 'login/oauth/authorize', 'login/oauth/access_token')

const github = new GitHubAPI({
  debug: false,
  protocol: 'https',
  host: 'api.github.com',
  headers: {
    'user-agent': 'Ciena Developers'
  },
  timeout: 5000
})

const baseUrl = 'localhost:3000'
// const deploymentURL = 'wdio.bp.cyaninc.com'
const MINIMUM_ACCOUNT_LIFETIME = 6

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: 'random-secret1025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true
  }
}))
app.use(passport.initialize())

app.use(passport.session())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/developers', developers)

// ==================================================================
//                          The main method
// ==================================================================

app.use(multer({
  dest: path.join(__dirname, '..', 'uploads'),
  rename: function (fieldname, filename) {
    return filename + '.' + Date.now()
  },
  onFileUploadStart: function () {
    debug('client request is starting ...')
  },
  onFileUploadComplete: function (file) {
    debug(file.fieldname + ' uploaded to  ' + file.path)
  }
}))

app.get(/^\/status\/(\d+)$/, function (req, res) {
  const id = req.params[0]
  const filename = path.join(__dirname, '..', 'screenshots/output-' + id + '.json')
  fs.exists(filename, function (exists) {
    if (exists) {
      res.status(200).send('finished')
    } else {
      res.status(404).send('Not found')
    }
    res.end()
  })
})

app.use('/', express.static(path.join(__dirname, '..', '/dist')))

app.post('/', function (req, res) {
  if (!req.headers) {
    res.send('Error: Headers do not exist')
    res.end()
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
        const filename = req.files.tarball.name
        const entryPoint = req.body['entry-point'] || 'demo'
        const testsFolder = req.body['tests-folder'] || 'tests/e2e'
        processUpload.newFile(filename, entryPoint, testsFolder, res)
      }).catch((err) => {
        res.send(err)
        res.end()
      })
    }
  }
})

// ==================================================================
//                   Configuration Settings
// ==================================================================

app.get('/authconfig', function (req, res) {
})

app.use('/screenshots', express.static(path.join(__dirname, '..', 'screenshots')))

// ==================================================================
//                       GitHub Authentication
// ==================================================================

app.get('/auth', function (req, res) {
  res.writeHead(303, {
    Location: OAuth2.getAuthorizeUrl({
      'redirect_uri': 'http://' + baseUrl + '/auth/callback',
      scope: ''
    })
  })
  res.end()
})

app.get('/auth/callback', function (req, res) {
  const code = req.query.code
  OAuth2.getOAuthAccessToken(code, {}, function (err, accessToken, refreshToken) {
    if (err) {
      throw err
    }
    // authenticate github API
    github.authenticate({
      type: 'oauth',
      token: accessToken
    })
    github.users.get({
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
        req.session.reset()
        res.redirect('/#/auth/denied?reason=1')
      } else {
        githubAPI.verify(github, res, user, reviewStartTime, req)
      }
    })
  })
})

function generateToken (n) {
  const s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  if (isNaN(n) && n <= 0) {
    throw new Error('n must be of type Number and >= 0')
  } else {
    return Array.apply(null, Array(n)).map(function () { return s.charAt(Math.floor(Math.random() * s.length)) }).join('')
  }
}

function destroySession (req) {
  req.session.destroy((err) => {
    if (err) {
      console.error(err)
    }
  })
}

app.get('/session', function (req, res) {
  if (!req.session || !req.session.user) {
    res.send({redirect: '/#/auth/denied?reason=9'})
  }
})

app.post('/auth/contract', function (req, res) {
  if (req.session && req.session.user) {
    const token = generateToken(30)
    const username = req.session.user
    console.log(username)
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
        DeveloperHandler.post(request)
        .then((result) => {
          destroySession(req)
          res.send({
            username,
            token
          })
          res.end()
        })
        .catch((err) => {
          if (err) {
            destroySession(req)
            res.send({redirect: '/#/auth/denied?reason=7', error: err})
          }
        })
      } else {
        throw new Error('You already an account')
      }
    })
    .catch((err) => {
      if (err) {
        console.log(err)
        destroySession(req)
        res.send({redirect: '/#/auth/denied?reason=4'})
      }
    })
  } else {
    res.send({redirect: '/#/auth/denied?reason=9'})
  }
})

// ==================================================================
//                        Login Authentication
// ==================================================================

mongoose.connect('mongodb://localhost/authentication')
passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})

passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username: md5(username) }, (err, user) => {
    if (err) {
      return done(err)
    }
    if (!user || user.password !== md5(password)) {
      return done(null, false)
    }
    return done(null, user)
  })
}))

app.get('/logout', (req, res) => {
  destroySession(req)
  req.logout()
  res.end()
})

const isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.send('NotAuthenticated')
}

app.get('/portal', isAuthenticated, (req, res) => {
})

app.post('/login', passport.authenticate('local', {successRedirect: '/#/portal', failureRedirect: '/#/login?failure=1'}), (req, res) => {
  res.redirect('/#/portal')
})

// ==================================================================
//                          Error Handling
// ==================================================================

// catch 404 and forward to error handler
app.use(function (req, res) {
  res.status(404).send('Not Found')
})

// error handler
app.use(function (err, req, res) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app
