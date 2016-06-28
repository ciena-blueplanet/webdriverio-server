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
    return redisResp
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
    get: function (username) {
      get(username)
      if (redisResponse.error !== undefined) {
        return redisResponse.error
      }
      return res
    },
    set: function (username, token) {
      set(username, token)
      return res
    },
    del: function (username) {
      remove(username)
      return res
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
    server.post(req, res, (err) => {
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
    server.post(reqPost, res, (err) => {
      if (err) {
        done.fail(err)
      } else {
        expect(res.status).toHaveBeenCalledWith(200)
        server.get(reqGet, res, (err) => {
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
    server.get(req, res, (err) => {
      if (err) {
        done.fail(err)
      } else {
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.format).toHaveBeenCalledWith({
          json: jasmine.any(Function)
        })
        expect(redisResponse).toEqual({error: 'The username provided does not match any username. Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com'})
        done()
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
    server.post(reqPost, res, (err) => {
      if (err) {
        done.fail(err)
      } else {
        expect(res.status).toHaveBeenCalledWith(200)
        server.delete(reqDelete, res, (err) => {
          if (err) {
            done.fail(err)
          } else {
            expect(res.status).toHaveBeenCalledWith(200)
            server.get(reqGet, res, (err) => {
              if (err) {
                done.fail(err)
              } else {
                expect(res.status).toHaveBeenCalledWith(500)
                expect(res.format).toHaveBeenCalledWith({
                  json: jasmine.any(Function)
                })
                expect(redisResponse).toEqual({error: 'The username provided does not match any username. Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com'})
                done()
              }
            })
          }
        })
      }
    })
  })
})
