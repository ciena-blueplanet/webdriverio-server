'use strict'

const selectors = require('./selectors')
const data = require('./data')

module.exports = function (ctx) {
  describe(`webdriverio-server homepage ${ctx.url}`, () => {
    let client
    let homepageURL = `${ctx.url}#/`

    beforeEach((done) => {
      client = ctx.client
      client
        .url(homepageURL)
        .refresh()
        .waitForExist(selectors.links.index.signUpLink, ctx.maxTimeout)
        .waitForExist(selectors.links.index.adminLogin, ctx.maxTimeout)
        .waitForExist(selectors.links.index.contributingLink, ctx.maxTimeout)
        .waitForExist(data.index.primaryLogo)
        .waitForExist(data.index.primaryTitle)
        .call(done)
    })

    it('page renders everything correctly', function (done) {
      client
        .verifyScreenshots('index.homepage', [ctx.commonScreenshots])
        .call(done)
    })
  })
}
