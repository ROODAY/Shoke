$(document).ready(function(){
	$("#authorize").click(function(){
		R.authenticate(function(authenticated){
			if(authenticated) {
				alert("You have been authenticated!");
				authenticationComplete();
			}
		})
	});

	function authenticationComplete() {
		R.ready(function() {
			var name = R.currentUser.attributes.firstName;
			alert("Welcome, " + name + "!");
		});
	}
});