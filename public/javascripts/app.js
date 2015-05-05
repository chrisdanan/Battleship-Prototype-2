var main = function(){
	"use strict";

	console.log("VANE!@@@@!@!@!@@!@");

	//++++++++++++++++++++++++VARIABLE DECLARATION++++++++++++++++++++++++++++++++++++
	//List of ships allowed in the game.
	var ships = [
					{"name": "battleship", "numPegs": 4, "set": "unset", "loc": []},
					{"name": "cruiser", "numPegs": 3, "set": "unset", "loc": []},
					{"name": "submarine", "numPegs": 2, "set": "unset", "loc": []}
				];

	//Holds the cells that have already been taken by ship pegs.
	var closed_moves = [];

	var shipsLeft = ships.length;  //Used to keep track of how many ships are left to be placed on the grid.

	//DOM elements that will be placed in the information section of the html page.
	var $clickInfo = $("<p>").addClass("clickInfo").text("You clicked: ");
	var $instructions = $("<p>").addClass("instructions").text("Place pegs on the board to represent your ships");
	var $subInstructions = $("<p>").addClass("placeShipInstructions");
	var $hoverInfo = $("<p>").addClass("hoverInfo").text("Hovering over: ");

	//Heading for the ship list.
	var $shipListHeading = $("<p>").text("List of ships left to place on the board");

	//Ready button will appear to the user when he/she has placed all of his/her ships on the grid.
	//It will take the user to the playing field.
	var $readyBtn = $("<button>").attr("id", "readyBtn").text("Ready!");

	//+++++++++++++++++++++++++FUNCTIONS+++++++++++++++++++++++++++++++++++++++++++++

	//Check if the cell clicked by the user is a valid placement cell.
	var verifyPlay = function(closed, ship, move, cellNum){
		//Check to see if duplicate click on same ship ONLY!
		if(closed.indexOf(move) >= 0){
			console.log(move + "! This play is illegal");
			return false;
		}
		//Check if the user already placed a cell for this ship.
		if(ship.loc.length > 0) {
			//http://stackoverflow.com/questions/6773550/get-id-of-div-from-its-class-name
			var clicked = parseInt(cellNum);

			//Checking to see if the cell previously clicked was above it. Allows down move.
			if(clicked - 10 > 0){
				var above = clicked - 10;
				var cellAbove = document.getElementsByClassName(String(above))[0].id;
				console.log(cellAbove + " is above " + move);
				//Now that we know what is above us, we can check if the previous cell was above it.
				if(ship.loc.indexOf(cellAbove) >= 0) {
					console.log(move + "! This play is legal!");
					return true;
				}
			}
			//Check to see if the cell previously clicked was left of it. Allows a right move.
			if((clicked - 1) % 10 > 0){
				//Check to see if the cell previously clicked was left of it. Allows a right move.
				var left = clicked - 1;
				var cellLeft = document.getElementsByClassName(String(left))[0].id;
				console.log(cellLeft + " is left of " + move);
				//Now that we know what is above us, we can check if the previous cell was above it.
				if(ship.loc.indexOf(cellLeft) >= 0) {
					console.log(move + "! This play is legal!");
					return true;
				}
			}
			//Check to see if the cell previously clicked was to its right. Allows a left move.
			if((clicked) % 10 != 0){
				console.log((clicked) % 10);
				//Check to see if the cell previously clicked was below it. Allows a right move.
				var right = clicked + 1;
				var cellRight = document.getElementsByClassName(String(right))[0].id;
				console.log(cellRight + " is right of " + move);
				//Now that we know what is above us, we can check if the previous cell was above it.
				if(ship.loc.indexOf(cellRight) >= 0) {
					console.log(move + "! This play is legal!");
					return true;
				}
			} 

			//Check to see if the cell previously clicked was to below it. Allows an up move.
			if(clicked + 10 < 101){
				//Check to see if the cell previously clicked was below it. Allows a right move.
				var below = clicked + 10;
				var cellBelow = document.getElementsByClassName(String(below))[0].id;
				console.log(cellBelow + " is below " + move);
				//Now that we know what is above us, we can check if the previous cell was above it.
				if(ship.loc.indexOf(cellBelow) >= 0) {
					console.log(move + "! This play is legal!");
					return true;
				}
			} 
			console.log(move + "! This play is illegal");
			return false;
			//document.getElementsByClassName('myClassName')[0].id
		}

		console.log(move + "! This play is legal!");
		return true;
	};

	//Purpose: Check if there are still any ships left to be placed on the grid.
	var checkShipsLeft = function(){
		if(shipsLeft === 0){
			$("#readyDiv").append($readyBtn);
		}
	};

	//Purpose: Check if the currently selected ship has any pegs left to be placed on the board.
	var checkNoPegsLeft = function(object, numPegs, shipButton){
		if(object.loc.length === numPegs){
			//Reference for disabled: http://stackoverflow.com/questions/16777003/what-is-the-easiest-way-to-disable-enable-buttons-and-links-jquery-bootstrap
			shipButton.prop("disabled", true);  //Disable button.
			object.set = "set";  //Mark that the ship has been placed on the board.
			shipsLeft--;
		}

		//Check if there are any ships left.
		checkShipsLeft();
	};

	//Purpose: Allow player to place pegs on the grid if there are pegs left to place.
	var checkPegsLeft = function(object, numPegs, legal, shipBtn, clickedCell, cellNum, cell){
		//As long as there are pegs of the ship left to place on the grid, keep placing pegs.
		if(object.loc.length < numPegs){
			//Check if the cell clicked for placement is legal.
			legal = verifyPlay(closed_moves, object, clickedCell, cellNum);

			if(legal){
				object.loc.push(clickedCell);  //Push the cell id to the objects loc variable to indicate that it has a peg in that cell.
				closed_moves.push(clickedCell);  //Push the cell id to the list of closed moves to mark that cell as taken.
				$(cell.target).addClass("played");

				//Check if the currently selected ship has any pegs left to place on the board.
				checkNoPegsLeft(object, numPegs, shipBtn);
			}
		}
	};

	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	
	//Append the DOM elements to their appropriate spots.
	$("#clicked").append($instructions);
	$("#clicked").append($subInstructions);
	$("#clicked").append($hoverInfo);
	$("#clicked").append($clickInfo);

	$("#shipList").append($shipListHeading);

	//Go through each ship and handle them (place them on the board).
	ships.forEach(function(ship){
		//Button for each type of ship.
		//The buttons will be used to allow the user to place ships on the grid.
		var $shipBtn = $("<button>").attr("id", ship.name).addClass("shipBtn").text(ship.name);

		//Append the buttons to the ship list.
		$("#shipList").append($shipBtn);

		//Handle each button click.\\\
		$shipBtn.on("click", function(){
			console.log("You clicked the " + $shipBtn.attr("id") + " button.");

			//Save the id (name of ship clicked) to a variable.
			var clickedShip = $shipBtn.attr("id");

			//Handle placing a ship on the grid by clicking a cell.
			$("#grid td").click(function(cell){
				var $clickedCell = $(cell.target).attr("id"),  //The id of the cell that was clicked (e.g. D3).
					classList = $(cell.target).attr("class").split(" "),  //Get the class list of the cell that was clicked.
					legal = false;  //Check to see if a placement is legal or not. 

				var $cellNum = classList[2];  //The cell count is always the third class item of the cell.

				//Match button click to a ship in the list of ships to get information about the ship (e.g. number of pegs).
				ships.forEach(function(object){
					//Find the correct ship amongst the list of ships.
					if(clickedShip === object.name && object.set === "unset"){
						console.log("Found the ship in the list");
						console.log(object);

						var numPegs = object.numPegs;  //Store number of pegs this ship has.

						//Check if the ship has more pegs to place on the grid.
						checkPegsLeft(object, numPegs, legal, $shipBtn, $clickedCell, $cellNum, cell);
					}
				});
			});
		});
	}); //Pyramid of doom oh no...

	//Ready button handler.
	$readyBtn.on("click", function(){
		console.log("Clicked Ready! button.");
	});


	//Handle when a table cell is clicked.
	$("#grid td").click(function(cell){
		var $clickedCell = $(cell.target).attr("id");  //Get the id of the cell that was clicked.

		console.log("Clicked cell " + $clickedCell);

		//Output to the user what he/she clicked.
		$("#clicked .clickInfo").text("You clicked: " + $clickedCell);
	});

	$("#grid td").mouseover(function(cell){
		//console.log(cell.target.id);
		$hoverInfo.text("Hovering over: " + cell.target.id);
	});

};

$(document).ready(main);