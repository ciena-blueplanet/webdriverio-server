import {expect} from 'chai'
import {it} from 'ember-mocha'
import {describe} from 'mocha'
import {generateToken} from 'webdriverio-server/app/utils/generateToken'

describe('Generate Token', function () {
  describe('General Case', function () {
    it('should generate a 30 character length token', function () {
      const token = generateToken(30)
      expect(token.length).to.equal(30)
    })
  })

  describe('Edge Cases', function () {
    it('should generate an error if passed not a number', function () {
      expect(generateToken('test')).to.throw()
    })

    it('should generate an error if passed a number less than 0', function () {
      expect(generateToken(-1)).to.throw()
    })
  })
})
