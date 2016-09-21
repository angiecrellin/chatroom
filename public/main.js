/* global $ */
$(document).ready(function() {
    var socket = io();
    var socketId = null;
    var input = $('input');
    var messages = $('#messages');
    var typingMessage = $('#typingMessage');
    var count = $('#count');
    var $privateMessage = $('#privateMessage');
    var $users = $('#users');
    


    socket.on('users', function(users){
        var html = users.map(function(user){
            return $('<li>', {'data-id':user.id, class:'user-link'}).text('user' + user.id)[0].outerHTML
        })
        $users.html(html.join(''))
    })
        
     $users.on('click', '.user-link', function(){
         socket.emit('privateMessage', input.val(), $(this).attr('data-id'))
         input.val('')
     })   

      socket.on('privateMessage', function(message, userId){
          $privateMessage.text('user' + userId + ' says: ' + message)
      })  
        
        


    /*socket.on('connect', function() {
        socketId = socket.io.engine.id;
        console.log(socketId);
        socket.on('privateMessage/#' + socketId, function(privateMessage) {
            console.log('privateMessage#', privateMessage);
            getPrivateMessage(privateMessage);
        });
    });*/

    var addMessage = function(message) {
        messages.append('<div>' + message + '</div>');
    };
    var setTypingMessage = function(message) {
        typingMessage.html('<div>' + message + '</div>');
    };

    input.on('keydown', function(event) {
        if (event.keyCode != 13) {
            return;
        }

        var message = input.val();
        addMessage(message);
        socket.emit('message', message);
        input.val('');
    });

    socket.on('message', addMessage);

    // Display a count of how many users are connected 
    var displayCount = function(connectedCount) {
        count.html('<div>' + connectedCount + '<div>');
    };


    socket.on('connectedCount', function(connectedCount) {
        displayCount(connectedCount);
    });
    socket.on('typingMessage', function(typingMessage) {
        setTypingMessage(typingMessage);
    })

    // add {user} is typing' functionality using timeout
    var typing = false;
    var timeout = false;

    function timeoutFunction() {
        typing = false;
        socket.emit('noLongerTypingMessage');
    }

    function onKeyDownNotEnter() {
        if (typing == false) {
            typing = true
            socket.emit('typingMessage');
            timeout = setTimeout(timeoutFunction, 5000);
        }
        else {
            clearTimeout(timeout);
            timeout = setTimeout(timeoutFunction, 5000);
        }

    }
    // Add {user} is typing functionality listening for start typing and stop typing on keydown and send
    input.on('keydown', function(event) {
        if (event.target.value === '') {
            typing = false
            console.log('user stops typing')
            setTypingMessage('')
            socket.emit('typingMessage', '')
            return;

        }
        else if (typing === false) {
            typing = true
            var typingMessage = ('User1 is typing')
            setTypingMessage(typingMessage);
            socket.emit('typingMessage', typingMessage);

        }

    });

    // Add private messaging by sending events to specific sockets using ID already assigned
    var getPrivateMessage = function(message) {
        privateMessage.html('<div>' + message + '<div>');
    };

});