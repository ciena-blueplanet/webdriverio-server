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
  'controller:portal',
  'PortalController',
  {
    unit: true,
    needs: ['model:developer']
  },
  function () {
    let controller, sandbox, store
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
    beforeEach(function () {
      sandbox = sinon.sandbox.create()
      controller = this.subject()
      store = controller.get('store')
      sandbox.stub(store, 'query', () => {
        return Ember.RSVP.resolve(mockDB)
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
        expect(controller.get('selectedIndex')).to.equal(1)
      })
    })

    xdescribe('getAll()', function () {
      beforeEach(function () {
        controller.actions.getAll.call(controller)
      })
      it('should filter the data set by token length', function () {
        expect(controller.get('data').length).to.equal(mockDB.length - 1)
      })
      it('should modify the username property', function () {
        expect(controller.get('data')[0].label).to.equal(mockDB[0].username)
      })
      it('should modify the token property', function () {
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

    xdescribe('createUser()', function () {
      let returnVal

      beforeEach(function () {
        returnVal = {
          username: 'jdoe',
          token: 'randomtestingtoken'
        }
        controller.set('info', returnVal)
        sandbox.spy(jQueryPrototype, 'addClass')
        sandbox.spy(jQueryPrototype, 'removeClass')
        sandbox.spy(jQueryPrototype, 'text')
      })

      describe('Creation is successful', function () {
        beforeEach(function () {
          sandbox.stub(store, 'createRecord', () => {
            return Ember.Object.create({
              username: returnVal.username,
              save: sandbox.spy(() => {
                return Ember.RSVP.resolve(returnVal)
              })
            })
          })
          controller.actions.createUser.call(controller)
        })
        
        describe('Parameters Checking', function () {
          it('Makes sure that the username is the same username as the one set in the info object', function () {
            expect(store.createRecord.lastCall.args[1].username).to.equal(returnVal.username)
          })

          it('Makes sure that the token is 30 characters long', function () {
            expect(store.createRecord.lastCall.args[1].token.length).to.equal(30)
          })

          it('Makes sure that the first argument passed into the createRecord is the developer model', function () {
            expect(store.createRecord.lastCall.args[0]).to.equal('developer')
          })
        })

        describe('Ember JQuery Calls', function () {
          it('should have a success class', function () {
            expect(jQueryPrototype.addClass.lastCall.args).to.eql(['success'])
          })

          it('should not have a failure class', function () {
            expect(jQueryPrototype.removeClass.lastCall.args).to.eql(['failure'])
          })

          it('should have updated the text attribute', function () {
            expect(jQueryPrototype.text.callCount).to.equal(1)
          })
        })
      })

      describe('Creation is unsuccessful', function () {
        beforeEach(function () {
          sandbox.stub(store, 'createRecord', () => {
            return Ember.Object.create({
              username: returnVal.username,
              save: sandbox.spy(() => {
                return Ember.RSVP.reject()
              })
            })
          })
          sandbox.stub(Ember.Logger, 'debug')
          controller.actions.createUser.call(controller)
        })

        it('should call the debug function once when the promise reaches the catch statement', function () {
          expect(Ember.Logger.debug.callCount).to.equal(1)
        })
      })
    })

    xdescribe('getUserInfo()', function () {
      let returnVal

      beforeEach(function () {
        returnVal = {
          username: 'jdoe'
        }
        controller.set('info', returnVal)
        sandbox.spy(jQueryPrototype, 'addClass')
        sandbox.spy(jQueryPrototype, 'removeClass')
        sandbox.spy(jQueryPrototype, 'text')
      })

      describe('Promise is successful', function () {
        beforeEach(function () {
          sandbox.stub(store, 'queryRecord', () => {
            const returnValue = Ember.Object.create(returnVal)
            return Ember.RSVP.resolve(returnValue)
          })
          controller.actions.getUserInfo.call(controller)
        })

        it('Makes sure that the username is the same username as the one set in the info object', function () {
          expect(store.queryRecord.lastCall.args[1].username).to.equal(returnVal.username)
        })

        it('Makes sure that the token is blank', function () {
          expect(store.queryRecord.lastCall.args[1].token).to.equal('')
        })

        it('Makes sure that the first argument passed into the queryRecord is the developer model', function () {
          expect(store.queryRecord.lastCall.args[0]).to.equal('developer')
        })

        describe('Ember JQuery Calls', function () {
          it('should have a success class', function () {
            expect(jQueryPrototype.addClass.lastCall.args).to.eql(['success'])
          })

          it('should not have a failure class', function () {
            expect(jQueryPrototype.removeClass.lastCall.args).to.eql(['failure'])
          })

          it('should have updated the text attribute', function () {
            expect(jQueryPrototype.text.callCount).to.equal(1)
          })
        })
      })

      describe('Promise is unsuccessful', function () {
        beforeEach(function () {
          sandbox.stub(store, 'queryRecord', () => {
            return Ember.RSVP.reject()
          })
          controller.actions.getUserInfo.call(controller)
        })

        describe('Ember JQuery Calls', function () {
          it('should have a failure class', function () {
            expect(jQueryPrototype.addClass.lastCall.args).to.eql(['failure'])
          })

          it('should not have a success class', function () {
            expect(jQueryPrototype.removeClass.lastCall.args).to.eql(['success'])
          })

          it('should have the correct text', function () {
            expect(jQueryPrototype.text.lastCall.args).to.eql(['No such user exists for the username: ' + returnVal.username])
          })
        })
      })
    })

    xdescribe('updateUserInfo()', function () {
      let returnVal

      beforeEach(function () {
        returnVal = {
          username: 'jdoe',
          token: 'randomtestingtoken'
        }
        controller.set('info', returnVal)
        sandbox.spy(jQueryPrototype, 'addClass')
        sandbox.spy(jQueryPrototype, 'removeClass')
        sandbox.spy(jQueryPrototype, 'text')
      })

      describe('Update is successful', function () {
        beforeEach(function () {
          sandbox.stub(store, 'createRecord', () => {
            return Ember.Object.create({
              username: returnVal.username,
              save: sandbox.spy(() => {
                return Ember.RSVP.resolve(returnVal)
              })
            })
          })
          controller.actions.updateUserInfo.call(controller)
        })
        
        describe('Parameters Checking', function () {
          it('Makes sure that the username is the same username as the one set in the info object', function () {
            expect(store.createRecord.lastCall.args[1].username).to.equal(returnVal.username)
          })

          it('Makes sure that the token is 30 characters long', function () {
            expect(store.createRecord.lastCall.args[1].token.length).to.equal(30)
          })

          it('Makes sure that the first argument passed into the createRecord is the developer model', function () {
            expect(store.createRecord.lastCall.args[0]).to.equal('developer')
          })
        })

        describe('Ember JQuery Calls', function () {
          it('should have a success class', function () {
            expect(jQueryPrototype.addClass.lastCall.args).to.eql(['success'])
          })

          it('should not have a failure class', function () {
            expect(jQueryPrototype.removeClass.lastCall.args).to.eql(['failure'])
          })

          it('should have updated the text attribute', function () {
            expect(jQueryPrototype.text.callCount).to.equal(1)
          })
        })
      })

      describe('Update is unsuccessful', function () {
        beforeEach(function () {
          sandbox.stub(store, 'createRecord', () => {
            return Ember.Object.create({
              username: returnVal.username,
              save: sandbox.spy(() => {
                return Ember.RSVP.reject()
              })
            })
          })
          sandbox.stub(Ember.Logger, 'debug')
          controller.actions.updateUserInfo.call(controller)
        })

        it('should call the debug function once when the promise reaches the catch statement', function () {
          expect(Ember.Logger.debug.callCount).to.equal(1)
        })
      })
    })

    xdescribe('deleteUser()', function () {
      let returnVal

      beforeEach(function () {
        returnVal = {
          username: 'jdoe'
        }
        controller.set('info', returnVal)
        sandbox.spy(jQueryPrototype, 'addClass')
        sandbox.spy(jQueryPrototype, 'removeClass')
        sandbox.spy(jQueryPrototype, 'text')
      })

      describe('Delete was successful', function () {
        beforeEach(function () {
          sandbox.stub(store, 'queryRecord', () => {
            return Ember.RSVP.resolve({
              username: returnVal.username,
              destroyRecord: sandbox.spy(() => {
                return Ember.RSVP.resolve(returnVal)
              })
            })
          })
          controller.actions.deleteUser.call(controller)
        })

        describe('Parameters Checking', function () {
          it('Makes sure that the username is the same username as the one set in the info object', function () {
            expect(store.queryRecord.lastCall.args[1].username).to.equal(returnVal.username)
          })

          it('Makes sure that the token is blank', function () {
            expect(store.queryRecord.lastCall.args[1].token).to.equal('')
          })

          it('Makes sure that the first argument passed into the queryRecord is the developer model', function () {
            expect(store.queryRecord.lastCall.args[0]).to.equal('developer')
          })
        })

        describe('Ember JQuery Calls', function () {
          it('should have a success class', function () {
            expect(jQueryPrototype.addClass.lastCall.args).to.eql(['success'])
          })

          it('should not have a failure class', function () {
            expect(jQueryPrototype.removeClass.lastCall.args).to.eql(['failure'])
          })

          it('should have updated the text attribute', function () {
            expect(jQueryPrototype.text.callCount).to.equal(1)
          })
        })
      })

      describe('Delete is unsuccessful', function () {
        beforeEach(function () {
          sandbox.stub(store, 'queryRecord', () => {
            return Ember.RSVP.resolve({
              username: returnVal.username,
              destroyRecord: sandbox.spy(() => {
                return Ember.RSVP.reject(returnVal)
              })
            })
          })
          sandbox.stub(Ember.Logger, 'debug')
          controller.actions.deleteUser.call(controller)
        })

        it('should call the debug function once when the promise reaches the catch statement', function () {
          expect(Ember.Logger.debug.callCount).to.equal(1)
        })

        describe('Ember JQuery Calls', function () {
          it('should have a failure class', function () {
            expect(jQueryPrototype.addClass.lastCall.args).to.eql(['failure'])
          })

          it('should not have a success class', function () {
            expect(jQueryPrototype.removeClass.lastCall.args).to.eql(['success'])
          })

          it('should have updated the text attribute', function () {
            expect(jQueryPrototype.text.callCount).to.equal(1)
          })
        })
      })
    })
  }
)


