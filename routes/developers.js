const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser') // parses info from POST
const methodOverride = require('method-override') // used to manipulate POST data
const DeveloperHandler = require('../handlers/developers_handler.js')

router.use(bodyParser.urlencoded({ extended: true }))

router.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

// Build the REST operations at the base of courses
// This will be accessible from base_url/developers
DeveloperHandler.init()
router.route('/')
    .get(DeveloperHandler.get.bind(DeveloperHandler))
    .post(DeveloperHandler.post.bind(DeveloperHandler))
    .put(DeveloperHandler.put.bind(DeveloperHandler))
    .delete(DeveloperHandler.delete.bind(DeveloperHandler))

module.exports = router
