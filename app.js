var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var passport = require('passport');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/chirp-test');
// Has to be before initializing passport
require('./models/models');

var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

/* Routes */
var index = require('./routes/index');
var signin = require('./routes/signin');
var signup = require('./routes/signup');
var lobby = require('./routes/lobby');
var room = require('./routes/room');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.sessionMiddleware = session({
    secret: 'zekrett'
});
app.use(app.sessionMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
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

app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'public')));

var auth = require('./routes/authenticate')(passport);
app.use('/', auth);
app.use('/signin', signin);
app.use('/signup', signup);
app.use('/lobby', lobby);
app.use('/room', room);

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
