var mongoose = require('mongoose');
var User = mongoose.model('User');
var Post = mongoose.model('Post');
var tokenModelWrap = require('./models/token-model-wrap');

var utils = require('./utils');
var LocalStrategy = require('passport-local').Strategy;
var RememberMeStrategy = require('passport-remember-me').Strategy;
var bCrypt = require('bcrypt-nodejs');

var winston = require('winston');

module.exports = function(passport) {

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function (user, done) {
        //return the unique id for the user
        return done(null, user._id);
    });

    //Deserialize user will call with the unique id provided by serialize user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            if (err) {
                return done (err, false);
            }
            if (!user) {
                return done('User not found', false);
            }
            return done(null, user);
        });
    });

    // TODO: this is to quickly share function in other module, it should be possible to do this better
    passport.issueToken = function (user, done) {
        var token = utils.randomString(64);
        tokenModelWrap.save(token, user.id, function(err) {
            if (err) { return done(err); }
            return done(null, token);
        });
    };

    passport.use(new RememberMeStrategy(
        function(token, done) {
            tokenModelWrap.consume(token, function (err, uid) {
                if (err) { return done(err); }
                if (!uid) { return done(null, false); }

                User.findById(uid, function(err, user) {
                    if (err) { return done(err); }
                    if (!user) { return done(null, false); }
                    return done(null, user);
                });
            });
        },
        passport.issueToken
    ));

    passport.use('signin', new LocalStrategy({
            passReqToCallback: true
        },
        function (req, username, password, done) {

            User.findOne({
                username: username
            }, function (err, user) {

                if (err) {
                    return done(err, false);
                }

                if (!user) {
                    return done(null, false, { message: 'User not found with username ' + username });
                }

                if (isValidPassword(user, password)) {
                    //successfully authenticated
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Invalid password ' + username });
                }

            });

        }
    ));

    passport.use('signup', new LocalStrategy({
            passReqToCallback: true
        }, function (req, username, password, done) {

            User.findOne({
                username: username
            }, function (err, user) {

                if (err) {
                    return done(err, false);
                }

                if (user) {
                    // we have already signed this user up
                    return done(null, false, { message: 'User already exists with username: ' + username });
                }

                var newUser = new User({
                    username: username,
                    password: createHash(password),
                    color: utils.getRandomColor()
                });

                newUser.save(function (err, savedUser) {
                    if (err) {
                        return done(err, false);
                    }
                    winston.info('Saved new user "' + username + '" to DB');
                    return done(null, savedUser);
                });

            });

        })
    );

    var isValidPassword = function (user, password) {
        return bCrypt.compareSync(password, user.password);
    };

    // Generates hash using bCrypt
    var createHash = function (password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

};
