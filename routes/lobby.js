var express = require('express');
var router = express.Router();
var rooms = require('../models/rooms');

router.use(function (req, res, next) {
    if(!req.isAuthenticated()){
        return res.redirect('/signin');
    }
    return next();
});

router.get('/', function(req, res, next) {
    res.render('lobby', {
        rooms: rooms
    });
});

module.exports = router;
