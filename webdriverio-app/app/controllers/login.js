import Ember from 'ember'

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
      Ember.run.later(() => {
        const username = this.get('loginInfo').username
        const password = this.get('loginInfo').password
        console.log('username: ' + username)
        console.log('password: ' + password)
        this.set('isFormDisabled', false)
      }, 3000)
    }
  }
})
