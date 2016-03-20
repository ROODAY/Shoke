var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var PlayMusic = require('playmusic');

var players = {};

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on("connection", function(socket){
  socket.emit("progressBar", 33);
  console.log("User " + socket.id + " has joined.");
  var pm = new PlayMusic();
  socket.emit("progressBar", 66);
  players[socket.id] = pm;
  socket.emit("playerReady");

  socket.on("authenticate", function(email, password){
    players[socket.id].init({email: email, password: password}, function(err) {
      if(err) {
        socket.emit("status", err.toString());
        socket.emit("progressBar", 100);
        console.error(err);
      } else {
        socket.emit("status", "Retrieving Playlists...");
        players[socket.id].getPlayLists(function(err, data) {
          var playlists = data.data.items;
          socket.emit("status", "Retrieving Songs...");
          socket.emit("progressBar", 50);
          players[socket.id].getPlayListEntries(function(err, data) {
            var songs = data.data.items;
            socket.emit("progressBar", 100);
            socket.emit("songData", playlists, songs);
          });
        });
      }
    });
  });

  socket.on("getStreamUrl", function(songId){
    players[socket.id].getStreamUrl(songId, function(bool, url) {
      socket.emit("playSong", url);
    });
  });

  socket.on("disconnect", function() {
      console.log("User " + socket.id + " left");
      delete players[socket.id];
  });
});

http.listen((process.env.PORT || 8000), function() {
    console.log("Listening for connections on port 8000.");
});