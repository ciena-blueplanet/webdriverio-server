import { expect } from 'chai'
import {
  describeModule,
  it
} from 'ember-mocha'

describeModule(
  'route:auth/denied',
  'AuthDeniedRoute',
  {
    unit: true
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

    describe('model()', function () {
      let params = {
        reason: '0'
      }
      beforeEach(function () {
        sandbox.stub(Ember.Logger, 'debug')
      })

      it('should return the reason', function () {
        expect(route.model(params)).to.equal(params.reason)
      })
    })

    describe('setupController()', function () {
      let controller, model, message
      describe('Reason #1', function () {
        beforeEach(function () {
          model = '1'
          message = 'A denied access message'
          controller = Ember.Object.create()
          sandbox.stub(Ember.$, 'get', (route, query, cb) => {
            cb(message)
          })
          route.setupController(controller, model)
        })

        it('should set the reason property to 1', function () {
          expect(controller.get('reason')).to.equal('1')
        })

        it('should set the correct parameters', function () {
          expect(Ember.$.get.lastCall.args[0]).to.equal('/auth/denied')
          expect(Ember.$.get.lastCall.args[1]).to.eql({
            reason: model
          })
        })

        it('should set the message to the correct message', function () {
          expect(controller.get('message')).to.equal(message)
        })
      })
    })
  }
)
