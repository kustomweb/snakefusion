//a clone or thought which is used to plan ahead

class SuperSnakeClone {
	constructor(original, chosenBrain) {
		this.len = 1;//the length of the snake
		this.pos;//position of the head of the snake
		this.tailPositions; //all the positions of the tail of the snake
		this.vel;//the velocity of the snake i.e. direction it will move next
		this.temp; //just a temporary PVector which gets used a bunch
		this.food;//the food that this snake needs to eat
		this.brain; // the neural net controlling the snake
		this.vision = []; //the inputs for the neural net
		this.decision; // the output of the neural net
		this.blanks = [];//all the blank spaces that are enclosed by the snake used to tell if the snake is trapped 
		
		this.leftToLive = 200; //the number of moves left ot live if this gets down to 0 the snake dies
		//this is to prevent the snakes doing circles forever
		
		
		this.moveCount = 0;  //the amount of moves the clone has done
		this.alive = true;  //true if the snake is alive
		this.foodFound = false; // true if the snake found the food
		this.trapped = false;//true if the snake is trapped
		
		
		this.seenFood = false;//whether the snake saw the food
		this.foodSeenAtCount = 300;
		this.ranOut = false; //true if after 500 moves the clone hasnt died, gotten trapped or eaten the food, so its probably looping
		
		
		this.growCount = 0;
	  
		//copy the position, tailPositions, length, brain, time to live and food from the original
		var x = original.pos.x;
		var y = original.pos.y;
		this.prev_x = x;
		this.prev_y = y;
		this.pos = new p5.Vector(x, y);
		this.vel = new p5.Vector(0, 0);
		
		this.tailPositions = original.tailPositions.slice(0);
		this.len = original.len;
		this.food = original.food.clone();
		this.brain = chosenBrain.clone();
		this.leftToLive = original.leftToLive;
		this.growCount = original.growCount;
	}
  
