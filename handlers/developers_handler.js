const redis = require('redis') // redis connection

function setErrorResponse (res, err, statusCode) {
  res.status(statusCode)
  res.format({
    json: function () {
      res.json({error: err})
    }
  })
}

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
    this.client = redis.createClient({password: '123456'})
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
  delete: function (req, res) {
    this.client.del(req.params.username, function (err, redisResp) {
      if (err) {
        setErrorResponse(res, err, 404)
      } else {
        setStandardResponse(res, redisResp)
      }
    })
  }
}

module.exports = DeveloperHandler
