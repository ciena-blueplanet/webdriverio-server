/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app')
var safeguard = require('ember-safeguard')

module.exports = function (defaults) {
  var app = new EmberApp(defaults, {
    babel: {
      ignore: [
        'bower_components/**/*.js',
        'node_modules/**/*.js'
      ],
      optional: ['es7.decorators']
    },
    'ember-cli-mocha': {
      useLintTree: false
    }
  })

  if (app.env === 'development') {
    safeguard(app)
  }

  return app.toTree()
}
