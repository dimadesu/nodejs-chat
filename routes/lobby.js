var express = require('express');
var router = express.Router();
var async = require('async');
var authChecker = require('./auth-checker');
var winston = require('winston');
var mongoose = require('mongoose');
var Room = mongoose.model('Room');

authChecker(router);

router.get('/', function(req, res, next) {

    Room.find(function (err, rooms) {
        if(err) {
            return winston.error(err);
        }

        return res.render('lobby', {
            rooms: rooms
        });
    });

});

router.post('/', function(req, res, next) {
    var roomName = req.body.roomName;

    winston.info('roomName: ', roomName);

    if (!roomName || roomName.trim().length === 0) {
        // Error
        return res.render('lobby', {
            rooms: rooms,
            status: 0,
            message: 'Room not created'
        });
    }

    function saveNewRoom (callback) {

        var newRoom = new Room({
            name: roomName,
            created_by: req.user._id
        });

        newRoom.save(function (err, savedRoom) {

            if (err) {
                return callback(err);
            }

            winston.info('Saved new room "' + savedRoom.name + '" to DB');

            callback(null, savedRoom);

        });

    }

    function fetchAllRooms (savedRoom, callback) {

        Room.find(function (err, rooms) {
            if (err) {
                return callback(err);
            }

            callback(null, savedRoom, rooms);
        });

    }

    async.waterfall([
        saveNewRoom,
        fetchAllRooms
    ], function (err, savedRoom, rooms) {
        if(err) {
            return winston.error(err);
        }
        return res.render('lobby', {
            rooms: rooms,
            status: 1,
            message: 'Room ' + savedRoom.name + ' created'
        });
    });

});

module.exports = router;
