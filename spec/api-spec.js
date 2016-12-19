'use strict'
const server = require('../handlers/developers-handler.js')

const res = {
  status: jasmine.createSpy('status'),
  format: jasmine.createSpy('format')
}

describe('Endpoint Tests', function () {
  beforeEach(() => {
    server.init()
  })

  describe('Get Requests', () => {
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
            .catch((err) => {
              done.fail(err)
            })
        })
        .catch((err) => {
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
})
