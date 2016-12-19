const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser') // parses info from POST
const methodOverride = require('method-override') // used to manipulate POST data

router.use(bodyParser.urlencoded({ extended: true }))

router.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

module.exports = router
