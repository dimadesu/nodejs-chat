var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
    if(!req.isAuthenticated()){
        return res.redirect('/signin');
    }
    return next();
});

router.get('/', function(req, res, next) {
    res.render('room');
});

module.exports = router;
