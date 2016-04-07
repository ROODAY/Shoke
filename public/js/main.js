$.material.init()

var socket = io();
var playlists = {};
var currentPlaylist;
var currentSongIndex;
var currentSongLength;
var currentSongTitle;
var currentSongArtist;
var isPlaying = false;
var volume = 0.5;
var volumepremute = 0.5;
var audio;
var progressBarElement = $(".progress-bar");
var statusElement = $("#status");
var loggedin = false;

if (annyang) {
  var commands = {
		'pause': pause,
		'paws': pause,
		'POS': pause,
		'stop': pause,
		'top': pause,
		'play': play,
		'continue': play,
		'next': nextSong,
		'play *tag': playPlaylist,
		'previous': prevSong,
		'Prius': prevSong,
		'previews': prevSong,
		'back': prevSong,
		'decrease volume': decreaseVolume,
		'decrees volume': decreaseVolume,
		'degrees volume': decreaseVolume,
		'lower volume': decreaseVolume,
		'softer': decreaseVolume,
		'quieter': decreaseVolume,
		'mute': muteVolume,
		'nude': muteVolume,
		'un mute': unmuteVolume,
		'unmute': unmuteVolume,
		'onion': unmuteVolume,
		'increase volume': increaseVolume,
		'louder': increaseVolume,
		'max volume': maxVolume,
		'maximum volume': maxVolume,
		'set volume to :value percent': setVolume,
		'logout': logout
	}
  annyang.addCommands(commands);
} else {
	swal("Oops...", "Annyang doesn't seem to be present! Voice commands will not work!", "error");
}

$("form").submit(function(e) {
    e.preventDefault();
});
$("#skip-back").click(prevSong);
$("#skip-forward").click(nextSong);
$("#pause").click(pausePlay);
$("#submit").click(function(){
	if (document.getElementById("email").checkValidity() && $("#password").val() !== "" && $("#email").val() !== "") {
		socket.emit("authenticate", $("#email").val(), $("#password").val());
		statusElement.html("Logging into Google Play Music...");
		progressBarElement.css("width", "0%");
	} else {
		swal("Oops...", "Either your email is invalid or you didn't enter a password!", "error");
	}
});

socket.on("log", function(data){
	console.log(data);
});

socket.on("error", function(data){
	console.error(data);
});

socket.on("progressBar", function(val){
	progressBarElement.css("width", val + "%");
});

socket.on("status", function(text){
	statusElement.html(text);
});

socket.on("playerReady", function(){
	statusElement.html("Player is ready!");
	progressBarElement.css("width", "100%");
});

socket.on("songData", function(playlistsRaw, songsRaw){
	statusElement.html("Processing Songs...");
	progressBarElement.css("width", "0%");
	var playlistCount = playlistsRaw.length;
	var progress = 0;
	playlistsRaw.forEach(function(list){
		var id = list.id;
		var songs = [];
		var songCount = songsRaw.length;
		var increment = Math.round(100/playlistCount/songCount);
		songsRaw.forEach(function(song){
			if (song.playlistId === id) {
				songs.push(song);
				progressBarElement.css("width", (progress + increment) + "%");
			}

		});
		playlists[list.name.toLowerCase()] = {
			"data": list,
			"songs": songs
		};
	});
	$("#playlists").html("");
	for (var list in playlists) {
		$("#playlists").append("<li class=\"list-group-item well\">" + playlists[list].data.name + "</li>")
	}
	$(".list-group-item").click(function(){
		var key = $(this).html().toLowerCase();
		currentSongIndex = Math.floor(Math.random() * (playlists[key].songs.length + 1));
		var song = playlists[key].songs[currentSongIndex];
		currentPlaylist = playlists[key];
		console.log(song);
		var trackid;
		if (song.track) {
			trackid = song.track.storeId;
		} else {
			trackid = song.trackId;
		}
		socket.emit("getStreamUrl", trackid);
	});
	statusElement.html("Ready!");
	statusElement.css("font-size", "30px");
	progressBarElement.css("width", "100%");
	$("#playlists-container").css("display", "block");
	$("#authentication-row").fadeOut("normal", function() {
        $(this).css("display", "none");
    });
    loggedin = true;
    if (annyang) {
    	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
			console.log("no gui for mobile");
		} else {
			SpeechKITT.annyang();
			SpeechKITT.setStylesheet('../css/skitt.css');
			SpeechKITT.vroom();
			SpeechKITT.setInstructionsText('Some commands to try…');
	        SpeechKITT.setSampleCommands(['Play', 'Pause', 'Previous', 'Next', 'Play [playlist]', 'Logout']);
	        SpeechKITT.rememberStatus(1);
		}
		annyang.start();
    }
});

