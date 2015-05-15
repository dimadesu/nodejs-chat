var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
    if(!req.isAuthenticated()){
        return res.redirect('/signin');
    }
    return next();
});

router.get('/', function(req, res, next) {
    res.render('lobby', {
        rooms: [
            'Room #1',
            'Room #2',
            'Test Room',
            'Stupid Room',
            'Support Room'
        ]
    });
});

module.exports = router;
