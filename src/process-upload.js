'use strict'

const childProcess = require('child_process')
const debug = require('debug')('server')
const path = require('path')
const fs = require('fs')
const http = require('http')

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

function checkServer (serversAvailible, server) {
  return new Promise((resolve, reject) => {
    let splitServer = server.split(':')
    http.get({
      host: splitServer[0],
      port: splitServer[1] || '3000'
    }, (res) => {
      resolve(-1)
    }).on('error', (e) => {
      resolve(serversAvailible.indexOf(server))
    })
  })
}

function checkServerAvailibility () {
  let servers = []
  try {
    servers = JSON.parse(fs.readFileSync(path.join(__dirname, 'servers.json'))).potentialServers
  } catch (e) {
    throw new Error(e)
  }
  let serversAvailible = servers
  let pset = []
  servers.forEach((server) => {
    pset.push(checkServer(serversAvailible, server))
  })
  return serversAvailible
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

  console.log('Checking avail')
  let servers = checkServerAvailibility()
  console.log('Servers availible', servers)
  const child = childProcess.spawn('bash', [this.scriptPath, filename, entryPoint, seconds, testsFolder])
  watchChild(child, seconds)
  res.send(seconds.toString())
  res.end()
}

module.exports = ns
