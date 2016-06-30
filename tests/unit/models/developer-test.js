import {expect} from 'chai'
import {describeModel, it} from 'ember-mocha'
import {beforeEach} from 'mocha'

const expectedAttrs = [
  'username',
  'token'
]

describeModel(
  'developer',
  'Developer',
  {
    unit: true
  },
  function () {
    let actualAttrs, model

    describe('Key tests', function () {
      beforeEach(function () {
        model = this.subject()
        actualAttrs = Object.keys(model.toJSON())
      })

      expectedAttrs.forEach((name) => {
        it(`defines attribute "${name}"`, function () {
          expect(actualAttrs).to.include(name)
        })
      })

      it('token should default to empty string', function () {
        expect(model.get('token')).to.equal('')
      })

      it('username should be the username passed in', function () {
        expect(model.get('username')).to.equal('')
      })
    })

    describe('Non Default Tests', function () {
      beforeEach(function () {
        model = this.subject({username: 'test', token: '123456'})
      })

      it('token should update if a token is passed in', function () {
        expect(model.get('token')).to.equal('123456')
      })

      it('should update the username if a username is passed in', function () {
        expect(model.get('username')).to.equal('test')
      })
    })
  }
)
