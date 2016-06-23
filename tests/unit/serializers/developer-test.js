/* jshint expr:true */
import { expect } from 'chai'
import { describeModel, it } from 'ember-mocha'

describeModel(
  'developer',
  'Unit | Serializer | developer',
  {
    // Specify the other units that are required for this test.
    needs: ['serializer:developer']
  },
  function () {
    // Replace this with your real tests.
    it('serializes records', function () {
      let record = this.subject()

      let serializedRecord = record.serialize()

      expect(serializedRecord).to.be.ok
    })
  }
)
