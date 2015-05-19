var socket = io();

var $form = $('form');
var $newMessage = $('#new-message');
var $chatBodyWrap = $('#chat-body-wrap');
var $chatBody = $('#chat-body');

function appendItem (resp, isAnnouncer) {

    // Reversed order
    var isReversed = false;

    // If object then it is history message, mongoose returns items in the wrong order
    // it is problematic to sort on server, since it would not be possible to stream
    if (typeof resp.msg === 'object') {
        resp.msg = resp.msg.text;
        isReversed = true;
    }

    var color = isAnnouncer ? 'muted' : resp.user.color;

    var $username = $('<span class="user">').text(resp.user.username);

    var $m = $('<div class="message text-' + color +'">');

    $m
        .append($username)
        .append(' ')
        .append(resp.msg);

    if(isReversed) {
        $chatBody.prepend($m);
    } else {
        $chatBody.append($m);
    }

    return $chatBodyWrap.scrollTop($chatBody.innerHeight() - $chatBodyWrap.innerHeight());

}

function addMessageFromUser (resp) {
    appendItem(resp, false);
}

function addMessageFromAnnouncer (resp) {
    appendItem(resp, true);
}

$form.submit(function(){
    socket.emit('client-to-server', $newMessage.val());
    $newMessage.val('');
    return false;
});

socket.on('server-to-client', addMessageFromUser);

socket.on('server-to-client-user-connected', addMessageFromAnnouncer);

socket.on('server-to-client-user-disconnected', addMessageFromAnnouncer);
