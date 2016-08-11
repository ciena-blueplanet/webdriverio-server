'use strict'

const wdioTester = require('../src/webdriverioTester')
const fs = require('fs-extra')
const path = require('path')
const childProcess = require('child_process')
const http = require('http')

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
            [`bash ${path.join(__dirname, '../src', 'tarScreenshots.sh')} 23098409-tests2-e2e.tar ${timestamp} tests2-e2e`], // eslint-disable-line max-len
            [`bash ${path.join(__dirname, '../src', 'tarScreenshots.sh')} 23098409-tests-e2e.tar ${timestamp} tests-e2e`], // eslint-disable-line max-len
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
      spyOn(wdioTester, 'processResults').and.callFake(function () {
        return Promise.resolve({
          exitCode: 1,
          output: 'build/1091842308410-homepage-e2e.tar',
          info: 'Information'
        })
      })
      spyOn(fs, 'writeFileSync')
      result = wdioTester.combineResults(id)
    })
    describe('combineScreenshots() resolves', function () {
      beforeEach(function () {
        spyOn(wdioTester, 'combineScreenshots').and.callFake(function () {
          return Promise.resolve()
        })
      })
      it('should call processResults() twice with the correct arguments', function (done) {
        result.then(() => {
          let res0 = wdioTester.runningProcesses.get(id)[0]
          let res1 = wdioTester.runningProcesses.get(id)[1]
          expect(wdioTester.processResults.calls.allArgs()).toEqual([
            [res0.timestamp, res0.server, res0.test],
            [res1.timestamp, res1.server, res1.test]
          ])
          done()
        })
        .catch((err) => {
          done.fail(err)
        })
      })
      it('should call combineScreenshots with the correct arguments', function (done) {
        result.then(() => {
          expect(wdioTester.combineScreenshots.calls.allArgs()).toEqual([
            [['build/1091842308410-homepage-e2e.tar', 'build/1091842308410-homepage-e2e.tar'], '1091842308410']
          ])
          done()
        })
        .catch((err) => {
          done.fail(err)
        })
      })
    })
  })
  describe('submitTarball()', function () {
    const tarball = 'test.tar'
    const server = 'localhost:3000'
    const test = 'test-e2e'
    const entryPoint = 'dist/'
    const timestamp1 = '4097509'
    describe('Child process returns an error', function () {
      beforeEach(function () {
        spyOn(childProcess, 'exec').and.callFake(function (cmd, cb) {
          cb('Error', null, null)
        })
      })
      it('should be rejected', function (done) {
        wdioTester.submitTarball(tarball, server, test, entryPoint, timestamp1).then((err) => {
          done.fail(err)
        })
        .catch((res) => {
          expect(res).toEqual('Error')
          done()
        })
      })
    })
    describe('should not fail with an error', function () {
      beforeEach(function () {
        spyOn(childProcess, 'exec').and.callFake(function (cmd, cb) {
          cb(null, '820398080', null)
        })
        wdioTester.runningProcesses.set(timestamp1, [
          'something'
        ])
      })
      afterEach(function () {
        wdioTester.runningProcesses = new Map()
      })
      it('should add the new running process to the map with the passed in timestamp', function (done) {
        wdioTester.submitTarball(tarball, server, test, entryPoint, timestamp1).then((timestamp) => {
          expect(wdioTester.runningProcesses.get(timestamp).length).toEqual(2)
          expect(wdioTester.runningProcesses.get(timestamp)[1].timestamp).toEqual('820398080')
          done()
        })
      })
      it('should return the same timestamp passed in', function (done) {
        wdioTester.submitTarball(tarball, server, test, entryPoint, timestamp1).then((timestamp) => {
          expect(timestamp).toEqual(timestamp1)
          done()
        })
      })
    })
  })
  describe('submitTarballs()', function () {
    const servers = ['localhost:3000', 'localhost:4000']
    const testsFolder = 'tests/e2e/'
    const entryPoint = 'dist/'
    const timestamp = '3120948'
    beforeEach(function () {
      spyOn(fs, 'statSync').and.callFake(function () {
        return {
          isFile: function () {
            return true
          }
        }
      })
      spyOn(fs, 'readdirSync').and.callFake(function () {
        return [
          'test1.tar',
          'test2.tar',
          'test3.tar'
        ]
      })
      spyOn(fs, 'rename')
      spyOn(wdioTester, 'submitTarball').and.callFake(function () {
        return Promise.resolve('82304982')
      })
      spyOn(wdioTester, 'getRandomServer').and.callFake(function () {
        return servers[0]
      })
    })
    it('should call getRandomServer() thrice with the correct arguments', function (done) {
      wdioTester.submitTarballs(entryPoint, timestamp, testsFolder, servers).then((timestampReturned) => {
        expect(wdioTester.getRandomServer.calls.allArgs()).toEqual([
          [servers], [servers], [servers]
        ])
        done()
      })
    })
    it('should return the correct timestamp', function (done) {
      wdioTester.submitTarballs(entryPoint, timestamp, testsFolder, servers).then((timestampReturned) => {
        expect(timestampReturned).toEqual(timestamp)
        done()
      })
    })
    it('should call submit tarballs thrice with the correct arguments', function (done) {
      wdioTester.submitTarballs(entryPoint, timestamp, testsFolder, servers).then((timestampReturned) => {
        expect(wdioTester.submitTarball.calls.allArgs()).toEqual([
          ['test1-3120948.tar', servers[0], 'test1', entryPoint, timestamp],
          ['test2-3120948.tar', servers[0], 'test2', entryPoint, timestamp],
          ['test3-3120948.tar', servers[0], 'test3', entryPoint, timestamp]
        ])
        done()
      })
    })
  })
  describe('getResults()', function () {
    beforeEach(function () {
      spyOn(wdioTester, 'exec').and.callFake(function () {
        return Promise.resolve(['{"args": "check"}'])
      })
      it('should return the correct object', function (done) {
        wdioTester.getResults('localhost:4000/status/30948092').then((obj) => {
          expect(obj).toEqual({args: 'check'})
          done()
        })
      })
      it('should call exec with the correct arguments', function (done) {
        wdioTester.getResults('localhost:4000/status/30948092').then((obj) => {
          expect(wdioTester.exec.calls.first().args).toEqual('curl -s localhost:4000/status/30948092')
          done()
        })
      })
    })
  })
  describe('getTarball()', function () {
    beforeEach(function () {
      spyOn(wdioTester, 'exec').and.callFake(function () {
        return Promise.resolve()
      })
    })
    it('should call exec with the correct arguments', function (done) {
      wdioTester.getTarball('localhost:4000/status/30948092').then(() => {
        expect(wdioTester.exec.calls.first().args).toEqual(['curl -s -O localhost:4000/status/30948092'])
        done()
      })
    })
  })
  describe('processResults()', function () {
    let timestamp = '102385'
    let server = 'localhost:3000'
    let testsDir = 'tmp/'
    beforeEach(function () {
      spyOn(wdioTester, 'getResults').and.callFake(function () {
        return Promise.resolve({
          output: 'output.tar'
        })
      })
      spyOn(wdioTester, 'getTarball').and.callFake(function () {
        return Promise.resolve()
      })
    })
    it('should resolve both times and return the results', function (done) {
      wdioTester.processResults(timestamp, server, testsDir).then((results) => {
        expect(results).toEqual({
          output: 'output.tar'
        })
        done()
      })
    })
    it('should call getResults() with the correct arguments', function (done) {
      const url = server + '/screenshots/output-' + timestamp + '-' + testsDir + '.json'
      wdioTester.processResults(timestamp, server, testsDir).then((results) => {
        expect(wdioTester.getResults).toHaveBeenCalledWith(url)
        done()
      })
    })
    it('should call getTarball() with the correct arguments', function (done) {
      const url = server + '/output.tar'
      wdioTester.processResults(timestamp, server, testsDir).then((results) => {
        expect(wdioTester.getTarball).toHaveBeenCalledWith(url)
        done()
      })
    })
  })
  describe('checkServer()', function () {
    beforeEach(function () {
      spyOn(http, 'get').and.callFake(function (args, cb) {
        cb()
      })
    })
    it('should split the server name correctly and return that it is availible', function (done) {
      wdioTester.checkServer('localhost:3000').then((server) => {
        expect(http.get.calls.first().args).toEqual([
          {
            host: 'localhost',
            port: '3000'
          },
          jasmine.any(Function)
        ])
        done()
      })
    })
    it('should return that it is availible', function (done) {
      wdioTester.checkServer('localhost:3000').then((server) => {
        expect(server).toEqual('localhost:3000')
        done()
      })
    })
  })
  describe('checkServerAvailibility()', function () {
    beforeEach(function () {
      spyOn(fs, 'readFileSync').and.callFake(function () {
        return '{"potentialServers": ["localhost:3000", "localhost:4000"]}'
      })
      spyOn(wdioTester, 'checkServer').and.callFake(function () {
        return Promise.resolve('localhost:3000')
      })
    })
    it('should call checkServer() twice with the correct arguments', function (done) {
      wdioTester.checkServerAvailibility().then(() => {
        expect(wdioTester.checkServer.calls.allArgs()).toEqual([
          ['localhost:3000'],
          ['localhost:4000']
        ])
        done()
      })
    })
    it('should return the correct server array', function (done) {
      wdioTester.checkServerAvailibility().then((servers) => {
        expect(servers).toEqual([
          'localhost:3000',
          'localhost:3000'
        ])
        done()
      })
    })
  })
  describe('getRandomServer()', function () {
    let serverArray = ['localhost:3000', 'localhost:3500', 'localhost:4000']
    it('should return one of the servers from the given server array parameter', function () {
      let res = wdioTester.getRandomServer(serverArray)
      expect(serverArray.indexOf(res)).not.toEqual(-1)
    })
  })
  describe('execute()', function () {
    let filename = 'test.tar'
    let entryPoint = 'dist/'
    let seconds = '198276734'
    let testsFolder = 'tests/e2e/'

    describe('childProcess returns an error', function () {
      beforeEach(function () {
        spyOn(wdioTester, 'checkServerAvailibility').and.callFake(function () {
          return Promise.resolve(['localhost:3000', 'localhost:3500', 'localhost:4000'])
        })
        spyOn(childProcess, 'exec').and.callFake(function (cmd, cb) {
          cb('Error', null, null)
        })
      })
      it('should catch the error and reject the promise', function (done) {
        wdioTester.execute(filename, entryPoint, seconds, testsFolder).then((err) => {
          done.fail(err)
        })
        .catch((res) => {
          expect(res).toEqual('Error')
          done()
        })
      })
    })
    describe('checkServerAvailibility() returns no servers', function () {
      beforeEach(function () {
        spyOn(wdioTester, 'checkServerAvailibility').and.callFake(function () {
          return Promise.resolve([])
        })
      })
      it('should reject with the correct error message', function (done) {
        wdioTester.execute(filename, entryPoint, seconds, testsFolder).then((err) => {
          done.fail(err)
        })
        .catch((res) => {
          expect(res).toEqual('There are no servers availible')
          done()
        })
      })
    })
    describe('submitTarballs()', function () {
      let serversArray = ['localhost:3000', 'localhost:3500', 'localhost:4000']
      beforeEach(function () {
        spyOn(wdioTester, 'checkServerAvailibility').and.callFake(function () {
          return Promise.resolve(serversArray)
        })
        spyOn(wdioTester, 'submitTarballs').and.callFake(function () {
          return Promise.resolve('9274987239847')
        })
        spyOn(childProcess, 'exec').and.callFake(function (cmd, cb) {
          cb(null, null, null)
        })
      })
      it('should be called with the correct arguments', function (done) {
        wdioTester.execute(filename, entryPoint, seconds, testsFolder).then(() => {
          expect(wdioTester.submitTarballs)
            .toHaveBeenCalledWith(entryPoint, seconds, testsFolder + '/tmp', serversArray)
          done()
        })
      })
      it('should resolve with the correct timestamp', function (done) {
        wdioTester.execute(filename, entryPoint, seconds, testsFolder).then((timestamp) => {
          expect(timestamp).toEqual('9274987239847')
          done()
        })
      })
    })
  })
})
