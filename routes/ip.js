const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser') // parses info from POST
const methodOverride = require('method-override') // used to manipulate POST data
const IPHandler = require('../handlers/ip-handler.js')
const multer = require('multer')
const path = require('path')
const debug = require('debug')('server')

// Parses incoming requests bodies
router.use(bodyParser.urlencoded({ extended: true }))

// Standard express code to override methods using headers
router.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

// Handles multipart form requests, specifically for sending files in curl requests
router.use(multer({
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

// This will be accessible from base_url/
router.route('/')
    .post(IPHandler.post.bind(IPHandler))

module.exports = router
