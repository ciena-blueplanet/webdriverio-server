'use strict'

const debug = require('debug')('server')
const express = require('express')
const fs = require('fs')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const multer = require('multer')

const DeveloperHandler = require('../handlers/developers-handler.js')

const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const md5 = require('blueimp-md5')
const session = require('express-session')

const app = express()

const developers = require('../routes/developers')
const auth = require('../routes/auth')

const processUpload = require('./process-upload')

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
app.use('/auth', auth)
app.use('/', express.static(path.join(__dirname, '..', '/dist')))

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

app.post('/', function (req, res) {
  console.log(req.headers['x-forwarded-for'])
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

app.get('/session', function (req, res) {
  if (!req.session || !req.session.user) {
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
  req.session.destroy((err) => {
    if (err) {
      console.error(err)
    }
  })
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
//                        Denied Access Reasons
// ==================================================================

app.get('/auth/denied', (req, res) => {
  let fileContents = JSON.parse(fs.readFileSync(path.join(__dirname, 'reasons.json')))
  if (!req.query || !req.query.reason) {
    res.send(fileContents[0])
  } else {
    res.send(fileContents[req.query.reason])
  }
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
