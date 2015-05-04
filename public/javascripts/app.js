var main = function(){
	"use strict";

	console.log("VANE!@@@@!@!@!@@!@");

	$("#grid").click(function(cell){
		var $clickedCell = $(cell.target).attr("id");

		console.log($clickedCell);

		$("#clicked p").text("You clicked: " + $clickedCell);
	});
};

$(document).ready(main);