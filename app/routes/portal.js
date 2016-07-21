import Ember from 'ember'

export default Ember.Route.extend({
  beforeModel: function () {
    Ember.$.get('/portal', (authStatus) => {
      if (authStatus === 'NotAuthenticated') {
        this.transitionTo('login')
      }
    })
  }
})
