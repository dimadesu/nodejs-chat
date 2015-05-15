/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor () {
    var colors = ['primary', 'success', 'info', 'warning', 'danger'];
    return colors[getRandomInt(0, colors.length - 1)];
}

var app = require('./app');

module.exports = function (server) {

    var io = require('socket.io')(server);

    io.use(function(socket, next){
        app.sessionMiddleware(socket.request, {}, next);
    });

    io.on('connection', function(socket){

        /* Connection */

        if (
            socket.request.session === undefined ||
            socket.request.session.passport === undefined ||
            socket.request.session.passport.user === undefined
        ) {
            console.log('No session');
            return;
        }

        var data = {
            user: socket.request.session.passport.user,
            color: getRandomColor()
        };

        console.log(data.user, 'connected');

        socket.emit('hi-to-client', {
            data: data,
            msg: 'hi'
        });

        socket.broadcast.emit('hi-to-client', {
            data: data,
            msg: 'connected'
        });

        /* Disconnect */

        socket.on('disconnect', function(){

            console.log(data.user, 'disconnected');

            socket.broadcast.emit('to-client-disconnect', {
                data: data,
                msg: 'disconnected'
            });

        });

        /* Etc. */

        socket.on('client-to-server', function(msg){

            console.log(data.user, 'says', msg);

            socket.emit('server-to-client', {
                data: data,
                msg: msg
            });

            socket.broadcast.emit('server-to-client', {
                data: data,
                msg: msg
            });

        });

    });

};
