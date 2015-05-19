var express = require('express');
var router = express.Router();

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
                    if (err) { return next(err); }
                    return res.redirect('/lobby');
                });
            })(req, res, next);
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
        req.session.destroy(function (err) {
            if (err) {
                return console.error(err);
            }
            return res.redirect('/');
        });
    });

    return router;

};
