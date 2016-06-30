import {expect} from 'chai'
import {
  describeModule,
  it} from 'ember-mocha'
import {
  afterEach,
  beforeEach,
  describe} from 'mocha'

const jQueryPrototype = Object.getPrototypeOf($('body'))

describeModule(
  'controller:login',
  'LoginController',
  {
    unit: true
  },
  function () {
    let controller, sandbox, store

    beforeEach(function () {
      sandbox = sinon.sandbox.create()
      controller = this.subject()
      store = controller.get('store')
    })

    afterEach(function () {
      sandbox.restore()
    })

    describe('formChange()', function () {
      it('should set loginInfo to the value passed in', function () {
        const value = 'testLoginInfo'
        Ember.run(() => {
          controller.actions.formChange.call(controller, value)
        })
        expect(controller.get('loginInfo')).to.equal(value)
      })
    })

    describe('formValidation()', function () {
      it('should set isFormInvalid to true if the number of errors is greater than 0', function () {
        const validation = {
          errors: [
            'Massive Failure'
          ]
        }
        Ember.run(() => {
          controller.actions.formValidation.call(controller, validation)
        })
        expect(controller.get('isFormInvalid')).to.equal(true)
      })

      it('should set isFormInvalid to false if the number of errors equals 0', function () {
        const validation = {
          errors: []
        }
        Ember.run(() => {
          controller.actions.formValidation.call(controller, validation)
        })
        expect(controller.get('isFormInvalid')).to.equal(false)
      })
    })

    describe('submitForm()', function () {
      let returnVal

      beforeEach(function () {
        returnVal = {
          username: 'jdoe',
          token: 'test'
        }
        controller.set('loginInfo', returnVal)
      })

      describe('Promise is successful', function () {
        beforeEach(function () {
          sandbox.stub(store, 'queryRecord', () => {
            const returnValue = Ember.Object.create(returnVal)
            return Ember.RSVP.resolve(returnValue)
          })
          sandbox.stub(controller, 'transitionToRoute')
          controller.actions.submitForm.call(controller)
        })

        it('Makes sure that the username is hashed to the standard 32 characters and defined', function () {
          expect(store.queryRecord.lastCall.args[1].username.length).to.equal(32)
        })

        it('Makes sure that the token is hashed to the standard 32 characters and defined', function () {
          expect(store.queryRecord.lastCall.args[1].token.length).to.equal(32)
        })

        it('Makes sure that the first argument passed into the queryRecord is the developer model', function () {
          expect(store.queryRecord.lastCall.args[0]).to.equal('developer')
        })

        it('Insert description here', function () {
          expect(controller.transitionToRoute.callCount).to.equal(1)
        })
      })

      describe('Promise is unsuccessful', function () {
        beforeEach(function () {
          sandbox.stub(store, 'queryRecord', () => {
            return Ember.RSVP.reject()
          })
        })

        describe('Ember JQuery Calls', function () {
          beforeEach(function () {
            sandbox.spy(jQueryPrototype, 'addClass')
            sandbox.spy(jQueryPrototype, 'removeClass')
            sandbox.spy(jQueryPrototype, 'text')
            controller.actions.submitForm.call(controller)
          })

          it('should have a failure class', function () {
            expect(jQueryPrototype.addClass.lastCall.args).to.eql(['failure'])
          })

          it('should not have a success class', function () {
            expect(jQueryPrototype.removeClass.lastCall.args).to.eql(['success'])
          })

          it('should have the correct text', function () {
            expect(jQueryPrototype.text.lastCall.args).to.eql(['Authentication Failed'])
          })
        })
      })
    })
  }
)
