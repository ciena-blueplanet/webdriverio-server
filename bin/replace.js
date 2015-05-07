#!/usr/bin/env node

/**
 * Simple script to replace dotted keys in a json file with new values.
 * It takes a filename as the first parameter, then a number of key:value pairs
 * @author Adam Meadows [job13er](https://github.com/job13er)
 * @copyright 2015 Cyan, Inc. All rights reserved.
 */

'use strict';

var path = require('path');
var fs = require('fs');


/**
 * Replace the possibly nested keyStr with the given value in obj
 * @param {Object} object - the object to manipulate
 * @param {String} keyStr - possibly dotted object key
 * @param {*} value - the new value
 */
function replace(object, keyStr, value) {
    var keys = keyStr.split('.');
    for (var i = 0, len = keys.length - 1; i < len; i++) {
        console.log('traversing ' + keys[i]);
        object = object[keys[i]];
    }


    // handle special case for `port` to make it an integer
    if (keys[len] === 'port') {
        value = parseInt(value, 10);
    }

    console.log('setting ' + keys[len] + ' to ' + value);
    object[keys[len]] = value;
}

/**
 * @typedef Pair
 * @property {String} keyStr - possibly dotted key(s)
 * @property {String} value - since this is coming from the command line, all values will be strings
 */

/**
 * Get the list of key/value pairs
 * @returns {Pair[]} array of pairs from command line arguments
 */
function getPairs() {
    var pairs = [];
    var pair = [];
    for (var i = 3, len = process.argv.length; i < len; i++) {
        pair = process.argv[i].split(':');
        console.log(JSON.stringify(pair));
        pairs.push({
            keyStr: pair[0],
            value: pair[1],
        });
    }

    return pairs;
}

function main() {
    var filename = path.join(process.cwd(), process.argv[2]);
    var json = require(filename);

    var pairs = getPairs();
    var pair;
    for (var i = 0, len = pairs.length; i < len; i++) {
        pair = pairs[i];
        replace(json, pair.keyStr, pair.value);
    }

    fs.writeFileSync(filename, JSON.stringify(json, null, 4));
}

main();
