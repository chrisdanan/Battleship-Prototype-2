var main = function(){
	"use strict";

	console.log("VANE!@@@@!@!@!@@!@");

	//var numShipPegs = 5;  //Number of pegs user has to place on the board.
	var ships = [
					{"name": "battleship", "numPegs": 4},
					{"name": "cruiser", "numPegs": 3},
					{"name": "submarine", "numPegs": 2}
				];

	var $clickInfo = $("<p>").addClass("clickInfo").text("You clicked: ");
	var $instructions = $("<p>").addClass("instructions").text("Place pegs on the board to represent your ships");
	var $subInstructions = $("<p>").addClass("placeShipInstructions");
	var $numShipsLeft = $("<p>").addClass("numShipsLeft").text("Number of ships left: " + numShipPegs);

	$("#clicked").append($instructions);
	$("#clicked").append($subInstructions);
	$("#clicked").append($clickInfo);
	//$("#clicked").append($numShipsLeft);

	//console.log(ships[0].name + " has " + ships[0].numPegs + " pegs.");

	ships.forEach(function(ship){
		var numShipPegs = ship.numPegs;
		
		$subInstructions.text("Place " + ship.numPegs + " pegs for " + ship.name);
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


};

$(document).ready(main);