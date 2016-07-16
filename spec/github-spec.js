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
  let response
  beforeEach(function () {
    spyOn(github.activity, 'getEventsForUserPublic').and.callFake(
      function (obj, cb) {
        cb(null, repoPagesDB)
      }
    )
    spyOn(github.repos, 'getById').and.callFake(
      function (id, cb) {
        if (id === repoDB1.id) {
          cb(null, repoDB1)
        } else if (id === repoDB2.id) {
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
  })
  it('should removed duplicates', function () {
    const res = githubAPI.removeDuplicates([{username: 'test'}, {username: 'test'}])
    expect(res.length).toEqual(1)
  })
  describe('getRepoByID()', function () {
    describe('owned by user', function () {
      it('should return that the repo is owned by the user', function () {
        githubAPI.getRepoByID(github, repoPagesDB[0], 'pastorsj').then((res) => {
          expect(res.id).toBe(repoDB1.id)
          expect(res.isPublic).toEqual(false)
        })
      })
    })

    it('should return that the repo is not owned by the user', function () {
      githubAPI.getRepoByID(github, repoPagesDB[2], 'pastorsj').then((res) => {
        expect(res.id).toBe(repoDB2.id)
        expect(res.isPublic).toEqual(true)
      })
    })
  })

  describe('getPageOfRepos()', function () {
    it('should call getEventsForUserPublic() once', function () {
      githubAPI.getPageOfRepos(github, 'pastorsj', 0, 0).then((res) => {
        expect(github.activity.getEventsForUserPublic.callCount).toEqual(1)
      })
    })

    it('should call getById() once', function () {
      githubAPI.getPageOfRepos(github, 'pastorsj', 0, 0).then((res) => {
        expect(github.activity.getById.callCount).toEqual(1)
      })
    })

    it('should return 1 repository not owned by the user', function () {
      githubAPI.getPageOfRepos(github, 'pastorsj', 0, 0).then((res) => {
        expect(res.total).toEqual(1)
      })
    })

    it('should get through the Promise.all', function () {
      spyOn(githubAPI, 'getRepoByID').and.callFake(
        function () {
          return Promise.resolve([
            {
              id: repoDB1.id,
              isPublic: true
            },
            {
              id: repoDB2.id,
              isPublic: false
            }
          ])
        }
      )
      githubAPI.getPageOfRepos(github, 'pastorsj', 0, 0).then((res) => {
        expect(res.total).toEqual(1)
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
        githubAPI.checkNumberRepos(github, response)
          .then((location) => {
            expect(location).toEqual('/#/auth/denied?reason=2')
            done()
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
        spyOn(DeveloperHandler, 'post').and.callFake(function (req) {
          return Promise.resolve()
        })
      })

      it('should redirect to the contract page', function (done) {
        githubAPI.checkNumberRepos(github, response, 'pastorsj').then((location) => {
          expect(location).toEqual('/#/auth/contract?username=pastorsj')
          done()
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
      githubAPI.verify(github, response, 'pastorsj', 0).then(() => {
        done()
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
