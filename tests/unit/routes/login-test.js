import { expect } from 'chai'
import {
  describeModule,
  it
} from 'ember-mocha'

describeModule(
  'route:login',
  'LoginRoute',
  {
    unit: true
  },
  function () {
    let route, sandbox, params
    beforeEach(function () {
      sandbox = sinon.sandbox.create()
      route = this.subject()
      params = {
        failure: 1
      }
    })

    afterEach(function () {
      sandbox.restore()
    })
    describe('model()', function () {
      it('should return the params passed in', function () {
        expect(route.model(params)).to.eql(params)
      })
    })
    describe('setupController()', function () {
      let controller
      beforeEach(function () {
        controller = Ember.A()
      })

      it('should set loginResult to true', function () {
        route.setupController(controller, params)
        expect(controller.get('loginResult')).to.equal(true)
      })

      it('should set loginResult to false', function () {
        route.setupController(controller, {})
        expect(controller.get('loginResult')).to.equal(false)
      })
    })
  }
)
