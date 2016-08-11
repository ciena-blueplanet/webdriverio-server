'use strict'

const DeveloperHandler = require('../handlers/developers-handler.js')
const IPHandler = require('../handlers/ip-handler.js')
const processUpload = require('../src/process-upload')

describe('IP Handling Spec', function () {
  let req, res
  describe('startTest()', function () {
    beforeEach(function () {
      req = {
        files: {
          tarball: {
            name: 'test.tar.gz'
          }
        },
        body: {
          'entry-point': 'test-entry',
          'tests-folder': 'test-folder'
        }
      }
      res = {}
      spyOn(processUpload, 'newFile').and.callFake(function () {
      })
      IPHandler.MASTER = true
      IPHandler.startTest(req, res)
    })

    it('should call processUpload.newFile() with the correct arguments', function () {
      expect(processUpload.newFile).toHaveBeenCalledWith(
        req.files.tarball.name, req.body['entry-point'], req.body['tests-folder'], res, true)
    })
  })

  describe('checkIP()', function () {
    describe('does not error out', function () {
      beforeEach(function () {
        req = {
          headers: {
            'x-forwarded-for': '52.22.60.255',
            username: 'testUser',
            token: '123456'
          }
        }
      })
      describe('DeveloperHandler.get handles correctly', function () {
        beforeEach(function () {
          spyOn(DeveloperHandler, 'get').and.callFake(function (request) {
            return Promise.reject('The token submitted does not match the token returned.')
          })
        })
        it('should resolve to true', function (done) {
          IPHandler.checkIP(req)
          .then((result) => {
            expect(result).toBeTruthy()
            done()
          })
          .catch((err) => {
            done.fail(err)
          })
        })
        it('should call DeveloperHandler.get with the correct parameters', function (done) {
          IPHandler.checkIP(req)
          .then((result) => {
            expect(DeveloperHandler.get).toHaveBeenCalledWith({
              query: {
                username: req.headers.username,
                token: req.headers.token
              }
            })
            done()
          })
          .catch((err) => {
            done.fail(err)
          })
        })
      })
      describe('DeveloperHandler.get resolves', function () {
        beforeEach(function () {
          spyOn(DeveloperHandler, 'get').and.callFake(function (request) {
            return Promise.resolve()
          })
        })
        it('should reject with the correct error message', function (done) {
          IPHandler.checkIP(req)
          .then((err) => {
            done.fail(err)
          })
          .catch((result) => {
            expect(result).toEqual(`Your account is restricted. Your username is ${req.headers.username} and your token is ${req.headers.token}`) // eslint-disable-line max-len
            done()
          })
        })
      })
      describe('DeveloperHandler.get reject with different error message', function () {
        beforeEach(function () {
          spyOn(DeveloperHandler, 'get').and.callFake(function (request) {
            return Promise.reject('Other Error')
          })
        })
        it('should reject with the error', function (done) {
          IPHandler.checkIP(req)
          .then((err) => {
            done.fail(err)
          })
          .catch((result) => {
            expect(result).toEqual('Other Error')
            done()
          })
        })
      })
    })
    describe('Errors out when no IP address is provided', function () {
      beforeEach(function () {
        req = {
          headers: {
            'x-forwarded-for': ''
          }
        }
      })
      it('should reject with an error message', function (done) {
        IPHandler.checkIP(req)
        .then((err) => {
          done.fail(err)
        })
        .catch((result) => {
          expect(result.startsWith('Please set headers for proxy connections'))
          done()
        })
      })
    })
  })

  describe('post()', function () {
    let req, res
    beforeEach(function () {
      res = jasmine.createSpyObj('res', ['send', 'end'])
    })
    it('should start the tests if the server is a slave', function (done) {
      IPHandler.MASTER = false
      spyOn(IPHandler, 'startTest')
      IPHandler.post(req, res).then(() => {
        expect(IPHandler.startTest).toHaveBeenCalled()
        done()
      })
    })
    describe('Check IP resolves to false', function () {
      beforeEach(function () {
        req = {
          headers: {
            username: 'test-user',
            token: '123456'
          }
        }
        IPHandler.MASTER = true
        spyOn(IPHandler, 'startTest')
        spyOn(IPHandler, 'checkIP').and.callFake(function () {
          return Promise.resolve(false)
        })
      })
      describe('checkUsername() resolves', function () {
        beforeEach(function () {
          spyOn(IPHandler, 'checkUsername').and.callFake(function () {
            return Promise.resolve()
          })
        })
        it('should call checkUsername()', function (done) {
          IPHandler.post(req, res).then(() => {
            expect(IPHandler.checkUsername).toHaveBeenCalled()
            done()
          })
        })
      })
    })
    describe('checkIP() resolves to true', function () {
      beforeEach(function () {
        req = {
          headers: {
            username: 'test-user',
            token: '123456'
          }
        }
        IPHandler.MASTER = true
        spyOn(IPHandler, 'startTest')
        spyOn(IPHandler, 'checkIP').and.callFake(function () {
          return Promise.resolve(true)
        })
      })
      it('should start the tests', function (done) {
        IPHandler.post(req, res).then(() => {
          expect(IPHandler.startTest).toHaveBeenCalled()
          done()
        })
      })
    })
    describe('checkIP rejects', function () {
      beforeEach(function () {
        req = {
          headers: {
            username: 'test-user',
            token: '123456'
          }
        }
        spyOn(IPHandler, 'checkIP').and.callFake(function () {
          return Promise.reject('Error')
        })
      })
      it('should send an error message in the res object', function (done) {
        IPHandler.post(req, res).then(() => {
          done.fail()
        })
        .catch((result) => {
          expect(result).toEqual('Error')
          expect(res.send).toHaveBeenCalledWith('Error')
          expect(res.end).toHaveBeenCalled()
          done()
        })
      })
    })
    describe('No headers exist', function () {
      beforeEach(function () {
        req = {}
        IPHandler.post(req, res)
      })
      it('should send an error message in the res object', function (done) {
        IPHandler.post(req, res).then(() => {
          done.fail()
        })
        .catch((result) => {
          expect(result).toEqual('Error: Headers do not exist')
          expect(res.send).toHaveBeenCalledWith('Error: Headers do not exist')
          expect(res.end).toHaveBeenCalled()
          done()
        })
      })
    })
  })
  describe('checkUsername()', function () {
    let req, res
    beforeEach(function () {
      res = jasmine.createSpyObj('res', ['send', 'end'])
      spyOn(IPHandler, 'startTest')
    })
    describe('username or token does not exist', function () {
      beforeEach(function () {
        req = {
          headers: {
            username: '',
            token: '~'
          }
        }
      })
      it('should send an error in the res object', function (done) {
        IPHandler.checkUsername(req, res).then((err) => {
          done.fail(err)
        })
        .catch(() => {
          expect(res.send).toHaveBeenCalled()
          expect(res.end).toHaveBeenCalled()
          done()
        })
      })
    })

    describe('DeveloperHandler.get should resolve', function () {
      beforeEach(function () {
        req = {
          headers: {
            username: 'test-user',
            token: '123456'
          }
        }
        spyOn(DeveloperHandler, 'get').and.callFake(function () {
          return Promise.resolve()
        })
      })
      it('should start the tests', function (done) {
        IPHandler.checkUsername(req, res).then(() => {
          expect(IPHandler.startTest).toHaveBeenCalledWith(req, res)
          done()
        })
      })
      it('should call DeveloperHandler.get with the correct parameters', function (done) {
        IPHandler.checkUsername(req, res).then(() => {
          expect(DeveloperHandler.get).toHaveBeenCalledWith({
            query: {
              username: req.headers.username,
              token: req.headers.token
            }
          })
          done()
        })
        .catch((err) => {
          done.fail(err)
        })
      })
    })
    describe('DeveloperHandler.get rejects', function () {
      beforeEach(function () {
        req = {
          headers: {
            username: 'test-user',
            token: '123456'
          }
        }
        spyOn(DeveloperHandler, 'get').and.callFake(function () {
          return Promise.reject('Error')
        })
      })
      it('should send the error back in the res object', function (done) {
        IPHandler.checkUsername(req, res).then((err) => {
          done.fail(err)
        })
        .catch((result) => {
          expect(result).toEqual('Error')
          expect(res.send).toHaveBeenCalledWith('Error')
          expect(res.end).toHaveBeenCalled()
          done()
        })
      })
    })
  })
})




