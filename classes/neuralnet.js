class NeuralNet {
	constructor (inputs, hiddenNo, outputNo) {
		//set dimensions from parameters
		this.iNodes = inputs;
		this.oNodes = outputNo;
		this.hNodes = hiddenNo;
		
		//create first layer weights 
		//included bias weight
		this.whi = new Matrix(this.hNodes, this.iNodes +1);
		
		//create second layer weights
		//include bias weight
		this.whh = new Matrix(this.hNodes, this.hNodes +1);
		
		//create second layer weights
		//include bias weight
		this.woh = new Matrix(this.oNodes, this.hNodes +1);  
		
		//set the matricies to random values
		this.whi.randomize();
		this.whh.randomize();
		this.woh.randomize();
	}

  	//mutation function for genetic algorithm
	mutate (mr) {
		//mutates each weight matrix
		this.whi.mutate(mr);
		this.whh.mutate(mr);
		this.woh.mutate(mr);
	}
  
  	//calculate the output values by feeding forward through the neural network
	output (inputsArr) {
		//convert array to matrix
		//Note woh has nothing to do with it its just a function in the var class
		var inputs = this.woh.singleColumnMatrixFromArray(inputsArr);
		
		//add bias 
		var inputsBias = inputs.addBias();
		
		
		//-----------------------calculate the guessed output
		
		//apply layer one weights to the inputs
		var hiddenInputs = this.whi.dot(inputsBias);
		
		//pass through activation function(sigmoid)
		var hiddenOutputs = hiddenInputs.activate();
		
		//add bias
		var hiddenOutputsBias = hiddenOutputs.addBias();
		
		//apply layer two weights
		var hiddenInputs2 = this.whh.dot(hiddenOutputsBias);
		var hiddenOutputs2 = hiddenInputs2.activate();
		var hiddenOutputsBias2 = hiddenOutputs2.addBias();
		
		//apply level three weights
		var outputInputs = this.woh.dot(hiddenOutputsBias2);
		//pass through activation function(sigmoid)
		var outputs = outputInputs.activate();
		
		//convert to an array and return
		return outputs.toArray();
	}
  
	//crossover function for genetic algorithm
	crossover (partner) {	
		//creates a new child with layer matrices from both parents
		var child = new NeuralNet(this.iNodes, this.hNodes, this.oNodes);
		child.whi = this.whi.crossover(partner.whi);
		child.whh = this.whh.crossover(partner.whh);
		child.woh = this.woh.crossover(partner.woh);
		return child;
	}
  
	//return a neural net which is a clone of this Neural net
	clone () {
		var clone  = new NeuralNet(this.iNodes, this.hNodes, this.oNodes); 
		clone.whi = this.whi.clone();
		clone.whh = this.whh.clone();
		clone.woh = this.woh.clone();
		
		return clone;
	}
  
	//converts the weights matrices to a single table 
	//used for storing the snakes brain in a file
	//I DO NOT USE THIS FUNCTION, I USE JSON
	NetToTable () {
		//create table
		var t = [];
		
		
		//convert the matricies to an array 
		var whiArr = this.whi.toArray();
		var whhArr = this.whh.toArray();
		var wohArr = this.woh.toArray();
		
		//set the amount of columns in the table
		/*
		for (var i = 0; i< max(whiArr.length, whhArr.length, wohArr.length); i++) {
		  t.addColumn();
		}
		*/
		
		//set the first row as whi
		var tr = [];
		
		for (var i = 0; i< whiArr.length; i++) {
		  tr.push(whiArr[i]);
		}
		t[0].push(tr);
		
		//set the second row as whh
		tr = [];
		
		for (var i = 0; i< whhArr.length; i++) {
		  tr.push(whhArr[i]);
		}
		t[1].push(tr);
		
		//set the third row as woh
		tr = [];
		
		for (var i = 0; i< wohArr.length; i++) {
		  tr.push(wohArr[i]);
		}
		t[2].push(tr);
		
		//return table
		return t;
	}

  
	//takes in table as parameter and overwrites the matrices data for this neural network
	//used to load snakes from file
	//I DO NOT USE THIS FUNCTION, I USE Object2Net
	TableToNet ( t) {
		//create arrays to tempurarily store the data for each matrix
		var whiArr = [];
		var whhArr = [];
		var wohArr = [];
		
		//set the whi array as the first row of the table
		var tr = t[0];
		
		for (var i = 0; i< whiArr.length; i++) {
		  whiArr[i] = tr[i];
		}
		
		//set the whh array as the second row of the table
		tr = t[1];
		
		for (var i = 0; i< whhArr.length; i++) {
		  whhArr[i] = tr[i];
		}
		
		//set the woh array as the third row of the table
		tr = t[2];
		
		for (var i = 0; i< wohArr.length; i++) {
		  wohArr[i] = tr[i];
		}
		
		//convert the arrays to matrices and set them as the layer matrices 
		this.whi.fromArray(whiArr);
		this.whh.fromArray(whhArr);
		this.woh.fromArray(wohArr);
	}
	
	Object2Net (object) {
		this.whi.createFromObject(object.whi);
		this.whh.createFromObject(object.whh);
		this.woh.createFromObject(object.woh);
	}
}
