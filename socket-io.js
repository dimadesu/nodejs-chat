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

        var connectedUser, oldRoom, newRoom;

        if (
            socket.request.session === undefined ||
            socket.request.session.passport === undefined ||
            socket.request.session.passport.user === undefined
        ) {
            console.log('No session');
            return;
        }

        /* Disconnect */

        socket.on('disconnect', function(){

            console.log(connectedUser.username, 'disconnected');

            socket.broadcast
                .to(newRoom)
                .emit('server-to-client-announce', {
                    user: connectedUser,
                    msg: 'disconnected'
                });

        });

        /* Chat post */

        socket.on('client-to-server', function(msg){

            console.log(connectedUser.username, 'says', msg);

            var post = new Post({
                text: msg,
                room: newRoom,
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

                socket.broadcast
                    .to(newRoom)
                    .emit('server-to-client', {
                        user: connectedUser,
                        msg: msg
                    });

            });

        });

        socket.on('client-to-server-switch-room', function (roomId) {

            oldRoom = newRoom;
            newRoom = roomId;

            if (!connectedUser) {

                User.findById(socket.request.session.passport.user, function (err, user) {

                    if (err) {
                        return console.error(err);
                    }

                    connectedUser = user;

                    receivedUserCb();

                });

            } else {

                receivedUserCb();

            }

        });

        function receivedUserCb () {

            console.log(connectedUser.username, 'connected');

            /* History */

            var stream = Post
                .find({
                    room: newRoom
                })
                .populate('created_by')
                .sort({'created_at': 'desc'})
                .limit(10)
                .stream();

            stream.on('error', function (err) {
                console.error(err);
            });

            // Stream posts one by one while they're being fetched
            stream.on('data', function (post) {
                delete post.created_by.password;
                socket.emit('server-to-client', {
                    user: post.created_by,
                    msg: post
                });
            });

            // When all posts are fetched run this
            stream.on('end', function () {

                //socket.leave(oldRoom);
                socket.join(newRoom);

                // Send message to old room (no need to send to myself)
                /*socket.broadcast
                    .to(oldRoom)
                    .emit('server-to-client-announce', {
                        user: connectedUser,
                        msg: 'left the room'
                    });*/

                /* Send message to new room */
                var newRoomData = {
                    user: connectedUser,
                    msg: 'joined the room'
                };

                // Send to myself
                socket.emit('server-to-client-announce', newRoomData);

                // Send to others
                socket.broadcast
                    .to(newRoom)
                    .emit('server-to-client-announce', newRoomData);

            });

        }

    });

};
