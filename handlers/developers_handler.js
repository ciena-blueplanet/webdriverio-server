const redis = require('redis') // redis connection
const client = redis.createClient()

var DeveloperHandler = {
  get: function (req, res) {
    client.get(req.params.username, function (err, resp) {
      if (err) {
        setErrorResponse(res, err, 404)
      } else if (resp === null) {
        setErrorResponse(res, 'The username provided does not match any username. Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com', 500)
      } else {
        setStandardResponse(res, resp)
      }
    })
  },
  post: function (req, res) {
    client.set(req.params.username, req.body.token, function (err, resp) {
      if (err) {
        setErrorResponse(res, err, 404)
      } else {
        setStandardResponse(res, resp)
      }
    })
  },
  put: function (req, res) {
    client.set(req.params.username, req.body.token, function (err, resp) {
      if (err) {
        setErrorResponse(res, err, 404)
      } else {
        setStandardResponse(res, resp)
      }
    })
  },
  delete: function (req, res) {
    client.del(req.params.username, function (err, resp) {
      if (err) {
        setErrorResponse(res, err, 404)
      } else {
        setStandardResponse(res, resp)
      }
    })
  }
}

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

module.exports = DeveloperHandler
