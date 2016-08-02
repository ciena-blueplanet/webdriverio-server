'use strict'

const childProcess = require('child_process')
const debug = require('debug')('server')
const path = require('path')
const fs = require('fs')
const webdriverioTester = require('./webdriverioTester')

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
 * @param {String} test - the current test being run
 */
const watchChild = function (child, seconds, test) {
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
      output: 'screenshots/' + seconds + '-' + test + '.tar'
    }

    try {
      output = JSON.stringify(output)
    } catch (e) {
      debug('ERROR: ', e)
      output = {
        exitCode: code,
        info: e.toString(),
        output: 'screenshots/' + seconds + '-' + test + '.tar'
      }

      try {
        output = JSON.stringify(output)
      } catch (e) {
        output = 'ERROR'
      }
    }

    var filename = path.join(__dirname, '../screenshots/output-' + seconds + '-' + test + '.json')
    fs.writeFile(filename, output, function (err) {
      if (err) {
        debug(seconds + ' : UNABLE TO WRITE FILE ' + filename + ' -- ' + err.toString())
      } else {
        debug(seconds + ' : ' + filename + ' saved')
      }
    })
  })
}

function serverIsMaster () {
  return true
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

  if (serverIsMaster()) {
    webdriverioTester.init()
    webdriverioTester.execute(filename, entryPoint, seconds, testsFolder).then((timestamp) => {
      console.log('Timestamp returned: ' + timestamp.toString())
      res.send(timestamp.toString())
      res.end()
    })
  } else {
    const child = childProcess.spawn('bash', [this.scriptPath, filename, entryPoint, seconds, testsFolder])
    watchChild(child, seconds, testsFolder)
    res.send(seconds.toString())
    res.end()
  }
}

module.exports = ns
