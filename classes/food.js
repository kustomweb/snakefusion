class Food {
	constructor() {
		this.pos = new p5.Vector();
		// set position to a random spot 
		this.pos.x = 400+floor(random(0, 40)) * 10;
		this.pos.y = floor(random(0, 40)) * 10;
	}
	//show the food as a red square
	show (color) {
		fill(color);
		rect(this.pos.x, this.pos.y, 10, 10);
	}

	//return a clone of this food 
	clone () {
		var clone = new Food();
		clone.pos = new p5.Vector(this.pos.x, this.pos.y);
		
		return clone;
	}
}
