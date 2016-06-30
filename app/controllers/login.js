import Ember from 'ember'
import md5 from 'npm:blueimp-md5'

export default Ember.Controller.extend({
  loginModel: {
    properties: {
      username: {
        type: 'string'
      },
      password: {
        type: 'string'
      }
    },
    type: 'object'
  },
  loginView: {
    containers: [
      {
        id: 'main',
        rows: [
          [
            {
              label: 'Username',
              model: 'username'
            }
          ],
          [
            {
              model: 'password',
              properties: {
                type: 'password'
              }
            }
          ]
        ]
      }
    ],
    rootContainers: [
      {
        container: 'main',
        label: 'Main'
      }
    ],
    type: 'form',
    version: '1.0'
  },
  isFormInvalid: true,
  actions: {
    /**
     * @param {Object} value - the json object containing the username and password typed in
     * by the user
     */
    formChange (value) {
      this.set('loginInfo', value)
    },
    /**
     * @param {Object} validation - a json object indicating the number of errors in the form
     */
    formValidation (validation) {
      this.set('isFormInvalid', validation.errors.length !== 0)
    },
    /**
     * When the user clicks the `Log In` button, this function will extract the username and password
     * typed in and attempt to validate those against the hashed version stored in the database. If the
     * username and password match, they are redirected to the admin portal route.
     */
    submitForm () {
      const {username, password} = this.get('loginInfo')
      this.get('store').queryRecord('developer', {
        username: md5(username),
        token: md5(password)
      })
      .then((res) => {
        return this.get('store').queryRecord('developer', {
          token: md5(username),
          username: md5(password)
        })
      })
      .then((res) => {
        this.transitionToRoute('portal')
      })
      .catch((err) => {
        Ember.Logger.debug(err)
        Ember.$('.login-result').addClass('failure')
        Ember.$('.login-result').removeClass('success')
        Ember.$('.login-result').text('Authentication Failed')
      })
      this.set('isFormDisabled', false)
    }
  }
})