socket.on("playSong", function(url){
	if (audio === undefined) {
		audio = new Audio(url);
	} else {
		audio.pause();
		audio = new Audio(url);
	}
	audio.addEventListener('error', function failed(e) {
	   // to get the source of the audio element use $(this).src
	   switch (e.target.error.code) {
	     case e.target.error.MEDIA_ERR_ABORTED:
	       swal("Oops...", "You aborted the video playback.", "error");
	       nextSong();
	       break;
	     case e.target.error.MEDIA_ERR_NETWORK:
	       swal("Oops...", "A network error caused the audio download to fail.", "error");
	       nextSong();
	       break;
	     case e.target.error.MEDIA_ERR_DECODE:
	       swal("Oops...", "The audio playback was aborted due to a corruption problem or because the video used features your browser did not support.", "error");
	       nextSong();
	       break;
	     case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
	       swal("Oops...", "The video audio not be loaded, either because the server or network failed or because the format is not supported.", "error");
	       nextSong();
	       break;
	     default:
	       swal("Oops...", "An unknown error occurred.", "error");
	       nextSong();
	       break;
	   }
	 }, true);
	audio.addEventListener('ended', nextSong);
	audio.volume = volume;
	audio.play();
	$("#audio-controls-row").css("display", "block");
	if (currentPlaylist.songs[currentSongIndex].track !== undefined) {
		currentSongTitle = currentPlaylist.songs[currentSongIndex].track.title;
		currentSongArtist = currentPlaylist.songs[currentSongIndex].track.artist;
	} else {
		currentSongTitle = "Unknown";
		currentSongArtist = "Unknown";
	}
	currentSongLength = Math.round(currentPlaylist.songs[currentSongIndex].track.durationMillis / 1000)
	isPlaying = true;
	updateSongProgress();
});

socket.on("loggedout", function(){
	$("#authentication-row").css("display", "block");
	$("#authentication-row").fadeIn("slow");
	$("#audio-controls-row").css("display", "none");
	$("#playlists-container").css("display", "none");
	statusElement.html("Player is ready!");
	progressBarElement.css("width", "100%");
});

function logout() {
	if (loggedin) {
		audio.pause();
		audio.currentTime = 0;
		audio = undefined;
		socket.emit("logout");	
	}
}

function updateSongProgress() {
	if (isPlaying) {
		progressBarElement.css("width", (audio.currentTime / currentSongLength) * 100 + "%");
		var minutes = Math.floor(audio.currentTime / 60);
		if (minutes.toString().length == 1) {
            minutes = "0" + minutes;
        }
		var seconds = Math.round(audio.currentTime - minutes * 60);
		if (seconds.toString().length == 1) {
            seconds = "0" + seconds;
        }
		statusElement.html(currentSongTitle + " by " + currentSongArtist + " | " + minutes + ":" + seconds);
		setTimeout(updateSongProgress, 1000);
	}
}

function pausePlay() {
	if (isPlaying) {
		pause();
	} else {
		play();
	}
}

function pause() {
	$("#pause>i").html("play_arrow");
	audio.pause();
	isPlaying = false;
}
function play() {
	$("#pause>i").html("pause");
	audio.play();
	isPlaying = true;
	updateSongProgress();
}

function prevSong() {
	if ((currentSongIndex - 1) < 0) {
		currentSongIndex = currentPlaylist.songs.length - 1;
	} else {
		currentSongIndex -= 1;
	}
	var song = currentPlaylist.songs[currentSongIndex];
	console.log(song);
	var trackid;
	if (song.track) {
		trackid = song.track.storeId;
	} else {
		trackid = song.trackId;
	}
	socket.emit("getStreamUrl", trackid);
}

function nextSong() {
	if ((currentSongIndex + 1) >= currentPlaylist.songs.length) {
		currentSongIndex = 0;
	} else {
		currentSongIndex += 1;
	}
	var song = currentPlaylist.songs[currentSongIndex];
	console.log(song);
	var trackid;
	if (song.track) {
		trackid = song.track.storeId;
	} else {
		trackid = song.trackId;
	}
	$("#pause>i").html("pause");
	socket.emit("getStreamUrl", trackid);
}

function playPlaylist(playlist) {
	console.log(playlist)
	var key = playlist.toLowerCase();
	currentSongIndex = Math.floor(Math.random() * (playlists[key].songs.length + 1));
	var song = playlists[key].songs[currentSongIndex];
	currentPlaylist = playlists[key];
	console.log(song);
	var trackid;
	if (song.track) {
		trackid = song.track.storeId;
	} else {
		trackid = song.trackId;
	}
	socket.emit("getStreamUrl", trackid);
}
function decreaseVolume() {
	volume -= 0.1;
	audio.volume = volume;
}
function muteVolume() {
	volumepremute = volume;
	volume = 0.0;
	audio.volume = volume;
}
function unmuteVolume() {
	volume = volumepremute;
	audio.volume = volume;
}
function increaseVolume() {
	volume += 0.1;
	audio.volume = volume;
}
function maxVolume() {
	volume = 1.0;
	audio.volume = volume;
}
function setVolume(value) {
	var vol = parseInt(value);
	if (isNaN(vol)) {
		vol = text2num(value);
	}
	audio.volume = vol/100;
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		console.log("no snackbar for mobile");
	} else {
		$.snackbar({content: "Volume is now " + vol + "%"});
	}
}