var mongoose = require('mongoose');
var User = mongoose.model('User');
var Post = mongoose.model('Post');

var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');

var winston = require('winston');

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor () {
    var colors = ['primary', 'success', 'info', 'warning', 'danger'];
    return colors[getRandomInt(0, colors.length - 1)];
}

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
                    color: getRandomColor()
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
