/**
 * A Redis client for node.js
 * https://github.com/NodeRedis/node_redis
 */
const redis = require('redis') // redis connection

var DeveloperHandler = {
  /**
   * This function initializes the redis client. It is extracted from the routes code because
   * when testing any http requests made to Redis, I did not want to initilize the client since that would require
   * Redis to be running while the tests were running.
   */
  init: function () {
    this.client = redis.createClient({password: process.env.REDIS})
  },
  /**
   * Set the response Object to be in the format of a successful reponse
   * @param {Object} res - The response Object
   * @param {String} username - The given username
   * @param {String} token - The given testing-token
   */
  setStandardResponse: function (res, username, token) {
    res.status(200)
    res.format({
      json: function () {
        res.json({
          username,
          token
        })
      }
    })
  },
  /**
   * Set the response Object to be in the format of a successful reponse
   * @param {Object} res - The response Object
   * @param {String[]} developers - The set of usernames and tokens returned from the query
   */
  setStandardKeysResponse: function (res, developers) {
    res.status(200)
    res.format({
      json: function () {
        res.json({
          developers
        })
      }
    })
  },
  /**
   * Sets the response Object to be in the format of an error.
   * @param {Object} res - The response Object
   * @param {String} err - The specific error
   * @param {Number} statusCode - The http status code
   */
  setErrorResponse: function (res, err, statusCode) {
    res.status(statusCode)
    res.format({
      json: function () {
        res.json({error: err})
      }
    })
  },
  /**
   * Gets a users information based on a username parameter.
   * @param {String} username - A username in the database
   * @returns {Promise} If successful, the username and corresponding token is returned
   */
  getValue: function (username) {
    return new Promise((resolve, reject) => {
      this.client.get(username, function (err, token) {
        if (err) {
          reject(err)
        }
        resolve({
          username,
          token: token
        })
      })
    })
  },
  /**
   * @param {Object} req - The request Object, containing the username and the token in the query
   * @param {Object} res - The response Object, which will be send back to the front end after the request has been returned.
   *                       It contains the status code and the json with either the username and token or the cooresponding error.
   * @returns {Promise} err - This function will always resolve with the err Object, since we are required to either resolve or reject the promise.
   */
  get: function (req, res) {
    return new Promise((resolve, reject) => {
      let pset = []
      if (req.query.queryAll) {
        this.client.keys('*', function (err, keys) {
          if (err) {
            DeveloperHandler.setErrorResponse(res, err, 404)
          } else {
            keys.map((item) => {
              pset.push(DeveloperHandler.getValue(item))
            })
            Promise.all(pset).then((value) => {
              DeveloperHandler.setStandardKeysResponse(res, value)
            }).catch((reason) => {
              DeveloperHandler.setErrorResponse(res, reason, 404)
            })
          }
          resolve(keys)
        })
      } else {
        this.client.get(req.query.username, function (err, redisResp) {
          if (err) {
            DeveloperHandler.setErrorResponse(res, err, 404)
          } else if (redisResp === null) {
            DeveloperHandler.setErrorResponse(res, 'The username provided does not match any username. Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com', 500)
          } else if (req.query.token === '') {
            DeveloperHandler.setStandardResponse(res, req.query.username, redisResp)
          } else if (req.query.token === redisResp) {
            DeveloperHandler.setStandardResponse(res, req.query.username, redisResp)
          } else {
            DeveloperHandler.setErrorResponse(res, 'The token submitted does not match the token returned.', 500)
          }
          resolve(err)
        })
      }
    })
  },
  /**
   * @param {Object} req - The request Object, containing the username and the token in the body
   * @param {Object} res - The response Object, which will be send back to the front end after the request has been returned.
   *                       It contains the status code and the json with either the username and token or the cooresponding error.
   * @returns {Promise} - This function will always resolve with the err Object, since we are required to either resolve or reject the promise.
   */
  post: function (req, res) {
    return new Promise((resolve, reject) => {
      const username = req.body.developer.username
      const token = req.body.developer.token
      this.client.set(username, token, function (err, redisResp) {
        if (err) {
          DeveloperHandler.setErrorResponse(res, err, 404)
        } else {
          DeveloperHandler.setStandardResponse(res, username, token)
        }
        resolve(err)
      })
    })
  },
  /**
   * @param {Object} req - The request Object, containing the username and the token in the parameters
   * @param {Object} res - The response Object, which will be send back to the front end after the request has been returned.
   *                       It contains the status code and the json with either the username and token or the cooresponding error.
   * @returns {Promise} err - This function will always resolve with the err Object, since we are required to either resolve or reject the promise.
   */
  delete: function (req, res) {
    return new Promise((resolve, reject) => {
      if (req.params.username === undefined) {
        DeveloperHandler.setErrorResponse(res, 'Request must be in parameters', 500)
      } else {
        this.client.del(req.params.username, function (err, redisResp) {
          if (err) {
            DeveloperHandler.setErrorResponse(res, err, 404)
          } else {
            DeveloperHandler.setStandardResponse(res, req.params.username, 'TokenWasDeleted')
          }
          resolve(err)
        })
      }
    })
  }
}

module.exports = DeveloperHandler
