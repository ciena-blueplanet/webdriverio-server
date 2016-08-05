'use strict'

const MASTER = true
const express = require('express')
const fs = require('fs')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const md5 = require('blueimp-md5')
const session = require('express-session')
const DeveloperHandler = require('../handlers/developers-handler')

const app = express()

const developers = require('../routes/developers')
const auth = require('../routes/auth')
const ip = require('../routes/ip')

const webdriverioTester = require('./webdriverioTester')

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
app.use('/', ip)
app.use(express.static(path.join(__dirname, '..', '/dist')))

// ==================================================================
//                          The main method
// ==================================================================

app.get(/^\/status\/(\d+)$/, function (req, res) {
  const id = req.params[0]
  const filename = path.join(__dirname, '..', 'screenshots/output-' + id + '.json')
  // Poll slave servers using the id (timestamp) if the server is the master server
  if (MASTER && webdriverioTester.getExisting(id)) {
    webdriverioTester.combineResults(id)
  }
  fs.exists(filename, function (exists) {
    if (exists) {
      res.status(200).send('finished')
    } else {
      res.status(404).send('Not found')
    }
    res.end()
  })
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

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})

passport.use(new LocalStrategy((username, password, done) => {
  const req = {
    query: {
      username: md5(username),
      token: md5(password)
    }
  }
  DeveloperHandler.get(req).then((res) => {
    return done(null, req.query.username)
  })
  .catch(() => {
    return done(null, false)
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

app.post('/login', passport.authenticate('local', {
  successRedirect: '/#/portal',
  failureRedirect: '/#/login?failure=1'
}), (req, res) => {
  res.redirect('/#/portal')
})

// ==================================================================
//                        Denied Access Reasons
// ==================================================================

app.get('/auth/denied', (req, res) => {
  let fileContents
  try {
    fileContents = JSON.parse(fs.readFileSync(path.join(__dirname, 'info.json'))).rejectionReasons
  } catch (e) {
    console.error('info.json was not found')
    res.send('An error has occured. Please contact the site admin. Please include this number: 404.')
  }
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

