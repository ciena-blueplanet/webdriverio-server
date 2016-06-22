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
 * @param {object} redisResp - The response from the redis database
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
    console.log('Body' + JSON.stringify(req.body, null, 2))
    console.log('Query' + JSON.stringify(req.query, null, 2))
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
      if (cb) {
        cb(err, redisResp)
      }
    })
  },
  post: function (req, res, cb) {
    console.log('POST')
    console.log('Body' + JSON.stringify(req.body, null, 2))
    console.log('Query' + JSON.stringify(req.query, null, 2))
    const username = req.body.developer.username
    const token = req.body.developer.token
    this.client.set(username, token, function (err, redisResp) {
      if (err) {
        setErrorResponse(res, err, 404)
      } else {
        setStandardResponse(res, username, token)
      }
      if (cb) {
        cb(err, redisResp)
      }
    })
  },
  put: function (req, res, cb) {
    console.log('PUT')
    console.log('Body' + JSON.stringify(req.body, null, 2))
    console.log('Query' + JSON.stringify(req.query, null, 2))
    this.client.set(req.query.username, req.query.token, function (err, redisResp) {
      if (err) {
        setErrorResponse(res, err, 404)
      } else {
        setStandardResponse(res, req.query.username, req.query.token)
      }
      if (cb) {
        cb(err, redisResp)
      }
    })
  },
  delete: function (req, res, cb) {
    console.log('PUT')
    console.log('Body' + JSON.stringify(req.body, null, 2))
    console.log('Query' + JSON.stringify(req.query, null, 2))
    console.log('Params' + JSON.stringify(req.params, null, 2))
    this.client.del(req.params.username, function (err, redisResp) {
      if (err) {
        setErrorResponse(res, err, 404)
      } else {
        setStandardResponse(res, req.params.username, 'TokenWasDeleted')
      }
      if (cb) {
        cb(err, redisResp)
      }
    })
  }
}

module.exports = DeveloperHandler
