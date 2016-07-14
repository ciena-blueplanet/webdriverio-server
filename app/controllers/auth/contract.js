import Ember from 'ember'
import generateToken from '../../utils/generateToken'

export default Ember.Controller.extend({
  checked: false,
  confirmed: false,
  disabled: true,
  token: '',
  actions: {
    onInputHandler: function () {
      this.set('checked', !this.get('checked'))
      this.set('disabled', !this.get('checked'))
    },
    submitForm: function () {
      this.set('confirmed', true)
      const username = this.get('username')
      const token = generateToken(30)
      this.set('username', username)
      this.set('token', token)
      return this.get('store').createRecord('developer', {
        username,
        token
      })
      .save()
      .then((res) => {
        Ember.Logger.debug('For the user with this username: ' +
                          username + ', their testing token is: ' +
                          token)
      })
      .catch((err) => {
        window.alert('An error has occured. Please contact the admin and give them this message:\n' + err)
        Ember.Logger.debug('An error has occured! ' + err)
      })
    }
  }
})
