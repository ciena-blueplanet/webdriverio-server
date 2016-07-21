import Ember from 'ember'

export default Ember.Route.extend({
  queryParams: {
    failure: {
      refreshModel: true
    }
  },
  /**
   * If the login failed, a parameter is passed back, indicating that
   * a 'Authentication Failed' message should be displayed
   * @param {Object} params - Contains information on whether the login failed
   * @returns {Object} The parameter that were passed in
   */
  model: function (params) {
    return params
  },
  /**
   * Checks whether the parameters passed in contains a failure parameter. If it does,
   * it will set a 'Authentication Failed' message.
   * @param {Object} controller - The controller object
   * @param {Object} model - The object containing the parameters
   */
  setupController: function (controller, model) {
    if (model.failure) {
      controller.set('loginResult', true)
    } else {
      controller.set('loginResult', false)
    }
  }
})
