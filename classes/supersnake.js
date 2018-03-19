//a supersnake which is fusion of 5 best snakes
class SuperSnake {
	constructor(demBrains) {
		this.len = 1;//the length of the snake
		this.pos;//position of the head of the snake
		this.tailPositions; //all the positions of the tail of the snake
		this.vel;//the velocity of the snake i.e. direction it will move next
		this.temp; //just a temporary PVector which gets used a bunch
		this.food;//the food that this snake needs to eat
		
		this.vision = []; //the inputs for the neural net
		this.decision; // the output of the neural net
		
		this.speciesColorFactor = 0;
		this.color = "";
		
		this.lifetime = 0;//how long the snake lived for
		this.fitness = 0;//the quality of this snake
		this.leftToLive = 500; //the number of moves left to live if this gets down to 0 the snake dies
		//this is to prevent the snakes doing circles forever
		
		
		
		this.growCount = 0; //the amount the snake still needs to grow
		
		this.alive = true;  //true if the snake is alive
		
		
		
		this.brain; // the array of neural nets controlling the snake
		
		this.clones;
		
		this.brainToFollow = 0;  //which brain to follow for the next few moves
		this.foodFound = false;//true if a clone has found the food safely
		this.sawFood = false; //true if a clone has seen the food
		this.movesToFollow = 0;//how many moves to follow that snake
	
		//set intial position of head and add 3 tail positions
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
	
		this.food = new Food();
		
	
		this.brain = demBrains;
	
		this.clones = [];
	
	 
		//initialize
		this.color = "purple"; 
	}

	//calculates the best direction to go based on the foresight from all of its brains 
	bestDecision () {
		//for each brain create a clone and run it until it dies or is trapped or finds food
		for (var i = 0; i < this.brain.length; i++) {
		  this.clones[i] = new SuperSnakeClone(this, this.brain[i]);
		  this.clones[i].runClone();
		  
		}
		
		//if any clones found the food find the one which does it in the least number of moves
		var minVal = 1000;
		var cloneAteFood = -1;
		for (var i = 0; i < this.brain.length; i++) {
		
		  if (this.clones[i].foodFound) {
			if (this.clones[i].moveCount < minVal) {
			  minVal =  this.clones[i].foodSeenAtCount;
			  cloneAteFood = i;
		
			}
		  }
		}
		 //if any of the clones ate the food
		if (cloneAteFood != -1) {
		  //set this clone as the brain to follow
		  this.foodFound = true; 
		  this.movesToFollow = this.clones[cloneAteFood].moveCount;
		  this.brainToFollow = cloneAteFood;
		  return;//we are done
		}
		
		
		//if you get to this povar then none of the snakes found the food so lets test for the next best 
		//has any seen the food
		
		 minVal = 1000;
		var cloneSeenFood = -1;
		for (var i = 0; i < this.brain.length; i++) {
		
		  if (this.clones[i].seenFood) {
			if (this.clones[i].foodSeenAtCount < min) {
			  minVal =  this.clones[i].foodSeenAtCount;
			  cloneSeenFood = i;
			}
		  }
		}
		
		//if any of the clones saw the food
		if (cloneSeenFood != -1) {
		  this.sawFood = true; 
		  this.movesToFollow = this.clones[cloneSeenFood].foodSeenAtCount;
		  this.brainToFollow = cloneSeenFood;
		  return;
		}
		
		
		//if you get to this povar then no snake found the food nor did they see the food, damn
		//follow the snake which made it the furthest without running out of moves (because they would probably be looping)
		
		var maxVal = 0;
		var cloneLastedLongest = 0;
		for (var i = 0; i < this.brain.length; i++) {
		
		  if (!this.clones[i].ranOut) {
			if (this.clones[i].moveCount > maxVal) {
			  maxVal =  this.clones[i].moveCount;
			  cloneLastedLongest = i;
			}
		  }
		}
		
		this.brainToFollow = cloneLastedLongest;
		this.movesToFollow = 1;
		return;
	}

	//from an output array returns an var indicating the direction the snake should go
	getDirection (netOutputs) {
		var maxVal = 0;
		var maxIndex = 0;
		
		for (var i = 0; i < netOutputs.length; i++) {
		  if (maxVal < netOutputs[i]) {
			maxVal = netOutputs[i];
			maxIndex = i;
		  }
		}
		return maxIndex;
	}

	setVelocity () {
		var prev_vx = this.vel.x;
		var prev_vy = this.vel.y;
		
		this.look();
		//if no more moves to follow then create clones to 'imagine' where to go
		if (this.movesToFollow <= 0) {
			this.sawFood = false;
			this.foodFound = false;
			this.bestDecision();
		}
		
		//get the direction from the brain 
		var direction  = this.getDirection(this.brain[this.brainToFollow].output(this.vision));
		
		//set the velocity based on this decision
		switch(direction) {
			case 0://left
				this.vel = new p5.Vector(-10, 0);
				break;
			case 1://up
				this.vel = new p5.Vector(0, -10);
				break;
			case 2://right
				this.vel = new p5.Vector(10, 0);
				break;
			case 3://down
				this.vel = new p5.Vector(0, 10);
				break;
		}
		//are we going backwards?
		if (this.pos.x + this.vel.x == this.tailPositions[this.tailPositions.length - 1].x && this.pos.y + this.vel.y == this.tailPositions[this.tailPositions.length - 1].y) {
			if (prev_vx==0 && prev_vy==0) {
				//standing still
				var rand = random(1);
				fact = 1;
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
 
	//move the snake in direction of the vel PVector
	move () {
		this.lifetime+=1;
		this.leftToLive -=1;
		this.movesToFollow -=1;
		
		//if time left to live is up then kill the snake
		if (this.leftToLive < 0) {
		  this.alive = false;
		}
		
		//if the snake hit itself or the edge then kill it
		if (this.gonnaDie(this.pos.x + this.vel.x, this.pos.y + this.vel.y)) {
		  this.alive= false;
		}
		
		//if the snake is on  the same position as the food then eat it
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
		
		  if (this.len>1) {
			var temp = new p5.Vector(this.pos.x, this.pos.y);
			this.tailPositions[this.len-2] = temp;
		  }
		}
		
		//actually move the head of the snake
		this.pos.add(this.vel);
	}
 
	//the snake just ate some food 
	eat () {
		//reset the food so its not on the tail
		this.food = new Food(); 
		while (this.tailPositions.indexOf(this.food.pos) > -1) {
		  this.food = new Food();
		}
		
		
		//let the snake live longer
		this.leftToLive += 100;
		this.growCount +=4;//the snake grows by 4
		this.movesToFollow =0;//make sure the bestDecision() function is called before the next move
		this.foodFound = false;
	
	}

	//show the super snake
	show () {
		switch(this.brainToFollow) {
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
		var head_color = this.color;
		
		//if a clone has found the food then show the snake as blue
		if(this.foodFound){
			//fill(0,255,0); 
			head_color = "blue";
		} else if (this.sawFood){
			//fill(0,0,255); 
			head_color = "green";
		}
		
		
		for (var i = 0; i < this.tailPositions.length; i++) {
			if (i < this.tailPositions.length - 1) {
				fill(this.color);
			} else {
				fill(head_color);
			}
			stroke(0);
			rect(this.tailPositions[i].x, this.tailPositions[i].y, 10, 10);
		}
		rect(this.pos.x, this.pos.y, 10, 10);
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
		
		//check if hit tail
		return this.isOnTail(x, y);
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
