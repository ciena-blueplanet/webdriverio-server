'use strict';

var ns = {};
var childProcess = require('child_process');

ns.newFile = function (filename, res) {
    console.log('------------------- newFile');
    var cmd = 'bash ./exec.sh ' + filename;
    var tarcmd = childProcess.exec(cmd, function (err, stdout, stderr) {
        if (err) {
            console.log(err.stack);
            console.log('Error code: ' + err.code);
            console.log('Signal received: ' + err.signal);
        }
        console.log('Child Process STDOUT: ' + stdout);
        console.log('Child Process STDERR: ' + stderr);
    });

    tarcmd.on('exit', function (code) {
        console.log('Child process exited with exit code ' + code);
        res.send('Child process exited with exit code ' + code);
        res.end();
    });
};

module.exports = ns;
