var app = require('./app');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Post = mongoose.model('Post');

module.exports = function (server) {

    var io = require('socket.io')(server);

    io.use(function(socket, next){
        app.sessionMiddleware(socket.request, {}, next);
    });

    io.on('connection', function(socket){

        /* Connection */

        var connectedUser;

        if (
            socket.request.session === undefined ||
            socket.request.session.passport === undefined ||
            socket.request.session.passport.user === undefined
        ) {
            console.log('No session');
            return;
        }

        User.findById(socket.request.session.passport.user, function (err, user) {
            if (err) {
                return console.error(err);
            }

            connectedUser = user;

            console.log(connectedUser.username, 'connected');

            var stream = Post.find().populate('created_by').sort({'created_at': 'desc'}).limit(10).stream();

            stream.on('error', function (err) {
                console.error(err);
            });

            stream.on('data', function (post) {
                if (err) {
                    return console.error(err);
                }
                console.log('post: ', post);
                console.log('post.created_by: ', post.created_by);
                delete post.created_by.password;
                socket.emit('server-to-client', {
                    user: post.created_by,
                    msg: post
                });
            });

            stream.on('end', function () {
                socket.broadcast.emit('hi-to-client', {
                    user: connectedUser,
                    msg: 'connected'
                });

                socket.emit('hi-to-client', {
                    user: connectedUser,
                    msg: 'hi'
                });
            });
        });

        /* Disconnect */

        socket.on('disconnect', function(){

            console.log(connectedUser.username, 'disconnected');

            socket.broadcast.emit('to-client-disconnect', {
                user: connectedUser,
                msg: 'disconnected'
            });

        });

        /* Etc. */

        socket.on('client-to-server', function(msg){

            console.log(connectedUser.username, 'says', msg);

            var post = new Post({
                text: msg,
                created_by: connectedUser._id
            });

            post.save(function (err, savedPost) {

                if (err) {
                    return console.log(err);
                }

                socket.emit('server-to-client', {
                    user: connectedUser,
                    msg: msg
                });

                socket.broadcast.emit('server-to-client', {
                    user: connectedUser,
                    msg: msg
                });

            });

        });

    });

};
