/* eslint-disable max-nested-callbacks */

'use strict'
const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const processUpload = require('../src/process-upload')

describe('process-upload', function () {
  var child
  beforeEach(function () {
    child = {
      on: jasmine.createSpy('child.on'),
      stdout: jasmine.createSpyObj('child.stdout', ['on']),
      stderr: jasmine.createSpyObj('child.stderr', ['on'])
    }
    spyOn(childProcess, 'spawn').and.returnValue(child)
    spyOn(console, 'log')
    spyOn(fs, 'existsSync').and.returnValue(true)
  })

  describe('.newFile()', function () {
    var res, seconds
    beforeEach(function () {
      res = jasmine.createSpyObj('res', ['send', 'end'])
      seconds = Math.floor(new Date().getTime() / 1000)
      processUpload.newFile('filename', 'entry-point', '.', res)
    })

    it('spawns a new process', function () {
      expect(childProcess.spawn).toHaveBeenCalledWith('bash', [
        processUpload.scriptPath,
        'filename',
        'entry-point',
        seconds,
        '.'
      ])
    })

    it('listens for data on stdout', function () {
      expect(child.stdout.on).toHaveBeenCalledWith('data', jasmine.any(Function))
    })

    it('listens for data on stderr', function () {
      expect(child.stderr.on).toHaveBeenCalledWith('data', jasmine.any(Function))
    })

    it('listens for exit of child', function () {
      expect(child.on).toHaveBeenCalledWith('exit', jasmine.any(Function))
    })

    it('sends response back', function () {
      expect(res.send).toHaveBeenCalledWith(seconds.toString())
    })

    it('ends the response', function () {
      expect(res.end).toHaveBeenCalled()
    })

    describe('when child exits', function () {
      beforeEach(function () {
        spyOn(fs, 'writeFile')
        child.stdout.on.calls.argsFor(0)[1]('some-stdout-data')
        child.stderr.on.calls.argsFor(0)[1]('some-stderr-data')
        child.on.calls.argsFor(0)[1](13)
      })

      it('writes a file', function () {
        expect(fs.writeFile).toHaveBeenCalledWith(
          path.join(__dirname, '../screenshots/output-' + seconds + '-..json'),
          JSON.stringify({
            exitCode: 13,
            info: 'some-stdout-datasome-stderr-data',
            output: 'screenshots/' + seconds + '-..tar'
          }),
          jasmine.any(Function)
        )
      })
    })
  })
})
