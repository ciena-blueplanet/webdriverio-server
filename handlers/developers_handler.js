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
function setStandardResponse (res, redisResp) {
  res.status(200)
  res.format({
    json: function () {
      res.json(redisResp)
    }
  })
}

var DeveloperHandler = {
  init: function () {
    this.client = redis.createClient({password: process.env.REDIS})
  },
  get: function (req, res, cb) {
    this.client.get(req.params.username, function (err, redisResp) {
      if (err) {
        setErrorResponse(res, err, 404)
      } else if (redisResp === null) {
        setErrorResponse(res, 'The username provided does not match any username. Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com', 500)
      } else {
        setStandardResponse(res, redisResp)
      }
      if (cb) {
        cb(err, redisResp)
      }
    })
  },
  post: function (req, res, cb) {
    this.client.set(req.params.username, req.body.token, function (err, redisResp) {
      if (err) {
        setErrorResponse(res, err, 404)
      } else {
        setStandardResponse(res, redisResp)
      }
      if (cb) {
        cb(err, redisResp)
      }
    })
  },
  put: function (req, res, cb) {
    this.client.set(req.params.username, req.body.token, function (err, redisResp) {
      if (err) {
        setErrorResponse(res, err, 404)
      } else {
        setStandardResponse(res, redisResp)
      }
      if (cb) {
        cb(err, redisResp)
      }
    })
  },
  delete: function (req, res, cb) {
    this.client.del(req.params.username, function (err, redisResp) {
      if (err) {
        setErrorResponse(res, err, 404)
      } else {
        setStandardResponse(res, redisResp)
      }
      if (cb) {
        cb(err, redisResp)
      }
    })
  }
}

module.exports = DeveloperHandler
