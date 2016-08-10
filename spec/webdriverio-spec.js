'use strict'

const wdioTester = require('../src/webdriverioTester')
const fs = require('fs-extra')
const path = require('path')

describe('WebDriverIO Testing Spec', function () {
  describe('init()', function () {
    let res
    beforeEach(function () {
      res = wdioTester.init()
    })
    it('should initialize this.exec', function () {
      expect(wdioTester.exec).toBeDefined()
    })
    it('should initialize running processes to a new map', function () {
      expect(wdioTester.runningProcesses).toEqual(new Map())
    })
    it('should return this', function () {
      expect(wdioTester).toEqual(res)
    })
  })
  describe('getExisting()', function () {
    let id, result
    beforeEach(function () {
      id = 1234
      wdioTester.runningProcesses = new Map()
      wdioTester.runningProcesses.set(id, [{
        server: 'localhost:3000',
        test: 'test-e2e',
        timestamp: '4350283445254',
        testComplete: false
      },
      {
        server: 'localhost:4000',
        test: 'test2-e2e',
        timestamp: '4350282343445254',
        testComplete: true
      }])
      spyOn(wdioTester, 'exec').and.callFake(function () {
        return Promise.resolve(['found'])
      })
      result = wdioTester.getExisting(id)
    })
    it('should run the exec command test twice', function () {
      expect(wdioTester.exec.calls.count()).toEqual(2)
    })
    it('should call the exec command with the correct curl commands', function () {
      let curl = 'curl -s localhost:3000/status/4350283445254-test-e2e'
      expect(wdioTester.exec.calls.first().args[0]).toEqual(curl)
      curl = 'curl -s localhost:4000/status/4350282343445254-test2-e2e'
      expect(wdioTester.exec.calls.mostRecent().args[0]).toEqual(curl)
    })
    it('should return that all the tests are complete', function (done) {
      result.then((res) => {
        expect(res).toBe(true)
        done()
      })
    })
  })
  describe('combineScreenshots()', function () {
    let timestamp, tarFiles
    beforeEach(function () {
      timestamp = '23098409'
      tarFiles = ['tmp/23098409-tests2-e2e.tar', 'tmp/23098409-tests-e2e.tar']
      spyOn(fs, 'ensureDirSync')
    })
    describe('First exec resolves, second exec resolves', function () {
      beforeEach(function () {
        spyOn(wdioTester, 'exec').and.callFake(function (cmd) {
          return Promise.resolve()
        })
      })
      it('should call the exec command with the correct curl commands', function (done) {
        wdioTester.combineScreenshots(tarFiles, '23098409').then(() => {
          expect(wdioTester.exec.calls.allArgs()).toEqual([
            [`bash ${path.join(__dirname, '../src', 'tarScreenshots.sh')} 23098409-tests2-e2e.tar ${timestamp} tests2-e2e`],
            [`bash ${path.join(__dirname, '../src', 'tarScreenshots.sh')} 23098409-tests-e2e.tar ${timestamp} tests-e2e`],
            [`tar -cf ${timestamp}.tar build-${timestamp}/screenshots/*`],
            [`mv ${timestamp}.tar screenshots/`]
          ])
          done()
        })
      })
    })
    describe('First exec fails', function () {
      beforeEach(function () {
        spyOn(wdioTester, 'exec').and.callFake(function (cmd) {
          return Promise.reject('Error')
        })
      })
      it('should reject with an error', function (done) {
        wdioTester.combineScreenshots(tarFiles, timestamp).then(() => {
          done.fail()
        })
        .catch((err) => {
          expect(err).toEqual('Error')
          done()
        })
      })
    })
    describe('First exec resolves, Second exec fails', function () {
      beforeEach(function () {
        spyOn(wdioTester, 'exec').and.callFake(function (cmd) {
          if (cmd.startsWith('tar')) {
            return Promise.resolve()
          } else if (cmd.startsWith('mv')) {
            return Promise.reject('Error2')
          }
        })
        it('should reject with an error', function (done) {
          wdioTester.combineScreenshots(tarFiles, timestamp).then(() => {
            done.fail()
          })
          .catch((err) => {
            expect(err).toEqual('Error2')
            done()
          })
        })
      })
    })
  })
  describe('combineResults()', function () {
    
  })
  describe('submitTarball()', function () {

  })
  describe('submitTarballs()', function () {

  })
  describe('getResults()', function () {

  })
  describe('getTarball()', function () {
    
  })
  describe('processResults()', function () {

  })
  describe('checkServer()', function () {

  })
  describe('checkServerAvailibility()', function () {

  })
  describe('getRandomServer()', function () {

  })
  describe('execute()', function () {

  })
})
