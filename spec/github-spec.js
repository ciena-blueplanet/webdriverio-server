'use strict'
const numReposDB1 = require('./mocks/checkNumberRepos.1')
const numReposDB2 = require('./mocks/checkNumberRepos.2')
const repoPagesDB = require('./mocks/getPageOfRepos')
const repoDB1 = require('./mocks/getRepoByID.1')
const repoDB2 = require('./mocks/getRepoByID.2')
const githubAPI = require('../handlers/github-api-handler')
const DeveloperHandler = require('../handlers/developers-handler')
const GitHubAPI = require('github')

const github = new GitHubAPI()

describe('Github API Testing', function () {
  let response, req
  beforeEach(function () {
    spyOn(github.activity, 'getEventsForUserPublic').and.callFake(
      function (obj, cb) {
        cb(null, repoPagesDB)
      }
    )
    spyOn(github.repos, 'getById').and.callFake(
      function (params, cb) {
        if (params.id === repoDB1.id) {
          cb(null, repoDB1)
        } else if (params.id === repoDB2.id) {
          cb(null, repoDB2)
        } else {
          cb('Error, ID does not match', null)
        }
      }
    )
    response = {
      redirect: function (location) {
      }
    }
    req = {
      session: {
        destroy: function () {}
      }
    }
  })
  it('should removed duplicates', function () {
    const res = githubAPI.removeDuplicates([{username: 'test'}, {username: 'test'}])
    expect(res.length).toEqual(1)
  })
  describe('getRepoByID()', function () {
    describe('owned by user', function () {
      it('should return that the repo is owned by the user', function (done) {
        githubAPI.getRepoByID(github, repoPagesDB[0], 'pastorsj')
        .then((res) => {
          expect(res.id).toBe(repoDB1.id)
          expect(res.isPublic).toEqual(false)
          done()
        })
        .catch((err) => {
          done.fail(err)
        })
      })
    })

    it('should return that the repo is not owned by the user', function (done) {
      githubAPI.getRepoByID(github, repoPagesDB[2], 'pastorsj')
      .then((res) => {
        expect(res.id).toBe(repoDB2.id)
        expect(res.isPublic).toEqual(true)
        done()
      })
      .catch((err) => {
        done.fail(err)
      })
    })
  })

  describe('getPageOfRepos()', function () {
    it('should call getEventsForUserPublic() once', function (done) {
      githubAPI.getPageOfRepos(github, 'pastorsj', 0, new Date(0))
      .then((res) => {
        expect(github.activity.getEventsForUserPublic.calls.count()).toEqual(1)
        done()
      })
      .catch((err) => {
        done.fail(err)
      })
    })

    it('should call getById() once', function (done) {
      githubAPI.getPageOfRepos(github, 'pastorsj', 0, new Date(0))
      .then((res) => {
        expect(github.repos.getById.calls.count()).toEqual(1)
        done()
      })
      .catch((err) => {
        done.fail(err)
      })
    })

    it('should return 1 repository not owned by the user', function (done) {
      githubAPI.getPageOfRepos(github, 'pastorsj', 0, new Date(0))
      .then((res) => {
        expect(res.total).toEqual(1)
        done()
      })
      .catch((err) => {
        done.fail(err)
      })
    })

    it('should get through the Promise.all', function (done) {
      spyOn(githubAPI, 'getRepoByID').and.callFake(
        function () {
          return Promise.resolve(
            {
              id: repoDB1.id,
              isPublic: true
            }
          )
        }
      )
      githubAPI.getPageOfRepos(github, 'pastorsj', 0, new Date(0))
      .then((res) => {
        expect(res.total).toEqual(1)
        done()
      })
      .catch((err) => {
        done.fail(err)
      })
    })
  })

  describe('checkNumberRepos()', function () {
    describe('denied redirection', function () {
      beforeEach(function () {
        spyOn(github.repos, 'getAll').and.callFake(
          function (obj, cb) {
            cb(null, numReposDB1)
          }
        )
      })
      it('should redirect to the denied page', function (done) {
        githubAPI.checkNumberRepos(github, response, 'pastorsj', req)
          .then((location) => {
            expect(location).toEqual('/#/auth/denied?reason=2')
            done()
          })
          .catch((err) => {
            done.fail(err)
          })
      })
    })

    describe('accepted redirection', function () {
      beforeEach(function () {
        spyOn(github.repos, 'getAll').and.callFake(
          function (obj, cb) {
            cb(null, numReposDB2)
          }
        )
      })
      describe('Redirect to denied access', function () {
        it('should deny access with reason 4', function (done) {
          spyOn(DeveloperHandler, 'get').and.callFake(function (request) {
            return Promise.resolve('')
          })
          githubAPI.checkNumberRepos(github, response, 'pastorsj', req)
          .then((location) => {
            expect(location).toEqual('/#/auth/denied?reason=4')
            done()
          })
          .catch((err) => {
            done.fail(err)
          })
        })

        it('should deny access with reason 0', function (done) {
          spyOn(DeveloperHandler, 'get').and.callFake(function (request) {
            return Promise.resolve('some value')
          })
          githubAPI.checkNumberRepos(github, response, 'pastorsj', req)
          .then((location) => {
            expect(location).toEqual('/#/auth/denied?reason=0')
            done()
          })
          .catch((err) => {
            done.fail(err)
          })
        })
      })
      describe('User does not exist', function () {
        beforeEach(function () {
          spyOn(DeveloperHandler, 'get').and.callFake(function (request) {
            return Promise.reject('This username does not exist: pastorsj')
          })
        })
        // TODO: What happened here?
        it('should redirect to the contract page', function (done) {
          spyOn(DeveloperHandler, 'post').and.callFake(function (request) {
            return Promise.resolve()
          })
          githubAPI.checkNumberRepos(github, response, 'pastorsj', req)
          .then((location) => {
            expect(location).toEqual('/#/auth/contract')
            done()
          })
          .catch((err) => {
            done.fail(err)
          })
        })

        it('should not redirect to the contract page', function (done) {
          spyOn(DeveloperHandler, 'post').and.callFake(function (request) {
            return Promise.reject('Error')
          })
          githubAPI.checkNumberRepos(github, response, 'pastorsj', req)
          .then((location) => {
            expect(location).toEqual('/#/auth/denied?reason=7')
            done()
          })
          .catch((err) => {
            done.fail(err)
          })
        })
      })
    })
  })

  describe('verify()', function () {
    beforeEach(function (done) {
      spyOn(githubAPI, 'getPageOfRepos').and.callFake(
        function () {
          return Promise.resolve({
            total: 1
          })
        }
      )
      spyOn(githubAPI, 'checkNumberRepos').and.callFake(
        function () {
          return Promise.resolve()
        }
      )
      githubAPI.verify(github, response, 'pastorsj', 0)
      .then(() => {
        done()
      })
      .catch((err) => {
        done.fail(err)
      })
    })
    it('should call getPageOfRepos three times', function () {
      expect(githubAPI.getPageOfRepos.calls.count()).toEqual(3)
    })
    it('should call checkNumberRepos once', function () {
      expect(githubAPI.checkNumberRepos.calls.count()).toEqual(1)
    })
  })
})
