'use strict';

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var multer = require('multer');

var app = express();

var processUpload = require('./process-upload.js');
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
    dest: './uploads/',
    rename: function (fieldname, filename) {
        return filename + Date.now();
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...');
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path);
        done = true;
    }
}));

/* GET home page. */
app.get('/', function (req, res) {
    res.render('index', {title: 'Webdriver server'});
});

app.post('/', function (req, res) {
    if (done) {
        var filename = req.files.tarball.name;
        processUpload.newFile(filename, res);
    }
});

app.use('/screenshots', express.static('screenshots'));

/*********************************************************************
 *                          Error handling                           *
 *********************************************************************/

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    console.log(req);
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
