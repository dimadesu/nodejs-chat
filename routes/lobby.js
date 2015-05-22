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
            status: 0,
            message: 'Please enter the room name.'
        });
    }

    function saveNewRoom (rooms, callback) {

        var newRoom = new Room({
            name: roomName,
            created_by: req.user._id
        });

        newRoom.save(function (err, savedRoom) {

            if (err) {
                return callback(err);
            }

            rooms.push(savedRoom);

            winston.info('Saved new room "' + savedRoom.name + '" to DB.');

            callback(null, rooms, savedRoom);

        });

    }

    function fetchAllRooms (callback) {

        Room.find(function (err, rooms) {
            if (err) {
                return callback(err);
            }

            // Check for room name duplicates
            if (rooms && rooms.length > 0) {
                var isNameTaken = rooms.some(function (room) {
                    return room.name === roomName;
                });
                if (isNameTaken) {
                    return callback({
                        isNameTaken: true,
                        message: 'Name "' + roomName + '" is already taken.'
                    }, rooms);
                }
            }

            return callback(null, rooms);
        });

    }

    async.waterfall([
        fetchAllRooms,
        saveNewRoom
    ], function (err, rooms, savedRoom) {
        if (err && err.isNameTaken) {
            return res.render('lobby', {
                rooms: rooms,
                status: 0,
                message: err.message
            });
        }
        if(err) {
            return winston.error(err);
        }
        return res.render('lobby', {
            rooms: rooms,
            status: 1,
            message: 'Room "' + savedRoom.name + '" created.'
        });
    });

});

module.exports = router;
