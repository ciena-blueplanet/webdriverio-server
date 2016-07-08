import Ember from 'ember'

export default Ember.Route.extend({
  beforeModel: function () {
    if (!window._isAuthenticated_) {
      this.transitionTo('login')
    }
  }
})
