import Ember from 'ember'

const NO_REASON = 6

export default Ember.Route.extend({
  queryParams: {
    reason: {
      refreshModel: true
    }
  },
  /**
   * This function will return whether the reason why
   * the developer was denied access to the server
   * @param {Object} params - Contains the reason paramter
   * @returns {Number} - The reason why a developer why denied access
   */
  model: function (params) {
    if (params.reason) {
      return params.reason
    }
    return NO_REASON
  },
  /**
   * Displays on the DOM why the developer was denied
   * @param {Object} controller - The ember object representing the controller
   * @param {Number} model - The reason why the developer was denied access to the server
   */
  setupController: function (controller, model) {
    controller.set('reason', model)
    Ember.$.get('/auth/denied', {
      reason: model
    }, (res) => {
      controller.set('message', res)
    })
  }
})
