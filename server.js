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
app.get("/", function(req, res){
	res.render("index", {title: "Battleship Prototype The Movie:The Game"});
});

app.post("/play", function(req,res){
	res.render("play", {title: "Let's Play"});
});

io.on("connection", function(socket){
	console.log("A player has joined the game");
});

