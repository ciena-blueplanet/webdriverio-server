'use strict'
const server = require('../handlers/developers-handler.js')
const redis = require('redis')

const res = {
  status: jasmine.createSpy('status'),
  format: jasmine.createSpy('format')
}

var db = new Map()

/**
 * Mocks the redis set command
 * @param {string} username - The username of a developer
 * @param {string} token - The token randomly generated and stored as the value to the username key
 */
function set (username, token) {
  db.set(username, token)
}

/**
 * Mocks the redis get command
 * @param {string} username - The username of a developer
 * @returns {String} - The token of the developer
 */
function get (username) {
  const token = db.get(username)
  return token
}

function getAll () {
  return Array.from(db.keys())
}

/**
 * Mocks the redis del command
 * @param {String} username - The username of the developer
 * @returns {Object} - The username, token pair, where the token is replaced by a custom string
 * indicating it has been deleted
 */
function remove (username) {
  const ret = {
    username,
    token: 'TokenWasDeleted'
  }
  if (db.delete(username)) {
    return ret
  }
  return null
}

beforeEach(() => {
  spyOn(redis, 'createClient').and.returnValue({
    get: function (username, cb) {
      const token = get(username)
      if (!token) {
        cb({
          error: 'The username provided does not match any username. ' +
          'Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com'
        })
      }
      cb(null, get(username))
    },
    set: function (username, token, cb) {
      set(username, token)
      cb(null, {
        username,
        token
      })
    },
    del: function (username, cb) {
      const pair = remove(username)
      if (!pair) {
        cb('User Does Not Exist')
      }
      cb(null, pair)
    },
    keys: function (key, cb) {
      if (key.toString() === '*') {
        cb(null, getAll())
      } else {
        cb(null)
      }
    }
  })
  server.init()
})

describe('Post Requests', () => {
  it('should post a new user correctly', (done) => {
    const req = {
      body: {
        developer: {
          username: 'testuser',
          token: '1234567890987654321'
        }
      }
    }
    server.post(req, res)
      .then((result) => {
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.format).toHaveBeenCalledWith({
          json: jasmine.any(Function)
        })
        expect(result).toEqual(req.body.developer)
        done()
      })
      .catch((err) => {
        done.fail(err)
      })
  })
})

describe('Get Requests', () => {
  it('should get a user with the correct token after an post happens', (done) => {
    const reqGet = {query: {username: 'testuser', token: 'acompletelynewandoriginaltoken'}}
    const reqPost = {
      body: {
        developer: {
          username: 'testuser',
          token: 'acompletelynewandoriginaltoken'
        }
      }
    }
    server.post(reqPost, res)
      .then((result) => {
        expect(res.status).toHaveBeenCalledWith(200)
        server.get(reqGet, res)
          .then((result) => {
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.format).toHaveBeenCalledWith({
              json: jasmine.any(Function)
            })
            expect(result).toEqual(reqPost.body.developer.token)
            done()
          }).catch((rej) => {
            done.fail(rej)
          })
      })
  })

  it('should indicate that a username does not exist', (done) => {
    const req = {query: {username: 'testrandomperson', token: 'acompletelynewandoriginaltoken'}}
    server.get(req, res)
      .then((result) => {
        done.fail(result)
      })
      .catch((errResult) => {
        expect(errResult).not.toBe(null)
        expect(res.status).toHaveBeenCalledWith(520)
        expect(res.format).toHaveBeenCalledWith({
          json: jasmine.any(Function)
        })
        expect(errResult).toEqual({
          error: 'The username provided does not match any username. ' +
          'Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com'
        })
        done()
      })
  })

  it('should get a user with the correct token after an post happens using the getValue call', (done) => {
    const key = {username: 'testuser'}
    const reqPost = {
      body: {
        developer: {
          username: 'testuser',
          token: 'acompletelynewandoriginaltoken'
        }
      }
    }
    server.post(reqPost, res)
      .then((result) => {
        expect(res.status).toHaveBeenCalledWith(200)
        server.getValue(key.username)
          .then((res) => {
            expect(res.username).toEqual(key.username)
            done()
          })
      })
      .catch((err) => {
        done.fail(JSON.stringify(err, null, 2))
      })
  })

  it('should get all users in the database', (done) => {
    const reqPost1 = {
      body: {
        developer: {
          username: 'testuser1',
          token: 'acompletelynewandoriginaltoken2'
        }
      }
    }
    const reqPost2 = {
      body: {
        developer: {
          username: 'testuser2',
          token: 'acompletelynewandoriginaltoken2'
        }
      }
    }
    spyOn(server, 'getValue').and.callFake(
      function (username) {
        if (db.get(username)) {
          return Promise.resolve({username, token: db.get(username)})
        }
        done.fail()
      }
    )
    server.post(reqPost1, res)
      .then((result) => {
        expect(res.status).toHaveBeenCalledWith(200)
        server.post(reqPost2, res)
          .then((result) => {
            expect(res.status).toHaveBeenCalledWith(200)
            server.get({query: {queryAll: 1}})
              .then((res) => {
                expect(res).toEqual(getAll())
                done()
              })
          })
          .catch((err) => {
            done.fail(err)
          })
      })
      .catch((err) => {
        done.fail(err)
      })
  })
})

