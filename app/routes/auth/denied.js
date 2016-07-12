import Ember from 'ember'

export default Ember.Route.extend({
  queryParams: {
    reason: {
      refreshModel: true
    }
  },
  model: function (params) {
    return params.reason
  },
  setupController: function (controller, model) {
    controller.set('reason', model)
    console.log('Reason: ' + controller.get('reason'))
    switch (model) {
      case '1':
        controller.set('message', `Your account has been active for less than 6 months. Please try again later.`)
        break
      case '2':
        controller.set('message', `You have less than two repositories linked to your account. Please
        make sure that you have two personal repositories that you contribute to regularly and then
        try again.
        `)
        break
      case '3':
        controller.set('message', `You have contributed to less than 2 open ' +
        'source public repositories in the last six months. Please try to contribute to at
        least two open source repositories before trying again.
        `)
        break
      case '4':
        controller.set('message', 'You already have an account opened. There is no need ' +
        'for you to sign up again. If you are having troubles, please contact the admin.')
        break
      case '5':
        controller.set('message', 'You do not have an account opened. ' +
        'Please create a valid GitHub account and try again later.')
        break
      default:
        controller.set('message', 'An error has occured. Please contact the site admin. ' +
        'Please include this number: ' + model)
        break
    }
  }
})
