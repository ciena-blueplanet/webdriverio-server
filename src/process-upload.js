/**
 * @author Peter Banka [@psbanka](https://github.com/psbanka)
 * @copyright 2015 Cyan Inc. All rights reserved.
 */

'use strict';

var childProcess = require('child_process');
var debug = require('debug')('server');
var path = require('path');

var ns = {
    scriptPath: path.join(__dirname, './exec.sh'),
};

var strip = function (data) {
    return data.toString().replace(/(\r\n|\n|\r)/gm, '');
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
    debug('------------------- newFile');
    var info = [];
    var seconds = Math.floor(new Date().getTime() / 1000);
    var child = childProcess.spawn('bash', [this.scriptPath, filename, entryPoint, seconds]);

    child.stdout.on('data', function (data) {
        debug('stdout: ' + strip(data));
        info.push(data);
    });
    child.stderr.on('data', function (data) {
        debug('sterr: ' + strip(data));
        info.push(data);
    });
    child.on('exit', function (code) {
        debug('closing code: ' + code);
        var output = {
            exitCode: code,
            info: info.join(''),
            output: 'screenshots/' + seconds + '.tar',
        };
        res.send(JSON.stringify(output));
        res.end();
        // TODO: setTimeout to delete the screenshots file in 30s
    });
};

module.exports = ns;
