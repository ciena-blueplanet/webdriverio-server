'use strict'

const GitHubAPI = require('github')
const DeveloperHandler = require('../handlers/developers-handler')
const AuthorizationHandler = require('../handlers/authorization-handler')
const githubAPI = require('../handlers/github-api-handler')
const oauth = require('oauth').OAuth2
const OAuth = oauth

describe('Authorization Handler', function () {
  let req, res, destroyed
  AuthorizationHandler.github = new GitHubAPI()
  AuthorizationHandler.OAuth2 = new OAuth()

  describe('get()', function () {
    beforeEach(function () {
      req = jasmine.createSpy('req')
      res = jasmine.createSpyObj('res', ['writeHead', 'end'])
      spyOn(AuthorizationHandler.OAuth2, 'getAuthorizeUrl').and.callFake(function () {
        return 'URL'
      })
      AuthorizationHandler.get(req, res)
    })
    it('should call writeHead with the correct parameters', function () {
      expect(res.writeHead).toHaveBeenCalledWith(303, {
        Location: jasmine.any(String)
      })
    })
  })

  describe('post()', function () {
    describe('Session is expired', function () {
      beforeEach(function () {
        req = jasmine.createSpy('req')
        res = jasmine.createSpyObj('res', ['send'])
      })
      it('should redirect to the denied access with reason=9', function (done) {
        AuthorizationHandler.post(req, res)
        .then((err) => {
          done.fail(JSON.stringify(err, null, 2))
        })
        .catch(() => {
          expect(res.send).toHaveBeenCalledWith({
            redirect: '/#/auth/denied?reason=9'
          })
          done()
        })
      })
    })

    describe('Session is not expired, DeveloperHandler.get resolves', function () {
      let username = 'pastorsj'
      beforeEach(function () {
        req = jasmine.createSpyObj('req', ['session'])
        req.session.user = username
        req.session = {
          user: username,
          destroy: function () {
            destroyed = true
          }
        }
        res = jasmine.createSpyObj('res', ['send', 'end'])
      })
      describe('DeveloperHandler.post resolves', function () {
        beforeEach(function () {
          spyOn(DeveloperHandler, 'get').and.callFake((request) => {
            return Promise.resolve('!')
          })
          spyOn(DeveloperHandler, 'post').and.callFake((request) => {
            return Promise.resolve()
          })
        })
        it('should call DeveloperHandler.get with the correct parameters', function (done) {
          AuthorizationHandler.post(req, res).then(() => {
            expect(DeveloperHandler.get).toHaveBeenCalledWith({
              query: {
                username,
                token: '!'
              }
            })
            done()
          })
          .catch((err) => {
            done.fail(err)
          })
        })
        it('should call DeveloperHandler.post with the correct parameters', function (done) {
          AuthorizationHandler.post(req, res).then(() => {
            expect(DeveloperHandler.post).toHaveBeenCalledWith({
              body: {
                developer: {
                  username,
                  token: jasmine.any(String)
                }
              }
            })
            done()
          })
          .catch((err) => {
            done.fail(err)
          })
        })
      })
      describe('DeveloperHandler.post rejects', function () {
        beforeEach(function () {
          destroyed = false
          spyOn(DeveloperHandler, 'get').and.callFake((request) => {
            return Promise.resolve('!')
          })
          spyOn(DeveloperHandler, 'post').and.callFake((request) => {
            return Promise.reject('Error')
          })
        })
        it('should destroy the session', function (done) {
          AuthorizationHandler.post(req, res)
          .then((err) => {
            done.fail(err)
          })
          .catch(() => {
            expect(destroyed).toBeTruthy()
            done()
          })
        })
        it('should called res.send with the correct parameters', function (done) {
          AuthorizationHandler.post(req, res)
          .then((err) => {
            done.fail(err)
          })
          .catch(() => {
            expect(res.send).toHaveBeenCalledWith({redirect: '/#/auth/denied?reason=7', error: 'Error'})
            done()
          })
        })
        it('should called reject with the correct result', function (done) {
          AuthorizationHandler.post(req, res)
          .then((err) => {
            done.fail(err)
          })
          .catch((result) => {
            expect(result).toEqual({redirect: '/#/auth/denied?reason=7', error: 'Error'})
            done()
          })
        })
      })
    })
    describe('Session is not expired, DeveloperHandler.get rejects', function () {
      let username = 'pastorsj'
      beforeEach(function () {
        spyOn(DeveloperHandler, 'get').and.callFake((request) => {
          return Promise.reject('Error')
        })
        req = jasmine.createSpyObj('req', ['session'])
        req.session.user = username
        req.session = {
          user: username,
          destroy: function () {
            destroyed = true
          }
        }
        res = jasmine.createSpyObj('res', ['send', 'end'])
      })
      it('should destroy the session', function (done) {
        AuthorizationHandler.post(req, res)
        .then((err) => {
          done.fail(err)
        })
        .catch((result) => {
          expect(destroyed).toBeTruthy()
          done()
        })
      })
      it('should set the res.send parameters correctly', function (done) {
        AuthorizationHandler.post(req, res)
        .then((err) => {
          done.fail(err)
        })
        .catch((result) => {
          expect(res.send).toHaveBeenCalledWith({redirect: '/#/auth/denied?reason=4'})
          done()
        })
      })
      it('should set the res.send parameters correctly', function (done) {
        AuthorizationHandler.post(req, res)
        .then((err) => {
          done.fail(err)
        })
        .catch((result) => {
          expect(result).toEqual({redirect: '/#/auth/denied?reason=4'})
          done()
        })
      })
    })
  })

  describe('getCallback', function () {
    beforeEach(function () {
      destroyed = false
      jasmine.createSpyObj('req', ['query', 'session'])
      req = {
        query: {
          code: '123456'
        },
        session: {
          destroy: function () {
            destroyed = true
          },
          user: ''
        }
      }
      res = jasmine.createSpyObj('res', ['redirect', 'end'])
      spyOn(AuthorizationHandler.OAuth2, 'getOAuthAccessToken').and.callFake((code, obj, cb) => {
        cb(null, '123456789', '987654321')
      })
    })
    describe('github.users.get does not error out', function () {
      beforeEach(function () {
        spyOn(AuthorizationHandler.github, 'authenticate')
        spyOn(AuthorizationHandler.github.users, 'get').and.callFake((obj, cb) => {
          cb(null, {
            login: 'pastorsj',
            'created_at': '0'
          })
        })
        spyOn(githubAPI, 'verify')
        AuthorizationHandler.getCallback(req, res)
      })
      it('should get the oauth token with the correct parameters', function () {
        expect(AuthorizationHandler.OAuth2.getOAuthAccessToken)
          .toHaveBeenCalledWith('123456', {}, jasmine.any(Function))
      })
      it('should call authenticate with the correct parameters', function () {
        expect(AuthorizationHandler.github.authenticate).toHaveBeenCalledWith({
          type: 'oauth',
          token: '123456789'
        })
      })
      it('should call get with the correct parameters', function () {
        expect(AuthorizationHandler.github.users.get).toHaveBeenCalledWith({}, jasmine.any(Function))
      })
      it('should call verify', function () {
        expect(githubAPI.verify).toHaveBeenCalled()
      })
      it('should set the username to be result.login', function () {
        expect(req.session.user).toEqual('pastorsj')
      })
    })
    describe('redirection occurs since users account is less than six months old', function () {
      beforeEach(function () {
        spyOn(AuthorizationHandler.github, 'authenticate')
        spyOn(AuthorizationHandler.github.users, 'get').and.callFake((obj, cb) => {
          cb(null, {
            login: 'pastorsj',
            'created_at': '3000 06 12'
          })
        })
        destroyed = false
        AuthorizationHandler.getCallback(req, res)
      })
      it('should destroy the session', function () {
        expect(destroyed).toBeTruthy()
      })
      it('should redirect to the denied page with reason = 1', function () {
        expect(res.redirect).toHaveBeenCalledWith('/#/auth/denied?reason=1')
      })
    })
    describe('github.users.get errors out', function () {
      beforeEach(function () {
        spyOn(AuthorizationHandler.github, 'authenticate')
        spyOn(AuthorizationHandler.github.users, 'get').and.callFake((obj, cb) => {
          cb('Error', {
            'created_at': '0'
          })
        })
        spyOn(githubAPI, 'verify')
        AuthorizationHandler.getCallback(req, res)
      })
      it('should redirect to the denied access page with reason = 8', function () {
        expect(res.redirect).toHaveBeenCalledWith('/#/auth/denied?reason=8')
      })
    })
  })
})
