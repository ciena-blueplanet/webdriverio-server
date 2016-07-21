'use strict'

module.exports = {
  links: {
    index: {
      signUpLink: '.link a .content:nth-child(1)',
      adminLogin: '.footer .bar .link .frost-link .content .text',
      adminLoginButton: '.footer .bar .link .frost-link',
      contributingLink: '.footer .bar .link a .content'
    },
    login: {
      loginButton: '.login-button .frost-button',
      loginForm: '.login-main .login',
      loginInputUsername: '.login-input:nth-child(1) input',
      loginInputPassword: '.login-input:nth-child(2) input'
    }
  }
}
