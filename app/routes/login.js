import Ember from 'ember'

export default Ember.Route.extend({
  beforeModel: function () {
    if (window) {
      window._isAuthenticated_ = false
    }
  }
})
