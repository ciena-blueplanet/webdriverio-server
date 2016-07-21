import Ember from 'ember'
import parseAndRedirect from '../../utils/parseAndRedirect'

export default Ember.Controller.extend({
  checked: false,
  confirmed: false,
  disabled: true,
  token: '',
  actions: {
    /**
     * This is executed when the user clicks the checkbox
     */
    onInputHandler: function () {
      this.set('checked', !this.get('checked'))
      this.set('disabled', !this.get('checked'))
    },
    /**
     * This is executed when the user accepts the contract. It will
     * post to the /auth/contract route, which will generate a token and pass
     * their username and token back in a json object
     */
    submitForm: function () {
      this.set('confirmed', true)
      Ember.$.post('/auth/contract', (res) => {
        if (!res) {
          Ember.Logger.debug('An error has occured ' + res)
        } else if (res.username && res.token) {
          this.set('username', res.username)
          this.set('token', res.token)
        } else if (typeof res.redirect === 'string' && res.redirect.startsWith('/#/auth/denied?')) {
          parseAndRedirect(res.redirect, this)
        } else {
          Ember.Logger.debug('An error has occured! ' + res)
        }
      })
    }
  }
})
