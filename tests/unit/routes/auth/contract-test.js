import { expect } from 'chai'
import {
  describeModule,
  it
} from 'ember-mocha'

describeModule(
  'route:auth/contract',
  'AuthContractRoute',
  {
    unit: true
  },
  function () {
    it('exists', function () {
      let route = this.subject()
      expect(route).to.be.ok
    })
  }
)
