'use strict'
const server = require('../handlers/developers_handler.js')
const redis = require('redis')

var redisResponse = ''

const res = {
  status: jasmine.createSpy('status'),
  format: jasmine.createSpy('format'),
  json: function (redisResp) {
    if (redisResp !== undefined) {
      redisResponse = redisResp
    }
  }
}

var db = new Map()

/**
 * Mocks the redis set command
 * @param {string} username - The username of a developer
 * @param {string} token - The token randomly generated and stored as the value to the username key
 */
function set (username, token) {
  db.set(username, token)
  res.json('OK')
}

/**
 * Mocks the redis get command
 * @param {string} username - The username of a developer
 */
function get (username) {
  const token = db.get(username)
  if (token !== undefined) {
    res.json(token)
  } else {
    res.json({error: 'The username provided does not match any username. Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com'})
  }
}

function getAll () {
  return Array.from(db.keys())
}

/**
 * Mocks the redis del command
 * @param {string} username - The username of the developer
 */
function remove (username) {
  db.delete(username)
  res.json('OK')
}

beforeEach(() => {
  spyOn(redis, 'createClient').and.returnValue({
    get: function (username, cb) {
      get(username)
      if (redisResponse.error !== undefined) {
        cb(redisResponse.error)
      }
      cb(null)
    },
    set: function (username, token, cb) {
      set(username, token)
      cb(null)
    },
    del: function (username, cb) {
      remove(username)
      cb(null)
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
      .then((err) => {
        if (err) {
          done.fail(err)
        } else {
          expect(res.status).toHaveBeenCalledWith(200)
          expect(res.format).toHaveBeenCalledWith({
            json: jasmine.any(Function)
          })
          expect(redisResponse).toEqual('OK')
          done()
        }
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
      .then((err) => {
        if (err) {
          done.fail(err)
        } else {
          expect(res.status).toHaveBeenCalledWith(200)
          server.get(reqGet, res)
            .then((err) => {
              if (err) {
                done.fail(err)
              } else {
                expect(res.status).toHaveBeenCalledWith(200)
                expect(res.format).toHaveBeenCalledWith({
                  json: jasmine.any(Function)
                })
                expect(redisResponse).toEqual('acompletelynewandoriginaltoken')
                done()
              }
            })
        }
      })
  })

  it('should indicate that a username does not exist', (done) => {
    const req = {query: {username: 'testrandomperson', token: 'acompletelynewandoriginaltoken'}}
    server.get(req, res)
      .then((err) => {
        expect(err).not.toBe(null)
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.format).toHaveBeenCalledWith({
          json: jasmine.any(Function)
        })
        expect(redisResponse).toEqual({error: 'The username provided does not match any username. Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com'})
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
      .then((err) => {
        if (err) {
          done.fail(err)
        } else {
          expect(res.status).toHaveBeenCalledWith(200)
          server.getValue(key.username)
            .then((res) => {
              expect(res.username).toEqual(key.username)
              done()
            })
        }
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
        let ret = {}
        if (db.get(username)) {
          ret = {username, token: db.get(username)}
        } else {
          done.fail()
        }
        return Promise.resolve(ret)
      }
    )
    server.post(reqPost1, res)
      .then((err) => {
        if (err) {
          done.fail(err)
        } else {
          expect(res.status).toHaveBeenCalledWith(200)
          server.post(reqPost2, res)
            .then((err) => {
              if (err) {
                done.fail(err)
              } else {
                expect(res.status).toHaveBeenCalledWith(200)
                server.get({query: {queryAll: 1}})
                  .then((res) => {
                    expect(res).toEqual(getAll())
                    done()
                  })
              }
            })
        }
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
      .then((err) => {
        if (err) {
          done.fail(err)
        } else {
          expect(res.status).toHaveBeenCalledWith(200)
          server.delete(reqDelete, res)
            .then((err) => {
              if (err) {
                done.fail(err)
              } else {
                expect(res.status).toHaveBeenCalledWith(200)
                server.get(reqGet, res)
                  .then((err) => {
                    expect(err).not.toBe(null)
                    expect(res.status).toHaveBeenCalledWith(500)
                    expect(res.format).toHaveBeenCalledWith({
                      json: jasmine.any(Function)
                    })
                    expect(redisResponse).toEqual({error: 'The username provided does not match any username. Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com'})
                    done()
                  })
              }
            })
        }
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
