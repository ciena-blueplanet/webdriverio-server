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
      Ember.run.later(() => {
        const {username, password} = this.get('loginInfo')
        this.get('store').queryRecord('developer', {
          username: md5(username),
          token: md5(password)
        }).then((res) => {
          this.get('store').queryRecord('developer', {
            token: md5(username),
            username: md5(password)
          }).then((res) => {
            this.transitionToRoute('')
          }).catch((err) => {
            throw err
          })
        }).catch((err) => {
          throw err
        })
        this.set('isFormDisabled', false)
      }, 1000)
    }
  }
})
