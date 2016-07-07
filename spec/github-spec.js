const numReposDB1 = require('./mocks/checkNumberRepos.1')
const numReposDB2 = require('./mocks/checkNumberRepos.2')
const repoPagesDB = require('./mocks/getPageOfRepos')
const repoDB1 = require('./mocks/getRepoByID.1')
const repoDB2 = require('./mocks/getRepoByID.2')
const GitHub_Handler = require('../handlers/github_api_handler')
const GitHubAPI = require('github')

const github = new GitHubAPI()

describe('Github API Testing', function () {
  let redirectLocation, response
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
    redirectLocation = ''
    response = {
      redirect: function (location) {
        redirectLocation = location
      }
    }
  })
  describe('getRepoByID()', function () {
    // result = getRepoByID
    // repo_information = getPageOfRepos
    describe('owned by user', function () {
      it('should return that the repo is owned by the user', function () {
        GitHub_Handler.getRepoByID(github, repoPagesDB[0], 'pastorsj').then((res) => {
          expect(res.id).toBe(repoDB1.id)
          expect(res.isPublic).toEqual(false)
        })
      })
    })

    it('should return that the repo is not owned by the user', function () {
      GitHub_Handler.getRepoByID(github, repoPagesDB[2], 'pastorsj').then((res) => {
        expect(res.id).toBe(repoDB2.id)
        expect(res.isPublic).toEqual(true)
      })
    })
  })

  describe('getPageOfRepos()', function () {
    it('should call getEventsForUserPublic() once', function () {
      GitHub_Handler.getPageOfRepos(github, 'pastorsj', 0, 0).then((res) => {
        expect(github.activity.getEventsForUserPublic.callCount).toEqual(1)
      })
    })

    it('should call getById() once', function () {
      GitHub_Handler.getPageOfRepos(github, 'pastorsj', 0, 0).then((res) => {
        expect(github.activity.getById.callCount).toEqual(1)
      })
    })

    it('should return 1 repository not owned by the user', function () {
      GitHub_Handler.getPageOfRepos(github, 'pastorsj', 0, 0).then((res) => {
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
      it('should redirect to the denied page', function () {
        GitHub_Handler.checkNumberRepos(github, response)
        expect(redirectLocation).toEqual('/#/auth/denied')
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

      it('should redirect to the contract page', function () {
        GitHub_Handler.checkNumberRepos(github, response)
        expect(redirectLocation).toEqual('/#/auth/contract')
      })
    })
  })

  describe('verify()', function () {
    beforeEach(function () {
      spyOn(GitHub_Handler, 'getPageOfRepos')
      spyOn(GitHub_Handler, 'checkNumberRepos')
    })
    it('should call getPageOfRepos three times', function () {
      GitHub_Handler.verify(github, response, 'pastorsj', 0)
      expect(GitHub_Handler.getPageOfRepos.calls.count()).toEqual(3)
    })
  })
})
