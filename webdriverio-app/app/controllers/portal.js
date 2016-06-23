import Ember from 'ember'
import generateToken from '../utils/generateToken'

export default Ember.Controller.extend({
  portalModel: {
    properties: {
      username: {
        type: 'string'
      }
    },
    required: ['username'],
    type: 'object'
  },
  portalView: {
    containers: [
      {
        id: 'main',
        rows: [
          [
            {
              label: 'GitHub Username',
              model: 'username'
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
    createUser () {
      Ember.run.later(() => {
        const token = generateToken(30)
        const username = this.get('info').username
        this.get('store').createRecord('developer', {
          username,
          token
        })
        .save()
        .then((res) => {
          Ember.$('.result').removeClass('failure')
          Ember.$('.result').addClass('success')
          Ember.$('.result').text('The user with the username: ' + username + ' was successfully created.\nTheir testing token is: ' + token)
        }).catch((err) => {
          throw err
        })
        this.set('isFormDisabled', false)
      }, 500)
    },
    getUserInfo () {
      Ember.run.later(() => {
        const username = this.get('info').username
        const token = ''
        this.get('store').queryRecord('developer', {
          username,
          token
        })
          .then((res) => {
            Ember.$('.result').removeClass('failure')
            Ember.$('.result').addClass('success')
            Ember.$('.result').text('For the user with this username: ' + res.get('username') + ', their testing token is: ' + res.get('token'))
          })
          .catch((err) => {
            Ember.$('.result').addClass('failure')
            Ember.$('.result').removeClass('success')
            Ember.$('.result').text('No such user exists for the username: ' + username)
            throw err
          })
        this.set('isFormDisabled', false)
      }, 500)
    },
    updateUserInfo () {
      Ember.run.later(() => {
        const token = generateToken(30)
        const username = this.get('info').username
        this.get('store').createRecord('developer', {
          username,
          token
        })
          .save()
          .then((res) => {
            Ember.$('.result').removeClass('failure')
            Ember.$('.result').addClass('success')
            Ember.$('.result').text('The user with the username: ' + username + ' was successfully updated. Their testing token is: ' + token)
          }).catch((err) => {
            Ember.$('.result').addClass('failure')
            Ember.$('.result').removeClass('success')
            Ember.$('.result').text('An error has occured: \n' + err)
            throw err
          })
        this.set('isFormDisabled', false)
      }, 500)
    },
    deleteUser () {
      Ember.run.later(() => {
        const username = this.get('info').username
        const token = ''
        this.get('store').queryRecord('developer', {
          username,
          token
        })
          .then((developer) => {
            developer.destroyRecord()
          })
          .then((res) => {
            Ember.$('.result').removeClass('failure')
            Ember.$('.result').addClass('success')
            Ember.$('.result').text('The user with the username: ' + username + ' was successfully deleted.')
          }).catch((err) => {
            Ember.$('.result').addClass('failure')
            Ember.$('.result').removeClass('success')
            Ember.$('.result').text('An error has occured: \n' + err)
            throw err
          })
        this.set('isFormDisabled', false)
      }, 500)
    },
    formChange (value) {
      this.set('info', value)
    },
    formValidation (validation) {
      this.set('isFormInvalid', validation.errors.length !== 0)
    }
  }
})
