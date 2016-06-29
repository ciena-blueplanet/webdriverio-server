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
    required: ['username', 'password'],
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
    formChange (value) {
      this.set('loginInfo', value)
    },
    formValidation (validation) {
      this.set('isFormInvalid', validation.errors.length !== 0)
    },
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
