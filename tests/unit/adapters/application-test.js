import {expect} from 'chai'
import {describeModule, it} from 'ember-mocha'
import {beforeEach} from 'mocha'

describeModule(
  'adapter:application',
  'ApplicationAdapter',
  {
    unit: true
  },
  function () {
    let adapter

    beforeEach(function () {
      adapter = this.subject()
    })

    it('has correct namespace', function () {
      expect(adapter.namespace).to.equal('')
    })
  })
