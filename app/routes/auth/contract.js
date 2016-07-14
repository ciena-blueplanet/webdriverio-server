import Ember from 'ember'

/**
 * Status Code References
 * 510 - The user does not have a github account (Reason = 5)
 * 520 - The user has already signed up (Reason = 4)
 */

const USER_DOES_NOT_EXIST = 5
const ALREADY_HAS_ACCOUNT = 4
const ERROR_ROUTE = 0

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
          this.transitionTo('auth.denied', {queryParams: {reason: USER_DOES_NOT_EXIST}})
        } else if (err.errors[0].status === '520') {
          this.transitionTo('auth.denied', {queryParams: {reason: ALREADY_HAS_ACCOUNT}})
        } else {
          this.transitionTo('auth.denied', {queryParams: {reason: ERROR_ROUTE}})
        }
        Ember.Logger.debug(err)
      })
  },
  setupController: function (controller, model) {
    controller.set('model', model)
    controller.set('username', model.username)
  }
})
