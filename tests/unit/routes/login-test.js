import { expect } from 'chai'
import {
  describeModule,
  it
} from 'ember-mocha'

const jQueryPrototype = Object.getPrototypeOf($('body'))

describeModule(
  'route:login',
  'LoginRoute',
  {
    unit: true
  },
  function () {
    let route, sandbox
    beforeEach(function () {
      sandbox = sinon.sandbox.create()
      route = this.subject()
      sandbox.stub(jQueryPrototype, 'text')
    })

    afterEach(function () {
      sandbox.restore()
    })
    describe('model()', function () {
      let params
      describe('Failed Authentication', function () {
        beforeEach(function () {
          params = {
            failure: 1
          }
          route.model(params)
        })
        it('should update the login-result text', function () {
          expect(jQueryPrototype.text.firstCall.args[0]).to.equal('Authentication Failed')
        })
      })
      describe('No Params', function () {
        beforeEach(function () {
          params = {}
          route.model(params)
        })
        it('should not update the login-result text', function () {
          expect(jQueryPrototype.text.callCount).to.equal(0)
        })
      })
    })
  }
)
