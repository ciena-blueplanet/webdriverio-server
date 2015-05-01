/**
 * @author Peter Banka [@psbanka](https://github.com/psbanka)
 * @copyright 2015 Cyan Inc. All rights reserved.
 */

'use strict';

var childProcess = require('child_process');
var debug = require('debug')('server');
var path = require('path');
var fs = require('fs');

var ns = {
    scriptPath: path.join(__dirname, './exec.sh'),
};

var strip = function (data) {
    return data.toString().replace(/(\r\n|\n|\r)/gm, '');
};


/**
 * Collect information from the child process
 * @param {Child} child - child process
 * @param {Number} seconds - timestamp when process started
 */
var watchChild = function (child, seconds) {
    var info = [];

    child.stdout.on('data', function (data) {
        if (data) {
            debug(seconds + ': ' + info.length + ':' + strip(data));
            info.push(data);
        }
    });

    child.stderr.on('data', function (data) {
        if (data) {
            debug(seconds + ': ' + info.length + ':' + strip(data));
            info.push(data);
        }
    });

    // TODO: setTimeout to delete the screenshots file in 30s
    child.on('exit', function (code) {
        debug('closing code: ' + code);
        debug('Returning ' + info.length + ' lines of output');
        var output = {
            exitCode: code,
            info: info.join(''),
            output: 'screenshots/' + seconds + '.tar',
        };
        try {
            output = JSON.stringify(output);
        } catch (e) {
            debug('ERROR: ', e);
            output = {
                exitCode: code,
                info: e.toString(),
                output: 'screenshots/' + seconds + '.tar',
            };
            try {
                output = JSON.stringify(output);
            } catch (e) {
                output = 'ERROR';
            }
        }
        var filename = path.join(__dirname, '../screenshots/output-' + seconds + '.json');
        fs.writeFile(filename, output, function (err) {
            if (err) {
                debug(seconds + ' : UNABLE TO WRITE FILE ' + filename + ' -- ' + err.toString());
            } else {
                debug(seconds + ' : ' + filename + ' saved');
            }
        });
    });
};

/**
 * We have received a request to process a new file
 * spawn a shell process to do all the operations and
 * watch the output of that process. Then bundle up a json
 * response for the requester.
 * @param {String} filename - the name of the tar file that was uploaded
 * @param {String} entryPoint - the URL to start testing
 * @param {Response} res - the express response object
 */
ns.newFile = function (filename, entryPoint, res) {
    var seconds = Math.floor(new Date().getTime() / 1000);
    debug('START: ------------ ' + seconds);
    var child;
    for (var index = 0; index < 3; index++) {
        var buildDir = path.join(__dirname, '../build-' + index);
        var self = this;
        if (fs.existsSync(buildDir)) {
            // We found a waiting build directory
            child = childProcess.spawn('bash', [self.scriptPath, index, filename, entryPoint, seconds]);
            watchChild(child, seconds);
            res.send(seconds.toString());
            res.end();
            break;
        }
    }
    if (!child) {
        var msg = 'Server is busy. Try again later';
        debug(msg);
        res.status(500).send(msg);
    }
};

module.exports = ns;
