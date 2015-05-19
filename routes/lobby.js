var express = require('express');
var router = express.Router();
var authChecker = require('./auth-checker');
var mongoose = require('mongoose');
var Room = mongoose.model('Room');

authChecker(router);

router.get('/', function(req, res, next) {

    Room.find(function (err, rooms) {
        if(err) {
            return console.log(err);
        }

        return res.render('lobby', {
            rooms: rooms
        });
    });

});

router.post('/', function(req, res, next) {
    var roomName = req.body.roomName;

    console.log('roomName: ', roomName);

    if (!roomName || roomName.trim().length === 0) {
        // Error
        return res.render('lobby', {
            rooms: rooms,
            status: 0,
            message: 'Room not created'
        });
    }

    var newRoom = new Room({
        name: roomName,
        created_by: req.user._id
    });

    newRoom.save(function (err, savedRoom) {

        if (err) {
            return console.error(err);
        }

        console.log('saved new room "' + savedRoom.name + '" to DB');

        // Fetch all rooms
        Room.find(function (err, rooms) {
            if (err) {
                return console.log(err);
            }

            return res.render('lobby', {
                rooms: rooms,
                status: 1,
                message: 'Room ' + savedRoom.name + ' created'
            });
        });

    });
});

module.exports = router;
