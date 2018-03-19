class Matrix {
	constructor(r, c) {
		this.rows = r;
		this.cols = c;
		this.matrix = [];
		//initiliazie the array
		for(var i = 0; i < this.rows; i++) {
			var arrCols = [];
			for (var j = 0; j < this.cols; j++) {
				arrCols.push(0);
			}
			this.matrix.push(arrCols);
		}
	}
	//constructor from ...
	createFromArray(arr) {
		this.matrix = arr;
		this.cols = arr.length;
		this.rows = arr[0].length;
	}
	
	createFromObject (object) {
		this.matrix = object.matrix;
		this.cols = object.cols;
		this.rows = object.rows;
	}
	
		
	//print matrix
	output () {
		for (var i =0; i< this.rows; i++) {
			for (var j = 0; j<this.cols; j++) {
				console.log(this.matrix[i][j] + "	");
			}
			console.log(" ");
		}
		console.log();
	}
		
	
	//multiply by scalar
	multiply (n ) {

		for (var i =0; i< this.rows; i++) {
			for (var j = 0; j< this.cols; j++) {
				this.matrix[i][j] *= n;
			}
		}
	}

	
	//return a matrix which is this matrix dot product parameter matrix 
	dot (n) {
		var result = new Matrix(this.rows, n.cols);
	 
		if (this.cols == n.rows) {
			//for each spot in the new matrix
			for (var i =0; i< this.rows; i++) {
				for (var j = 0; j<n.cols; j++) {
					var sum = 0;
					for (var k = 0; k< this.cols; k++) {
						sum+= this.matrix[i][k]*n.matrix[k][j];
					}
					result.matrix[i][j] = sum;
				}
			}
		}

		return result;
	}
	
	//set the matrix to random ints between -1 and 1
	randomize () {
		for (var i =0; i< this.rows; i++) {
			for (var j = 0; j< this.cols; j++) {
				this.matrix[i][j] = random(-1, 1);
			}
		}
	}

	
	//add a scalar to the matrix
	addScalar (n ) {
		for (var i =0; i< this.rows; i++) {
			for (var j = 0; j< this.cols; j++) {
				this.matrix[i][j] += n;
			}
		}
	}

	///return a matrix which is this matrix + parameter matrix
	add (n ) {
		var newMatrix = new Matrix(this.rows, this.cols);
		if (cols == n.cols && this.rows == n.rows) {
			for (var i =0; i< this.rows; i++) {
				for (var j = 0; j< this.cols; j++) {
					newMatrix.matrix[i][j] = this.matrix[i][j] + n.matrix[i][j];
				}
			}
		}
		return newMatrix;
	}

	//return a matrix which is this matrix - parameter matrix
	subtract (n ) {
		var newMatrix = new Matrix(cols, this.rows);
		if (cols == n.cols && this.rows == n.rows) {
			for (var i =0; i< this.rows; i++) {
				for (var j = 0; j< this.cols; j++) {
					newMatrix.matrix[i][j] = this.matrix[i][j] - n.matrix[i][j];
				}
			}
		}
		return newMatrix;
	}
	
	//return a matrix which is this matrix * parameter matrix (element wise multiplication)
	multiply (n ) {
		var newMatrix = new Matrix(this.rows, this.cols);
		if (cols == n.cols && this.rows == n.rows) {
			for (var i =0; i< this.rows; i++) {
				for (var j = 0; j< this.cols; j++) {
					newMatrix.matrix[i][j] = this.matrix[i][j] * n.matrix[i][j];
				}
			}
		}
		return newMatrix;
	}
	
	//return a matrix which is the transpose of this matrix
	transpose  () {
		var n = new Matrix(cols, this.rows);
		for (var i =0; i< this.rows; i++) {
			for (var j = 0; j< this.cols; j++) {
				n.matrix[j][i] = this.matrix[i][j];
			}
		}
		return n;
	}
	
	//Creates a single column array from the parameter array
	singleColumnMatrixFromArray (arr) {
		var n = new Matrix(arr.length, 1);
		for (var i = 0; i< arr.length; i++) {
			n.matrix[i][0] = arr[i];
		}
		return n;
	}
		
	//sets this matrix from an array
	fromArray (arr) {
		for (var i = 0; i< this.rows; i++) {
			for (var j = 0; j< cols; j++) {
				this.matrix[i][j] =	arr[j+i*cols];
			}
		}
	}
		
	//returns an array which represents this matrix
	toArray () {
		var arr = [];
		for (var i = 0; i< this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				arr[j + i * this.cols] = this.matrix[i][j];
			}
		}
		return arr;
	}

	
	//for ix1 matrixes adds one to the bottom
	addBias () {
		var n = new Matrix(this.rows+1, 1);
		for (var i =0; i< this.rows; i++) {
			n.matrix[i][0] = this.matrix[i][0];
		}
		n.matrix[this.rows][0] = 1;
		return n;
	}
	
	//applies the activation function(sigmoid) to each element of the matrix
	activate () {
		var n = new Matrix(this.rows, this.cols);
		for (var i =0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				n.matrix[i][j] = this.sigmoid(this.matrix[i][j]);
			}
		}
		return n;
	}
	
		
	//sigmoid activation function
	sigmoid (x) {
		var y = 1 / (1 + pow(Math.E, -x));
		return y;
	}
	//returns the matrix that is the derived sigmoid function of the current matrix
	sigmoidDerived () {
		var n = new Matrix(this.rows, this.cols);
		for (var i =0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				n.matrix[i][j] = (this.matrix[i][j] * (1- this.matrix[i][j]));
			}
		}
		return n;
	}

	
	//returns the matrix which is this matrix with the bottom layer removed
	removeBottomLayer () {
		var n = new Matrix(this.rows-1, this.cols);			
		for (var i =0; i<n.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				n.matrix[i][j] = this.matrix[i][j];
			}
		}
		return n;
	}
	
	//Mutation function for genetic algorithm 
	
	mutate (mutationRate) {
		//for each element in the matrix
		for (var i =0; i< this.rows; i++) {
			for (var j = 0; j< this.cols; j++) {
				var rand = random(1);
				if (rand<mutationRate) {//if chosen to be mutated
					this.matrix[i][j] += randomGaussian() / 5;
					//add a random value to it(can be negative)
					
					//set the boundaries to 1 and -1
					if (this.matrix[i][j]>1) {
						this.matrix[i][j] = 1;
					}
					if (this.matrix[i][j] <-1) {
						this.matrix[i][j] = -1;
					}
				}
			}
		}
	}
	
	//returns a matrix which has a random number of values from this matrix and the rest from the parameter matrix
	crossover (partner) {
		var child = new Matrix(this.rows, this.cols);
		
		//pick a random povar in the matrix
		var randC = floor(random(this.cols));
		var randR = floor(random(this.rows));
		for (var i =0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {

				if ((i< randR)|| (i==randR && j<=randC)) { //if before the random point then copy from this matric
					child.matrix[i][j] = this.matrix[i][j];
				} else { //if after the random point then copy from the parameter array
					child.matrix[i][j] = partner.matrix[i][j];
				}
			}
		}
		return child;
	}
	
	//return a copy of this matrix
	clone () {
		var clone = new	Matrix(this.rows, this.cols);
		for (var i =0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				clone.matrix[i][j] = this.matrix[i][j];
			}
		}
		return clone;
	}
}
