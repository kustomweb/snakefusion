class World {
	constructor(speciesNo, popSize) {
		this.gen = 0;//the current generation the world is up to
	
		//all the populations/species in the world 
		this.species;
		
		this.topBrains;//array containing the brains of the snakes of legend
		this.fusedSnake;//the superFusion snake
		//Snake worldBestSnake; //the best snake out of all the populations
		this.worldLongest = 0;// the best score of the best snake out of all the populations, like a world record
		this.worldLongestSpecies = -1;
		
		this.worldBestFitness = 0;
		this.worldBestSpecies = -1;
		this.worldBestColorFactor = 0;
		
		this.SnakesOfLegend; // the snakes which are loaded from file and are the best ever
		this.legend; // a temp position to store one of these legends
		this.legendNo = -1; // the position the currently tested legend has in the snakes of legend array
		
		var d = new Date();
		var month = d.getMonth() + 1;
		if (month < 10) {
			month = "0" + month;
		}
		var day = d.getDate();
		if (day < 10) {
			day = "0" + day;
		}
		var minutes = d.getMinutes();;
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
		var id = d.getFullYear() + "" + month + "" + day + "" + minutes;
		this.worldID = id; // a random number to identify the population, used for saving snakes
		
		//initiate species
		this.species = [];
		for (var i = 0; i< speciesNo; i++) {
		  this.species[i] = new Population(popSize, i);
		  arrBestOfSpecies[i] = [];
		}
		
		//initiates snakes of legends
		this.SnakesOfLegend = [];
		for (var i = 0; i< 5; i++) {
		  this.SnakesOfLegend[i] = new Snake();
		}
		
		//initiate topbrains
		this.topBrains = [];
	}
  
	//updates all the species in the world
	updateAlive () {
		for (var i = 0; i< this.species.length; i++) {
		  this.species[i].updateAlive();
		}
	}
	
	//runs the genetic algorithm on all the species
	geneticAlgorithm () {
		for (var i = 0; i< this.species.length; i++) {
		  this.species[i].calcFitness();
		  this.species[i].naturalSelection();
		  //species[i].mutate();
		}
		this.gen+=1;
		this.setTopScore();
		//if any of the top snakes from the species is better than the any of the saved snakes then save them
		for (var i = 0; i< this.species.length; i++) {
		  this.saveTopSnakeJSON(i);
		}
		
		this.saveBestSnakes();
	}
  
	//load the snakes of legend from json file via ajax
	loadBestSnakes (blnLegend, snakeNo) {
		if (typeof blnLegend == "undefined") {
			blnLegend = false;
		}
		var self = this;
		  
		var url = "get_best_snakes.php";
		
		var r = new XMLHttpRequest();
		r.open("POST", url, true);
		r.onreadystatechange = function () {
		  if (r.readyState != 4 || r.status != 200) {
			return;
		  } else {
			var data = r.responseText;
			var jdata = JSON.parse(data);
			if (jdata.success) {
				var mdata = JSON.parse(jdata.data)
				//do something
				for (var i = 0; i< 5; i++) {
					var snake_data = JSON.parse(mdata[i]);
					self.SnakesOfLegend[i] = self.SnakesOfLegend[i].loadSnakeData(snake_data);
					self.SnakesOfLegend[i].bestEver = snake_data.score;
				}
				
				worldOfLegends = self;
				worldOfLegends.intializeLegends(500, self.SnakesOfLegend);
				
				if (blnLegend) {
					self.legend = self.SnakesOfLegend[snakeNo].clone();
					self.legendNo = snakeNo;
					self.legend.test = true;
				}
				
				if (fusionGo) {
					self.snakeFusionComplete();
				}
				blnLoadingData = false;
			} else {
				console.log("ERROR loading data");
				blnLoadingData = false;
			}
		  }
		};
		r.send();
	}	
  
	//creates the super snake from all the snakes of legend
	snakeFusion () {  
		blnLoadingData = true;
		this.loadBestSnakes();
	}
	
	snakeFusionComplete () {
		//populates the top Brains array with the brains of the best snakes
		for (var i = 0; i< this.SnakesOfLegend.length; i++) {
			this.topBrains[i] = this.SnakesOfLegend[i].brain.clone();
		}
		
		this.fusedSnake = new SuperSnake(this.topBrains);
	}
  
  	//update the state of the supersnake
	updateSuperSnake () {
	
		this.fusedSnake.look();
		this.fusedSnake.setVelocity(); 
		this.fusedSnake.move();
		this.fusedSnake.show();
		//saveFrames("output/superSnake/frame_#######.png", "png", 1, speed);
		//" + frameCount + "
	}  
  
	//update the legend snake test
	updateLegend () {	
		this.legend.look();
		this.legend.setVelocity();
		this.legend.move();
		this.legend.show();
	}
	
	//test if all the snakes from all the species are dead
	done () {
		for (var i = 0; i< this.species.length; i++) {
		  if (!this.species[i].done()) {
			return false;
		  }
		}
		return true;
	}

  
	//set the top score from the global best scores of each species
	setTopScore () {
		var maxVal = 0;
		var maxIndex = 0;
		for (var i = 0; i < this.species.length; i++) {
		  if (this.species[i].globalBestFitness > maxVal ) {
			maxVal = this.species[i].globalBestFitness;
			maxIndex = i;
			arrBestOfSpecies[i].push({iteration: world.gen, fitness: maxVal, color: this.species[i].color});
		  }
		}
		//best overall
		this.worldBestFitness = this.species[maxIndex].globalBestFitness;
		this.worldBestSpecies = maxIndex;
		this.worldBestColorFactor = this.species[maxIndex].speciesColorFactor;
		
		arrBest.push({iteration: world.gen, fitness:this.worldBestFitness, color:this.species[maxIndex].color});
		
		var maxVal = 0;
		var maxIndex = 0;
		for (var i = 0; i < this.species.length; i++) {
		  if (this.species[i].globalBest > maxVal ) {
			maxVal = this.species[i].globalBest;
			maxIndex = i;
		  }
		}
		this.worldLongest = this.species[maxIndex].globalBest;	// + " (" + this.species[maxIndex].speciesName + ")";
		this.worldLongestSpecies = maxIndex;
	}
  
	saveBestSnakes () {
		//only the best go in this file
		var url = "save_best.php";
		var formData = new FormData();
		formData.append("worldID", this.worldID);
		
		var r = new XMLHttpRequest();
		r.open("POST", url, true);
		r.onreadystatechange = function() {
		  if (r.readyState != 4 || r.status != 200) {
			return;
		  } else {
			var data = r.responseText;
			var jdata = JSON.parse(data);
			if (jdata.success) {
				//do something
				if (jdata.updated=="updated") {
					console.log("new champ for " + jdata.worldID);
				}
			}
		  }
		};
		r.send(formData);
	}
	//saves the top snake of the parameter no. species if it has a better score than any of the legends
	saveTopSnakeJSON (speciesNo) {
		//save the species as a json
		this.species[speciesNo].globalBestSnake.clone().saveSnakeJSON(speciesNo, this.species[speciesNo].currentBestSnake, this.species[speciesNo].globalBest, this.species[speciesNo].populationID, this.worldID, this.gen);
	
	}
	//saves the top snake of the parameter no. species if it has a better score than any of the legends
	saveTopSnake (speciesNo) {
		//load the data about which legend spaces have already been assigned a snake 
		var t = loadTable("data/snakesStored.csv", "csv", "header");
		
		var snakeNo = -1;
		var tr = new p5.TableRow(0);
		for (var i = 0; i< t.getColumnCount(); i++) {
		  if (tr.getInt(i) == 0) {
			snakeNo = i;
			break;
		  }
		}
		//if there are any free spaces store the top snake of this species
		if (snakeNo!= -1) {
			this.species[speciesNo].globalBestSnake.clone().saveSnake(snakeNo, this.species[speciesNo].globalBest, this.species[speciesNo].populationID);
			tr = new p5.TableRow(0);
			tr.setInt(snakeNo, 1);
			this.saveTable(t, "data/snakesStored.csv");
		} else {
		  //if snake positions are full
		  //check for snakes from this population to stop snakes from the same generation populating the entire legend list
		  var t1;
		  var tr1;
		  for (var i = 0; i< t.getColumnCount(); i++) {
			t1 = loadTable("data/SnakeStats" + i+ ".csv", "header");
			tr1 = t1.getRow(0);
			if (tr1.getInt(1) == this.species[speciesNo].populationID) {
			  if (this.species[speciesNo].globalBest > tr1.getInt(0)) { //if the currently loaded snake is from this population and worse than the best snake
				this.species[speciesNo].globalBestSnake.clone().saveSnake(i, this.species[speciesNo].globalBest, this.species[speciesNo].populationID);//save the snake
			  }
			  return;//exit the function
			}
		  }
		
		  //if no snakes from this species are stored then overload the legend with the lowest score if its lower than the score of the top snake of this species
		
		  var minVal = this.species[speciesNo].globalBest;
		  var minIndex = -1;
		
		  for (var i = 0; i< t.getColumnCount(); i++) {
			t1 = loadTable("data/SnakeStats" + i+ ".csv", "header");
			tr1 = t1.getRow(0);
			if (tr1.getInt(0) < minVal) {
			  minVal = tr1.getInt(0);
			  minIndex = i;//
			}
		  }
		
		  //if the snake to be saved isnt better than any of them dont save it
		  if (minIndex!= -1) {
			this.species[speciesNo].globalBestSnake.clone().saveSnake(minIndex, this.species[speciesNo].globalBest, this.species[speciesNo].populationID);//save snake
		  }
		}
	}
  
	//get a legend ready for testing
	playLegend (snakeNo) {
		blnLoadingData = true;
		this.loadBestSnakes(true, snakeNo);
	}

  

	//for training the legends to reach higher levels of awesome
	intializeLegends ( popSize, legendsArray) {
	
		//initiate species
		this.species = [];
		
		//set each population to be a mutated version of the legend in the array
		for (var i = 0; i< legendsArray.length; i++) {
			this.species[i] = new Population(0, i);
			this.species[i].initializePopulation(popSize, legendsArray[i]);
			//set the population ID's for each population to stop overwriting the snakes data?
			this.species[i].populationID = legendsArray[i].populationID;
			
			arrBestOfSpecies[i] = [];
		}
	}

}
