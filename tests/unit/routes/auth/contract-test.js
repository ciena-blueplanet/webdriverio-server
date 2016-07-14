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
    let route, sandbox, store

    beforeEach(function () {
      sandbox = sinon.sandbox.create()
      route = this.subject()
      store = route.get('store')
    })

    afterEach(function () {
      sandbox.restore()
    })

    describe('model()', function () {
      let params = {
        username: 'test-user'
      }
      beforeEach(function () {
        sandbox.stub(Ember.Logger, 'debug')
      })
      describe('Resolve Case', function () {
        beforeEach(function () {
          sandbox.stub(store, 'queryRecord', () => {
            const returnValue = Ember.Object.create(params)
            return Ember.RSVP.resolve(returnValue)
          })
          route.model(params)
        })
        it('Makes sure that the username is the same as the parameters username', function () {
          expect(store.queryRecord.lastCall.args[1].username).to.equal(params.username)
        })

        it('Makes sure that the token is the bang character', function () {
          expect(store.queryRecord.lastCall.args[1].token).to.equal('!')
        })

        it('Makes sure that the first argument passed into the queryRecord is the developer model', function () {
          expect(store.queryRecord.lastCall.args[0]).to.equal('developer')
        })
      })

      describe('Reject Case', function () {
        let err
        describe('Reason 5', function () {
          beforeEach(function () {
            err = {
              errors: [
                {
                  status: '510'
                }
              ]
            }
            sandbox.stub(store, 'queryRecord', () => {
              const error = Ember.Object.create(err)
              return Ember.RSVP.reject(error)
            })
            sandbox.stub(route, 'transitionTo')
            route.model(params)
          })

          it('transitionTo should be called once', function () {
            expect(route.transitionTo.callCount).to.equal(1)
          })

          it('should transition to the denied route', function () {
            expect(route.transitionTo.lastCall.args[0]).to.equal('auth.denied')
          })

          it('should transition to the denied route with reason = 5', function () {
            expect(route.transitionTo.lastCall.args[1]).to.eql({queryParams: {reason: 5}})
          })
        })

        describe('Reason 4', function () {
          beforeEach(function () {
            err = {
              errors: [
                {
                  status: '520'
                }
              ]
            }
            sandbox.stub(store, 'queryRecord', () => {
              const error = Ember.Object.create(err)
              return Ember.RSVP.reject(error)
            })
            sandbox.stub(route, 'transitionTo')
            route.model(params)
          })

          it('transitionTo should be called once', function () {
            expect(route.transitionTo.callCount).to.equal(1)
          })

          it('should transition to the denied route', function () {
            expect(route.transitionTo.lastCall.args[0]).to.equal('auth.denied')
          })

          it('should transition to the denied route with reason = 4', function () {
            expect(route.transitionTo.lastCall.args[1]).to.eql({queryParams: {reason: 4}})
          })
        })

        describe('Reason 0', function () {
          beforeEach(function () {
            err = {
              errors: [
                {
                  status: '500'
                }
              ]
            }
            sandbox.stub(store, 'queryRecord', () => {
              const error = Ember.Object.create(err)
              return Ember.RSVP.reject(error)
            })
            sandbox.stub(route, 'transitionTo')
            route.model(params)
          })

          it('transitionTo should be called once', function () {
            expect(route.transitionTo.callCount).to.equal(1)
          })

          it('should transition to the denied route', function () {
            expect(route.transitionTo.lastCall.args[0]).to.equal('auth.denied')
          })

          it('should transition to the denied route with reason = 0', function () {
            expect(route.transitionTo.lastCall.args[1]).to.eql({queryParams: {reason: 0}})
          })
        })
      })
    })

    describe('setupController()', function () {
      let controller, model
      beforeEach(function () {
        model = {
          username: 'test-user'
        }
        controller = Ember.Object.create()
        route.setupController(controller, model)
      })

      it('should set the model to be the model parameter', function () {
        expect(controller.get('model')).to.eql(model)
      })

      it('should set the username to model.username', function () {
        expect(controller.get('username')).to.eql(model.username)
      })
    })

    it('exists', function () {
      expect(route).to.be.ok
    })
  }
)
