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

//Set up the schema.
var PlayerSchema = mongoose.Schema({
	username: String,
	ships: Array,
	closed_moves: Array
});

//Set up the variable to hold objects for the database.
var PlayerModel = mongoose.model("PlayerModel", PlayerSchema);

var initializeTurn = function(){
	return Math.floor(Math.random() * 2 + 1) -1;
};

//Routes:
//Route for homepage.
app.get("/", function(req, res){
	res.render("index", {title: "Battleship Prototype The Movie:The Game"});
});

// //Route for saving the ship locations.
// app.post("/saveShipLocations", function(req,res){
// 	console.log("RECEIVED POST");
// 	console.log(req.body);

// 	res.send("");  //Send junk data.
// });

////Route for loading the playing field.
// app.get("/play", function(req, res){
// 	res.render("play", {title: "Play"})
// });

//Game Rooms
//Reference: https://github.com/Automattic/socket.io/blob/master/examples/chat/public/main.js
var numUsers = 0;
var usernames = {};

io.on("connection", function(socket){
	numUsers++;
	console.log(numUsers + " logged in.");

	socket.on("add username", function(username){
		socket.username = username;
		console.log(socket.username + " has logged in.");

		var newUser = new PlayerModel({"username": username, "ships": []});

		newUser.save(function(err){
			if(err){
				console.log("ERROR: " + err);
				return;
			}
		});		
	});

	socket.on("save state", function(data){

		socket.ships = data.ships;
		socket.closed_moves = data.closed_moves;

		//console.log(socket.ships);

		console.log(data);

		PlayerModel.update({"username": socket.username}, {$set: {"ships": data.ships, "closed_moves": data.closed_moves}}, function(err, results){
			if(err){
				console.log("ERROR: " + err);
				return;
			}

			console.log(results);
		});
	});

	socket.on("attack", function(attack){
		//Reports attack to user that got attack
		socket.broadcast.emit("attacked", attack);
		console.log(socket.username + " attacked " + attack);
	});

	socket.on("attack result", function(result){
		//Reports whether user got hit or missed
		socket.broadcast.emit("attack result");
	});

	socket.on("play game", function(readyFlag){
		PlayerModel.find({"username": socket.username}, function(err, data){
			if(err){
				console.log("ERROR: " + err);
				return;
			}

			connectedUsers.push(data[0].username);

			console.log(connectedUsers);

			if(connectedUsers.length === 2){
				console.log("Ready to start the game");

				var turn = initializeTurn();

				var playerToGoFirst,
					playerToGoNext;

				if(turn === 0){
					playerToGoFirst = connectedUsers[turn];
					playerToGoNext = connectedUsers[1];
				} else{
					playerToGoFirst = connectedUsers[turn];
					playerToGoNext = connectedUsers[0];
				}

				io.emit("first turn", {"personFirst": playerToGoFirst});
			}
		});
	});

	socket.on("disconnect", function(){
		numUsers--;
		console.log(socket.username + " has logged out. " + numUsers + " logged in.")

		if(connectedUsers.indexOf(socket.username) > 0){
			connectedUsers.splice(connectedUsers.indexOf(socket.username), 1);
		}
		console.log(connectedUsers);
	});

});

