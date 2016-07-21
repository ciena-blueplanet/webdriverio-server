import { expect } from 'chai'
import {
  describeModule,
  it
} from 'ember-mocha'

describeModule(
  'route:auth/contract',
  'AuthContractRoute',
  {
    unit: true,
    needs: ['model:developer']
  },
  function () {
    let route, sandbox

    beforeEach(function () {
      sandbox = sinon.sandbox.create()

      route = this.subject()
    })

    afterEach(function () {
      sandbox.restore()
    })

    describe('beforeModel()', function () {
      describe('Redirect Case', function () {
        beforeEach(function () {
          sandbox.stub(Ember.$, 'get', (route, cb) => {
            cb({redirect: '/#/auth/denied?reason=1'})
          })
          sandbox.stub(route, 'transitionTo')
          route.beforeModel()
        })
        it('should use a jquery request to check whether the session exists', function () {
          expect(Ember.$.get.lastCall.args[0]).to.equal('/session')
        })

        it('should attempt to redirect to auth.denied with query params of {reason: 1}', function () {
          expect(route.transitionTo.lastCall.args[0]).to.equal('auth.denied')
          expect(route.transitionTo.lastCall.args[1]).to.eql({queryParams: {reason: '1'}})
        })
      })

      describe('No redirection Case', function () {
        beforeEach(function () {
          sandbox.stub(Ember.$, 'get', (route, cb) => {
            cb()
          })
          sandbox.stub(route, 'transitionTo')
          route.beforeModel()
        })
        it('should use a jquery request to check whether the session exists', function () {
          expect(Ember.$.get.lastCall.args[0]).to.equal('/session')
        })

        it('should not attempt to redirect', function () {
          expect(route.transitionTo.callCount).to.equal(0)
        })
      })
    })
  }
)
