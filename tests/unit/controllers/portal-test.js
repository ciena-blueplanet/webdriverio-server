import {expect} from 'chai'
import {
  describeModule,
  it} from 'ember-mocha'
import {
  afterEach,
  beforeEach,
  describe} from 'mocha'

const jQueryPrototype = Object.getPrototypeOf($('body'))

let mockDB = [
  {
    username: 'test1',
    token: 'test-token1'
  },
  {
    username: 'test2',
    token: 'test-token2'
  },
  {
    username: 'test3',
    token: 'test-token3'
  },
  {
    username: 'test4',
    token: 'test-token4'
  },
  {
    username: 'test5',
    token: '123456789098765432134567890987654321234567890'
  }
]

describeModule(
  'controller:portal',
  'PortalController',
  {
    unit: true,
    needs: ['model:developer']
  },
  function () {
    let controller, sandbox, store
    beforeEach(function () {
      sandbox = sinon.sandbox.create()
      controller = this.subject()
      store = controller.get('store')
      sandbox.stub(store, 'query', () => {
        return Ember.RSVP.resolve(Ember.ArrayProxy.create({
          content: Ember.A(mockDB)
        }))
      })
    })

    afterEach(function () {
      sandbox.restore()
    })

    describe('initial state', function () {
      it('should initialize username', function () {
        expect(controller.get('username')).to.equal('')
      })
      it('should initialize a token', function () {
        expect(controller.get('token')).to.equal('')
      })
      it('should set the selectedIndex to 1', function () {
        expect(controller.get('selectedIndex')).to.eql([0])
      })
    })

    describe('getAll()', function () {
      beforeEach(function () {
        controller.actions.getAll.call(controller)
      })
      xit('should filter the data set by token length', function () {
        expect(controller.get('data').length).to.equal(mockDB.length - 1)
      })
      xit('should modify the username property', function () {
        expect(controller.get('data')[0].label).to.equal(mockDB[0].username)
      })
      xit('should modify the token property', function () {
        expect(controller.get('data')[0].value).to.equal(mockDB[0].username)
      })
      it('should be called with the correct params', function () {
        expect(store.query.lastCall.args[1].queryAll).to.equal(1)
      })
      it('shoudl be called with the correct model', function () {
        expect(store.query.lastCall.args[0]).to.equal('developer')
      })
    })

    describe('formChange()', function () {
      it('should set loginInfo to the value passed in', function () {
        const value = 'testLoginInfo'
        Ember.run(() => {
          controller.actions.formChange.call(controller, value)
        })
        expect(controller.get('info')).to.equal(value)
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

    describe('updateDOM()', function () {
      beforeEach(function () {
        sandbox.spy(jQueryPrototype, 'text')
        sandbox.spy(jQueryPrototype, 'show')
        sandbox.spy(jQueryPrototype, 'hide')
        controller.set('username', 'test')
      })

      describe('unrestricted token', function () {
        beforeEach(function () {
          controller.set('token', 'test-token')
          controller.actions.updateDOM.call(controller)
        })

        it('should update the username label', function () {
          expect(jQueryPrototype.text.firstCall.args[0]).to.equal('test')
        })

        it('should update the token label', function () {
          expect(jQueryPrototype.text.secondCall.args[0]).to.equal('test-token')
        })

        it('should call show three times', function () {
          expect(jQueryPrototype.show.callCount).to.equal(3)
        })

        it('should call hide two times', function () {
          expect(jQueryPrototype.hide.callCount).to.equal(2)
        })
      })

      describe('restricted token', function () {
        beforeEach(function () {
          controller.set('token', '~')
          controller.actions.updateDOM.call(controller)
        })

        it('should update the username label', function () {
          expect(jQueryPrototype.text.firstCall.args[0]).to.equal('test')
        })

        it('should update the token label', function () {
          expect(jQueryPrototype.text.secondCall.args[0]).to.equal('~')
        })

        it('should call show four times', function () {
          expect(jQueryPrototype.show.callCount).to.equal(4)
        })

        it('should call hide one times', function () {
          expect(jQueryPrototype.hide.callCount).to.equal(1)
        })
      })
    })

    describe('createUser()', function () {
      let returnVal
      let record = {
        label: 'test',
        value: 'test-token'
      }

      beforeEach(function () {
        returnVal = {
          username: record.label,
          token: record.value
        }
        controller.set('info', returnVal)
      })

      describe('Creation is successful', function () {
        beforeEach(function () {
          sandbox.stub(store, 'createRecord', () => {
            return Ember.Object.create({
              username: record.label,
              token: record.value,
              save: sandbox.spy(() => {
                return Ember.RSVP.resolve(returnVal)
              })
            })
          })
          controller.actions.createUser.call(controller, record)
        })

        describe('Parameters Checking', function () {
          it('Makes sure that the username is the same username as the passed-in token', function () {
            expect(store.createRecord.lastCall.args[1].username).to.equal(record.label)
          })

          it('Makes sure that the token is the same as the passed-in token', function () {
            expect(store.createRecord.lastCall.args[1].token).to.equal(record.value)
          })

          it('Makes sure that the first argument passed into the createRecord is the developer model', function () {
            expect(store.createRecord.lastCall.args[0]).to.equal('developer')
          })
        })
      })

      describe('Creation is unsuccessful', function () {
        beforeEach(function () {
          sandbox.stub(store, 'createRecord', () => {
            return Ember.Object.create({
              username: returnVal.username,
              token: returnVal.token,
              save: sandbox.spy(() => {
                return Ember.RSVP.reject()
              })
            })
          })
          sandbox.stub(Ember.Logger, 'debug')
          controller.set('data', Ember.A([record]))
          controller.actions.createUser.call(controller, record)
        })

        it('should get rid of the single record in data', function () {
          expect(controller.get('data').toArray().length).to.equal(0)
        })

        it('should call the debug function once when the promise reaches the catch statement', function () {
          expect(Ember.Logger.debug.callCount).to.equal(1)
        })
      })
    })

    describe('confirmHandler()', function () {
      beforeEach(function () {
        controller.set('info', {
          username: 'jdoe'
        })
        controller.set('data', Ember.A([{label: 'test1', value: '1234'}]))
        sandbox.stub(controller.actions, 'createUser', () => {
          return Ember.Object.create({
            username: 'jdoe'
          })
        })
        controller.actions.confirmHandler.call(controller)
      })

      it('should add the record with the correct username to the data array', function () {
        expect(controller.get('data')[0].label).to.equal('jdoe')
      })

      it('should add the record with a token to the data array', function () {
        expect(controller.get('data')[0].value.length).to.equal(30)
      })

      it('should set the selectedIndex to 0', function () {
        expect(controller.get('selectedIndex')).to.eql([0])
      })
    })

    describe('generateHandler() and unrestrictHandler()', function () {
      beforeEach(function () {
        controller.set('username', 'test')
        sandbox.stub(controller.actions, 'createUser', () => {
          return Ember.Object.create({
            username: 'jdoe'
          })
        })
      })

      it('should set a token to be 30 characters long', function () {
        controller.actions.generateHandler.call(controller)
        expect(controller.get('token').length).to.equal(30)
      })

      it('should set a token to be 30 characters long', function () {
        controller.actions.unrestrictHandler.call(controller)
        expect(controller.get('token').length).to.equal(30)
      })
    })

    describe('restrictHandler()', function () {
      beforeEach(function () {
        controller.set('username', 'test')
        sandbox.stub(controller.actions, 'createUser', () => {
          return Ember.Object.create({
            username: 'jdoe'
          })
        })
        controller.actions.restrictHandler.call(controller)
      })

      it('should set a token to be ~', function () {
        expect(controller.get('token')).to.equal('~')
      })
    })

    describe('onChangeHandler', function () {
      beforeEach(function () {
        let val = mockDB.map((item) => {
          return {
            label: item.username,
            value: item.token
          }
        })
        controller.set('data', Ember.A(val))
        controller.actions.onChangeHandler.call(controller, mockDB[1].token)
      })

      it('should set the username to the matching token', function () {
        expect(controller.get('username')).to.equal(mockDB[1].username)
      })

      it('should set the token to the token parameter', function () {
        expect(controller.get('token')).to.equal(mockDB[1].token)
      })
    })
  }
)


