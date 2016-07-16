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

app.use(require('express-session')({
  secret: 'random-secret1025',
  resave: false,
  saveUninitialized: false
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
        throw err
      }
      // Account must be open for longer than 6 months
      const reviewStartTime = new Date()
      const accountOpened = new Date(result.created_at)
      const user = result.login
      reviewStartTime.setMonth(reviewStartTime.getMonth() - MINIMUM_ACCOUNT_LIFETIME)
      if (reviewStartTime.getTime() < accountOpened.getTime()) {
        res.redirect('/#/auth/denied?reason=1')
      } else {
        githubAPI.verify(github, res, user, reviewStartTime)
      }
    })
  })
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
