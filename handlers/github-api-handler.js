'use strict'
const _ = require('lodash')
const DeveloperHandler = require('./developers-handler')

// This is the maximum number of account events that can be returned from a single query to the GitHub API
const MAX_EVENTS = 100
const REPOS_CONTRIBUTED_TO = 2
const REPOS_OWNED = 2
const PAGES_TO_QUERY = 3
const NOT_ENOUGH_PERSONAL_REPOS = 2
const NOT_ENOUGH_PUBLIC_REPOS = 3
const githubAPI = {
  /**
   * Removes duplicate items (repositories) from an array by creating a set from the array
   * and then converting it back into an array. (Since sets can't contain duplicates)
   * @param {Array} repoSet - A set of objects containing repository information
   * @returns {Array} A unique set of objects containing repository information
   */
  removeDuplicates: function (repoSet) {
    return _.uniqWith(repoSet, _.isEqual)
  },
  /**
   * Gets a repository on github by its id and checks if the owner
   * of the repo is the current user
   * @param {Object} github - Allows for API calls to be made to the github api server
   * @param {Object} repoInformation - The returned object containing information on repositories contributed to by the user
   * @param {String} user - The owner of the account to be validated
   * @returns {Promise} Either returns that the repository is owned by the user or not
   */
  getRepoByID: function (github, repoInformation, user) {
    return new Promise((resolve, reject) => {
      github.repos.getById({
        id: repoInformation.repo.id
      }, (err, result) => {
        if (err) {
          throw err
        }
        if (result.owner.login !== user) {
          resolve({
            id: result.id,
            isPublic: true
          })
        } else {
          resolve({
            id: result.id,
            isPublic: false
          })
        }
      })
    })
  },
  /**
   * Gets a page of GitHub account events, each page containing 100 events, which can be
   * push events, pull request events, issue events etc...
   * @param {Object} github - Allows for API calls to be made to the github api server
   * @param {String} user - The owner of the account to be validated
   * @param {Number} pageNumber - The page number of account events
   * @param {Number} reviewStartTime - The current time minus 6 months, for now
   * @returns {Promise} Returns the number of repos that are not owned by the user and are unique
   */
  getPageOfRepos: function (github, user, pageNumber, reviewStartTime) {
    return new Promise((resolve, reject) => {
      let pset = []
      github.activity.getEventsForUserPublic({
        user,
        page: pageNumber,
        'per_page': MAX_EVENTS
      }, (err, result) => {
        if (err) {
          throw err
        }
        let repoEvent = ''
        result.forEach((event) => {
          repoEvent = new Date(event.created_at)
          if (reviewStartTime.getTime() < repoEvent.getTime()) {
            if (event.type === 'PullRequestEvent') {
              pset.push(githubAPI.getRepoByID(github, event, user))
            }
          }
        })
        Promise.all(pset).then((values) => {
          values = githubAPI.removeDuplicates(values)
          let numRepos = _.reduce(values, (sum, repo) => {
            if (repo.isPublic) {
              return ++sum
            }
            return sum
          }, 0)
          resolve({
            total: numRepos
          })
        })
      })
    })
  },
  /**
   * Makes sure that the user has at at least two personal repositories
   * @param {Object} github - Allows for API calls to be made to the github api server
   * @param {Object} res - The result object, allowing either the user to be redirected to a denied access
   * @param {String} user - The username of the account being analysed
   * page or a contract/success page
   */
  checkNumberRepos: function (github, res, user) {
    github.repos.getAll({
    }, (err, result) => {
      if (err) {
        throw err
      }
      let total = _.reduce(result, (sum, repo) => {
        if (!repo.fork) {
          return ++sum
        }
        return sum
      }, 0)
      if (total < REPOS_OWNED) {
        res.redirect('/#/auth/denied?reason=' + NOT_ENOUGH_PERSONAL_REPOS)
      } else {
        const req = {
          body: {
            developer: {
              username: user,
              token: '!'
            }
          }
        }
        DeveloperHandler.post(req).then(() => {
          res.redirect('/#/auth/contract?username=' + user)
        })
      }
    })
  },
  /**
   * Checks whether a user has contributed to at least two repositories in the last
   * six months
   * @param {Object} github - Allows for API calls to be made to the github api server
   * @param {Object} res - The result object, allowing either the user to be redirected to a denied access
   * page or a contract/success page
   * @param {String} user - The owner of the account being validated
   * @param {Number} reviewStartTime - The current time minus 6 months, for now
   * @returns {Promise} - The set of promises containing the results of the query for pages of repos
   */
  verify: function (github, res, user, reviewStartTime) {
    const pages = PAGES_TO_QUERY
    let eventPSet = []
    for (let i = 0; i < pages; i++) {
      eventPSet.push(githubAPI.getPageOfRepos(github, user, i, reviewStartTime))
    }
    return Promise.all(eventPSet).then((values) => {
      let total = _.reduce(values, (sum, n) => {
        return sum + n.total
      }, 0)
      if (total < REPOS_CONTRIBUTED_TO) {
        res.redirect('/#/auth/denied?reason=' + NOT_ENOUGH_PUBLIC_REPOS)
      } else {
        githubAPI.checkNumberRepos(github, res, user)
      }
    })
  }
}

module.exports = githubAPI
