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
  function() {
    it('exists', function() {
      let route = this.subject()
      expect(route).to.be.ok
    });
  }
);
