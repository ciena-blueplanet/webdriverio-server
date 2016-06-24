import {expect} from 'chai'
import {
  describeModule,
  it} from 'ember-mocha'
import {
  afterEach,
  beforeEach,
  describe} from 'mocha'

describeModule(
  'controller:login',
  'LoginController',
  {
    unit: true
  },
  function () {
    let controller, sandbox

    beforeEach(function () {
      sandbox = sinon.sandbox.create()
      controller = this.subject()
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

    it('exists', function () {
      let controller = this.subject()
      expect(controller).to.be.ok
    })
  }
)
