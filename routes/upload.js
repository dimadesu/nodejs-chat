var express = require('express');
var async = require('async');
var winston = require('winston');
var fs = require('fs');
var router = express.Router();
var mongoose = require('mongoose');
var Upload = mongoose.model('Upload');
var authChecker = require('./auth-checker');

authChecker(router);

router.get('/', function(req, res, next) {

    Upload.find({
        created_by: req.user.id
    }, function (err, uploads) {
        if(err) {
            return winston.error(err);
        }
        return res.render('upload', {
            uploads: uploads,
            host: req.headers.host
        });
    });

});

router.post('/', function(req, res) {

    winston.info('req.files: ', req.files);

    var file = req.files ? req.files.uploadFile : null;

    if (!file || file.size === 0) {
        return res.render('upload', {
            status: 0,
            message: 'Please choose file'
        });
    }

    if (file.mimetype.indexOf('image/') !== 0) {
        fs.unlink('./' + file.path); // delete the partially written file
        return res.render('upload', {
            status: 0,
            message: 'Wrong file type'
        });
    }

    if (file.truncated) {
        return res.render('upload', {
            status: 0,
            message: 'File size is bigger than allowed'
        });
    }

    function uploadSuccess (callback){

        // Upload success
        var upload = new Upload ({
            filename: file.name,
            created_by: req.user.id
        });

        upload.save(function (err, savedUpload) {

            if(err) {
                callback(err);
            }

            winston.info('File uploaded successfully');

            callback();

        });

    }

    function findUploads (callback) {

        // Get all uploads for this user
        Upload.find({
            created_by: req.user.id
        }, function (err, uploads) {

            if(err) {
                return callback(err);
            }

            return res.render('upload', {
                status: 1,
                message: 'File uploaded successfully',
                uploads: uploads,
                host: req.headers.host
            });

        });

    }

    fs.exists(file.path, function(exists) {
        if(!exists) {
            return res.render('upload', {
                status: 0,
                message: 'Upload failure'
            });
        } else {
            return async.series([
                uploadSuccess,
                findUploads
            ], function (err) {
                return winston.error(err);
            });
        }
    });

});

module.exports = router;
