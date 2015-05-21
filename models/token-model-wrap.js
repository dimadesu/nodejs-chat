var winston = require('winston');
var mongoose = require('mongoose');
var Token = mongoose.model('Token');

var tokenModelWrap = {
    consume: function (token, fn) {

        Token.findOne({
            token: token
        }, function (err, tokenItem) {
            if(err){
                return fn(err);
            }

            if(!tokenItem) {
                return fn('Token not found');
            }

            var uid = tokenItem.created_by;

            // Invalidate/delete the single-use token
            Token.remove({
                _id: tokenItem._id
            }, function (err) {
                if (err) {
                    return winston.error(err);
                }
                return fn(null, uid);
            });
        });

    },
    save: function (token, uid, fn) {

        var tokenToSave = new Token ({
            token: token,
            created_by: uid
        });

        tokenToSave.save(function (err, savedToken) {
            if(err) {
                return winston.error(err);
            }
            // Successful save
            fn();
        });

    }
};

module.exports = tokenModelWrap;
