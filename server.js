"use strict";

var express = require("express"),
	app = express(),
	http = require("http"),
	path = require("path"),
	server = http.createServer(app),
	socketIO = require("socket.io"),
	io = socketIO(server),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	port = 3000;

var connectedUsers = [];

//Connect to the database.
mongoose.connect("mongodb://localhost/FlippinShips", function(err){
	if(err){
		console.log("CONNECTION ERROR: " + err);
		return;
	}
});

server.listen(port);
console.log("Hey! Listen to port 3000!");

//Set up views path and view engine.
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

//Set up static directory.
app.use(express.static(__dirname + "/public"));

//Tell Express to parse incoming JSON objects.
app.use(bodyParser());

//Set up the schemas.
//Schema to keep track of user accounts.
var UserSchema = mongoose.Schema({
	userName: String,
	passWord: String
});

//Schema to keep track of players playing the game at this moment.
var PlayerSchema = mongoose.Schema({
	username: String,
	ships: Array,
	closed_moves: Array
});

//Set up the variable to hold objects for the database.
var UserModel = mongoose.model("UserModel", UserSchema);
var PlayerModel = mongoose.model("PlayerModel", PlayerSchema);

//Purpose: Randomly choose which player goes first.
var initializeTurn = function(){
	return Math.floor(Math.random() * 2 + 1) -1;
};

//Routes:
//Route for homepage.
app.get("/", function(req, res){
	//res.render("index", {title: "Battleship Prototype The Movie:The Game"});
	res.render("login", {title: "Flippin' Ships Login Page"});  //Default home page is login page.
});

//Route for registration page.
app.get("/register", function(req, res){
	res.render("register", {title: "Flippin' Ships Registration Page"});
});

//Route for login page.
app.get("/login", function(req, res){
	res.render("login", {title: "Flippin' Ships Login Page"});
});

//Route for handling posts from login form.
app.post("/login_verification", function(req, res){
	var userName = req.body.userName;  //Store username.
	var passWord = req.body.passWord;  //Store password.

	console.log("Received a request from the client to /login_verfication");

	//Find the user in the database.
	UserModel.find({"userName": userName, "passWord": passWord}, function(err, data){
		if(err){
			console.log("ERROR " + err);
			return;
		}

		if(data.length === 1){ //A user was found in the database.
			console.log("Found user " + data[0].userName);
			res.render("game", {title: "Battleship Prototype The Movie:The Game", username: userName});
		} else{  //The user was not found.
			console.log("Cannot find user.");
			//<<<Output error message to user>>>
		}
	});
});

//Route for handling posts from registration page.
//This will take care of creating new user accounts.
app.post("/registration", function(req, res){
	var userName = req.body.userName;  //Store username.
	var passWord = req.body.passWord;  //Store password.

	console.log("Received request from client.");

	//Create user object.
	var user = new UserModel({"userName": userName, "passWord": passWord});

	//<<<<IMPORTANT!!! Need to check for existing usernames first!!!!>>>>

	//Save the user to the database.
	user.save(function(err){
		if(err){
			console.log("ERROR: " + err);
			return;
		}
	});

	//<<<<<Move this message to appropriate spot????>>>>
	res.send({"message": "Successfully registered."});
});

//Game Rooms
//Reference: https://github.com/Automattic/socket.io/blob/master/examples/chat/public/main.js
var numUsers = 0;  //Keep track of number of users in a game room.
var usernames = {};  //Holds connected user's names.

//Socket Handling

