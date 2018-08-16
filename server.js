var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var multer = require('multer');
var bodyParser = require('body-parser');
users = [];
connections = [];
filename = '';
app.use(bodyParser.json());
var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/Images");
    },
    filename: function (req, file, callback) {
        filename = file.fieldname + "_" + Date.now() + "_" + file.originalname;
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

app.use('/public',express.static(__dirname + '/public'));

var upload = multer({ storage: Storage }).array("imgUploader", 3); //Field name and max count


app.get('/', function(req, res){
    res.sendFile(__dirname + '/client.html');
});

app.post("/api/upload", function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.end("Something went wrong!");
        }
        return res.end("success !");
    });
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
    io.emit('new message', {msg : data, user: socket.username, filename:filename });
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
