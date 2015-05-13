var main = function(){
	"use strict";

	console.log("Hello Vane");

	//DOM elements.
	var $userName = $("<input>").addClass("inputUserName").attr("id", "userName"),
		$password = $("<input>").addClass("inputPassword").attr("id", "passWord").attr("type", "password"),
		$submitButton = $("<button>").text("Submit"),
		$userNameLabel = $("<label>").attr("for", "userName").text("Username"),
		$passWordLabel = $("<label>").attr("for", "passWord").text("Password"),
		$registerButton = $("<button>").text("Register");

	//Append DOM elements to DOM.
	$("#register-form").append($userNameLabel);
	$("#register-form").append($userName);
	$("#register-form").append($passWordLabel);
	$("#register-form").append($password);
	//$("#login-form").append($submitButton);

	$("#register-form").append($registerButton);

	//Submit Button is no longer in use.
	/*
	$submitButton.on("click", function(){
		console.log("Loggin in...");

		var uName = $userName.val(),
			pWord = $password.val();

		$.post("/login_verification", {"userName": uName, "passWord": pWord}, function(res){
			console.log("Got a response back from the server.");

			console.log(res.message);
		});

		$userName.val("");
		$password.val("");
	});*/

	//User clicks register button to register for a new account.
	$registerButton.on("click", function(){
		console.log("Registering...");

		var uName = $userName.val(),  //Store username into variable.
			pWord = $password.val();  //Store password into variable.

		//Send post to register for new account.
		$.post("/registration", {"userName": uName, "passWord": pWord}, function(res){
			console.log("Got a response back from the server.");

			$("#results").append($("<p>").text(res.message));
		});
	})
}

$(document).ready(main);