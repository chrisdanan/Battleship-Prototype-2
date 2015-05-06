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

server.listen(port);
console.log("Hey! Listen to port 3000!");

//Set up views path and view engine.
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

//Set up static directory.
app.use(express.static(__dirname + "/public"));

//CONNECT HERE TO DATABASE!!!

//Tell Express to parse incoming JSON objects.
app.use(bodyParser());

//CRATE MONGOSE SKEM HERE KK?

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
		usernames[username] = username;
		console.log(username + " has logged in.");
	});

	socket.on("save state", function(ships){
		socket.ships = ships;
		console.log(socket.ships);
	});

	socket.on("disconnect", function(){
		numUsers--;
		delete usernames[socket.username];
		console.log(socket.username + " has logged out. " + numUsers + " logged in.")
	});

});

