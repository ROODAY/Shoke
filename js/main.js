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

	////// RECOGNITION LOGIC ///////

	var currentInterimTranscript = '';
	var finalTranscript = '';
	var recognizing = false;
	var finishedListening = false;

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

			var cIT = currentInterimTranscript.trim();
			var currentVol = R.player.volume();

			var newWords = finalTranscript.replace(savedFinalTranscript, '').trim();
			console.log("final transcript newWords: '" + newWords + "'");

			var ua = navigator.userAgent.toLowerCase();
			var isAndroid = ua.indexOf("android") > -1;
			if(isAndroid && (typeof window.orientation !== 'undefined')) {
				if(newWords == 'pause' || newWords == 'stop' || newWords == 'paws' || newWords == 'top') {
					R.player.pause();
				} else if(newWords == 'play' || newWords == 'continue' || newWords == 'stock' || newWords == 'talk') {
					R.player.play();
				} else if(newWords == "next") {
					R.player.next(true);
				} else if(newWords == "previous" || newWords == "Prius") {
					R.player.previous();
				} else if(newWords == "decrease" || newWords == "decree") {
					R.player.volume(currentVol - 0.25);
					console.log("currentVol: " + currentVol);
					currentVol = currentVol - 0.25;
					console.log("new volume (dec): " + R.player.volume());
				} else if(newWords == "increase") {
					R.player.volume(currentVol + 0.25);
					console.log("currentVol: " + currentVol);
					currentVol = currentVol + 0.25;
					console.log("new volume (dec): " + R.player.volume());
				} 
			} else {
				if(cIT == "pause" || cIT == "paws" || cIT == "POS" || cIT == "stop" || cIT == "top") {
					R.player.pause();
				} else if(cIT == "play" || cIT == "continue") {
					R.player.play();
				} else if(cIT == "next") {
					R.player.next(true);
				} else if(cIT == "previous" || cIT == "Prius") {
					R.player.previous();
				} else if(cIT == "decrease" || cIT == "decree") {
					R.player.volume(currentVol - 0.25);
					console.log("currentVol: " + currentVol);
					currentVol = currentVol - 0.25;
					console.log("new volume (dec): " + R.player.volume());
				} else if(cIT == "increase") {
					R.player.volume(currentVol + 0.25);
					console.log("currentVol: " + currentVol);
					currentVol = currentVol + 0.25;
					console.log("new volume (dec): " + R.player.volume());
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
					var ownedPlaylists = response.result.owned;
					for(var i = 0; i < ownedPlaylists.length; i++) {
						var currentPlaylist = ownedPlaylists[i];
						var name = currentPlaylist.name;
						var key = currentPlaylist.key;
						var li = "<li class='playlist' data-key='"
							+ key + "'>"
							+ (i + 1) + ". " +  name + "</li>";
						console.log(li);
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
});