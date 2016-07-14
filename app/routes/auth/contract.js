import Ember from 'ember'

/**
 * Status Code References
 * 510 - The user does not have a github account (Reason = 5)
 * 520 - The user has already signed up (Reason = 4)
 */

export default Ember.Route.extend({
  queryParams: {
    username: {
      refreshModel: true
    }
  },
  model: function (params) {
    return this.get('store').queryRecord('developer',
      {
        username: params.username,
        token: '!'
      })
      .then((res) => {
        return {
          username: params.username
        }
      })
      .catch((err) => {
        if (err.errors[0].status === '510') {
          this.transitionTo('auth.denied', {queryParams: {reason: 5}})
        } else if (err.errors[0].status === '520') {
          this.transitionTo('auth.denied', {queryParams: {reason: 4}})
        } else {
          this.transitionTo('auth.denied', {queryParams: {reason: 0}})
        }
        Ember.Logger.debug(err)
      })
  },
  setupController: function (controller, model) {
    controller.set('model', model)
    controller.set('username', model.username)
  }
})
