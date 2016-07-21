import { expect } from 'chai'
import {
  describeModule,
  it
} from 'ember-mocha'

describeModule(
  'controller:auth/contract',
  'ContractController',
  {
    unit: true
  },
  function () {
    // Replace this with your real tests.
    let controller, sandbox
    beforeEach(function () {
      sandbox = sinon.sandbox.create()
      controller = this.subject()
    })

    afterEach(function () {
      sandbox.restore()
    })

    describe('onInit', function () {
      it('should initialize checked to false', function () {
        expect(controller.get('checked')).to.equal(false)
      })
      it('should initialize confirmed to false', function () {
        expect(controller.get('confirmed')).to.equal(false)
      })
      it('should initialize disabled to be the opposite of checked', function () {
        expect(controller.get('disabled')).to.equal(true)
      })
      it('should initialize the token to be the empty string', function () {
        expect(controller.get('token')).to.equal('')
      })
    })

    describe('onInputHandler()', function () {
      beforeEach(function () {
        controller.actions.onInputHandler.call(controller)
      })
      it('should toggle the checked property', function () {
        expect(controller.get('checked')).to.equal(true)
      })
      it('should set the disabled property to the opposite of the checked property', function () {
        expect(controller.get('disabled')).to.equal(!controller.get('checked'))
      })
    })

    describe('submitForm()', function () {
      let record = {
        username: 'pastorsj',
        token: 'itsarandomthirtycharactertoken'
      }

      describe('Successful, no redirect Case', function () {
        beforeEach(function () {
          sandbox.stub(Ember.$, 'post', (route, cb) => {
            cb(record)
          })
          controller.actions.submitForm.call(controller)
        })
        it('should set the username as the username property', function () {
          expect(controller.get('username')).to.equal(record.username)
        })

        it('should set the token as the token property', function () {
          expect(controller.get('token')).to.equal(record.token)
        })

        it('should make a post call with the correct arguments', function () {
          expect(Ember.$.post.lastCall.args[0]).to.equal('/auth/contract')
        })
      })

      describe('Redirect Case', function () {
        beforeEach(function () {
          sandbox.stub(Ember.$, 'post', (route, cb) => {
            cb({redirect: '/#/auth/denied?reason=1'})
          })
          sandbox.stub(controller, 'transitionToRoute')
          controller.actions.submitForm.call(controller)
        })
        it('should call transitionToRoute with the correct arguments', function () {
          expect(controller.transitionToRoute.lastCall.args[0]).to.equal('auth.denied')
          expect(controller.transitionToRoute.lastCall.args[1]).to.eql({queryParams: {reason: '1'}})
        })

        it('should make a post call with the correct arguments', function () {
          expect(Ember.$.post.lastCall.args[0]).to.equal('/auth/contract')
        })
      })

      describe('Failure Case', function () {
        beforeEach(function () {
          sandbox.stub(Ember.$, 'post', (route, cb) => {
            cb()
          })
          sandbox.stub(Ember.Logger, 'debug')
          controller.actions.submitForm.call(controller)
        })
        it('should indicate an error occured', function () {
          expect(Ember.Logger.debug.callCount).to.equal(1)
        })
      })
    })
  }
)
