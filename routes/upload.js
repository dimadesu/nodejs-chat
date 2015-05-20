var express = require('express');
var winston = require('winston');
var fs = require('fs');
var router = express.Router();
var authChecker = require('./auth-checker');

authChecker(router);

router.get('/', function(req, res, next) {
    res.render('upload');
});

router.post('/', function(req, res) {

    winston.info(req.files);

    var file = req.files ? req.files.uploadFile : null;

    if (!file || file.size === 0) {
        return res.render('upload', {
            status: 0,
            message: 'Please choose file',
            files: req.files // Debug info
        });
    }

    if (file.mimetype.indexOf('image/') !== 0) {
        return res.render('upload', {
            status: 0,
            message: 'Wrong file type',
            files: req.files
        });
    }

    if (file.truncated) {
        return res.render('upload', {
            status: 0,
            message: 'File size is bigger than allowed',
            files: req.files
        });
    }

    fs.exists(file.path, function(exists) {
        if(exists) {
            return res.render('upload', {
                status: 1,
                message: 'File uploaded successfully',
                files: req.files
            });
        } else {
            return res.render('upload', {
                status: 0,
                message: 'Upload failure',
                files: req.files
            });
        }
    });

});

module.exports = router;
