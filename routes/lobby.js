var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('lobby');
});

module.exports = router;
