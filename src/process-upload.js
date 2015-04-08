'use strict';

var ns = {};
var childProcess = require('child_process');

/*
var psTree = require('ps-tree');

var kill = function (pid, signal, callback) {
    signal   = signal || 'SIGKILL';
    callback = callback || function () {};
    var killTree = true;
    if(killTree) {
        psTree(pid, function (err, children) {
            [pid].concat(
                children.map(function (p) {
                    return p.PID;
                })
            ).forEach(function (tpid) {
                try { process.kill(tpid, signal) }
                catch (ex) { }
            });
            callback();
        });
    } else {
        try { process.kill(pid, signal) }
        catch (ex) { }
        callback();
    }
};
*/

ns.newFile = function (filename, res) {
    console.log('------------------- newFile');
    var info = [];
    var error = [];
    var seconds = seconds = Math.floor(new Date().getTime() / 1000);
    var child = childProcess.spawn('bash', ['./src/exec.sh', filename, seconds]);

    child.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
        info.push(data)
    });
    child.stderr.on('data', function(data) {
        console.log('sterr: ' + data);
        error.push(data)
    });
    child.on('exit', function(code) {
        console.log('closing code: ' + code);
        var output = {
            exitCode: code,
            info: info.join(''),
            error: error.join(''),
            output: 'screenshots/' + seconds + '.tar',
        };
        res.send(JSON.stringify(output));
        res.end();
    });
};

module.exports = ns;
