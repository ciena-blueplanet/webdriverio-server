/* global jQuery */
'use strict'

const selectors = require('./selectors')
const data = require('./data')

module.exports = function (ctx) {
  describe(`webdriverio-server login ${ctx.url}`, () => {
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

    it('renders the login page correctly once the login button is clicked', function (done) {
      client
        .verifyScreenshots('index.homepage', [ctx.commonScreenshots])
        .click(selectors.links.index.adminLoginButton)
        .pause(ctx.maxTimeout)
        .waitForExist(selectors.links.login.loginButton)
        .waitForExist(selectors.links.login.loginForm)
        .waitForExist(selectors.links.login.loginInputPassword)
        .waitForExist(selectors.links.login.loginInputUsername)
        .waitForExist(data.login.username)
        .waitForExist(data.login.password)
        .verifyScreenshots('login.homepage', [ctx.commonScreenshots])
        .execute(
          function () {
            jQuery('.login-input input[name=username]').val('test')
            jQuery('.login-input input[name=password]').val('password')
          }
        )
        .then(() => {
          client
            .waitForExist(data.login.usernameInput)
            .waitForExist(data.login.passwordInput)
            .verifyScreenshots('login.filledOut', [ctx.commonScreenshots])
            .call(done)
        })
    })
  })
}
