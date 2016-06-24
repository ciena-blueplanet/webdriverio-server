import {expect} from 'chai'
import DS from 'ember-data'
import {describeModule, it} from 'ember-mocha'
import {beforeEach} from 'mocha'
import Developer from 'webdriverio-server/models/developer'
import setupStore from '../../helpers/store'

describeModule(
  'serializer:developer',
  'DeveloperSerializer',
  {
    unit: true
  },
  function () {
    let env, mockResourceClass, serializer, payload, response

    beforeEach(function () {
      serializer = this.subject()
      env = setupStore({
        adapter: DS.RESTAdapter,
        developer: Developer,
        serializer
      })
      mockResourceClass = env.store.modelFor('developer')
    })

    afterEach(function () {
      payload = null
      response = null
    })

    it('specified proper modelName', function () {
      const actual = serializer.get('modelName')
      expect(actual).to.equal('developer')
    })

    it('specified proper primary key', function () {
      const actual = serializer.get('primaryKey')
      expect(actual).to.equal('username')
    })

    describe('.normalizeQueryRecordResponse()', function () {

      beforeEach(function () {
        payload = {
          username: 'test',
          token: 'abc123'
        }
      })

      it('normalizes the query record reponse to be of type developer', function () {
        response = serializer.normalizeQueryRecordResponse(env.store, mockResourceClass, payload, null, null)
        expect(response.data['type']).to.equal('developer')
      })

      it('normalizes the query record response', function () {
        response = serializer.normalizeQueryRecordResponse(env.store, mockResourceClass, payload, null, null)
        expect(response.data['attributes']).to.deep.equal(payload)
      })
    })

    describe('.normalizeCreateRecordResponse()', function () {

      beforeEach(function () {
        payload = {
          username: 'testCreate',
          token: 'abc1234'
        }
      })

      it('normalizes the create record reponse to be of type developer', function () {
        response = serializer.normalizeCreateRecordResponse(env.store, mockResourceClass, payload, null, null)
        expect(response.data['type']).to.equal('developer')
      })

      it('normalizes the create record response', function () {
        response = serializer.normalizeCreateRecordResponse(env.store, mockResourceClass, payload, null, null)
        expect(response.data['attributes']).to.deep.equal(payload)
      })
    })

    describe('.normalizeDeleteRecordResponse()', function () {
      beforeEach(function () {
        payload = {
          username: 'testDelete',
          token: 'abc123deletetoken'
        }
      })

      it('normalizes the delete record reponse to be of type developer', function () {
        response = serializer.normalizeDeleteRecordResponse(env.store, mockResourceClass, payload, null, null)
        expect(response.data['type']).to.equal('developer')
      })

      it('normalizes the delete record response', function () {
        response = serializer.normalizeDeleteRecordResponse(env.store, mockResourceClass, payload, null, null)
        expect(response.data['attributes']).to.deep.equal(payload)
      })
    })
  }
)