	//runs the clone until it dies, finds the food is trapped or takes over 500 moves to do any of these things
	runClone () {
		for (var i = 0; i< 500; i++) {
		  //update clone
		  this.look();
		  this.setVelocity();
		  this.move();
		  if (!this.alive || this.foodFound || this.trapped) {//if anything interesting happened then stop the clone        
			return;
		  }
		
		}
		this.ranOut = true; // the snake is probably in a loop
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

    
	//set the velocity from the output of the neural network
	setVelocity () {
		var prev_vx = this.vel.x;
		var prev_vy = this.vel.y;
		
		//get the output of the neural network
		var direction = this.getDirection(this.brain.output(this.vision));
		
		//get the maximum position in the output array and use this as the decision on which direction to go
		
		//set the velocity based on this decision
		switch(direction) {
		case 0:
			this.vel = new p5.Vector(-10, 0);
			break;
		case 1:
			this.vel = new p5.Vector(0, -10);
			break;
		case 2:
			this.vel = new p5.Vector(10, 0);
			break;
		case 3:
			this.vel = new p5.Vector(0, 10);
			break;
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
	

	//move the snake in direction of the vel PVector
	move () {
		var prev_vx = this.vel.x;
		var prev_vy = this.vel.y;
		
		//increment moveCount
		this.moveCount+=1;
		//move through time
		this.leftToLive -=1;
		
		//if time left to live is up then kill the snake
		if (this.leftToLive < 0) {
		  this.alive = false;
		  return;
		}
		
		//if the snake hit itself or the edge then kill it
		if (this.gonnaDie(this.pos.x + this.vel.x, this.pos.y + this.vel.y)) {
		  this.alive= false;
		  return;
		}
		
		//if the snake is trapped then set it as trapped and end the clone
		if (this.isTrapped()) {
		  this.trapped = true;
		  return;
		}
		
		//if the snake is on  the same position as the food then set it as found food and end the clone
		//Note the snake cannot be trapped and find food so no need to test it
		if (this.pos.x + this.vel.x == this.food.pos.x && this.pos.y + this.vel.y == this.food.pos.y) {
		  this.foodFound = true;
		  return;
		}
		
		
		//not growing then move all the tail positions to follow the head
		//nice
		if (this.growCount > 0) {
			this.growCount --;
			this.grow();
		} else {
			for (var i = 0; i< this.tailPositions.length -1; i++) {
				var temp = new p5.Vector(this.tailPositions[i+1].x, this.tailPositions[i+1].y);
				this.tailPositions[i] = temp;
			}
		
			if (this.len>1) {
				var temp = new p5.Vector(this.pos.x, this.pos.y);
				this.tailPositions[this.len-2] = temp;
			}
		}
		//actually move the snakes head
		this.pos.add(this.vel);
		
		//if the clone can see the food and hasnt already seen the food (we want the shortest povar to seeing the food) then set the number of moves it took to see it
		if (!this.seenFood && this.seeFood()) {
			this.seenFood = true;
			this.foodSeenAtCount = this.moveCount;
		}
	}
    
	//grows the snake by 1 square
	grow () {
		//add the head to the tail list this simulates the snake growing as the head is the only thing which moves
		var temp = new p5.Vector(this.pos.x, this.pos.y);
		this.tailPositions.push(temp);
		this.len +=1;
	}


    
	//is the food within sight (only 4 directions) cannot see through tail
	seeFood () {
		//look in 4 directions for the food
		var left = new p5.Vector(this.pos.x-10, this.pos.y);
		var right = new p5.Vector(this.pos.x+10, this.pos.y);
		var up = new p5.Vector(this.pos.x, this.pos.y-10);
		var down = new p5.Vector(this.pos.x, this.pos.y+10);
		
		
		//look left until found the wall the snakes body or the food
		//while the left vector is not on the tail or out 
		while (!this.gonnaDie(left.x, left.y)) {
			//if the left vector is on the food then the snake can see the food and thus return true
			if (left.x == this.food.pos.x && left.y == this.food.pos.y) {
				return true;
			}
			//look further left
			left.x-=10;
		}
		//look right for food
		while (!this.gonnaDie(right.x, right.y)) {
			if (right.x == this.food.pos.x && right.y == this.food.pos.y) {
				return true;
			}
			right.x+=10;
		}
		
		//look up for food
		while (!this.gonnaDie(up.x, up.y)) {
			if (up.x == this.food.pos.x && up.y == this.food.pos.y) {
				return true;
			}
			up.y -=10;
		}
		//look down for food
		while (!this.gonnaDie(down.x, down.y)) {
			if (down.x == this.food.pos.x && down.y == this.food.pos.y) {
				return true;
			}
			down.y+=10;
		}
		
		//if not seen in any of the 4 directions then return false
		return false;
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
    
	//this function return whether or not the snake is trapped, trapped meaning that the snake is trapped within its own tail
	isTrapped () {
		//stores all the points within the tails 'trap' 
		this.blanks = [];
		this.countNextTo(this.pos.x, this.pos.y);//call recursive function to add all the blanks which are reachable from the head of the snake
		
		//if the amount of spaces is less than half the remaining positions(1600 - tailPositions.length) or less than 300 whichever is less
		//then it considered as trapped so return true 
		//otherwise return false
		return (this.blanks.length <= min((1600 - this.tailPositions.length)/2, 300));
	}
  
  
	//adds all the blanks which are reachable from the head of the snake to the blanks ArrayList 
	//see isTrapped function above for more info
	//recursively  calls itself to find all blanks within the snakes tail
	countNextTo (x, y) {
		//no need to add more positions to blank if already considered not trapped
		if (this.blanks.length <= min((1600 - this.tailPositions.length)/2, 300)) {
			var temp = new p5.Vector(x+10, y);//the position to check if its blank
		
			//if not out or on the tail then add it to the blank ArrayList and then look for other blanks around that position by calling this function again 
			if (!this.gonnaDie(temp.x, temp.y) && this.blanks.indexOf(temp) < 0) {
				this.blanks.push(temp);
				this.countNextTo(temp.x, temp.y);
			}
			//look to the left
			var temp = new p5.Vector(x-10, y);
			if (!this.gonnaDie(temp.x, temp.y) && this.blanks.indexOf(temp) < 0) {
				this.blanks.push(temp);
				this.countNextTo(temp.x, temp.y);
			}
			//look down
			var temp = new p5.Vector(x, y+10);
			if (!this.gonnaDie(temp.x, temp.y) && this.blanks.indexOf(temp) < 0) {
				this.blanks.push(temp);
				this.countNextTo(temp.x, temp.y);
			}
			//look up
			var temp = new p5.Vector(x, y-10);
			if (!this.gonnaDie(temp.x, temp.y) && this.blanks.indexOf(temp) < 0) {
				this.blanks.push(temp);
				this.countNextTo(temp.x, temp.y);
			}
		}
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
			if (!this.foodIsFound && position.x == this.food.pos.x && position.y == this.food.pos.y) {
				visionInDirection[0] = 1;
				this.foodIsFound = true; // dont check if food is already found
			}
			
			//check for tail at the position
			if (!this.tailIsFound && this.isOnTail(position.x, position.y)) {
				visionInDirection[1] = 1/distance;
				this.tailIsFound = true; // dont check if tail is already found
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
