/**
 * A Redis client for node.js
 * https://github.com/NodeRedis/node_redis
 */
const redis = require('redis') // redis connection

/**
 * Sets the response object to be in the format of an error
 * @param {object} res - The response object
 * @param {string} err - The specific error
 * @param {Number} statusCode - The http status code
 */
function setErrorResponse (res, err, statusCode) {
  res.status(statusCode)
  res.format({
    json: function () {
      res.json({error: err})
    }
  })
}

/**
 * Set the response object to be in the format of a successful reponse
 * @param {object} res - The response object
 * @param {string} username - The given username
 * @param {object} token - The given testing-token
 */
function setStandardResponse (res, username, token) {
  console.log('BACKEND RESPONSE: username: ' + username + ' token: ' + token)
  res.status(200)
  res.format({
    json: function () {
      res.json({
        username,
        token
      })
    }
  })
}

var DeveloperHandler = {
  init: function () {
    this.client = redis.createClient({password: process.env.REDIS})
  },
  get: function (req, res, cb) {
    console.log('GET')
    if (req.body) {
      console.log('Body' + JSON.stringify(req.body, null, 2))
    }
    if (req.query) {
      console.log('Query' + JSON.stringify(req.query, null, 2))
    }
    if (req.params) {
      console.log('Params' + JSON.stringify(req.params, null, 2))
    }
    this.client.get(req.query.username, function (err, redisResp) {
      if (err) {
        setErrorResponse(res, err, 404)
      } else if (redisResp === null) {
        setErrorResponse(res, 'The username provided does not match any username. Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com', 500)
      } else if (req.query.token === '') {
        setStandardResponse(res, req.query.username, redisResp)
      } else if (req.query.token === redisResp) {
        setStandardResponse(res, req.query.username, redisResp)
      } else {
        setErrorResponse(res, 'The token submitted does not match the token returned.', 500)
      }
    })
  },
  post: function (req, res, cb) {
    console.log('POST')
    if (req.body) {
      console.log('Body' + JSON.stringify(req.body, null, 2))
    }
    if (req.query) {
      console.log('Query' + JSON.stringify(req.query, null, 2))
    }
    if (req.params) {
      console.log('Params' + JSON.stringify(req.params, null, 2))
    }
    const username = req.body.developer.username
    const token = req.body.developer.token
    this.client.set(username, token, function (err, redisResp) {
      if (err) {
        setErrorResponse(res, err, 404)
      } else {
        setStandardResponse(res, username, token)
      }
    })
  },
  delete: function (req, res, cb) {
    console.log('DELETE')
    if (req.query) {
      console.log('Query' + JSON.stringify(req.query, null, 2))
    }
    if (req.body) {
      console.log('Body' + JSON.stringify(req.body, null, 2))
    }
    if (req.params) {
      console.log('Params' + JSON.stringify(req.params, null, 2))
    }
    if (req.params.username === undefined) {
      setErrorResponse(res, 'Request must be in parameters', 500)
    } else {
      this.client.del(req.params.username, function (err, redisResp) {
        console.log('Redis Response is ' + redisResp)
        console.log('Error Response is ' + err)
        if (err) {
          setErrorResponse(res, err, 404)
        } else {
          setStandardResponse(res, req.params.username, 'TokenWasDeleted')
        }
      })
    }
  },
  put: function (req, res, cb) {
    console.log('PUT')
    if (req.body) {
      console.log('Body' + JSON.stringify(req.body, null, 2))
    }
    if (req.query) {
      console.log('Query' + JSON.stringify(req.query, null, 2))
    }
    if (req.params) {
      console.log('Params' + JSON.stringify(req.params, null, 2))
    }
    this.client.set(req.query.username, req.query.token, function (err, redisResp) {
      if (err) {
        setErrorResponse(res, err, 404)
      } else {
        setStandardResponse(res, req.query.username, req.query.token)
      }
    })
  }
}

module.exports = DeveloperHandler
