/**
 * @author Peter Banka [@psbanka](https://github.com/psbanka)
 * @copyright 2015 Cyan Inc. All rights reserved.
 */

'use strict';

var debug = require('debug')('server');
var express = require('express');
var fs = require('fs');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var multer = require('multer');

var app = express();

var processUpload = require('./process-upload');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

/*********************************************************************
 *                          The main method                          *
 *********************************************************************/
var done = false;

app.use(multer({
    dest: path.join(__dirname, '..', 'uploads'),
    rename: function (fieldname, filename) {
        return filename + '.' + Date.now();
    },
    onFileUploadStart: function (file) {
        debug('cient request is starting ...');
    },
    onFileUploadComplete: function (file) {
        debug(file.fieldname + ' uploaded to  ' + file.path);
        done = true;
    },
}));

app.get(/^\/status\/(\d+)$/, function (req, res) {
    var id = req.params[0];
    var filename = 'screenshots/output-' + id + '.json';
    console.log("filename: ", filename);
    fs.exists(filename, function (exists) {
        if (exists) {
            res.status(200).send('finished');
        } else {
            res.status(404).send('Not found');
        }
        res.end()
    });
});

/* GET home page. */
app.get('/', function (req, res) {
    res.render('index', {title: 'Webdriver server'});
});

app.post('/', function (req, res) {
    if (done) {
        var filename = req.files.tarball.name;
        var entryPoint = req.body['entry-point'] || 'demo';
        processUpload.newFile(filename, entryPoint, res);
    }
});

app.use('/screenshots', express.static(path.join(__dirname, '..', 'screenshots')));

/*********************************************************************
 *                          Error handling                           *
 *********************************************************************/

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    console.log(req.path);
    res.status(404).send('Not Found');
    res.end();
});

// error handler
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
    });
});


module.exports = app;
