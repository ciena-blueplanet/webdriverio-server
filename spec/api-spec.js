const base_url = 'http://localhost:3000'
const server = require('../handlers/developers_handler.js')
const redis = require('redis')

const res = {
  status: jasmine.createSpy('status'),
  format: jasmine.createSpy('format'),
  json: function () {}
}

beforeEach(() => {
  spyOn(redis, 'createClient').and.returnValue({
    delete: function () {},
    get: function () {},
    post: function () {},
    put: function () {},
    set: function (username, token, cb) {
      cb(undefined, res)
    },
    del: function () {}
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
        done()
      }
    })
  })
})

xdescribe('Get Requests', () => {
  it('should get a user with the correct token after an update happens', (done) => {
    var testToken = {token: 'sometokenofjustice'}
    server.put({url: base_url + '/developers/testuser', form: testToken}, (err, res, body) => {
      if (err) {
        done.fail(err)
      } else {
        expect(res.statusCode).toEqual(200)
        server.get(base_url + '/developers/testuser', (err, res, body) => {
          if (err) {
            done.fail(err)
          } else {
            expect(res.statusCode).toEqual(200)
            expect(body).toEqual('"sometokenofjustice"')
            done()
          }
        })
      }
    })
  })

  it('should get a user with the correct token after an post happens', (done) => {
    var testToken = {token: 'acompletelynewandoriginaltoken'}
    server.post({url: base_url + '/developers/testuser', form: testToken}, (err, res, body) => {
      if (err) {
        done.fail(err)
      } else {
        expect(res.statusCode).toEqual(200)
        server.get(base_url + '/developers/testuser', (err, res, body) => {
          if (err) {
            done.fail(err)
          } else {
            expect(res.statusCode).toEqual(200)
            expect(body).toEqual('"acompletelynewandoriginaltoken"')
            done()
          }
        })
      }
    })
  })

  it('should indicate that a username does not exist', (done) => {
    server.get(base_url + '/developers/ksdflaj', (err, res, body) => {
      if (err) {
        done.fail(err)
      } else {
        expect(res.statusCode).toEqual(500)
        expect(body).toEqual('{"error":"The username provided does not match any username. Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com"}')
        done()
      }
    })
  })
})

xdescribe('Delete Requests', () => {
  it('should delete a user correctly', (done) => {
    server.post(base_url + '/developers/testuser', (err, res, body) => {
      if (err) {
        done.fail(err)
      } else {
        expect(res.statusCode).toEqual(200)
        server.delete(base_url + '/developers/testuser', (err, res, body) => {
          if (err) {
            done.fail(err)
          } else {
            expect(res.statusCode).toEqual(200)
            server.get(base_url + '/developers/testuser', (err, res, body) => {
              if (err) {
                done.fail(err)
              } else {
                expect(res.statusCode).toEqual(500)
                expect(body).toEqual('{"error":"The username provided does not match any username. Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com"}')
                done()
              }
            })
          }
        })
      }
    })
  })
})
