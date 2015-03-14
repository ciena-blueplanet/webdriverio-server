/**
 * Gruntfile for webdriverio-server
 * @copyright 2015 . All rights reserved.
 */

'use strict';

var _ = require('lodash');
var helper = require('cy-toolkit').gruntHelper;

var allJsFiles = [
    './Gruntfile.js',
    'src/**/*.js',
    'spec/**/*.js',
];

module.exports = function (grunt) {

    // initialize the helper with the grunt instance
    helper.init(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        eslint: helper.opts.eslint({
            files: allJsFiles,
        }),

        filenames: helper.opts.filenames({
            files: _.without(allJsFiles, './Gruntfile.js'),
        }),

        jsdoc: helper.opts.jsdoc(),
    });

    // register aliases (dependencies will be loaded when they are run)
    helper.registerTaskAlias('default', []);
    helper.registerTaskAlias('lint', ['eslint', 'filenames']);
};
