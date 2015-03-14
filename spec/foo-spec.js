/**
 * Example spec file to show tests working
 * TODO: Replace me with some real code
 * @copyright 2015 . All rights reserved.
 */

'use strict';

var t = require('cy-toolkit').transplant(__dirname);
var foo = t.require('./foo');

describe('foo', function () {
    var obj;
    beforeEach(function () {
        obj = {
            foo: 'foo',
        };
    });

    it('gets the property', function () {
        expect(foo.get(obj, 'foo', 'bar')).toBe('foo');
    });

    it('uses the default if property is missing', function () {
        expect(foo.get(obj, 'baz', 'bar')).toBe('bar');
    });
});
