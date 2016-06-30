import RESTSerializer from 'ember-data/serializers/rest'

export default RESTSerializer.extend({
  modelName: 'developer',
  primaryKey: 'username',
  normalizeQueryRecordResponse: function (store, primaryModelClass, payload, id, requestType) {
    payload = {
      developer: payload
    }

    return this._super(store, primaryModelClass, payload, id, requestType)
  },
  normalizeCreateRecordResponse: function (store, primaryModelClass, payload, id, requestType) {
    payload = {
      developer: payload
    }

    return this._super(store, primaryModelClass, payload, id, requestType)
  },
  normalizeDeleteRecordResponse: function (store, primaryModelClass, payload, id, requestType) {
    payload = {
      developer: payload
    }

    return this._super(store, primaryModelClass, payload, id, requestType)
  }
})
