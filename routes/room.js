var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Room = mongoose.model('Room');
var authChecker = require('./auth-checker');

authChecker(router);

router.get('/:roomId', function(req, res, next) {
    Room.findById(req.params.roomId, function (err, room) {
        if(err){
            return console.error(err);
        }
        return res.render('room', {
            roomId: room._id,
            roomName: room.name
        });
    });
});

module.exports = router;
