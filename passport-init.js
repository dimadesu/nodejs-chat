/*var User = require('./models/models');
var mongoose = require('mongoose');
var User = mongoose.model('User');*/
var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
users = {};
module.exports = function(passport) {

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function (user, done) {
        console.log('serializing user:', user.username);
        //return the unique id for the user
        done(null, user.username);
    });

    //Desieralize user will call with the unique id provided by serializeuser
    passport.deserializeUser(function (username, done) {
        return done(null, users[username]);
    });

    passport.use('signin', new LocalStrategy({
            passReqToCallback: true
        },
        function (req, username, password, done) {

            if (!users[username]) {
                return done(null, false, { message: 'User not found with username ' + username });
            }

            if (isValidPassword(users[username], password)) {
                //successfully authenticated
                return done(null, users[username]);
            } else {
                return done(null, false, { message: 'Invalid password ' + username });
            }
        }
    ));

    passport.use('signup', new LocalStrategy({
            passReqToCallback: true
        }, function (req, username, password, done) {

            if (users[username]) {
                return done(null, false, { message: 'User already exists with username: ' + username });
            }

            users[username] = {
                username: username,
                password: createHash(password)
            };

            return done(null, users[username]);

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
