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
    let controller, sandbox, store
    beforeEach(function () {
      sandbox = sinon.sandbox.create()
      controller = this.subject()
      store = controller.get('store')
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
      let returnVal
      let record = {
        label: 'test',
        value: 'test-token'
      }

      beforeEach(function () {
        returnVal = {
          username: record.label
        }
        controller.set('info', returnVal)
      })

      describe('Creation is successful', function () {
        beforeEach(function () {
          sandbox.stub(store, 'createRecord', () => {
            return Ember.Object.create({
              username: record.label,
              save: sandbox.spy(() => {
                return Ember.RSVP.resolve(returnVal)
              })
            })
          })
          controller.actions.submitForm.call(controller)
          controller.set('username', record.label)
        })

        describe('Resolve Case', function () {
          it('Makes sure that the token has a length of 30', function () {
            expect(store.createRecord.lastCall.args[1].token.length).to.equal(30)
          })

          it('Makes sure that the first argument passed into the createRecord is the developer model', function () {
            expect(store.createRecord.lastCall.args[0]).to.equal('developer')
          })

          it('should set the username as the username property', function () {
            expect(controller.get('username')).to.equal(record.label)
          })

          it('should set the token as the token property', function () {
            expect(controller.get('token').length).to.equal(30)
          })
        })
      })

      describe('Reject Case', function () {
        beforeEach(function () {
          sandbox.stub(store, 'createRecord', () => {
            return Ember.Object.create({
              username: returnVal.username,
              save: sandbox.spy(() => {
                return Ember.RSVP.reject('Error')
              })
            })
          })
          sandbox.stub(Ember.Logger, 'debug')
          sandbox.stub(window, 'alert')
          controller.actions.submitForm.call(controller)
        })

        it('should call the debug function once when the promise reaches the catch statement', function () {
          expect(Ember.Logger.debug.callCount).to.equal(1)
        })

        it('should call the alert function once when the promise reaches the catch statement', function () {
          expect(window.alert.callCount).to.equal(1)
        })
      })
    })
  }
)
