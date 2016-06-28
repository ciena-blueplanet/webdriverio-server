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
        Ember.$('.result').addClass('failure')
        Ember.$('.result').removeClass('success')
        Ember.$('.result').text('An error has occured: \n' + err)
        Ember.Logger.debug(err)
      })
      this.set('isFormDisabled', false)
    },
    getUserInfo () {
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
          Ember.Logger.debug(err)
        })
      this.set('isFormDisabled', false)
    },
    updateUserInfo () {
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
          Ember.Logger.debug(err)
        })
      this.set('isFormDisabled', false)
    },
    deleteUser () {
      const username = this.get('info').username
      const token = ''
      this.get('store').queryRecord('developer', {
        username,
        token
      })
        .then((developer) => {
          return developer.destroyRecord()
        })
        .then((res) => {
          Ember.$('.result').removeClass('failure')
          Ember.$('.result').addClass('success')
          Ember.$('.result').text('The user with the username: ' + username + ' was successfully deleted.')
        })
        .catch((err) => {
          Ember.$('.result').addClass('failure')
          Ember.$('.result').removeClass('success')
          Ember.$('.result').text('An error has occured: \n' + err)
          Ember.Logger.debug(err)
        })
      this.set('isFormDisabled', false)
    },
    formChange (value) {
      this.set('info', value)
    },
    formValidation (validation) {
      this.set('isFormInvalid', validation.errors.length !== 0)
    }
  }
})