io.on("connection", function(socket){
	numUsers++;  //Increase number of users each time a user connects.
	console.log(numUsers + " logged in.");

	//Handle when user chooses his/her nickname.
	socket.on("add username", function(username){
		socket.username = username;  //Store username in socket object.
		console.log(socket.username + " has logged in.");

		//Create database object for new player.
		var newUser = new PlayerModel({"username": username, "ships": []});

		//Save the new player in the database.
		newUser.save(function(err){
			if(err){
				console.log("ERROR: " + err);
				return;
			}
		});		
	});

	//Handle when player indicates he/she is finished placing ships on the board.
	socket.on("save state", function(data){

		socket.ships = data.ships;  //Save player's ship data in socket object.
		socket.closed_moves = data.closed_moves;  //Save closed_moves array in socket object.

		console.log(data);
		
		//Update the player's ship data in the database.
		PlayerModel.update({"username": socket.username}, {$set: {"ships": data.ships, "closed_moves": data.closed_moves}}, function(err, results){
			if(err){
				console.log("ERROR: " + err);
				return;
			}

			console.log(results);
		});
	});

	//Handle when a player attacks.
	socket.on("attack", function(attack){
		//Reports attack to user that got attack
		socket.broadcast.emit("attacked", attack);
		console.log(socket.username + " attacked " + attack);
	});

	//Handle when the attacking player receives the result of his/her attack.
	socket.on("attack result", function(result){
		//Reports whether user got hit or missed
		socket.broadcast.emit("attack result", result);
	});

	//Handle when the user indicates he/she is ready to begin playing the game.
	socket.on("play game", function(readyFlag){
		//Find the player who indicated that he/she was ready.
		PlayerModel.find({"username": socket.username}, function(err, data){
			if(err){
				console.log("ERROR: " + err);
				return;
			}
			console.log(connectedUsers)
			connectedUsers.push(data[0].username);  //Add player to array.

			console.log(connectedUsers);

			//Once the array has 2 players in it, the game can begin.
			if(connectedUsers.length === 2){
				console.log("Ready to start the game");

				var turn = initializeTurn();  //Get random number to indicate who goes first.

				var playerToGoFirst,  //Holds name of player to go first.
					playerToGoNext;  //Holds name of player to go next.

				//Determine who goes first based on random number.
				if(turn === 0){
					playerToGoFirst = connectedUsers[turn];
					playerToGoNext = connectedUsers[1];
				} else{
					playerToGoFirst = connectedUsers[turn];
					playerToGoNext = connectedUsers[0];
				}

				console.log("It is " + playerToGoFirst + "'s turn first.");
				//Emit to all players who goes first.
				io.emit("first turn", {"personFirst": playerToGoFirst});
			}
		});
	});

	//Handle when a player ends their turn.
	socket.on("end turn", function(player){

		var indexOfPlayer = connectedUsers.indexOf(player);  //Get index of array where player's are stored.
															//Since there are only 2 players, the other index goes next.

		//Handle whose turn is next and emit to all players.
		if(indexOfPlayer === 0){
			console.log("It is now player " + connectedUsers[1] + "'s turn.");
			io.emit("next turn", {"activePlayer": connectedUsers[1], "inactivePlayer": connectedUsers[0]});
		} else if(indexOfPlayer === 1){
			console.log("It is now player " + connectedUsers[0] + "'s turn.");
			io.emit("next turn", {"activePlayer": connectedUsers[0], "inactivePlayer": connectedUsers[1]});
		}

	});

	//Handle when the game is over.
	socket.on("game over", function(result){
		var winner = result.winner;  //Store name of winner.
		var indexOfWinner = connectedUsers.indexOf(winner);  //Get index of winner from player array.

		console.log("Game Over");

		//Find out who won based on index.  Emit to all players who won and lost.
		if(indexOfWinner === 0){
			console.log("Winner is " + connectedUsers[0]);
			console.log("Loser is " + connectedUsers[1]);
			io.emit("the end", {"winner": connectedUsers[0], "loser": connectedUsers[1]});
		} else if(indexOfWinner === 1){
			console.log("Winner is " + connectedUsers[1]);
			console.log("Loser is " + connectedUsers[0]);
			io.emit("the end", {"winner": connectedUsers[1], "loser": connectedUsers[0]});
		}
	});

	//Handle when a player leaves the game.
	//<<<NOTE: Can be used to catch 'forfeited' games in the future.>>>
	socket.on("disconnect", function(){
		numUsers--;
		console.log(socket.username + " has logged out. " + numUsers + " logged in.")

		if(connectedUsers.indexOf(socket.username) >= 0){
			connectedUsers.splice(connectedUsers.indexOf(socket.username), 1);
		}
		console.log(connectedUsers);
	});

});

//t
//fflvd

