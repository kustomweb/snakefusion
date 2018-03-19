class Population  {
	constructor(size, speciesNo) {
		this.snakes = [];//all the snakes in the population
		this.gen = 1;//which generation we are up to 
		this.globalBest = 4;// the best score ever achieved by this population
		this.globalBestFitness = 0; // the best fitness ever achieved by this population
		this.currentBest = 4;//the current best score
		this.currentBestSnake = floor(random(size)); //the position of the current best snake (highest score) in the array
		
		this.globalBestSnake; //a clone of the best snake this population has ever seen
		this.populationID = floor(random(10000)); // a random number to identify the population, used for saving snakes
		this.speciesNo = speciesNo;
		
		switch(speciesNo) {
			case 0:
				this.speciesName = "Viper";
				this.color = "skyblue";
				break;
			case 1:
				this.speciesName = "Boa";
				this.color = "yellow";
				break;
			case 2:
				this.speciesName = "Cobra";
				this.color = "pink";
				break;
			case 3:
				this.speciesName = "Mamba";
				this.color = "lime";
				break;
			case 4:
				this.speciesName = "Python";
				this.color = "orange";
				break;
		}
		
		//initiate all the snakes
		for (var i = 0; i < size; i++) {
			this.snakes[i] = new Snake();
			this.snakes[i].initialize(this.speciesNo, this.populationID, this.color);
		}
		
		if (size > 0) {
			this.globalBestSnake = this.snakes[0].clone();
		}
	}
	//used to help improve legends 
	createSnake (size, best) {
		
		this.snakes = [];
		
		//set all the snakes as mutated clones of the legend snake
		for (var i =0; i<size; i++) {
			this.snakes[i] = best.clone();
			this.snakes[i].mutate(globalMutationRate);
			this.snakes[i].speciesNo = this.speciesNo;
			this.snakes[i].populationID = this.populationID;
		}
		this.globalBestSnake = best.clone();
	}
	
	
	 //used to help improve legends 
	initializePopulation (popSize, best) {
		this.snakes = [];
		
		//set all the snakes as	the legend snake
		for (var i =0; i<popSize; i++) {
			this.snakes[i] = best.clone();
			this.snakes[i].test = true;
			this.snakes[i].initialize(this.speciesNo, this.populationID, this.color);
		}
		
		this.globalBestSnake = best.clone();
	}
	 
	
//---------------------------------------------------------------------------------------------------------------------------------------------------------	
	//updates all the snakes in the population which are currently alive
	updateAlive () {
		for (var i = 0; i< this.snakes.length; i++) {
			if (this.snakes[i].alive) {
				this.snakes[i].look(); //get inputs for brain
				this.snakes[i].setVelocity();	//get outputs from the neural net
				this.snakes[i].move(); //move the snake in the direction indicated by the neural net
				if (this.snakes[i].alive && (showAll || (i == this.currentBestSnake))) {
					//if still alive show the snake
					this.snakes[i].show();
				}
			}
		}
		this.setCurrentBest(); //after updating every snake renew the best snake
	}
//---------------------------------------------------------------------------------------------------------------------------------------------------------	
	//test if all the snakes in this population are dead
	done () {
		for (var i = 0; i< this.snakes.length; i++) {
			if (this.snakes[i].alive) {
			return false;
			}
		}
	
		return true;
	}
//---------------------------------------------------------------------------------------------------------------------------------------------------------	
	//calculates fitness of every snake
	calcFitness () {
		for (var i = 0; i< this.snakes.length; i++) {
			this.snakes[i].calcFitness();
		}
	}
	
 //---------------------------------------------------------------------------------------------------------------------------------------------------------	 
	//creates the next generation of snakes by natural selection
	naturalSelection () {

		var newSnakes = []; //next generation of snakes
		
		//set the first snake as the best snake without crossover or mutation
		this.setBestSnake();
		newSnakes.push(this.globalBestSnake.clone());
		for (var i = 1; i<this.snakes.length; i++) {
			
			//select 2 parents based on fitness
			var parent1 = this.selectSnake();
			var parent2 = this.selectSnake();
			
			//crossover the 2 snakes to create the child
			var child = parent1.crossover(parent2);
			//mutate the child (weird thing to type)
			child.mutate(globalMutationRate);
			//add the child to the next generation
			newSnakes.push(child);
			
			//newSnakes[i] = selectSnake().clone().mutate(globalMutationRate); //uncomment this line to do natural selection without crossover
		}
		
		for (var i = 1; i<this.snakes.length; i++) {
			this.snakes[i] = newSnakes[i].clone();// set the current generation to the next generation
		}
		
		this.gen+=1;
		this.currentBest = 4;
	}
//---------------------------------------------------------------------------------------------------------------------------------------------------------	
	//chooses snake from the population to return randomly(considering fitness)
	selectSnake () {
		//this function works by randomly choosing a value between 0 and the sum of all the fitnesses
		//then go through all the snakes and add their fitness to a running sum and if that sum is greater than the random value generated that snake is chosen
		//since snakes with a higher fitness function add more to the running sum then they have a higher chance of being chosen
		
		
		//calculate the sum of all the fitnesses
		var fitnessSum = 0;
		for (var i =0; i<this.snakes.length; i++) {
			fitnessSum += this.snakes[i].fitness;
		}
	
		
		//set random value
		var rand = floor(random(fitnessSum));
		
		//initialise the running sum
		var runningSum = 0;
	
		for (var i = 0; i< this.snakes.length; i++) {
			runningSum += this.snakes[i].fitness; 
			if (runningSum > rand) {
				return this.snakes[i];
			}
		}
		//unreachable code to make the parser happy
		return this.snakes[0];
	}
//---------------------------------------------------------------------------------------------------------------------------------------------------------	
	//sets the best snakes globally and for this gen
	setBestSnake () {
		//calculate max fitness
		var maxVal=0;
		var maxIndex = 0;
		for (var i =0; i<this.snakes.length; i++) {
			if (this.snakes[i].fitness > maxVal) {
				maxVal= this.snakes[i].fitness;
				maxIndex = i;
			}
		}
		//if best this gen is better than the global best then set the global best as the best this gen
		if(maxVal > this.globalBestFitness){
			this.globalBestFitness = maxVal;
			this.globalBestSnake = this.snakes[maxIndex].clone();
		}
	
	
	}
	
 //---------------------------------------------------------------------------------------------------------------------------------------------------------	 
	//mutates all the snakes
	mutate () {
		for (var i =1; i<this.snakes.length; i++) {
			this.snakes[i].mutate(globalMutationRate);
		}
	}
//---------------------------------------------------------------------------------------------------------------------------------------------------------	
	//sets the current best snake, used when just showing one snake at a time
	setCurrentBest () {
		if (!this.done()) {//if any snakes alive
			var maxVal=0;
			var maxIndex = 0;
			for (var i =0; i<this.snakes.length; i++) {
				if (this.snakes[i].alive && this.snakes[i].len > maxVal) {
					maxVal= this.snakes[i].len;
					maxIndex = i;
				}
			}
	
			if (maxVal> this.currentBest) {
				this.currentBest = floor(maxVal);
			}
	
			//if the best length is more than 1 greater than the 5 stored in this.currentBest snake then set it;
			//the + 5 is to stop the current best snake from jumping from snake to snake
			if (!this.snakes[this.currentBestSnake].alive || maxVal> this.snakes[this.currentBestSnake].len +5	 ) {
	
				this.currentBestSnake	= maxIndex;
			}
	
			
			if (this.currentBest > this.globalBest) {
				this.globalBest = this.currentBest;
			}
		}
	}
}
