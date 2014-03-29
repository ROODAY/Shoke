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
				},
				error: function(response) {
					console.log("Error: " + response.message);
				}
			});
		});
	}
});