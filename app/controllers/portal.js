import Ember from 'ember'
import generateToken from '../utils/generateToken'

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

    this.get('store').query('developer',
      {
        queryAll: 1
      })
      .then((res) => {
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
  username: '',
  token: '',
  selectedIndex: 1,
  actions: {
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
      this.get('store').createRecord('developer', {
        username: element.label,
        token: element.value
      })
      .save()
      .then((res) => {
        console.log('For the user with this username: ' + res.get('username') + ', their testing token is: ' + res.get('token'))
      })
      .catch((err) => {
        const data = this.get('data').toArray()
        const index = data.indexOf({element})
        if (index !== -1) {
          data.splice(index, 1)
        }
        this.set('data', Ember.A(data))
        throw err
      })
    },
    /**
     * Creates a user if they do not exist already and populates them in the selection of data
     */
    confirmHandler: function () {
      const username = this.get('info').username
      const token = generateToken(30)
      const element = {
        label: username,
        value: token
      }
      const index = this.get('data').indexOf({element})
      if (index === -1) {
        const data = this.get('data').toArray()
        data.unshift(element)
        this.set('data', Ember.A(data))
        this.set('selectedIndex', 0)
        this.send('onChangeHandler', token)
      } else {
        console.log('This person with username ' + username + 'already exists')
      }
    },
    generateHandler: function () {
      const token = generateToken(30)
      const element = {
        label: this.get('username'),
        value: token
      }
      this.send('createUser', element)
      this.set('token', token)
      this.send('updateDOM')
    },
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
    unrestrictHandler: function () {
      this.send('generateHandler')
    },
    onChangeHandler: function (token) {
      token = token.toString()
      const result = Ember.$.grep(this.get('data'), function (element) {
        return element.value === token
      })
      if (result.length > 0) {
        this.setProperties({
          username: result[0].label,
          token: token
        })
        this.send('updateDOM')
      }
    }
  }
})
