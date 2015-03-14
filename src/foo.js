/**
 * Example file to show tests working
 * TODO: Replace me with some real code
 * @copyright 2015 . All rights reserved.
 */

'use strict';

var _ = require('lodash');

var ns = {};

/**
 * Get the given property name (key) from the given object, or defaultValue if key doesn't exist
 * @param {Object} obj - the object to 'get' a property from
 * @param {String} key - the property name
 * @param {Object} defaultValue - the value to return if 'key' doesn't exist as a property on 'obj'
 * @returns {Object} the property on 'obj' represented by 'key' or the 'defaultValue'
 */
ns.get = function (obj, key, defaultValue) {
    return _.has(obj, key) ? obj[key] : defaultValue;
};

module.exports = ns;
