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

function set (username, token) {
  db.set(username, token)
  res.json('OK')
}

function get (username) {
  const token = db.get(username)
  if (token !== undefined) {
    res.json(token)
  } else {
    res.json({error: 'The username provided does not match any username. Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com'})
  }
}

function remove (username) {
  db.delete(username)
  res.json('OK')
}

beforeEach(() => {
  spyOn(redis, 'createClient').and.returnValue({
    get: function (username, cb) {
      get(username)
      if (redisResponse.error !== undefined) {
        cb(undefined, null)
      }
      cb(undefined, res)
    },
    set: function (username, token, cb) {
      set(username, token)
      cb(undefined, res)
    },
    del: function (username, cb) {
      remove(username)
      cb(undefined, res)
    }
  })
  server.init()
})

describe('Post Requests', () => {
  it('should post a new user correctly', (done) => {
    const req = {params: {username: 'testuser'}, body: {token: '1234567890987654321'}}
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

describe('Put Requests', () => {
  it('should update a user correctly', (done) => {
    const req = {params: {username: 'testuser'}, body: {token: '357284909lsdkjf83745'}}
    server.put(req, res, (err) => {
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
  it('should get a user with the correct token after an update happens', (done) => {
    const req = {params: {username: 'testuser'}, body: {token: 'sometokenofjustice'}}
    server.put(req, res, (err) => {
      if (err) {
        done.fail(err)
      } else {
        expect(res.status).toHaveBeenCalledWith(200)
        server.get(req, res, (err) => {
          if (err) {
            done.fail(err)
          } else {
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.format).toHaveBeenCalledWith({
              json: jasmine.any(Function)
            })
            expect(redisResponse).toEqual('sometokenofjustice')
            done()
          }
        })
      }
    })
  })

  it('should get a user with the correct token after an post happens', (done) => {
    const req = {params: {username: 'testuser'}, body: {token: 'acompletelynewandoriginaltoken'}}
    server.post(req, res, (err) => {
      if (err) {
        done.fail(err)
      } else {
        expect(res.status).toHaveBeenCalledWith(200)
        server.get(req, res, (err) => {
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
    const req = {params: {username: 'lhg'}}
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
    const req = {params: {username: 'testuser'}, body: {token: 'atokenthattotallyworks'}}
    server.post(req, res, (err) => {
      if (err) {
        done.fail(err)
      } else {
        expect(res.status).toHaveBeenCalledWith(200)
        server.delete(req, res, (err) => {
          if (err) {
            done.fail(err)
          } else {
            expect(res.status).toHaveBeenCalledWith(200)
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
          }
        })
      }
    })
  })
})
