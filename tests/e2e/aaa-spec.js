'use strict'

const path = require('path')
const glob = require('glob-all')

const webdriverio = require('webdriverio')
const webdrivercss = require('webdrivercss')

// testUtils are provided by webdriverio-server
// https://github.com/ciena-blueplanet/webdriverio-server/blob/master/testUtils/utils.js
const testUtils = require('../../testUtils/utils').e2e
const testConfig = require('./test-config.json')
const url = testUtils.getUrl(testConfig)

const NORMAL_VIEWPORT_WIDTH = 1280
const NORMAL_VIEWPORT_HEIGHT = 800

jasmine.DEFAULT_TIMEOUT_INTERVAL = 9999999
const ctx = {
  commonScreenshots: {
    name: 'content',
    elem: 'html'
  },
  detailContents: {
    name: 'details',
    elem: 'div.detail-view'
  },
  detailInfoBar: {
    name: 'infobar',
    elem: 'div.info-bar'
  },
  maxTimeout: 5000,
  maxWaitFor: 1000,
  url
}

beforeAll((done) => {
  ctx.client = testUtils.init(webdriverio, webdrivercss, testConfig)
  ctx.client
    .setViewportSize({width: NORMAL_VIEWPORT_WIDTH, height: NORMAL_VIEWPORT_HEIGHT})
    .call(done)
})

afterAll((done) => {
  ctx.client.end(done)
})

const files = glob.sync([path.join(__dirname, '**', '*-e2e.js')])
const relativeFiles = files.map((file) => `./${path.relative(__dirname, file)}`)
relativeFiles.forEach((modulePath) => {
  const module = require(modulePath)
  module(ctx)
})
