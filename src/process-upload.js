'use strict'

const childProcess = require('child_process')
const debug = require('debug')('server')
const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const DeveloperHandler = require('../handlers/developers-handler.js')

const ns = {
  scriptPath: path.join(__dirname, './exec.sh')
}

var strip = function (data) {
  return data.toString().replace(/(\r\n|\n|\r)/gm, '')
}

/**
 * Collect information from the child process
 * @param {Child} child - child process
 * @param {Number} seconds - timestamp when process started
 */
const watchChild = function (child, seconds) {
  const info = []

  child.stdout.on('data', function (data) {
    if (data) {
      debug(seconds + ': ' + info.length + ':' + strip(data))
      info.push(data)
    }
  })

  child.stderr.on('data', function (data) {
    if (data) {
      debug(seconds + ': ' + info.length + ':' + strip(data))
      info.push(data)
    }
  })

  // TODO: setTimeout to delete the screenshots file in 30s
  child.on('exit', function (code) {
    debug('closing code: ' + code)
    debug('Returning ' + info.length + ' lines of output')
    var output = {
      exitCode: code,
      info: info.join(''),
      output: 'screenshots/' + seconds + '.tar'
    }

    try {
      output = JSON.stringify(output)
    } catch (e) {
      debug('ERROR: ', e)
      output = {
        exitCode: code,
        info: e.toString(),
        output: 'screenshots/' + seconds + '.tar'
      }

      try {
        output = JSON.stringify(output)
      } catch (e) {
        output = 'ERROR'
      }
    }

    var filename = path.join(__dirname, '../screenshots/output-' + seconds + '.json')
    fs.writeFile(filename, output, function (err) {
      if (err) {
        debug(seconds + ' : UNABLE TO WRITE FILE ' + filename + ' -- ' + err.toString())
      } else {
        debug(seconds + ' : ' + filename + ' saved')
      }
    })
  })
}

/**
 * We have received a request to process a new file
 * spawn a shell process to do all the operations and
 * watch the output of that process. Then bundle up a json
 * response for the requester.
 * @param {String} filename - the name of the tar file that was uploaded
 * @param {String} entryPoint - the URL to start testing
 * @param {String} testsFolder - the path to the tests folder (tests/e2e)
 * @param {Response} res - the express response object
 */
ns.newFile = function (filename, entryPoint, testsFolder, res) {
  const seconds = Math.floor(new Date().getTime() / 1000)
  debug('START: ------------ ' + seconds)
  let stats = _.sortBy(getStatsofDirectoriesAndFolders(path.join(__dirname, '..')), (file) => {
    const time = new Date(file.birthtime)
    return time.getTime()
  })
  const dir = stats[stats.length - 1].fileName
  const configFile = JSON.parse(fs.readFileSync(path.join(dir, 'tests', 'e2e/config.json')))
  if (!configFile || !configFile.username || !configFile.token) {
    debug(`You must provided a config file in the tests/e2e directory containing
           your testing token and username.\nIf this is the first time you have seen this message,
           you need to sign up to become an authorized Ciena developer to\n be able to submit tests
           to this server. Please visit http://wdio.bp.cyaninc.com to sign up`)
    res.end()
  } else {
    const request = {
      query: {
        username: configFile.username,
        token: configFile.token
      }
    }
    DeveloperHandler.get(request, null).then((redisResponse) => {
      console.log(redisResponse)
      console.log('You have been verified as a authorized Ciena Developer. Welcome back!')
      const child = childProcess.spawn('bash', [this.scriptPath, filename, entryPoint, seconds, testsFolder])
      watchChild(child, seconds)
      res.send(seconds.toString())
      res.end()
    }).catch((err) => {
      if (err) {
        console.log('Error ' + err)
        debug(`The config.json file you provided has the wrong username or token.
              Please fix the issue and resubmit your tests.`)
        res.send(seconds.toString())
        res.end()
      }
    })
  }
}

var getStatsofDirectoriesAndFolders = function (dir) {
  let results = []
  fs.readdirSync(dir).forEach(function (file) {
    let stat = fs.statSync(dir + '/' + file)
    stat.fileName = file
    results.push(stat)
  })
  return results
}

module.exports = ns
