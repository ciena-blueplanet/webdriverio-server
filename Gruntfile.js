/**
 * Gruntfile for webdriverio-server
 * @copyright 2015 Cyan Inc. All rights reserved.
 */

'use strict';

module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-filenames');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        eslint: {
            files: [
                './Gruntfile.js',
                'bin/**/*.js',
                'src/**/*.js',
                'spec/**/*.js',
            ],

            options: {
                config: '.eslintrc',
                rulesdir: ['node_modules/beaker/src/eslint-rules'],
            },
        },

        filenames: {
            src: [
                'bin/**/*.*',
                'src/**/*.*',
                'spec/**/*.*',
                '!**/Gruntfile.js',
                '!node_modules/**',
            ],

            options: {
                valid: /^[a-z0-9\-\.]+\.([^\.]+)$/,
            },
        },
    });

    grunt.registerTask('lint', ['eslint', 'filenames']);
    grunt.registerTask('default', []);
};
