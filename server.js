var express = require('express');


var socket_io = require('socket.io');
var http = require('http');
var express = require('express');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);
var connectedCount = 0;

var privateMessage = false

var users = [];
var userId = 0;


    
    
    

    io.on('connection', function(socket) {
        console.log('Client connected');
        connectedCount += 1;
        io.sockets.emit('connectedCount', connectedCount);
        var currentUser = {
            id: userId++,
            socketId: socket.id,
        }
        users.push(currentUser);
        io.emit('users', users)
        socket.on('message', function(message) {
            console.log('Received message:', message);
            socket.broadcast.emit('message', message);
        });
        
    socket.on('privateMessage', function(message,userId){
        var found = users.filter(function(user){
            return user.id === Number(userId)
        })
        if (found.length) {
            io.to(found[0].socketId).emit('privateMessage', message, userId)
        }
    })
    

        // Add '{user} is typing' functionality
        var typingMessage = false

        socket.on('typingMessage', function(typingMessage) {
            socket.broadcast.emit('typingMessage', typingMessage)
        });

        // Add private messaging by sending events to specific sockets using ID already assigned
        
    
        
        socket.on('privateMessage#' + socket.id, function(message) {
            console.log('privateMessage#', socket.id, message)
            socket.broadcast.emit('privateMessage#' + socket.id, message);
        });


        setTimeout(function(){
            console.log(socket.id)
            socket.emit('privateMessage' + socket.id, 'user2 says hello')
        }, 5000)


        socket.on('disconnect', function() {
            connectedCount -= 1;
            
            io.sockets.emit('connectedCount', connectedCount);
            console.log('disconnected');
            users = users.filter(function(user){
               return user.id != currentUser.id 
            })
            io.emit('users', users)
        });
    });

server.listen(process.env.PORT || 8080);
console.log('server is running');