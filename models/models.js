var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    color: String,
    password: String,
    created_at: {
        type: Date,
        default: Date.now
    }
});

var roomSchema = new Schema({
    name: String,
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

var postSchema = new Schema({
    text: String,
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('User', userSchema);
mongoose.model('Room', roomSchema);
mongoose.model('Post', postSchema);
