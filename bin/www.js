#!/usr/bin/env node

/**
 * @author Peter Banka [psbanka](https://github.com/psbanka)
 * @author Adam Meadows [job13er](https://github.com/job13er)
 * @copyright 2015 Cyan, Inc. All rights reserved.
 */

'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('server');
var http = require('http');

var app = require('../src/app');

/**
 * Normalize a port into a number, string, or false.
 * @param {String} val - the port to normalize
 * @returns {Number|String} - the port number or named pipe or false
 */
function normalizePort(val) {
    var portNum = parseInt(val, 10);

    if (isNaN(portNum)) {
        // named pipe
        return val;
    }

    if (portNum >= 0) {
        // port number
        return portNum;
    }

    return false;
}

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var server = http.createServer(app);

// Listen on provided port, on all network interfaces.
server.listen(port);

server.on('error', function (error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            throw new Error(bind + 'requires elevated privileges');
        case 'EADDRINUSE':
            throw new Error(bind + ' is already in use');
        default:
            throw error;
    }
});

server.on('listening', function () {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
});
