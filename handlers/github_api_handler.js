function getRepoByID (github, event, user) {
  return new Promise((resolve, reject) => {
    github.repos.getById({
      id: event.repo.id
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
}

function removeDuplicates (repoSet) {
  return Array.from(new Set(repoSet))
}

function getPageOfRepos (github, user, i, sixMonthsAgo) {
  return new Promise((resolve, reject) => {
    let pset = []
    github.activity.getEventsForUserPublic({
      user,
      page: i,
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
            pset.push(getRepoByID(github, event, user))
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
}

function checkNumberRepos (github, res) {
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
}

const Verify = function (github, res, user, sixMonthsAgo) {
  const pages = 3
  let eventPSet = []
  for (let i = 0; i < pages; i++) {
    eventPSet.push(getPageOfRepos(github, user, i, sixMonthsAgo))
  }
  Promise.all(eventPSet).then((values) => {
    let total = 0
    values.forEach((element) => {
      total += element.total
    })
    if (total < 2) {
      res.redirect('/#/auth/denied')
    } else {
      checkNumberRepos(github, res)
    }
  })
}

module.exports = Verify
