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
      let controller, model
      describe('Reason #1', function () {
        beforeEach(function () {
          model = '1'
          controller = Ember.Object.create()
          route.setupController(controller, model)
        })

        it('should set the reason property to 1', function () {
          expect(controller.get('reason')).to.equal('1')
        })

        it('should set the message correctly', function () {
          expect(controller.get('message')).to.equal(`Your account has been active for less than 6 months.
        Please try again later.`)
        })
      })
      describe('Reason #2', function () {
        beforeEach(function () {
          model = '2'
          controller = Ember.Object.create()
          route.setupController(controller, model)
        })

        it('should set the reason property to 2', function () {
          expect(controller.get('reason')).to.equal('2')
        })

        it('should set the message correctly', function () {
          expect(controller.get('message')).to.equal(`You have less than two repositories linked to your account. Please
        make sure that you have two personal repositories that you contribute to regularly and then
        try again.
        `)
        })
      })
      describe('Reason #3', function () {
        beforeEach(function () {
          model = '3'
          controller = Ember.Object.create()
          route.setupController(controller, model)
        })

        it('should set the reason property to 3', function () {
          expect(controller.get('reason')).to.equal('3')
        })

        it('should set the message correctly', function () {
          expect(controller.get('message')).to.equal(`You have contributed to less than 2 open
        source public repositories in the last six months. Please try to contribute to at
        least two open source repositories before trying again.
        `)
        })
      })

      describe('Reason #4', function () {
        beforeEach(function () {
          model = '4'
          controller = Ember.Object.create()
          route.setupController(controller, model)
        })

        it('should set the reason property to 4', function () {
          expect(controller.get('reason')).to.equal('4')
        })

        it('should set the message correctly', function () {
          expect(controller.get('message')).to.equal(`You already have an account opened. There is no need
        for you to sign up again. If you are having troubles, please contact the admin.`)
        })
      })

      describe('Reason #5', function () {
        beforeEach(function () {
          model = '5'
          controller = Ember.Object.create()
          route.setupController(controller, model)
        })

        it('should set the reason property to 5', function () {
          expect(controller.get('reason')).to.equal('5')
        })

        it('should set the message correctly', function () {
          expect(controller.get('message')).to.equal(`You do not have an account opened.
        Please create a valid GitHub account and try again later.`)
        })
      })

      describe('Default Reason', function () {
        beforeEach(function () {
          model = '0'
          controller = Ember.Object.create()
          route.setupController(controller, model)
        })

        it('should set the reason property to 0', function () {
          expect(controller.get('reason')).to.equal('0')
        })

        it('should set the message correctly', function () {
          expect(controller.get('message')).to.equal(`An error has occured. Please contact the site admin.
        Please include this number: ` + model)
        })
      })
    })

    it('exists', function () {
      expect(route).to.be.ok
    })
  }
)
