var express = require('express');
var path = require('path');
var fs = require('fs');
var winston = require('winston');
var favicon = require('serve-favicon');

/* File upload */
var multer = require('multer');

/* DB */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/nodejs-chat');
// Has to be before initializing passport
require('./models/models');

/* Auth */
var passport = require('passport');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var flash = require('connect-flash');

/* Routes */
var signin = require('./routes/signin');
var signup = require('./routes/signup');
var lobby = require('./routes/lobby');
var room = require('./routes/room');
var upload = require('./routes/upload');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/img/favicon.ico'));
// cookieParser has to be before session middleware
app.use(cookieParser());
app.sessionMiddleware = session({
    secret: 'zekrett',
    store: new MongoStore({ mongooseConnection: mongoose.connection })

});
app.use(app.sessionMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
var initPassport = require('./passport');
initPassport(passport);

// session data for jade
app.use(function(req, res, next){
    res.locals.user = req.user;
    next();
});

/* File upload */
app.use(multer({
    dest: './public/uploads/',
    limits: {
        files: 1,
        fileSize: 500 * 1024 // Accepts bytes
    },
    rename: function (fieldname, filename) {
        return filename + Date.now();
    },
    onFileUploadStart: function (file) {
        winston.info('Starting to upload: ' + file.originalname);
    },
    onFileUploadComplete: function (file) {
        winston.info('Uploaded file to ' + file.path);
    },
    onFileSizeLimit: function (file) {
        winston.warn('Failed file size limit check: ', file.originalname);
        fs.unlink('./' + file.path); // delete the partially written file
    },
    onError: function (error, next) {
        winston.error(error);
        next(error);
    }
}));

app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'public')));

/* Routes */

var auth = require('./routes/authenticate')(passport);
app.use('/', auth);
app.use('/signin', signin);
app.use('/signup', signup);
app.use('/lobby', lobby);
app.use('/room', room);
app.use('/upload', upload);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
