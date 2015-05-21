var express = require('express');
var router = express.Router();
var winston = require('winston');
var mongoose = require('mongoose');
var Token = mongoose.model('Token');

module.exports = function(passport){

    router.get('/', function(req, res, next) {
        if(!req.isAuthenticated()){
            return res.redirect('/signin');
        } else {
            return res.redirect('/lobby');
        }
    });

    router.post(
        '/signin',
        function(req, res, next) {
            passport.authenticate('signin', function (err, user, info) {
                if (err) {
                    return next(err); // will generate a 500 error
                }
                if (!user) {
                    return res.render('signin', info);
                }

                req.logIn(user, function(err) {

                    if (err) {
                        return next(err);
                    }

                    if (!req.body.remember_me) {
                        return next();
                    }

                    passport.issueToken(req.user, function(err, token) {
                        if (err) { return next(err); }
                        res.cookie(
                            'remember_me',
                            token,
                            {
                                path: '/',
                                httpOnly: true,
                                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                            }
                        );
                        return next();
                    });

                });
            })(req, res, next);
        },
        function (req, res) {

            // Sign in success
            return res.redirect('/lobby');

        }
    );

    router.post('/signup', function(req, res, next) {
        passport.authenticate('signup', function (err, user, info) {
            if (err) {
                return next(err); // will generate a 500 error
            }
            if (!user) {
                return res.render('signup', info);
            }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/lobby');
            });
        })(req, res, next);
    });

    router.get('/signout', function(req, res) {

        // Invalidate/delete the single-use token
        Token.remove({
            created_by: req.user.id
        }, function (err) {
            if (err) {
                return winston.error(err);
            }
        });

        res.clearCookie('remember_me');

        req.session.destroy(function (err) {
            if (err) {
                return winston.error(err);
            }
            return res.redirect('/');
        });

    });

    return router;

};
