import Ember from 'ember'
import generateToken from '../utils/generateToken'
const TOKEN_LENGTH = 30

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
  init () {
    this._super(...arguments)
    this.set('data', [])
    this.send('getAll')
  },
  username: '',
  token: '',
  selectedIndex: [0],
  actions: {
    /**
     * Gets all users and their tokens from the database
     */
    getAll: function () {
      this.get('store').query('developer',
        {
          queryAll: 1
        })
        .then((res) => {
          let filteredResult = res.filter((item) => {
            // Filters out the md5 hash (32 characters)
            return item.get('token').length <= TOKEN_LENGTH
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
    /**
     * Updates the resticted buttons depending on the token generated
     */
    updateDOM: function () {
      Ember.$('#username_label').text(this.get('username'))
      Ember.$('#token_label').text(this.get('token'))
      Ember.$('.general_info').show()
      Ember.$('.action_generate').show()
      if (this.get('token') === '~') {
        Ember.$('.restricted_info').show()
        Ember.$('.action_unrestrict').show()
        Ember.$('.action_restrict').hide()
      } else {
        Ember.$('.restricted_info').hide()
        Ember.$('.action_restrict').show()
        Ember.$('.action_unrestrict').hide()
      }
    },
    createUser: function (element) {
      return this.get('store').createRecord('developer', {
        username: element.label,
        token: element.value
      })
      .save()
      .then((res) => {
        Ember.Logger.debug('For the user with this username: ' + res.get('username') + ', their testing token is: ' + res.get('token'))
      })
      .catch((err) => {
        const data = this.get('data')
        const index = data.indexOf(element)
        if (index !== -1) {
          data.splice(index, 1)
        }
        this.set('data', Ember.A(data))
        Ember.Logger.debug(err)
      })
    },
    /**
     * Creates a user if they do not exist already and populates them in the selection of data
     */
    createUserHandler: function () {
      const username = this.get('info').username
      const token = generateToken(30)
      const element = {
        label: username,
        value: token
      }
      this.send('createUser', element)
      const data = this.get('data').toArray()
      const index = data.indexOf(element)
      if (index === -1) {
        data.unshift(element)
        this.set('data', Ember.A(data))
        this.set('selectedIndex', [0])
        this.send('onChangeHandler', token)
      } else {
        alert('This person with username ' + username + 'already exists')
      }
    },
    /**
     * Generates a new token for the given user
     */
    generateHandler: function () {
      const token = generateToken(TOKEN_LENGTH)
      const element = {
        label: this.get('username'),
        value: token
      }
      this.send('createUser', element)
      this.set('token', token)
      this.send('updateDOM')
    },
    /**
     * Restricts the user by generating a token equal to ~
     */
    restrictHandler: function () {
      const token = '~'
      const element = {
        label: this.get('username'),
        value: token
      }
      this.send('createUser', element)
      this.set('token', token)
      this.send('updateDOM')
    },
    /**
     * Unrestricts the user by generating a new token
     */
    unrestrictHandler: function () {
      this.send('generateHandler')
    },
    /**
     * When a username is chosen from the list, their information is retrieved
     * and displayed on the DOM
     * @param {String} token - The token associated with the user
     */
    onChangeHandler: function (token) {
      token = token.toString()
      const result = Ember.$.grep(this.get('data'), function (element) {
        return element.value === token
      })
      if (result.length) {
        this.setProperties({
          username: result[0].label,
          token: token
        })
        this.send('updateDOM')
      }
    }
  }
})
