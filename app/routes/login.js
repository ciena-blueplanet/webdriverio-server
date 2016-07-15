import Ember from 'ember'

export default Ember.Route.extend({
  queryParams: {
    failure: {
      refreshModel: true
    }
  },
  model: function (params) {
    if (params.failure) {
      Ember.$('.login-result').text('Authentication Failed')
    }
  }
})
