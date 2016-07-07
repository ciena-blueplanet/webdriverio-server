const fs = require('fs')
const GitHub_Handler = {
  /**
   * Gets a repository on github by its id and checks if the owner
   * of the repo is the current user
   * @param {Object} github - Allows for API calls to be made to the github api server
   * @param {Object} repo_information - The returned object containing information on repositories contributed to by the user
   * @param {String} user - The owner of the account to be validated
   * @returns {Promise} Either returns that the repository is owned by the user or not
   */
  getRepoByID: function (github, repo_information, user) {
    return new Promise((resolve, reject) => {
      github.repos.getById({
        id: repo_information.repo.id
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
   * @param {Number} sixMonthsAgo - The current time minus 6 months
   * @returns {Promise} Returns the number of repos that are not owned by the user and are unique
   */
  getPageOfRepos: function (github, user, pageNumber, sixMonthsAgo) {
    return new Promise((resolve, reject) => {
      let pset = []
      github.activity.getEventsForUserPublic({
        user,
        page: pageNumber,
        per_page: 100
      }, (err, result) => {
        if (err) {
          throw err
        }
        let repoEvent = ''
        result.forEach((event) => {
          repoEvent = new Date(event.created_at)
          if (sixMonthsAgo.getTime() < repoEvent.getTime()) {
            if (event.type === 'PullRequestEvent') {
              pset.push(GitHub_Handler.getRepoByID(github, event, user))
            }
          }
        })
        Promise.all(pset).then((values) => {
          let numRepos = 0
          values = removeDuplicates(values)
          values.forEach((element) => {
            if (element.isPublic) {
              numRepos++
            }
          })
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
   * page or a contract/success page
   */
  checkNumberRepos: function (github, res) {
    github.repos.getAll({
    }, (err, result) => {
      if (err) {
        throw err
      }
      let total = 0
      result.forEach((repo) => {
        if (!repo.fork) {
          total++
        }
      })
      if (total < 2) {
        res.redirect('/#/auth/denied')
      } else {
        res.redirect('/#/auth/contract')
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
   * @param {Number} sixMonthsAgo - The current time minus 6 months
   */
  verify: function (github, res, user, sixMonthsAgo) {
    const pages = 3
    let eventPSet = []
    for (let i = 0; i < pages; i++) {
      eventPSet.push(GitHub_Handler.getPageOfRepos(github, user, i, sixMonthsAgo))
    }
    Promise.all(eventPSet).then((values) => {
      let total = 0
      values.forEach((element) => {
        total += element.total
      })
      if (total < 2) {
        res.redirect('/#/auth/denied')
      } else {
        GitHub_Handler.checkNumberRepos(github, res)
      }
    })
  }
}

/**
 * Removes duplicate items (repositories) from an array by creating a set from the array
 * and then converting it back into an array. (Since sets can't contain duplicates)
 * @param {Array} repoSet - A set of objects containing repository information
 * @returns {Array} A unique set of objects containing repository information
 */
function removeDuplicates (repoSet) {
  return Array.from(new Set(repoSet))
}

module.exports = GitHub_Handler
