$(document).ready(function(){
	/////// RECOGNITION LOGIC ///////
	var currentInterimTranscript = '';
	var finalTranscript = '';
	var recognizing = false;
	var finishedListening = false;
	
	/////// GLOBAL VARIABLES ///////
	var unmuteVol = 3.14159;
	var playlists = new Array();
	var currPlaylist = [];
	var currPlaylistIndex = 0;
	var audio = new Audio();
	var spotifyApi = new SpotifyWebApi();
	var playlistids = {};

	spotifyApi.setAccessToken(accessToken);
	spotifyApi.getUserPlaylists(username).then(function(data) {
		data.items.forEach(function(playlist){
			$("#playlists").append("<li class='playlist' data-id='" + playlist.id + "'><img class='playlistImage' src='/assets/images/Play.png'><span class='playlistName'>" + playlist.name + "</span></li>");
			playlistids[playlist.name] = playlist.id;
			$(".playlist").click(function(){
				var playlistid = $(this).data("id");
				spotifyApi.getPlaylist(username, playlistid).then(function(data) {
					currPlaylist = data.tracks.items;
					audio.src = currPlaylist[0].track.preview_url;
					currPlaylistIndex = 0;
					audio.volume = 0.5;
					audio.play();
				}, function(err) {
					console.error(err);
				});
			});
		});
	}, function(err) {
		console.error(err);
	});

	if(!('webkitSpeechRecognition' in window)) {
		swal({
			title: "Sorry!", 
			text: "Your browser does not support the Speech API. Please use a browser such as Google Chrome.",
			imageUrl: "/assets/images/chromelogo.png"
		});
	} else {
		var recognition = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = 'en-US';

		recognition.onstart = function() {
			recognizing = true;
			if($("#playItems").css('display') == 'none') {
				enterPlayMode();
			}
		}

		recognition.onerror = function() {
			console.error("Recognition error.");
		}

		recognition.onend = function() {
			recognizing = false;
			if(finishedListening) {
				console.log("Ending recognition.");
			} else {
				console.log("Restarting recognition.");
				startRecording();
			}
		}

		recognition.onresult = function(event) {
			var savedFinalTranscript = finalTranscript;
			var previousInterimTranscript = currentInterimTranscript;
			currentInterimTranscript = '';

			for(var i = event.resultIndex; i < event.results.length; i++) {
				if(event.results[i].isFinal) {
					finalTranscript += event.results[i][0].transcript;
				} else {
					currentInterimTranscript += event.results[i][0].transcript;
				}
			}

			if(previousInterimTranscript == currentInterimTranscript) {
				currentInterimTranscript = '';
			}

			var cIT = currentInterimTranscript.trim();
			var newWords = finalTranscript.replace(savedFinalTranscript, '').trim();
			var currentVol = 0.5;

			var ua = navigator.userAgent.toLowerCase();
			var isAndroid = ua.indexOf("android") > -1;
			if(isAndroid && (typeof window.orientation !== 'undefined')) {
				$("#command").text(newWords);
				if(newWords == "start") {
					startSB();
				} else if(newWords == "pause" || newWords == "paws" || newWords == "POS" || newWords == "stop" || newWords == "top") {
					
				} else if(newWords == "play" || newWords == "continue") {
					var keyArray = Object.keys(playlistids);
					playPlaylist(username, keyArray);
				} else if(newWords == "next") {
					
				} else if(newWords == "next playlist" || newWords == "NEX playlist" || newWords == "X playlist" || newWords == "explicit" || newWords == "explain list") {
					playNextPlaylist();
				} else if(newWords == "previous" || newWords == "Prius" || newWords == "previews" || newWords == "back") {
					
				} else if(newWords == "decrease volume" || newWords == "decrees volume" || newWords == "degrees volume" || newWords == "lower volume" || newWords == "softer" || newWords == "quieter") {
					currentVol = currentVol - 0.25;
				} else if((newWords == "mute" || newWords == "nude") && currentVol > 0.0) {
					unmuteVol = 1;
				} else if((newWords == "un mute" || newWords == "unmute" || newWords == "onion") && currentVol == 0.0 && unmuteVol != 3.14159) {
					
				} else if(newWords == "increase volume" || newWords == "louder") {
					currentVol = currentVol + 0.25;
				} else if(newWords == "max volume" || newWords == "maximum volume") {
					
				} else if(newWords == "shuffle on") {
					
				} else if(newWords == "shuffle off") {
					
				}
			} else {
				if(cIT == "start") {
					startSB();
				} else if(cIT == "pause" || cIT == "paws" || cIT == "POS" || cIT == "stop" || cIT == "top") {
					
				} else if(cIT == "play" || cIT == "continue") {
					var keyArray = Object.keys(playlistids);
					playPlaylist(username, keyArray);
				} else if(cIT == "next") {
					
				} else if(cIT == "next playlist" || cIT == "NEX playlist" || cIT == "X playlist" || cIT == "explicit" || cIT == "explain list") {
					playNextPlaylist();
				} else if(cIT == "previous" || cIT == "Prius" || cIT == "previews" || cIT == "back") {
					
				} else if(cIT == "decrease volume" || cIT == "decrees volume" || cIT == "degrees volume" || cIT == "lower volume" || cIT == "softer" || cIT == "quieter") {
					currentVol = currentVol - 0.25;
				} else if((cIT == "mute" || cIT == "nude") && currentVol > 0.0) {
					unmuteVol = R.player.volume();
				} else if((cIT == "un mute" || cIT == "unmute" || cIT == "onion") && currentVol == 0.0 && unmuteVol != 3.14159) {
					
				} else if(cIT == "increase volume" || cIT == "louder") {
					currentVol = currentVol + 0.25;
				} else if(cIT == "max volume" || cIT == "maximum volume") {
					
				} else if(cIT == "shuffle on") {
					
				} else if(cIT == "shuffle off") {
					
				}
			}
		}
	}

	function playPlaylist(username, keys) {
		keyArray = shuffle(keys);
		var playlistid = playlistids[keyArray[0]];
		spotifyApi.getPlaylist(username, playlistid).then(function(data) {
			currPlaylist = data.tracks.items;
			audio.src = currPlaylist[0].track.preview_url;
			currPlaylistIndex = 0;
			audio.volume = 0.5;
			audio.play();
		}, function(err) {
			playPlaylist(username, keys);
		});
	}

	///// FUNCTIONS //////
	$("#microphoneButton").click(function() {
		startRecording();
		fadeOutAndRemove('#microphoneAccess');
		setTimeout(function(){
			$("#playItems").fadeIn('fast');
		}, 250);
	})

	function enterPlayMode() {
		R.ready(function() {
			fadeOutAndRemove('#microphoneAccess');
			$("#playItems").fadeIn('fast');
			var name = R.currentUser.attributes.firstName;
			$("#container").prepend("<p>Welcome, " + name + "!</p>");

			//Get Playlists
			R.request({
				method: "getPlaylists",
				content: {},
				success: function(response) {
					console.log(response);
					var allPlaylists = new Array();
					var index = 0;
					response.result.owned.forEach(function(elm) {
						allPlaylists[index] = elm;
						index++;
					});
					response.result.collab.forEach(function(elm) {
						allPlaylists[index] = elm;
						index++;
					});
					response.result.subscribed.forEach(function(elm) {
						allPlaylists[index] = elm;
						index++;
					});

					playlists = allPlaylists;

					for(var i = 0; i < allPlaylists.length; i++) {
						var currentPlaylist = allPlaylists[i];
						var name = currentPlaylist.name;
						var key = currentPlaylist.key;
						var li = "<li class='playlist' data-key='"
							+ key +  "' data-index='"
							+ i + "'>"
							+ (i + 1) + ". " +  name + "</li>";
						console.log(li);
						var icon = currentPlaylist.icon;
						var li = createPlaylistThumb(name, key, icon);
						$("#playlists").append(li);
					}
					createClickTogglers();
				},
				error: function(response) {
					console.log("Error: " + response.message);
				}
			});
		});
	}

	function createClickTogglers() {
		$("li").on('click', function(e) {
			e.preventDefault();
			currPlaylistIndex = $(this).attr("data-index");
			currPlaylist = playlists[currPlaylistIndex];
			var key = $(this).attr("data-key");
			if(!(recognizing)) {
				startRecording();
			}
			R.player.play({source: key});
		});
	}

	

	$("#playPause").click(function(){
		R.player.togglePause();
	});

	function startRecording() {
		finalTranscript = '';
		if(!(recognizing)) {
			recognition.start();
		}
	}

	function stopRecording() {
		recognition.stop();
	}

	function fadeOutAndRemove(identifier) {
		$(identifier).fadeOut('fast', function() {
			this.remove();
		});
	}

	function startSB() {
		var defaultPL = playlists[0];
		var key = defaultPL.key;
		R.player.play({source: key});
	}

	function playNextPlaylist() {
		currPlaylistIndex = (currPlaylistIndex + 1) % playlists.length;
		currPlaylist = playlists[currPlaylistIndex];
		var key = currPlaylist.key;
		R.player.play({source: key});
	}

	function createPlaylistThumb(name, key, icon) {
		var result = "<li class='.playlist' data-key='";
		result += key + "'>";
		result += "<img class='playlistImage' src='" + icon + "'>";
		result += "<span class='playlistName'>" + name + "</span>";
		result += "</li>";
		return result;
	}

	function shuffle(o){ // From http://stackoverflow.com/questions/14697371/how-to-retrieve-random-json-object-by-key-from-json-dictionary
	    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	    return o;
	};
});