describe('Delete Requests', () => {
  it('should delete a user correctly', (done) => {
    const reqGet = {query: {username: 'testuser', token: 'acompletelynewandoriginaltoken'}}
    const reqPost = {
      body: {
        developer: {
          username: 'testuser',
          token: 'acompletelynewandoriginaltoken'
        }
      }
    }
    const reqDelete = {
      params: {
        username: 'testuser'
      }
    }
    server.post(reqPost, res)
      .then((result) => {
        expect(res.status).toHaveBeenCalledWith(200)
        server.delete(reqDelete, res)
          .then((result) => {
            expect(res.status).toHaveBeenCalledWith(200)
            server.get(reqGet, res)
              .then((result) => {
                console.log('1')
                done.fail(JSON.stringify(result, null, 2))
              })
              .catch((errResult) => {
                expect(errResult).not.toBe(null)
                expect(res.status).toHaveBeenCalledWith(520)
                expect(res.format).toHaveBeenCalledWith({
                  json: jasmine.any(Function)
                })
                expect(errResult).toEqual({
                  error: 'The username provided does not match any username. ' +
                  'Please make sure that you are signed up as an authorized ' +
                  'ciena developer on www.cienadevelopers.com'
                })
                done()
              })
          })
          .catch((err) => {
            console.log('2')
            done.fail(JSON.stringify(err, null, 2))
          })
      })
      .catch((err) => {
        console.log('3')
        done.fail(JSON.stringify(err, null, 2))
      })
  })
})

describe('Response Tests', () => {
  let resSpy
  beforeEach(function () {
    resSpy = jasmine.createSpyObj('res', ['status', 'format', 'json'])
  })
  it('should format the standard response correctly', function () {
    server.setStandardResponse(resSpy, 'test', 'test-token')
    expect(resSpy.status).toHaveBeenCalledWith(200)
    expect(resSpy.format).toHaveBeenCalledWith({
      json: jasmine.any(Function)
    })
  })
  it('should format the error response correctly', function () {
    server.setErrorResponse(resSpy, 'Failure', 500)
    expect(resSpy.status).toHaveBeenCalledWith(500)
    expect(resSpy.format).toHaveBeenCalledWith({
      json: jasmine.any(Function)
    })
  })
  it('should format the standard keys response correctly', function () {
    server.setStandardKeysResponse(resSpy, ['test1', 'test2'])
    expect(resSpy.status).toHaveBeenCalledWith(200)
    expect(resSpy.format).toHaveBeenCalledWith({
      json: jasmine.any(Function)
    })
  })
})
