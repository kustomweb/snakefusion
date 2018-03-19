var world;//world which stores the species / populations

var worldOfLegends;
var blnLoadingData = false;

var speed = 30;//the frame rate

//booleans used to control the game state
var showAll = false;//whether to show all the snakes in the generation or just the current best snake
var trainLegendSnakes = false; //true if training the legends i.e. if running worldOfLegends
var showingLegend = false;//true if testing just one legend
var fusionGo =false;//true if testing the snake fusion 

var globalMutationRate = 0.01;
var arrBest = [];
var arrBestOfSpecies = [];
var blnFilesLoaded = false;
//---------------------------------------------------------------------------------------------------------------------------------------------------------  
//run on startup
function setup() {
	frameRate(speed);
	createCanvas(1900, 900);
	
	//world = new World(2, 100);
  
	if (trainLegendSnakes == true || showingLegend) {
		blnLoadingData = true;
		world = new World(0, 0);
		//load best snakes from file and setup worldOfLegends
		world.loadBestSnakes();
	} else {
		world = new World(5, 500);
	}
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------  
function draw() {
	if (blnLoadingData) {
		return;
	}
	
	if (showingLegend && world.legendNo < 0) {
		var snakeNo = 0;
		world.legend = world.SnakesOfLegend[snakeNo].clone();
		world.legendNo = snakeNo;
		world.legend.test = true;
	}
			
	background(51);
	
	drawData();
  
	//training/evolving the legend snakes
	if (trainLegendSnakes) {
		if (!worldOfLegends.done()) {
		  worldOfLegends.updateAlive();
		} else {
		  //all are dead
		  worldOfLegends.geneticAlgorithm();
		}
	
	//testing a single legend
	} else if (showingLegend) {
		if (world.legend.alive) {
		  world.updateLegend();
		} else {
			if(world.legend.len < 100){
				world.playLegend(world.legendNo);
			} else {
				showingLegend = false;
			}
		}
	
	// testing the supersnake fusion
	} else if (fusionGo) {
		if (world.fusedSnake.alive) {
			world.updateSuperSnake();
		} else { //once done set the fusionGo to false
			fusionGo = false;
		}
	//training/evolving population normally
	} else {
		if (!world.done()) {//if there is still a snake alive then update them
			world.updateAlive();
		} else {//if all are dead :(
			world.geneticAlgorithm();
		}
	}
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------  

function keyPressed() {
	switch(key.toLowerCase()) {
		case ' '://toggle show all
		showAll = !showAll;
		break;
	case '+'://speed up frame rate
		speed += 10;
		frameRate(speed);
		break;
	case '-'://slow down frame rate
		if (speed > 10) {
		  speed -= 10;
		  frameRate(speed);
		}
		break;
	case 'f'://create a fused snake from the legends
		fusionGo  = true;
		world.snakeFusion();
		break;
	case '0'://test legend 0
		showingLegend = true;
		world.playLegend(0);
		break;
	case '1': // test legend no 1
		world.playLegend(1);
		showingLegend = true;
		break;
	case '2'://test legend no 2
		world.playLegend(2);
		showingLegend = true;
		break;
	case '3'://test legend no 3
		world.playLegend(3);
		showingLegend = true;
		break;
	case '4'://test legend no 4
		world.playLegend(4);
		showingLegend = true;
		break;
	case 'h'://halve the mutation rate
		globalMutationRate /=2;
		break;
	case 'd'://double the mutation rate
		globalMutationRate *= 2;
		break;
	case 'l'://train the legends
		trainLegendSnakes =!trainLegendSnakes;
		if (trainLegendSnakes == true) {//load best snakes from file and setup worldOfLegends
			blnLoadingData = true;
			world.loadBestSnakes();
		}
	}
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------  
function drawData() {
	if (blnLoadingData) {
		return;
	}
	fill(255);
	stroke(255);
	line(400, 0, 400, 400);
	line(0, 400, 800, 400);
	line(800, 0, 800, 400);
	textSize(20);
	
	//training/evolving the legend snakes
	if (trainLegendSnakes) {
		/*
		text("Generation: " + (worldOfLegends.gen), 10, 100); 
		text("Speed: " + speed, 10, 150);
		text("Global Best: " + (worldOfLegends.worldLongest), 10, 200);
		text("mutation Rate: " + globalMutationRate, 10, 250);      
		*/
		var y_offset = 0;
		fill(255);
		stroke(255);
		text("Generation: " + (worldOfLegends.gen), 10, 20 + y_offset); y_offset += 30;
		if (worldOfLegends.gen > 0) {
			
			var species = worldOfLegends.species[worldOfLegends.worldBestSpecies];
			//fill(255, 255 - species.speciesColorFactor, 0);
			//stroke(255, 255 - species.speciesColorFactor, 0);
			fill(species.color);
			stroke(species.color);	
			text("Best Species: " + (worldOfLegends.worldBestSpecies + 1) + " (" + species.speciesName + ")", 10, 20 + y_offset); y_offset += 30;
			//text("Speed: " + speed, 10, 150);
			text("Fitness: " + (worldOfLegends.worldBestFitness).toFixed(4), 10, 20 + y_offset); y_offset += 30;
			
			var species = worldOfLegends.species[worldOfLegends.worldLongestSpecies]; 
			//fill(255, 255 - species.speciesColorFactor, 0);
			//stroke(255, 255 - species.speciesColorFactor, 0);
			fill(species.color);
			stroke(species.color);
				
			text("Longest Species: " + (worldOfLegends.worldLongestSpecies + 1) + " (" + species.speciesName + ")", 10, 20 + y_offset); y_offset += 30;
			text("Score: " + (worldOfLegends.worldLongest), 10, 20 + y_offset); y_offset += 30;
		
		
			//text("mutation Rate: " + globalMutationRate, 10, 350);
			
			textSize(20);
			for (var i = 0; i < worldOfLegends.species.length; i++) {
				var species = worldOfLegends.species[i];
				var suffix = "       ";
				
				if (species.globalBestFitness == worldOfLegends.worldBestFitness) {
					suffix = ">>> ";
				}
				//fill(255, 255 - species.speciesColorFactor, 0);
				//stroke(255, 255 - species.speciesColorFactor, 0);
				fill(species.color);
				stroke(species.color);
				text(suffix + (Number(species.speciesNo) + 1) + "] " + species.speciesName + ": Overall: " + species.globalBest + " Best: " + (species.globalBestFitness).toFixed(4), 900, 40 + (i * 35));
			}
		}
		var upper_limit = 0;
		//graph the overall performance
		for (var i = 0; i < arrBest.length; i++) {
			var x = arrBest[i].iteration;
			if (upper_limit <  Number(arrBest[i].fitness))  {
				upper_limit =  Number(arrBest[i].fitness);
			}
		}
		noStroke();
		for (var i = 0; i < arrBest.length; i++) {
			var x = arrBest[i].iteration;
			var normFitness =  Number(arrBest[i].fitness) / upper_limit;
			//console.log(normFitness);
			//var y = sh + 690 - normFitness;
			var y = 690 - (normFitness * 100);
			var color = "rgb(255, 255 , 255)";
			if (i == arrBest.length - 1) {
				//last point
				color = "rgb(255, 0 , 0)";
			}
			if (normFitness==1) {
				color = arrBest[i].color;
			}
			fill(color);
			//console.log(x, y);
			rect(x, y, 4, 4);
		}
	//testing a single legend
	} else if (showingLegend) {
		text("Score: " + (world.legend.len-4), 10, 100); 
	
	// testing the supersnake fusion
	} else if (fusionGo) {
		var color = world.fusedSnake.color;
		fill(color);
		stroke(255);
		text("Score: " + (world.fusedSnake.len-4), 10, 100); 
		text("Brain: " + world.fusedSnake.speciesName, 10, 130); 
	
	//training/evolving population normally
	} else {
		var y_offset = 0;
		fill(255);
		stroke(255);
		text("Generation: " + (world.gen), 10, 20 + y_offset); y_offset += 30;
		if (world.gen > 0) {
			
			var species = world.species[world.worldBestSpecies];
			//fill(255, 255 - species.speciesColorFactor, 0);
			//stroke(255, 255 - species.speciesColorFactor, 0);
			fill(species.color);
			stroke(species.color);	
			text("Best Species: " + (world.worldBestSpecies + 1) + " (" + species.speciesName + ")", 10, 20 + y_offset); y_offset += 30;
			//text("Speed: " + speed, 10, 150);
			text("Fitness: " + (world.worldBestFitness).toFixed(4), 10, 20 + y_offset); y_offset += 30;
			
			var species = world.species[world.worldLongestSpecies]; 
			//fill(255, 255 - species.speciesColorFactor, 0);
			//stroke(255, 255 - species.speciesColorFactor, 0);
			fill(species.color);
			stroke(species.color);
				
			text("Longest Species: " + (world.worldLongestSpecies + 1) + " (" + species.speciesName + ")", 10, 20 + y_offset); y_offset += 30;
			text("Score: " + (world.worldLongest), 10, 20 + y_offset); y_offset += 30;
		
		
			//text("mutation Rate: " + globalMutationRate, 10, 350);
			
			textSize(20);
			for (var i = 0; i < world.species.length; i++) {
				var species = world.species[i];
				var suffix = "       ";
				
				if (species.globalBestFitness == world.worldBestFitness) {
					suffix = ">>> ";
				}
				//fill(255, 255 - species.speciesColorFactor, 0);
				//stroke(255, 255 - species.speciesColorFactor, 0);
				fill(species.color);
				stroke(species.color);
				text(suffix + (Number(species.speciesNo) + 1) + "] " + species.speciesName + ": Overall: " + species.globalBest + " Best: " + (species.globalBestFitness).toFixed(4), 900, 40 + (i * 35));
			}
		}
		var upper_limit = 0;
		//graph the overall performance
		for (var i = 0; i < arrBest.length; i++) {
			var x = arrBest[i].iteration;
			if (upper_limit <  Number(arrBest[i].fitness))  {
				upper_limit =  Number(arrBest[i].fitness);
			}
		}
		noStroke();
		for (var i = 0; i < arrBest.length; i++) {
			var x = arrBest[i].iteration;
			var normFitness =  Number(arrBest[i].fitness) / upper_limit;
			//console.log(normFitness);
			//var y = sh + 690 - normFitness;
			var y = 690 - (normFitness * 100);
			var color = "rgb(255, 255 , 255)";
			if (i == arrBest.length - 1) {
				//last point
				color = "rgb(255, 0 , 0)";
			}
			if (normFitness==1) {
				color = arrBest[i].color;
			}
			fill(color);
			//console.log(x, y);
			rect(x, y, 4, 4);
		}
		if (world.gen > 0) {
			for (var i = 0; i < world.species.length; i++) {
				var upper_limit = 0;
				//graph the overall performance
				for (var k = 0; k < arrBestOfSpecies[i].length; k++) {
					var bestSpecies = arrBestOfSpecies[i][k];
					var x = bestSpecies.iteration;
					if (upper_limit <  Number(bestSpecies.fitness))  {
						upper_limit =  Number(bestSpecies.fitness);
					}
				}
				
				noStroke();
				for (var k = 0; k < arrBestOfSpecies[i].length; k++) {
					var bestSpecies = arrBestOfSpecies[i][k];
					var x = bestSpecies.iteration;
					var normFitness =  Number(bestSpecies.fitness) / upper_limit;
					//console.log(normFitness);
					//var y = sh + 690 - normFitness;
					var y = 890 - (normFitness * 100);
					var color = bestSpecies.color;
					
					fill(color);
					//console.log(x, y);
					rect(x, y, 4, 4);
				}
			}
		}
	}
}
function getFileFromServer(url, doneCallback) {
    var xhr;

    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handleStateChange;
    xhr.open("GET", url, true);
    xhr.send();

    function handleStateChange() {
        if (xhr.readyState === 4) {
            doneCallback(xhr.status == 200 ? xhr.responseText : null);
        }
    }
}
