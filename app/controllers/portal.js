import Ember from 'ember'
import generateToken from '../utils/generateToken'

/**
 * @param {String} message - The message displayed to the user when the call made to the backend succeeds
 */
function success (message) {
  Ember.$('.result').removeClass('failure')
  Ember.$('.result').addClass('success')
  Ember.$('.result').text(message)
}

/**
 * @param {String} message - The message displayed to the user when the call made to the backend fails
 * @param {String} err - The actual error message
 */
function failure (message, err) {
  Ember.$('.result').addClass('failure')
  Ember.$('.result').removeClass('success')
  Ember.$('.result').text(message)
  Ember.Logger.debug(err)
}

export default Ember.Controller.extend({
  portalModel: {
    properties: {
      username: {
        type: 'string'
      }
    },
    type: 'object'
  },
  portalView: {
    containers: [
      {
        id: 'main',
        rows: [
          [
            {
              label: 'Username',
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
  selectedIndex: 1,
  init () {
    this._super(...arguments)
    this.set('data', [])

    this.get('store').query('developer',
      {
        queryAll: 1
      })
      .then((res) => {
        console.log(res)
        let filteredResult = res.filter((item) => {
          // Filters out the md5 hash (32 characters)
          return item.get('token').length <= 30
        }).map((result) => {
          return {
            label: result.get('username'),
            value: result.get('token')
          }
        })
        this.set('data', filteredResult)
      })
      .catch((err) => {
        Ember.Logger.debug(err)
      })
  },
  actions: {
    /**
     * When the user clicks the `Create User` button, this function is called. It first generates
     * a random 30 character token. It then extracts the username and combines those two into a record
     * which gets sent to the backend.
     */
    createUser () {
      const token = generateToken(30)
      const username = this.get('info').username
      this.get('store').createRecord('developer', {
        username,
        token
      })
      .save()
      .then((res) => {
        success('The user with the username: ' + username + ' was successfully created.\nTheir testing token is: ' + token)
      }).catch((err) => {
        failure('An error has occured: \n' + err, err)
      })
      this.set('isFormDisabled', false)
    },
    /**
     * When the user clicks the `Get User` button, this function is called. It extracts the username
     * from the `info` object, then query's for the record contains the key which is the username.
     * It will either return that the user exists and the token is __ or that the user does not exist.
     */
    getUserInfo () {
      const username = this.get('info').username
      const token = ''
      this.get('store').queryRecord('developer', {
        username,
        token
      })
        .then((res) => {
          success('For the user with this username: ' + res.get('username') + ', their testing token is: ' + res.get('token'))
        })
        .catch((err) => {
          failure('No such user exists for the username: ' + username, err)
        })
      this.set('isFormDisabled', false)
    },
    /**
     * When the user clicks the `Update User` button, this function is called. It recreates the user
     * and overwrites the token that was stored in the backend. This update will return the token created.
     */
    updateUserInfo () {
      const token = generateToken(30)
      const username = this.get('info').username
      this.get('store').createRecord('developer', {
        username,
        token
      })
        .save()
        .then((res) => {
          success('The user with the username: ' + username + ' was successfully updated. Their testing token is: ' + token)
        }).catch((err) => {
          failure('An error has occured: \n' + err, err)
        })
      this.set('isFormDisabled', false)
    },
    /**
     * When the user click the `Delete User` button, this function is called. It will delete the user with the
     * given username if it exists. It will return successfully if the user existed and was deleted.
     */
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
          success('The user with the username: ' + username + ' was successfully deleted.')
        })
        .catch((err) => {
          failure('An error has occured: \n' + err, err)
        })
      this.set('isFormDisabled', false)
    },
    /**
     * @param {Object} value - When a username is typed into the `GitHub Username` text box, the 
     * value will include an entry for that username.
     */
    formChange (value) {
      this.set('info', value)
    },
    /**
     * @param {Object} validation - a json object indicating the number of errors in the form
     */
    formValidation (validation) {
      this.set('isFormInvalid', validation.errors.length !== 0)
    },
    confirmHandler: function () {
      this.notifications.addNotification({
        message: 'Confirmed',
        type: 'success',
        autoClear: true,
        clearDuration: 2000
      })
    },
    myCustomAction: function () {
      console.log('My Custom action triggered')
    }
  }
})
