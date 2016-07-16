'use strict'
/**
 * A Redis client for node.js
 * https://github.com/NodeRedis/node_redis
 */
const redis = require('redis') // redis connection
const USERNAME_DOES_NOT_EXIST = 510
const TOKEN_DOES_NOT_EXIST = 520

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
   * Set the response Object to be in the format of a successful response
   * @param {Object} res - The response Object
   * @param {String} username - The given username
   * @param {String} token - The given testing-token
   */
  setStandardResponse: function (res, username, token) {
    if (!res) {
      return
    }
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
   * Set the response Object to be in the format of a successful response
   * @param {Object} res - The response Object
   * @param {String[]} developers - An array of objects containing key-value pairs of usernames and tokens
   * [
   *  {
   *    username: {String}
   *    token: {String}
   *  },
   * ]
   */
  setStandardKeysResponse: function (res, developers) {
    if (!res) {
      return
    }
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
    if (!res) {
      return
    }
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
      this.client.get(username, (err, token) => {
        if (err) {
          reject(err)
        }
        resolve({
          username,
          token
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
      if (req.query.queryAll) {
        this.client.keys('*', (err, keys) => {
          getKeysResponse(err, res, keys)
          resolve(keys)
        })
      } else {
        this.client.get(req.query.username, (err, redisResp) => {
          let response = {}
          response = getResponse(err, res, req, redisResp)
          if (response.resolve) {
            resolve(response.resolve)
          } else {
            reject(response.reject)
          }
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
      this.client.set(username, token, (err, redisResp) => {
        if (err) {
          DeveloperHandler.setErrorResponse(res, err, 404)
          reject(err)
        } else {
          DeveloperHandler.setStandardResponse(res, username, token)
          resolve(redisResp)
        }
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
        reject('Request must be in parameters')
      } else {
        this.client.del(req.params.username, (err, redisResp) => {
          if (err) {
            DeveloperHandler.setErrorResponse(res, err, 404)
            reject(err)
          } else {
            DeveloperHandler.setStandardResponse(res, req.params.username, 'TokenWasDeleted')
            resolve(redisResp)
          }
        })
      }
    })
  }
}

function getKeysResponse (err, res, keys) {
  if (err) {
    DeveloperHandler.setErrorResponse(res, err, 404)
  } else {
    const pset = keys.map((item) => DeveloperHandler.getValue(item))
    Promise.all(pset).then((value) => {
      DeveloperHandler.setStandardKeysResponse(res, value)
    }).catch((reason) => {
      DeveloperHandler.setErrorResponse(res, reason, 404)
    })
  }
}

function getResponse (err, res, req, redisResp) {
  if (err) {
    DeveloperHandler.setErrorResponse(res, err, 404)
    return {reject: err}
  } else if (redisResp === null) {
    DeveloperHandler.setErrorResponse(res, 'The username provided does not match any username. ' +
                                           'Please make sure that you are signed up as an authorized ' +
                                           'ciena developer on www.cienadevelopers.com', USERNAME_DOES_NOT_EXIST)
    return {reject: 'This username does not exist: ' + req.query.username}
  } else if (req.query.token === '' || req.query.token === redisResp) {
    DeveloperHandler.setStandardResponse(res, req.query.username, redisResp)
    return {resolve: req.query.token}
  } else {
    DeveloperHandler.setErrorResponse(res, `The token submitted does
       not match the token returned.`, TOKEN_DOES_NOT_EXIST)
    return {reject: 'The token submitted does not match the token returned.'}
  }
}

module.exports = DeveloperHandler
