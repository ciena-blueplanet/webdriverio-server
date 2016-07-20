import { expect } from 'chai'
import {
  describeModule,
  it
} from 'ember-mocha'

describeModule(
  'route:portal',
  'PortalRoute',
  {
    unit: true
  },
  function () {
    let route, sandbox, params
    beforeEach(function () {
      sandbox = sinon.sandbox.create()
      route = this.subject()
    })

    afterEach(function () {
      sandbox.restore()
    })
    describe('beforeModel()', function () {
      describe('Redirect case', function () {
        beforeEach(function () {
          sandbox.stub(Ember.$, 'get', (route, cb) => {
            cb('NotAuthenticated')
          })
          sandbox.stub(route, 'transitionTo')
          route.beforeModel()
        })
        it('should transition to the login page', function () {
          expect(route.transitionTo.lastCall.args[0]).to.equal('login')
        })
      })
      describe('No redirection case', function () {
        beforeEach(function () {
          sandbox.stub(Ember.$, 'get', (route, cb) => {
            cb('Authenticated')
          })
          sandbox.stub(route, 'transitionTo')
          route.beforeModel()
        })
        it('should transition to the login page', function () {
          expect(route.transitionTo.callCount).to.equal(0)
        })
      })
    })
  }
)
