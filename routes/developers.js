const express = require('express')
const router = express.Router()
const redis = require('redis') // redis connection
const bodyParser = require('body-parser') // parses info from POST
const methodOverride = require('method-override') // used to manipulate POST data

const client = redis.createClient()

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
// This will be accessible from localhost:8000/developers
router.route('/:username')
    .get(function (req, res) {
      client.get(req.params.username, function (err, resp) {
        if (err) {
          setErrorResponse(res, err, 404)
        } else if (resp === null) {
          setErrorResponse(res, 'The username provided does not match any username. Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com', 500)
        } else {
          setStandardResponse(res, resp)
        }
      })
    })
    .post(function (req, res) {
      client.set(req.params.username, req.body.token, function (err, resp) {
        if (err) {
          setErrorResponse(res, err, 404)
        } else {
          setStandardResponse(res, resp)
        }
      })
    })
    .put(function (req, res) {
      client.set(req.params.username, req.body.token, function (err, resp) {
        if (err) {
          setErrorResponse(res, err, 404)
        } else {
          setStandardResponse(res, resp)
        }
      })
    })
    .delete(function (req, res) {
      client.del(req.params.username, function (err, resp) {
        if (err) {
          setErrorResponse(res, err, 404)
        } else {
          setStandardResponse(res, resp)
        }
      })
    })

function setErrorResponse (res, err, statusCode) {
  res.status(statusCode)
  res.format({
    json: function () {
      res.json({error: err})
    }
  })
}

function setStandardResponse (res, resp) {
  res.status(200)
  res.format({
    json: function () {
      res.json(resp)
    }
  })
}

module.exports = router
