$(document).ready(function(){
	R.ready(function(){
		if(R.authenticated()) {
			authenticationComplete();
		} else {
			notAuthenticated();
		}
	});

	$("#authorize").click(function(){
		R.authenticate({
			complete: function(authenticated){
				if(authenticated) {
					console.log("User authenticated");
					authenticationComplete();
				}
			},
			mode: 'redirect'
		})
	});

	/////// RECOGNITION LOGIC ///////

	var currentInterimTranscript = '';
	var finalTranscript = '';
	var recognizing = false;
	var finishedListening = false;
	
	/////// GLOBAL VARIABLES ///////
	var unmuteVol = 3.14159;
	var playlists = new Array();
	var currPlaylist = "";
	var currPlaylistIndex = "";

	if(!('webkitSpeechRecognition' in window)) {
		alert("Sorry, your Browser does not support the Speech API.");
	} else {
		var recognition = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = 'en-US';

		recognition.onstart = function() {
			recognizing = true;
			console.log("Listening now. Speak clearly.");
			if($("#playItems").css('display') == 'none') {
				enterPlayMode();
			}
		}

		recognition.onerror = function() {
			console.log("Recognition error.");
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

			console.log("interim: '" + currentInterimTranscript + "'");
			console.log("final: '" + finalTranscript + "'");

			if(previousInterimTranscript == currentInterimTranscript) {
				currentInterimTranscript = '';
			}

			R.player.repeat(R.player.REPEAT_ALL);

			var cIT = currentInterimTranscript.trim();
			var newWords = finalTranscript.replace(savedFinalTranscript, '').trim();

			var currentVol = R.player.volume();

			console.log("final transcript newWords: '" + newWords + "'");

			var ua = navigator.userAgent.toLowerCase();
			var isAndroid = ua.indexOf("android") > -1;
			if(isAndroid && (typeof window.orientation !== 'undefined')) {
				if(newWords == "start") {
					startSB();
				} else if(newWords == "pause" || newWords == "paws" || newWords == "POS" || newWords == "stop" || newWords == "top") {
					R.player.pause();
				} else if(newWords == "play" || newWords == "continue") {
					R.player.play();
				} else if(newWords == "next") {
					R.player.next();
				} else if(newWords == "next playlist" || newWords == "NEX playlist" || newWords == "X playlist" || newWords == "explicit" || newWords == "explain list") {
					playNextPlaylist();
					console.log("name: " + currPlaylist.name + " index: " + currPlaylistIndex);
				} else if(newWords == "previous" || newWords == "Prius" || newWords == "previews" || newWords == "back") {
					R.player.previous();
				} else if(newWords == "decrease volume" || newWords == "decrees volume" || newWords == "degrees volume" || newWords == "lower volume" || newWords == "softer" || newWords == "quieter") {
					R.player.volume(currentVol - 0.25);
					console.log("currentVol: " + currentVol);
					currentVol = currentVol - 0.25;
					console.log("new volume (dec): " + R.player.volume());
				} else if((newWords == "mute" || newWords == "nude") && currentVol > 0.0) {
					console.log("mute before: " + R.player.volume());
					unmuteVol = R.player.volume();
					R.player.volume(0.0);
					console.log("mute after: " + R.player.volume());
				} else if((newWords == "un mute" || newWords == "unmute" || newWords == "onion") && currentVol == 0.0 && unmuteVol != 3.14159) {
					console.log("mute before: " + R.player.volume());
					R.player.volume(unmuteVol);
					console.log("mute after: " + R.player.volume());
				} else if(newWords == "increase volume" || newWords == "louder") {
					R.player.volume(currentVol + 0.25);
					console.log("currentVol: " + currentVol);
					currentVol = currentVol + 0.25;
					console.log("new volume (dec): " + R.player.volume());
				} else if(newWords == "max volume" || newWords == "maximum volume") {
					R.player.volume(1.0);
				} else if(newWords == "shuffle on") {
					console.log("current shuffle: " + R.player.shuffle());
					R.player.shuffle(true);
					console.log("new shuffle: " + R.player.shuffle());
				} else if(newWords == "shuffle off") {
					console.log("current shuffle: " + R.player.shuffle());
					R.player.shuffle(false);
					console.log("new shuffle: " + R.player.shuffle());
				}
			} else {
				if(cIT == "start") {
					startSB();
				} else if(cIT == "pause" || cIT == "paws" || cIT == "POS" || cIT == "stop" || cIT == "top") {
					R.player.pause();
				} else if(cIT == "play" || cIT == "continue") {
					R.player.play();
				} else if(cIT == "next") {
					R.player.next();
				} else if(cIT == "next playlist" || cIT == "NEX playlist" || cIT == "X playlist" || cIT == "explicit" || cIT == "explain list") {
					playNextPlaylist();
					console.log("name: " + currPlaylist.name + " index: " + currPlaylistIndex);
				} else if(cIT == "previous" || cIT == "Prius" || cIT == "previews" || cIT == "back") {
					R.player.previous();
				} else if(cIT == "decrease volume" || cIT == "decrees volume" || cIT == "degrees volume" || cIT == "lower volume" || cIT == "softer" || cIT == "quieter") {
					R.player.volume(currentVol - 0.25);
					console.log("currentVol: " + currentVol);
					currentVol = currentVol - 0.25;
					console.log("new volume (dec): " + R.player.volume());
				} else if((cIT == "mute" || cIT == "nude") && currentVol > 0.0) {
					console.log("mute before: " + R.player.volume());
					unmuteVol = R.player.volume();
					R.player.volume(0.0);
					console.log("mute after: " + R.player.volume());
				} else if((cIT == "un mute" || cIT == "unmute" || cIT == "onion") && currentVol == 0.0 && unmuteVol != 3.14159) {
					console.log("mute before: " + R.player.volume());
					R.player.volume(unmuteVol);
					console.log("mute after: " + R.player.volume());
				} else if(cIT == "increase volume" || cIT == "louder") {
					R.player.volume(currentVol + 0.25);
					console.log("currentVol: " + currentVol);
					currentVol = currentVol + 0.25;
					console.log("new volume (dec): " + R.player.volume());
				} else if(cIT == "max volume" || cIT == "maximum volume") {
					R.player.volume(1.0);
				} else if(cIT == "shuffle on") {
					console.log("current shuffle: " + R.player.shuffle());
					R.player.shuffle(true);
					console.log("new shuffle: " + R.player.shuffle());
				} else if(cIT == "shuffle off") {
					console.log("current shuffle: " + R.player.shuffle());
					R.player.shuffle(false);
					console.log("new shuffle: " + R.player.shuffle());
				}
			}
		}
	}

	///// FUNCTIONS //////

	function authenticationComplete() {
		R.ready(function() {
			//Hide and remove current elements
			fadeOutAndRemove('#loginItems');
			$("#microphoneAccess").fadeIn('fast');
		});
	}

	function notAuthenticated() {
		$("#loginItems").fadeIn('fast');
	}

	$("#microphoneButton").click(function() {
		startRecording();
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
			console.log("Playing playlist: " + key);
			if(!(recognizing)) {
				startRecording();
			}
			R.player.play({source: key});
		})
	}

	$("#playPause").click(function(){
		console.log("Toggling play/pause");
		R.player.togglePause();
	})

	function startRecording() {
		finalTranscript = '';
		if(!(recognizing)) {
			console.log("If asked, please allow the browser to use your microphone");
			recognition.start();
		}
	}

	function stopRecording() {
		recognition.stop();
		console.log("Stopped recognition.");
	}

	function fadeOutAndRemove(identifier) {
		$(identifier).fadeOut('fast', function() {
			this.remove();
		})
	}

	function startSB() {
		var defaultPL = playlists[0];
		var key = defaultPL.key;
		console.log("Playing playlist: " + key);
		R.player.play({source: key});
	}

	function playNextPlaylist() {
		currPlaylistIndex = (currPlaylistIndex + 1) % playlists.length;
		currPlaylist = playlists[currPlaylistIndex];
		var key = currPlaylist.key;
		console.log("Playing playlist: " + key);
		R.player.play({source: key});
	}

	function createPlaylistThumb(name, key, icon) {
		var result = "<li class='.playlist' data-key='";
		result += key + "'>";
		result += "<img class='playlistImage' src='" + icon + "'>";
		result += "<span class='playlistName'>" + name + "</span>";
		result += "</li>"
		console.log(result);
		return result;
	}
});