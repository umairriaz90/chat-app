var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
users = [];
connections = [];


app.get('/', function(req, res){
  res.sendFile(__dirname + '/client.html');
});

io.on('connection', function(socket) {
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  //Disconnect
  socket.on('disconnect', function() {
    users.splice(users.indexOf(socket.username,1));
    updateUsernames(users);
    connections.splice(connections.indexOf(socket),1);
    console.log('Disconnected: %s sockets connected', connections.length);
  });

  // Send Message
  socket.on('send message',function(data) {
    console.log(data);
    io.emit('new message', {msg : data, user: socket.username});
  });

  // New User
  socket.on('new user', function(data, callback) {
    callback(true);
    currentUser(data);
    users.push(socket.username);
    updateUsernames(users);
  });

  function currentUser(data) {
    socket.username = data;
  }
  function updateUsernames(users) {
    io.emit('get users', users);
  }
  
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});