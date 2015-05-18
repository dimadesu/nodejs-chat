var socket = io();

var $form = $('form');
var $newMessage = $('#new-message');
var $chatBodyWrap = $('#chat-body-wrap');
var $chatBody = $('#chat-body');

function appendItem ($el, msg, username, color) {
    var $m = $('<div class="message text-' + color +'">')
        .append(msg)
        .append(' ')
        .append($('<span class="user">').text(username));
    return $el.append($m);
}

function addMessageFromUser (resp) {
    if(typeof resp === 'object') {
        appendItem($chatBody, resp.msg.text, resp.msg.created_by, resp.data.color);
    } else {
        appendItem($chatBody, resp.msg, resp.data.user, resp.data.color);
    }
    $chatBodyWrap.scrollTop($chatBody.innerHeight() - $chatBodyWrap.innerHeight());
}

function addMessageFromAnnouncer (resp) {
    appendItem($chatBody, resp.msg, resp.data.user, 'muted');
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
