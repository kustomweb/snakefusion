class Snake {
	constructor () {
		this.len = 1;//the length of the snake
		this.pos;//position of the head of the snake
		this.prev_x = -1;
		this.prev_y = -1;
		this.tailPositions; //all the positions of the tail of the snake
		this.vel;//the velocity of the snake i.e. direction it will move next
		this.temp; //just a temporary p5.Vector which gets used a bunch
		this.food;//the food that this snake needs to eat
		this.brain; // the neural net controlling the snake
		this.vision = []; //the inputs for the neural net
		this.decision; // the output of the neural net
		this.populationID = -1;
		this.speciesNo = -1;
		this.speciesColorFactor = 0;
		this.color = "";
		
		this.lifetime = 0;//how long the snake lived for
		this.fitness = 0;//the quality of this snake
		this.leftToLive = 200; //the number of moves left to live if this gets down to 0 the snake dies
		//this is to prevent the snakes doing circles forever
		
		//if this is a legend
		this.bestEver = -1;
	
		
		this.growCount = 0;//the amount the snake still needs to grow
	
		this.alive = true;	//true if the snake is alive
		this.test = false;//true if the snake is being tested not trained
	
		//set initial position of head and add 3 tail positions since the starting length is 4
		var x = 600;
		var y = 200;
		this.prev_x = x;
		this.prev_y = y;
		this.pos = new p5.Vector(x, y);
		this.vel = new p5.Vector(0, 0);
		this.tailPositions = [];
		
		var temp = new p5.Vector(x-30, y);
		this.tailPositions.push(temp);
		temp = new p5.Vector(x-20, y);
		this.tailPositions.push(temp);
		temp = new p5.Vector(x-10, y);
		this.tailPositions.push(temp);
		this.len+=3;
		
		//intiate the food
		this.food = new Food();
	
		this.brain = new NeuralNet(24, 18, 4);//create a neural net with 24 input neurons 18 hidden neurons and 4 output neurons
		this.leftToLive = 200;
	}
	
	//initialize
	initialize (speciesNo, populationID, color) {
		this.speciesNo = speciesNo;
		this.speciesColorFactor = 51 * speciesNo;
		this.color = color;
		this.populationID = populationID;
	}
	
	//mutates neural net
	mutate (mr) {
		this.brain.mutate(mr);
	}
	

	//set the velocity from the output of the neural network
	setVelocity () {
		var prev_vx = this.vel.x;
		var prev_vy = this.vel.y;
		
		//get the output of the neural network
		var decision = this.brain.output(this.vision);

		//get the maximum position in the output array and use this as the decision on which direction to go
		var maxVal = 0;
		var maxIndex	=0;
		for (var i = 0; i < decision.length; i++) {
			if (maxVal < decision[i]) {
				maxVal = decision[i];
				maxIndex = i;
			}
		}
		//set the velocity based on this decision
		if (maxIndex == 0) {
			//if (this.vel.x!=10 && this.vel.y !=0) { //this is to stop the snake from going back into its own body but i removed it to teach the snakes to avoid their bodies
			this.vel.x =-10;
			this.vel.y =0;
			//}
		} else if (maxIndex == 1) {
			//if (this.vel.x!=0 && this.vel.y !=10) {
			this.vel.x =0;
			this.vel.y =-10;
			//}
		} else if (maxIndex == 2) {
			//if (this.vel.x!=-10 && this.vel.y !=0) {
			this.vel.x =10;
			this.vel.y =0;
			//}
		} else {
			//if (this.vel.x!=0 && this.vel.y !=-10) {
			this.vel.x =0;
			this.vel.y =10;
			//}
		}
		
		//are we going backwards?
		if (this.pos.x + this.vel.x == this.tailPositions[this.tailPositions.length - 1].x && this.pos.y + this.vel.y == this.tailPositions[this.tailPositions.length - 1].y) {
			if (prev_vx==0 && prev_vy==0) {
				//standing still
				var rand = random(1);
				var fact = 1;
				if (rand < .5) {
					fact = -1;
				}
				prev_vx = 10 * fact;
				
				rand = random(1);
				fact = 1;
				if (rand < .5) {
					fact = -1;
				}
				prev_vy = 10 * fact;
			}
			this.vel.x = prev_vx;
			this.vel.y = prev_vy;
		}
	}
	

	//move the snake in direction of the vel p5.Vector
	move () {
		//move through time
		this.lifetime+=1;
		this.leftToLive -=1;

		//if time left to live is up then kill the snake
		if (this.leftToLive < 0) {
			this.alive = false;
		}

		//if the snake hit itself or the edge then kill it
		if (this.gonnaDie(this.pos.x + this.vel.x, this.pos.y + this.vel.y)) {
			this.alive= false;
		}

		//if the snake is on	the same position as the food then eat it
		if (this.pos.x + this.vel.x == this.food.pos.x && this.pos.y + this.vel.y == this.food.pos.y) {
			this.eat();
		}

		//snake grows 1 square at a time so if the snake has recently eaten then grow count will be greater than 0
		if (this.growCount > 0) {
			this.growCount --;
			this.grow();
		} else {//not growing then move all the tail positions to follow the head
			for (var i = 0; i< this.tailPositions.length -1; i++) {
				var temp = new p5.Vector(this.tailPositions[i+1].x, this.tailPositions[i+1].y);
				this.tailPositions[i] = temp;
			}
			var temp = new p5.Vector(this.pos.x, this.pos.y);
			this.tailPositions[this.len-2] =  temp;
		}

		this.prev_x = this.pos.x;
		this.prev_y = this.pos.y;
		
		//actually move the snakes head
		this.pos.add(this.vel);
	}

	

	//the snake just ate some food 
	eat () {

		//reset food to a new position	
		this.food = new Food(); 
		while (this.tailPositions.indexOf(this.food.pos) > -1) { //make sure the food isnt on the snake
			this.food = new Food();
		}
	 
		//increase time left to live
		this.leftToLive += 100;

		//if testing then grow by 4 but if not and the snake is still small only grow by 1
		//this is for helping snakes evolving so they dont get too big too soon
		if (this.test||this.len>=10) {
			this.growCount += 4;
		} else {
			this.growCount += 1;
		}
	}
	

	//display the snake
	show () {
		//fill(255, 255 - this.speciesColorFactor, 0);
		fill(this.color);
		stroke(0);
		//show the tail
		for (var i = 0; i< this.tailPositions.length; i++) {
			rect(this.tailPositions[i].x, this.tailPositions[i].y, 10, 10);
		}
		//show the head
		rect(this.pos.x, this.pos.y, 10, 10);

		//show the food
		this.food.show(this.color);
	}
	

	//grows the snake by 1 square
	grow () {
		//add the head to the tail list this simulates the snake growing as the head is the only thing which moves
		var temp = new p5.Vector(this.pos.x, this.pos.y);
		this.tailPositions.push(temp);
		this.len +=1;
	}


	//returns true if the snake is going to hit itself or a wall
	gonnaDie (x, y) {
		//check if hit wall
		if (x < 400 || y < 0 || x >= 800 || y >= 400) {
			return true;
		}
		if (this.isOnTail(x, y)) {
			//check if hit tail
			return true;
		}
		
		return false;
	}
		
	//returns true if the coordinates is on the snakes tail
	isOnTail (x, y) {
		for (var i = 0; i < this.tailPositions.length; i++) {
			if (x == this.tailPositions[i].x &&	y == this.tailPositions[i].y) {
				return true;
			}
		}

		return false;
	}
	

	//calculate the fitness of the snake after it has died
	calcFitness () {
		//fitness is based on length and this.lifetime
		if (this.len < 10) {
			this.fitness = floor(this.lifetime *this.lifetime * pow(2, (floor(this.len))));
		} else {
			//grows slower after 10 to stop this.fitness from getting stupidly big
			//ensure greater than len = 9
			this.fitness =	this.lifetime * this.lifetime;
			this.fitness *= pow(2, 10);
			this.fitness *=(this.len-9);
		}
		this.fitness /= 100000;
	}
	
	//sigmoid activation function
	sigmoid (x) {
		var y = 1 / (1 + pow(Math.E, -x));
		return y;
	}
	

	//crossover function for genetic algorithm
	crossover (partner) {
		var child = new Snake();
		child.initialize(this.speciesNo, this.populationID, this.color);
		child.brain = this.brain.crossover(partner.brain);
		return child;
	}
	

	//returns a clone of the snake
	clone () {
		var clone = new Snake();
		clone.initialize(this.speciesNo, this.populationID, this.color);
		clone.brain = this.brain.clone();
		clone.alive = true;
		return clone;
	}
	

	//saves the snake to a file by converting it to a table
	//I do not use this function, use JSON now
	saveSnake (snakeNo, score, popID) {
		//save the snakes top score and its population id 

		var snakeStats = new Table();
		snakeStats.addColumn("Top Score");
		snakeStats.addColumn("PopulationID");
		var tr = snakeStats.addRow();
		tr.setFloat(0, score);
		tr.setInt(1, popID);

		saveTable(snakeStats, "data/SnakeStats" + snakeNo+ ".csv");

		//save snakes brain
		saveTable(this.brain.NetToTable(), "data/Snake" + snakeNo+ ".csv");
	}
	
	saveSnakeJSON (speciesNo, snakeNo, score, popID, worldID, gen) {
		//save the snakes top score and its population id 

		var url = "save_snake.php";
		var formData = new FormData();
		formData.append("speciesNo", speciesNo);
		formData.append("snakeNo", snakeNo);
		formData.append("score", score);
		formData.append("popID", popID);
		formData.append("worldID", worldID);
		formData.append("gen", gen);
		formData.append("brain", JSON.stringify(this.brain));
		
		var r = new XMLHttpRequest();
		r.open("POST", url, true);
		r.onreadystatechange = function () {
		  if (r.readyState != 4 || r.status != 200) {
			return;
		  } else {
			var data = r.responseText;
			var jdata = JSON.parse(data);
			if (jdata.success) {
				//do something
			}
		  }
		};
		r.send(formData);
	}
	

	//return the snake saved in the parameter position
	//I do not use this function, use JSON now
	loadSnake (snakeNo) {
		var load_action = new Snake();
		var t = loadTable("data/Snake" + snakeNo + ".csv");
		load_action.brain.TableToNet(t);
		return load_action;
	}
	
	loadSnakeData (data) {
		var load_action = new Snake();
		var speciesNo = data.speciesNo;
		var populationID = data.popID;		
		switch(Number(speciesNo)) {
			case 0:
				var color = "skyblue";
				break;
			case 1:
				var color = "yellow";
				break;
			case 2:
				var color = "pink";
				break;
			case 3:
				var color = "lime";
				break;
			case 4:
				var color = "orange";
				break;
		}
		load_action.initialize(speciesNo, populationID, color);
		//var t = loadTable("data/Snake" + snakeNo + ".csv");
		load_action.brain.Object2Net(JSON.parse(data.brain));
		return load_action;
	}
	loadSnakeJSON (snakeNo, worldID) {
		var load_action = new Snake();
		var url = "get_snake.php";
		var formData = new FormData();
		formData.append("snakeNo", snakeNo);
		formData.append("worldID", worldID);
		
		var r = new XMLHttpRequest();
		r.open("POST", url, true);
		r.onreadystatechange = function () {
		  if (r.readyState != 4 || r.status != 200) {
			return;
		  } else {
			var data = r.responseText;
			var jdata = JSON.parse(data);
			if (jdata.success) {
				//do something
				
			}
		  }
		};
		r.send(formData);
	}

	

	//looks in 8 directions to find food,walls and its tail
	look () {
		var vision = [];
		//look left
		var tempValues = this.lookInDirection(new p5.Vector(-10, 0));
		vision[0] = tempValues[0];
		vision[1] = tempValues[1];
		vision[2] = tempValues[2];
		//look left/up	
		tempValues = this.lookInDirection(new p5.Vector(-10, -10));
		vision[3] = tempValues[0];
		vision[4] = tempValues[1];
		vision[5] = tempValues[2];
		//look up
		tempValues = this.lookInDirection(new p5.Vector(0, -10));
		vision[6] = tempValues[0];
		vision[7] = tempValues[1];
		vision[8] = tempValues[2];
		//look up/right
		tempValues = this.lookInDirection(new p5.Vector(10, -10));
		vision[9] = tempValues[0];
		vision[10] = tempValues[1];
		vision[11] = tempValues[2];
		//look right
		tempValues = this.lookInDirection(new p5.Vector(10, 0));
		vision[12] = tempValues[0];
		vision[13] = tempValues[1];
		vision[14] = tempValues[2];
		//look right/down
		tempValues = this.lookInDirection(new p5.Vector(10, 10));
		vision[15] = tempValues[0];
		vision[16] = tempValues[1];
		vision[17] = tempValues[2];
		//look down
		tempValues = this.lookInDirection(new p5.Vector(0, 10));
		vision[18] = tempValues[0];
		vision[19] = tempValues[1];
		vision[20] = tempValues[2];
		//look down/left
		tempValues = this.lookInDirection(new p5.Vector(-10, 10));
		vision[21] = tempValues[0];
		vision[22] = tempValues[1];
		vision[23] = tempValues[2];
		
		this.vision = vision;
	}


	lookInDirection (direction) {
		//set up a temp array to hold the values that are going to be passed to the main vision array
		var visionInDirection = [0, 0, 0];
		var position = new p5.Vector(this.pos.x, this.pos.y);//the position where we are currently looking for food or tail or wall
		var foodIsFound = false;//true if the food has been located in the direction looked
		var tailIsFound = false;//true if the tail has been located in the direction looked 
		var distance = 0;
		//move once in the desired direction before starting 
		position.add(direction);
		distance +=1;

		//look in the direction until you reach a wall
		while (!(position.x < 400 || position.y < 0 || position.x >= 800 || position.y >= 400)) {

			//check for food at the position
			if (!foodIsFound && position.x == this.food.pos.x && position.y == this.food.pos.y) {
				visionInDirection[0] = 1;
				foodIsFound = true; // dont check if food is already found
			}

			//check for tail at the position
			var blnOnTail = this.isOnTail(position.x, position.y);
			if (!tailIsFound && blnOnTail) {
				visionInDirection[1] = 1/distance;
				tailIsFound = true; // dont check if tail is already found
			}

			//look further in the direction
			position.add(direction);
			distance +=1;
		}

		//set the distance to the wall
		visionInDirection[2] = 1/distance;

		return visionInDirection;
	}
}
