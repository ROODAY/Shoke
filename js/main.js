$(document).ready(function(){
	$("#authorize").click(function(){
		R.authenticate(function(authenticated){
			if(authenticated) {
				console.log("User authenticated");
				authenticationComplete();
			}
		})
	});

	function authenticationComplete() {
		R.ready(function() {
			var name = R.currentUser.attributes.firstName;
			$("#container").append("<p>Welcome, " + name + "!</p>");

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
			R.player.play({source: key});
		})
	}

	$("#playPause").click(function(){
		console.log("Toggling play/pause");
		R.player.togglePause();
	})
});