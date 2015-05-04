var main = function(){
	"use strict";

	console.log("VANE!@@@@!@!@!@@!@");

	//var numShipPegs = 5;  //Number of pegs user has to place on the board.
	var ships = [
					{"name": "battleship", "numPegs": 4, "set": "unset"},
					{"name": "cruiser", "numPegs": 3, "set": "unset"},
					{"name": "submarine", "numPegs": 2, "set": "unset"}
				];

	var $clickInfo = $("<p>").addClass("clickInfo").text("You clicked: ");
	var $instructions = $("<p>").addClass("instructions").text("Place pegs on the board to represent your ships");
	var $subInstructions = $("<p>").addClass("placeShipInstructions");
	var $hoverInfo = $("<p>").addClass("hoverInfo").text("Hovering over: ");
	var $ul = $("<ul>");
	var $shipListHeading = $("<p>").text("List of ships left to place on the board");

	//var $numShipsLeft = $("<p>").addClass("numShipsLeft").text("Number of ships left: " + numShipPegs);

	$("#clicked").append($instructions);
	$("#clicked").append($subInstructions);
	$("#clicked").append($hoverInfo);
	$("#clicked").append($clickInfo);

	$("#shipList").append($shipListHeading);
	$("#shipList").append($ul);
	//$("#clicked").append($numShipsLeft);

	//console.log(ships[0].name + " has " + ships[0].numPegs + " pegs.");

	/*
	ships.forEach(function(ship){
		var numShipPegs = ship.numPegs;
		
		$subInstructions.text("Place " + ship.numPegs + " pegs for " + ship.name);
	});*/

	//Place ships on a list and handle click events for each ship.
	ships.forEach(function(ship){
		//First, create the list of ships to be outputted to the user.
		var	$li = $("<li>").attr("id", ship.name).addClass("ship").text(ship.name);

		$ul.append($li);

		$li.on("click", function(){
			console.log($li.attr("id"));

			//Next, remove "activeShip" class from list.
			$("#shipList li").removeClass("activeShip");

			//Give clicked ship "activeShip" class.
			$li.addClass("activeShip");
		})
	});

	//Handle when a table cell is clicked.
	$("#grid td").click(function(cell){
		var $clickedCell = $(cell.target).attr("id");  //Get the id of the cell that was clicked.

		console.log($clickedCell);

		//Output to the user what he/she clicked.
		$("#clicked .clickInfo").text("You clicked: " + $clickedCell);

		/*
		if(confirm("Are you sure you want to place a peg here?")){
			$(cell.target).addClass("ship");
			numShipPegs--;
			$numShipsLeft.text("Number of ships left: " + numShipPegs);
		}*/
	});

	$("#grid td").mouseover(function(cell){
		//console.log(cell.target.id);
		$hoverInfo.text("Hovering over: " + cell.target.id);
	});

};

$(document).ready(main);