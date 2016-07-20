import Ember from 'ember'
import parseAndRedirect from '../../utils/parseAndRedirect'

export default Ember.Route.extend({
  /**
   * This makes sure that the express session is still intact before loading the 
   * contract. If it is not intact, the user is redirected to a denied access page 
   * and must try again.
   */
  beforeModel: function () {
    Ember.$.get('/session', (res) => {
      if (res && res.redirect && typeof res.redirect === 'string') {
        parseAndRedirect(res.redirect, this)
      }
    })
  }
})
