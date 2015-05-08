var socket = io();

var $form = $('form');
var $newMessage = $('#new-message');
var $chatBodyWrap = $('#chat-body-wrap');
var $chatBody = $('#chat-body');

function addMessageFromUser (resp) {
    var $m = $('<div class="message text-' + resp.data.color +'">')
        .append($('<span class="user">').text(resp.data.user))
        .append(' ')
        .append(resp.msg);
    $chatBody.append($m);
    $chatBodyWrap.scrollTop($chatBody.innerHeight() - $chatBodyWrap.innerHeight());
}

function addMessageFromAnnouncer (resp) {
    var $m = $('<div class="message text-muted">')
        .append(resp.msg)
        .append(' ')
        .append($('<span class="user">').text(resp.data.user));
    $chatBody.append($m);
    $chatBodyWrap.scrollTop($chatBody.innerHeight() - $chatBodyWrap.innerHeight());
}

$form.submit(function(){
    socket.emit('client-to-server', $newMessage.val());
    $newMessage.val('');
    return false;
});

socket.on('server-to-client', addMessageFromUser);

socket.on('hi-to-client', addMessageFromAnnouncer);

socket.on('to-client-disconnect', addMessageFromAnnouncer);
