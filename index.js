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
  console.log("User " + socket.id + " has joined.");
  var pm = new PlayMusic();
  players[socket.id] = pm;
  socket.emit("playerReady");

  socket.on("authenticate", function(email, password){
    players[socket.id].init({email: email, password: password}, function(err) {
      if(err) console.error(err);
      
      players[socket.id].getPlayLists(function(err, data) {
        var playlists = data.data.items;
        players[socket.id].getPlayListEntries(function(err, data) {
          var songs = data.data.items;
          socket.emit("songData", playlists, songs);
        });
      });
    });
  });

  socket.on("getStreamUrl", function(songId){
    players[socket.id].getStreamUrl(songId, function(bool, url) {
      socket.emit("playSong", url);
    });
  });
});

http.listen((process.env.PORT || 8000), function() {
    console.log("Listening for connections on port 8000.");
});