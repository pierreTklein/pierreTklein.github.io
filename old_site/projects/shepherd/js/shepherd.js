//THINGS TO ADD:
//	• marketplace
//	• cash
//	• plant seeds so that you can grow grass faster, but you need $$
//	• add wolves / dangers to your sheep
//  • add cliff side?! (sheep are stupid, they can fall off the cliff)
//  • add seasons
//		• add irrigation, droughts, natural disasters (like toradoes that can steal your sheepies)
//  • storage for food, (so collecting food)
//  • add difference between selling the wool vs. selling the sheep


/*

I was thinking of a spawn area, perhaps one or more caves
And wolves come out at a certain frequency and go back
Maybe 3? At a time that's sort of in a pack but also not really... 
is it possible to make the ai coordinate so the Wolves choose a specific sheep, and then try to surround it?
And after a certain time, if the wolves don't catch any sheep, they go back into the cave
The Wolves could have states! Locate target -> surround target -> close in! -> Locate another target
Maybe even like... the more sheep the wolves catch (and drag back to the cave? Maybe a pink triangle for dead sheep) and faster the wolves spawn... like procreation

And the wolves can move a bit faster than the sheep and be slowed when carrying a sheep back. 
Then could make a character (dog?) to fight the wolves! (Ai too? Guide it via fences or something?) and perhaps a sheep must be hit by wolves 3 times to be dead? 
And then maybe life regen as well on sheep... and wolves have 5hp from dog?

*/

var frameRate;
var isPaused = false;
var version = "0.2.0.1";
function animations(){
	var isDebug = false; //boolean value that tells whether or not the game is in debug mode

	var keys = []; //stores which keys are pressed. keys[keyCode] is either True or False.

	var time = [Date.now(),Date.now()];//stores dt
	var canvas = document.getElementById('runner');//the canvas we are painting on
	var animalPop;//the population of sheep
	var wolves;
	var neighborhood = 30;//the radius of interactivity between animals

	//for checking the frame rate:
	var numFrames = 0;//number of frames in a given time frame
	frameRate = 21;//starting frame rate, just above the minimum frame rate

	//to make sure that the function runs optimally
	var optimizedSize = false;

	//for interaction with the mouse:
	var mouseLocation = new vector(0,0);//location of the mouse
	var numClicks = 0;//number of clicks user has made
	var clickLocation = new vector(0,0);//location of the click by mouse
	var lineType = "remove" //whether the line the person is drawing is 'remove', or something else

	//this is to generate lines so the arrows can interact with an environment!!
	var lines = [];//stores the current fences
	var removedLine = false;//whether the last key press removed a fence
	var oldLines = []; //stores the fences that were removed
	var reAddedLine = false;//whether the last key press re-added a fence

	//food for the arrows:
	var lands;

	//for CURRENCY:
	var loan = 100000;
	var cash = 0;
	var costOfSheep = 2000;
	//VECTOR:
	function vector(x,y){
		this.x = x;
		this.y = y;		
		this.flagged = false;//flags a vector contains NaN as one of its values
		this.ang = 0;
	}
	// result.sub(firstVector,secondVector)
	vector.prototype.sub = function(v1,v2){//subtracts the two vectors that are inputs, and stores it in the third vector.
		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;
	}
	vector.prototype.setValues = function(x,y){//sets the x and y values to whatever you give it
		this.x = x;
		this.y = y;
		if((isNaN(this.x) || isNaN(this.y)) && !this.flagged){
			console.log(this.x, "setVal");
			this.flagged = true;
		}
	}
	vector.prototype.magnitude = function(){//returns the magnitude of the vector
		return Math.sqrt((this.x*this.x)+(this.y*this.y));
	}
	vector.prototype.magnitudeSquared = function(){//returns the magnitude, before square-rooting it
		return ((this.x*this.x)+(this.y*this.y))
	}
	vector.prototype.add = function(otherV){//adds another vector to the current vector
		this.x = this.x + otherV.x;
		this.y = this.y + otherV.y;			
		if((isNaN(this.x) || isNaN(this.y)) && !this.flagged){
			console.log(this.x, "add");
			this.flagged = true;
		}
	}
	vector.prototype.addPieceWise = function(x,y){//adds x and y value to the given vector
		this.x += x;
		this.y += y;
	}
	vector.prototype.mult = function(multiplier){//multiply vector by a scalar
		this.x = this.x * multiplier;
		this.y = this.y * multiplier;
		if((isNaN(this.x) || isNaN(this.y)) && !this.flagged){
			console.log(this.x, "mult");
			this.flagged = true;
		}

	}
	vector.prototype.div = function(divisor){//dividee by a scalar. Will not change value if divisor is 0.
		if(divisor != 0){
			this.x = this.x / divisor;
			this.y = this.y / divisor;
		}
		if((isNaN(this.x) || isNaN(this.y)) && !this.flagged){
			console.log(this.x, "div");
			this.flagged = true;
		}

	}
	vector.prototype.normalize = function(){//normalizes the vector.
		var mag = this.magnitude();
		if(mag != 0){
			this.x = this.x / mag;
			this.y = this.y / mag;
		}
		if((isNaN(this.x) || isNaN(this.y)) && !this.flagged){
			console.log(this.x, "normal");
			this.flagged = true;
		}
	}
	vector.prototype.limit = function(max){//if the magnitude of the vector is greater than the input, magnitude equals input.
		var mag = this.magnitude();
		if(mag > max){
			this.normalize();
			this.mult(max);
		}	
		if((isNaN(this.x) || isNaN(this.y)) && !this.flagged){
			console.log(this.x, ",lim");
			this.flagged = true;
		}
	}
	vector.prototype.copyValues = function(vector){//copies values from one vector to another vector
		this.x = vector.x;
		this.y = vector.y;
		if((isNaN(this.x) || isNaN(this.y)) && !this.flagged){
			console.log(this.x, "copy");
			this.flagged = true;
		}
	}
	vector.prototype.getAngle = function(){//returns the angle of the vector, from (I believe) the horizontal.
		return Math.atan2(this.y,this.x);
	}
	vector.prototype.dot = function(otherV){//returns dot product of this vector with inputted vector
		return this.x*otherV.x + this.y*otherV.y;
	}
	vector.prototype.relativeAngle = function(otherV){//returns relative angle between two vectors
		return otherV.getAngle()-this.getAngle();
	}
	vector.prototype.toString = function(){//returns the x,y position as string
		return this.x + "," + this.y;
	}
	vector.prototype.draw = function(startV){//draws the line between two vectors 
		var context = canvas.getContext('2d');
	    context.beginPath();
	    //context.moveTo(startV.x,startV.y);
    	context.arc(startV.x,startV.y, 10, 0, 2 * Math.PI, false);
	    context.moveTo(startV.x,startV.y);
	    context.lineTo(this.x,this.y);
		context.strokeStyle = '#FFFFFF'
		context.stroke();			
		context.closePath();
	}


	//LINE SEGMENT:
	function lineSegment(startV, endV){//line segment as defined by two vectors 
		this.startV = startV;
		this.endV = endV;
		this.line = new vector(0,0);
		this.line.sub(startV,endV);
		this.lengthSq = this.line.magnitudeSquared();

		//for calculating distance to another point
		this.distanceTo = new vector(0,0);
		this.t = 0;
		this.proj =  new vector(0,0);
	}
	lineSegment.prototype.getDistance = function(pointV){//returns the vector distance from the endpoint of a vector to the closest point on the given line
		if(this.lengthSq == 0){
			//console.log("length = 0");
			this.distanceTo.sub(pointV,this.startV);
		}
		else{
			this.t = ((pointV.x - this.startV.x) * (this.endV.x - this.startV.x) + (pointV.y - this.startV.y) * (this.endV.y - this.startV.y)) / this.lengthSq;
			this.t = Math.max(0, Math.min(1, this.t));
			this.proj.setValues(this.startV.x + this.t * (this.endV.x - this.startV.x), this.startV.y + this.t * (this.endV.y - this.startV.y))
			this.distanceTo.sub(pointV,this.proj);
		}
		return this.distanceTo;
	}
	lineSegment.prototype.getDistanceMag = function(pointV){//returns the magnitude distance from the endpoint of a vector to the closest point on the given line
		return this.getDistance(pointV).magnitude();
	}
	lineSegment.prototype.onSegment = function(p, q, r){
	    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
	    	q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)){
			return true;

	    }
		return false;
	}
	// To find orientation of ordered triplet (p, q, r).
	// The function returns following values
	// 0 --> p, q and r are colinear
	// 1 --> Clockwise
	// 2 --> Counterclockwise
	lineSegment.prototype.orientation = function(p, q, r){
	    // for details of below formula.
	    var val = (q.y - p.y) * (r.x - q.x) -
	              (q.x - p.x) * (r.y - q.y);
	    if (val == 0) return 0;  // colinear
	    return (val > 0)? 1: 2; // clock or counterclock wise
	}
	 
	// The main function that returns true if line segment 'p1q1'
	// and 'p2q2' intersect.
	lineSegment.prototype.doIntersect = function(other){
	    // Find the four orientations needed for general and
	    // special cases
	 
		//Point p1, Point q1, Point p2, Point q2
		var o1 = this.orientation(this.startV, this.endV, other.startV);
		var o2 = this.orientation(this.startV, this.endV, other.endV);
		var o3 = this.orientation(other.startV, other.endV, this.startV);
		var o4 = this.orientation(other.startV, other.endV, this.endV);

	    // General case
		if (o1 != o2 && o3 != o4) return true;
	 
	    // Special Cases
	    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
		if (o1 == 0 && onSegment(this.startV, other.startV, this.endV)) return true;
	 
	    // p1, q1 and p2 are colinear and q2 lies on segment p1q1
		if (o2 == 0 && this.onSegment(this.startV, other.endV, this.endV)) return true;
	 
	    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
		if (o3 == 0 && this.onSegment(other.startV, this.startV, other.endV)) return true;
	 
	     // p2, q2 and q1 are colinear and q1 lies on segment p2q2
		if (o4 == 0 && this.onSegment(other.startV, this.endV, other.endV)) return true;
	    return false; // Doesn't fall in any of the above cases
	}
	lineSegment.prototype.draw = function(){//draws the line segments
		var context = canvas.getContext('2d');
		context.save();
	    context.beginPath();
	    context.moveTo(this.startV.x,this.startV.y);
	    context.lineTo(this.endV.x,this.endV.y);
        context.lineWidth = 2;
		context.strokeStyle = '#FFFFFF'
		context.stroke();
		context.closePath();
		context.restore();
	}

	//LAND:
	function land(tileSize){//
		this.tileSize = tileSize;
		this.columns = canvas.height / this.tileSize;
		this.rows = canvas.width / this.tileSize;

		this.animalX = 0;
		this.animalY = 0;
		this.tile = this.generateLand();

	}
	land.prototype.generateLand = function(){
		var rowArr = [];
		for(var i = 0; i < this.rows; i++){
			var columnArr = [];
			for(var j = 0; j < this.columns; j++){
				columnArr.push(new food(i*this.tileSize+this.tileSize/2,j*this.tileSize+this.tileSize/2,this.tileSize,Math.random()*1000));
			}
			rowArr.push(columnArr);
		}
		return rowArr;
	}
	//returns true / false according to whether the animal successfully ate or not
	land.prototype.eat = function(animalLocation,biteSize){
		this.animalX = Math.floor(animalLocation.x / this.tileSize);
		this.animalY = Math.floor(animalLocation.y / this.tileSize);
		return this.tile[this.animalX][this.animalY].eat(biteSize);
	}


	land.prototype.update = function(){
		for(var i = 0; i < this.tile.length; i++){
			for(var j = 0; j < this.tile[i].length; j++){
				this.tile[i][j].update();
			}
		}			
	}
	land.prototype.draw = function(){
		for(var i = 0; i < this.tile.length; i++){
			for(var j = 0; j < this.tile[i].length; j++){
				this.tile[i][j].draw();
			}
		}
	}

	//FOOD:
	function food(x,y,width,fertility){
		this.maxFertility = 1000;
		this.location = new vector(x,y);
		this.width = width;
		this.fertility = fertility;
		this.color = '#473E36';

	}
	food.prototype.chooseColor = function(){
		if(this.fertility>750){
			this.color = '#006400'
		}else if(this.fertility > 500){
			this.color = '#008000'
		}else if(this.fertility > 250){
			this.color = '#228B22'
		}else if(this.fertility > 100){
			this.color = '#556B2F'
		}else if(this.fertility > 50){
			this.color = '#808000'
		}else if(this.fertility > 10){
			this.color = '#9f8a60';
		}else{
			this.color = '#473E36';
		}
	}
	food.prototype.canBeEaten = function(biteSize){
		if(this.fertility >= biteSize){
			return true;
		}
		else{
			return false;
		}
	}
	food.prototype.eat = function(biteSize){
		if(this.canBeEaten(biteSize)){
			this.fertility -= biteSize;
			return true;
		}
		return false;
	}

	food.prototype.update = function(){
		if(this.fertility < this.maxFertility){
			this.fertility+=0.05;
		}
	}
	food.prototype.draw = function(){
		this.chooseColor(); 
		var context = canvas.getContext('2d');
		this.drawSquare(context);
		if(isDebug){
			this.drawText(context);
		}

		//this.drawCircle(context);
	}
	food.prototype.drawCircle = function(context){
		context.beginPath();
		context.arc(this.location.x, this.location.y, this.width/2, 0, 2 * Math.PI, false);
		context.fillStyle = '#000000';
		context.fill();
		context.closePath();
	}
	food.prototype.drawSquare = function(context){
		context.beginPath();
		context.moveTo(this.location.x-this.width/2,this.location.y-this.width/2);
		context.lineTo(this.location.x+this.width/2,this.location.y-this.width/2);
		context.lineTo(this.location.x+this.width/2,this.location.y+this.width/2);
		context.lineTo(this.location.x-this.width/2,this.location.y+this.width/2);
		context.lineTo(this.location.x-this.width/2,this.location.y-this.width/2);
		context.fillStyle = this.color;
		context.fill();
        context.lineWidth = 1;
		context.strokeStyle = '#000000';
		context.stroke();
		context.closePath();
	}
	food.prototype.drawText = function(context){
		context.font="12px Arial";
		context.textAlign = "center";
		context.fillStyle = '#FFFFFF';
		context.fillText(Math.floor(this.fertility),this.location.x,this.location.y+5);
	}

	//ARROW:
	function arrow(mass,x,y,dx,dy){
		this.location = new vector(x,y);
		this.mass = mass;
		this.radius = Math.sqrt(100/Math.PI);
		
		this.maxV = 3;
		this.velocity = new vector(dx,dy);
		this.velocity.limit(this.maxV);
		this.heading = 0;//this.velocity.getAngle();

		this.maxF = 10;
		this.force = new vector(0,0);
		
		this.distanceTo = new vector(0,0);
		
		this.mag = 0;
	
		this.numArrowsUsed = 0;
		//for calculating the separation between arrows:
		this.maxSeparationF = 1;
		this.separationRadius = (this.radius * 2)+7;
		this.sumSeparations = new vector(0,0);
		this.separationForce = new vector(0,0);
		this.minSeparationAngle = 0;

		//for calculating the alignment force:
		this.maxAlignF = 1;
		this.sumAlignments = new vector(0,0);
		this.alignForce = new vector(0,0);
		this.minAlignAngle =  Math.PI/2;

		
		//for calculating the cohesion force:
		this.maxCohesionF = 1;
		this.sumCohesion = new vector(0,0);
		this.cohesionForce = new vector(0,0);
		this.minCohesionAngle = Math.PI/2;

		// //for calculating other herd populations:
		// this.maxOthersF = 1;
		// this.sumOthers = new vector(0,0);
		// this.othersForce = new vector(0,0);
		// this.minOthersAngle = 0;

		//for calculating the seeking force:
		this.maxSeekF = 1;
		this.desiredV = new vector(0,0);

		//for calculating shephard avoidance:
		this.maxShephardF = 100;
		this.shephardForce = new vector(0,0);

		//for calculating wall avoidance:
		this.maxWallF = 100;
		this.sumWall = new vector(0,0);
		this.wallForce = new vector(0,0);
		this.numWallsUsed = 0; 
		this.placeHolderDist;
		this.wallRadius = this.radius * 2 + 5;



		//HUNGER, EATING, ENERGY, AGE:
		this.maxHealth = 1000;
		this.health = 1000;
		this.energy = 500;
		this.biteSize = 0.7;
		this.energyExpenditure = 0.15;
		this.maxAge = 100;
		this.primeAge = this.maxAge / 2;
		this.age = 0;

		//Pricing:
		this.value = this.updateValue();
		//for drawing:
		this.firstVertex = new vector(0,0);		
		this.reset = function(){
			this.location.setValues(x,y);
			this.velocity.setValues(Math.random()*10-5,Math.random()*10-5);
		}

	}
	arrow.prototype.applyForce = function(vector){
		this.force.add(vector);
	}
	arrow.prototype.update = function(curIndex, otherArrows, dt){
		if(this.health <= 0){
			return;
		}
		this.age+=0.05 * dt;
		this.force.setValues(0,0);
		
		this.distanceTo.setValues(0,0);

		this.separate(curIndex,otherArrows);
		this.separationForce.mult(1.5);

		this.align(curIndex,otherArrows);
		this.alignForce.mult(1.0);

		this.cohesion(curIndex,otherArrows);
		this.cohesionForce.mult(1.0);
		
		this.shephard("avoid"); //"seek" or "avoid"
		this.shephardForce.mult(1.3);

		this.avoidWalls();
		this.wallForce.mult(1.5);

		this.applyForce(this.separationForce);
		this.applyForce(this.alignForce);
		this.applyForce(this.cohesionForce);
		this.applyForce(this.shephardForce);
		this.applyForce(this.wallForce);

		this.force.limit(this.maxF);

		if(this.force.magnitudeSquared() != 0){
			this.velocity.addPieceWise(this.force.x*(dt/this.mass),this.force.y*(dt/this.mass));
		}
		this.velocity.limit(this.maxV);

		if(this.velocity.magnitudeSquared() != 0){
			this.heading = this.velocity.getAngle();
		}
		this.location.addPieceWise(this.velocity.x*dt,this.velocity.y*dt);
		this.stayInBound();
		this.eat();
		this.checkHealth();
		this.updateValue();
	}

	arrow.prototype.eat = function(){
		if(this.energy < 500){
			if(lands.eat(this.location,this.biteSize)){
				this.energy+=this.biteSize;
			}
		}
		if(this.energy > 0){this.energy-=this.energyExpenditure;}
	}
	arrow.prototype.checkHealth = function(){
		if(this.age > 4/5 * this.maxAge){this.health -=0.5;}
		if(this.energy < 100){this.health -= 0.5;}
		else{this.health += (this.health<this.maxHealth)? 0.1:0;}
	}
	arrow.prototype.updateValue = function(){
		if(this.health <= 0){this.value = costOfSheep/10;}
		else{this.value = (this.health + this.energy) * (Math.pow(Math.E,(-(Math.pow(this.age-this.primeAge,2)/(800))))+0.5) ; }
	}
	arrow.prototype.isTimeToSell = function(){
		if(this.value > costOfSheep){
			return true;
		}
		else{
			return false;
		}
	}

	arrow.prototype.separate = function(curIndex, otherArrows){
		this.numArrowsUsed = 0;
		this.sumSeparations.setValues(0,0);
		this.separationForce.setValues(0,0);
		this.mag = 0;
		for(var i = 0; i < otherArrows.length; i++){
			this.distanceTo.sub(this.location,otherArrows[i].location);
			this.mag = this.distanceTo.magnitude();
			//&& Math.abs(this.velocity.relativeAngle(this.distanceTo)) < Math.PI/2
			if(this.criteria(i,curIndex,this.separationRadius,this.minSeparationAngle,otherArrows[i])){//this.mag > 0 && this.mag < this.separationRadius
				this.distanceTo.normalize();
				this.distanceTo.div(this.mag);
				this.sumSeparations.add(this.distanceTo);
				this.numArrowsUsed++;
			}
		}
		if(this.numArrowsUsed > 0){
			this.sumSeparations.div(this.numArrowsUsed);
		}
		if(this.sumSeparations.magnitudeSquared() > 0){
			this.sumSeparations.normalize();
			this.sumSeparations.mult(this.maxV);
			this.separationForce.sub(this.sumSeparations,this.velocity);
			this.separationForce.limit(this.maxSeparationF);
		}
	}
	arrow.prototype.align = function(curIndex, otherArrows){
		this.numArrowsUsed = 0;
		this.sumAlignments.setValues(0,0);
		this.alignForce.setValues(0,0);
		this.mag = 0;

		for(var i = 0; i < otherArrows.length; i++){
			this.distanceTo.sub(this.location,otherArrows[i].location);
			this.mag = this.distanceTo.magnitude();
			if(this.criteria(i,curIndex,neighborhood,this.minAlignAngle,otherArrows[i])){ //i != curIndex && this.mag > 0 && this.mag < neighborhood
				this.sumAlignments.add(otherArrows[i].velocity);
				this.numArrowsUsed++;
			}
		}
		if(this.numArrowsUsed > 0){
			this.sumAlignments.div(this.numArrowsUsed);
			this.sumAlignments.normalize();
			this.sumAlignments.mult(this.maxV);
			this.alignForce.sub(this.sumAlignments,this.velocity);
			this.alignForce.limit(this.maxAlignF);
		}
	}
	arrow.prototype.cohesion = function(curIndex, otherArrows){
		this.numArrowsUsed = 0; 
		this.sumCohesion.setValues(0,0);
		this.cohesionForce.setValues(0,0);
		this.mag = 0;
		for(var i = 0; i < otherArrows.length; i++){
			this.distanceTo.sub(this.location,otherArrows[i].location);
			this.mag = this.distanceTo.magnitude();
			if(this.criteria(i,curIndex,neighborhood,this.minCohesionAngle,otherArrows[i])){//i != curIndex && this.mag > 0 && this.mag < neighborhood
				this.sumCohesion.add(otherArrows[i].location);
				this.numArrowsUsed++;
			}
		}
		if(this.numArrowsUsed > 0){
			this.sumCohesion.div(this.numArrowsUsed);
			this.seek(this.sumCohesion,this.cohesionForce);
		}
	}
	// //an array of all of the other herds that are 
	// arrow.prototype.otherPopulations = function(curIndex, otherPopulationArr){
	// 	//for calculating other herd populations:
	// 	this.maxOthersF = 1;
	// 	this.sumOthers = new vector(0,0);
	// 	this.othersForce = new vector(0,0);
	// 	this.minOthersAngle = 0;

	// 	this.numArrowsUsed = 0;
	// 	this.sumOthers.setValues(0,0);
	// 	this.othersForce.setValues(0,0);
	// 	this.mag = 0;
	// 	for(var j = 0; j < otherPopulationArr.length; j++){
	// 		for(var i = 0; i < otherPopulationArr[i].length; i++){
	// 			this.distanceTo.sub(this.location,otherPopulationArr[i][j].location);
	// 			this.mag = this.distanceTo.magnitude();
	// 			//&& Math.abs(this.velocity.relativeAngle(this.distanceTo)) < Math.PI/2
	// 			if(this.criteria(i,curIndex,this.separationRadius,this.minSeparationAngle,otherPopulationArr[i][j])){//this.mag > 0 && this.mag < this.separationRadius
	// 				this.distanceTo.normalize();
	// 				this.distanceTo.div(this.mag);
	// 				this.sumSeparations.add(this.distanceTo);
	// 				this.numArrowsUsed++;
	// 			}
	// 		}
	// 	}
	// 	if(this.numArrowsUsed > 0){
	// 		this.sumSeparations.div(this.numArrowsUsed);
	// 	}
	// 	if(this.sumSeparations.magnitudeSquared() > 0){
	// 		this.sumSeparations.normalize();
	// 		this.sumSeparations.mult(this.maxV);
	// 		this.separationForce.sub(this.sumSeparations,this.velocity);
	// 		this.separationForce.limit(this.maxSeparationF);
	// 	}
	// }

	arrow.prototype.criteria = function(i, curIndex, magCriteria,angle, otherArrow){
		if(i != curIndex && this.mag > 0 && this.mag < magCriteria && Math.abs(this.distanceTo.relativeAngle(this.velocity)) > angle && otherArrow.health > 0){//&& Math.abs(this.velocity.relativeAngle(this.distanceTo)) < Math.PI/2
			return true;
		}
		return false;
	}

	arrow.prototype.shephard = function(type){
		this.shephardForce.setValues(0,0);
		this.distanceTo.sub(this.location,mouseLocation);
		this.mag = this.distanceTo.magnitude();
		if(type == "avoid"){
			if(this.mag > 0 && this.mag < neighborhood){
				this.distanceTo.normalize();
				this.distanceTo.div(this.mag);
				this.shephardForce.add(this.distanceTo);
			}
			if(this.shephardForce.magnitudeSquared() > 0){
				this.shephardForce.normalize();
				this.shephardForce.mult(this.maxV);
				this.shephardForce.sub(this.shephardForce,this.velocity);
				this.shephardForce.limit(this.maxShephardF);
			}
		}
		else if(type == "seek"){
			if(this.mag > 0 && this.mag < neighborhood){
				this.seek(mouseLocation,this.shephardForce);
			}
		}
	}
	arrow.prototype.avoidWalls = function(){
		this.numWallsUsed = 0; 
		this.wallForce.setValues(0,0);
		this.sumWall.setValues(0,0);
		this.mag = 0;

		for(var i = 0; i < lines.length; i++){
			this.placeHolderDist = lines[i].getDistance(this.location);
			this.distanceTo.setValues(this.placeHolderDist.x,this.placeHolderDist.y);
			this.mag = this.distanceTo.magnitude();
			if(this.mag < this.wallRadius){
				//console.log(i,this.mag);
				this.distanceTo.normalize();
				this.distanceTo.div(this.mag);
				this.sumWall.add(this.distanceTo);
				this.numWallsUsed++;
			}
		}
		if(this.numWallsUsed > 0){
			this.sumWall.div(this.numWallsUsed);
		}
		if(this.sumWall.magnitudeSquared() > 0){
			this.sumWall.normalize();
			this.sumWall.mult(this.maxV);
			this.wallForce.sub(this.sumWall,this.velocity);
			this.wallForce.limit(this.maxWallF);
		}						
	}

	arrow.prototype.seek = function(target,resultantForce){
		this.desiredV.setValues(0,0);
		this.desiredV.sub(target,this.location);
		this.desiredV.normalize();
		this.desiredV.mult(this.maxV);
		resultantForce.sub(this.desiredV,this.velocity);
		resultantForce.limit(this.maxSeekF);
	}
	arrow.prototype.stayInBound = function(){
		this.location.x = (this.location.x < 0) ? canvas.width : this.location.x;
		this.location.y = (this.location.y < 0) ? canvas.height : this.location.y;
		this.location.x = (this.location.x > canvas.width) ? 0 : this.location.x;
		this.location.y = (this.location.y > canvas.height) ? 0 : this.location.y;
	}
	arrow.prototype.draw = function(){
		var context = canvas.getContext('2d');
		context.save();
		context.globalAlpha = Math.max(this.health/this.maxHealth,0);
		//this.drawCircle(context);
		this.drawTriangle(context);
		context.restore();
	}
	arrow.prototype.drawCircle = function(context){
		context.beginPath();
		context.arc(this.location.x, this.location.y, this.radius, 0, 2 * Math.PI, false);
		context.fillStyle = '#000000';
		context.fill();
		context.stroke();
		context.closePath();
	}
	arrow.prototype.drawTriangle = function(context){
	    context.beginPath();
	    context.moveTo(this.location.x+(Math.cos(this.heading))*this.radius,this.location.y+(Math.sin(this.heading))*this.radius);
	    for(var i = 1; i < 4; i++){
		    this.firstVertex.setValues(this.location.x+(Math.cos(this.heading+(2*Math.PI/3)*i))*this.radius,this.location.y+(Math.sin(this.heading+(2*Math.PI/3)*i))*this.radius)
		    context.lineTo(this.firstVertex.x,this.firstVertex.y);
	    }
	    if(this.isTimeToSell()){
			context.fillStyle = '#FFDF00'
	    }
	    else{
			context.fillStyle = '#FFFFFF';
	    }
		context.strokeStyle = '#FFFFFF';
	    context.fill();
		context.globalAlpha = 1;
		context.stroke();
	    context.closePath();
	}
	arrow.prototype.toString = function(){
		var str = this.location.toString() + ", [" + this.velocity.toString() + "," + this.velocity.magnitude() + "]," //+  this.force.toString() + "," + this.separationForce.toString() + "," + this.alignForce.toString() + "," + this.cohesionForce.toString()
		return str;
	}

	function animalPopulation(size){
		this.curSize = size;
		this.curValue = 0;
		this.arrows = [];
		this.avgHealth = 0;
		this.avgEnergy = 0;
		this.avgAge = 0;
		this.avgValue = 0;
		this.debugArr = [["Pop. Size: ", 0], ["avg. Health: ", 0], ["avg. Energy: ", 0], ["avg. Age: ", 0], ["avg. Value: ", 0]];		

		this.addArrows = function(numArrows){
			for(var i = 0; i < numArrows; i++){
				this.addArrow(new arrow(1,canvas.width/2,canvas.height/2,Math.random()*10-5,Math.random()*10-5));
			}
		}
		this.addArrow = function(arrow){
			this.arrows.push(arrow);
		}
		this.removeArrows = function(numArrows){
			console.log("Original frame rate: ",frameRate,"number of arrows originally:",this.arrows.length);
			console.log("removed",(this.arrows.length - numArrows),"arrows to increase frame rate.")
			this.arrows = this.arrows.splice(this.arrows.length-numArrows,this.arrows.length);
			console.log("Total number of arrows is now:",this.arrows.length);
		}
		this.update = function(){
			this.curSize = 0;
			this.avgHealth = 0;
			this.avgEnergy = 0;
			this.avgAge = 0;
			this.curValue = 0;
			this.avgValue = 0;
			for(var i = 0; i < this.arrows.length; i++){
				this.arrows[i].update(i,this.arrows,0.4);
				this.curValue+=this.arrows[i].value;
				if(/*isDebug &&*/ this.arrows[i].health > 0){
					this.avgHealth += this.arrows[i].health;
					this.avgEnergy += this.arrows[i].energy;
					this.avgAge += this.arrows[i].age;
					this.avgValue += this.arrows[i].value;
				}
				if(this.arrows[i].health > 0){
					this.curSize++;
				}
			}
			if(/*isDebug &&*/ this.curSize > 0){
				this.avgHealth /= this.curSize;
				this.avgEnergy /= this.curSize;
				this.avgAge /= this.curSize;
				this.avgValue = this.curValue;
				this.avgValue /= this.curSize;
			}
			this.updateDebugArr();
		}
		this.updateDebugArr = function(){
			this.debugArr[0][1] = Math.floor(this.curSize);
			this.debugArr[1][1] = Math.floor(this.avgHealth);
			this.debugArr[2][1] = Math.floor(this.avgEnergy);
			this.debugArr[3][1] = Math.floor(this.avgAge);
			this.debugArr[4][1] = Math.floor(this.avgValue);
		}
		this.draw = function(){
			for(var i = 0; i < this.arrows.length; i++){
				this.arrows[i].draw();
			}
			if(true){
				var newArr = [];
				for(var i = 0; i < this.debugArr.length; i++){
					newArr.push(this.debugArr[i][0] + this.debugArr[i][1]);
				}
				writeMultiLine(newArr, canvas.width-400,canvas.height-70,"left");
			}
		}
		this.sell = function(coord1,coord2){
			var cash = 0;
			for(var i = this.arrows.length-1; i >= 0; i--){
				if(this.inArea(this.arrows[i].location,coord1,coord2)){
					cash+= this.arrows[i].value;
					this.arrows.splice(i,1);
				}
			}
			return cash;
		}
		this.inArea = function(point,coord1,coord2){
			if((point.x >= coord1.x && point.x <= coord2.x) && (point.y >= coord1.y && point.y <= coord2.y)){return true;}
			if((point.x >= coord2.x && point.x <= coord1.x) && (point.y >= coord1.y && point.y <= coord2.y)){return true;}
			if((point.x >= coord2.x && point.x <= coord1.x) && (point.y >= coord2.y && point.y <= coord1.y)){return true;}
			if((point.x >= coord1.x && point.x <= coord2.x) && (point.y >= coord2.y && point.y <= coord1.y)){return true;}
			return false;
		}
		this.addArrows(size);
	}
	function getLines(startAndEndVs){
		var lines = [];
		for(var i = 0 ; i < startAndEndVs.length; i++){
			lines.push(new lineSegment(startAndEndVs[i][0],startAndEndVs[i][1]));
		}
		return lines;
	}
	function getBox(width,height,upperX,upperY){
		var UL = new vector(upperX,upperY);
		var UR = new vector(upperX+width,upperY);
		var LL = new vector(upperX,upperY+height);
		var LR = new vector(upperX+width,upperY+height);
		//creates a rectangle
		return getLines([[UL,UR],[UL,LL],[LL,LR],[UR,LR]]);
	}
	function getPolygon(points){
		var arr = [];
		for(var i = 0 ; i < points.length-1; i++){
			var v1 = new vector(points[i][0],points[i][1]);
			var v2 = new vector(points[i+1][0],points[i+1][1]);
			arr.push([v1,v2]);
		}
		return getLines(arr);
	}
	function addLine(startV,endV,lineArr){
		lineArr.push(new lineSegment(startV,endV));		
	}
	function convert1dTo2d(arr){
		var twoDArr = [];
		for(var i = 0; i < arr.length-1; i=i+2){
			twoDArr.push([arr[i],arr[i+1]]);
		}
		return twoDArr;
	}
	function drawMouseLine(){
		if(numClicks%2==1){
			var context = canvas.getContext('2d');
		    if(lineType == "add"){
				context.save();
				context.beginPath();
				context.moveTo(clickLocation.x,clickLocation.y);
				context.lineTo(mouseLocation.x,mouseLocation.y);
				context.strokeStyle = '#FFFFFF'
				context.stroke();			
				context.closePath();			
				context.restore();
	    }
		    else if(lineType == "remove"){
				context.save();
				context.beginPath();
				context.moveTo(clickLocation.x,clickLocation.y);
				context.lineTo(mouseLocation.x,mouseLocation.y);
				context.strokeStyle = '#FF0000'
				context.stroke();			
				context.closePath();			
				context.restore();
		    }
		    else if(lineType == "sell"){
		    	drawBox(context, clickLocation.x,clickLocation.y,mouseLocation.x,mouseLocation.y,'#FFFFFF','#D3D3D3',0.2);
		    }
		}
	}
	function drawBox(context, px,py,qx,qy,strokeColor,fillColor, alpha){
		context.save();
		context.beginPath();
		context.moveTo(px,py);
		context.lineTo(px,qy);
		context.lineTo(qx,qy);
		context.lineTo(qx,py);
		context.lineTo(px,py);
		context.strokeStyle = strokeColor;//'#FFFFFF'
		context.fillStyle = fillColor;//'#D3D3D3'
		context.globalAlpha = alpha;//0.2;
		context.fill();
		context.globalAlpha = 1;
		context.stroke();			
		context.closePath();			
		context.restore();
	}

	function setEventListeners(){
		window.onresize = setCanvasSize;
		document.getElementById("runner").addEventListener("click",function(e){
			numClicks++;
			var x;
			var y;
			if (e.pageX || e.pageY) { 
				x = e.pageX;
				y = e.pageY;
			}
			else { 
				x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
				y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
			} 
			x -= canvas.offsetLeft;
			y -= canvas.offsetTop;

			//if we want to draw the walls:
			if(numClicks%2==0 && lineType == "add"){ //add a line
				oldLines.length = 0;
				addLine(clickLocation,new vector(x,y),lines);
			}
			else if(numClicks%2==0 && lineType == "remove"){ //remove a line
				var mouseLine = new lineSegment(clickLocation,new vector(x,y));
				for(var i = lines.length - 1; i >= 0; i--){
					if(lines[i].doIntersect(mouseLine)){
						var line = lines.splice(i,1);
						console.log(line);
						oldLines.push(line[0]);
					}
				}
			}
			else if(numClicks%2==0 && lineType == "sell"){ //sell sheep
				//sell the sheep
				var sale=animalPop.sell(clickLocation,mouseLocation);
				if(loan - sale >= 0){
					loan-=sale;
				}
				else if(loan > 0){
					sale-=loan;
					loan = 0;
					cash+=sale;
				}
				else{
					cash+=sale;
				}
			}
			else{
				clickLocation = new vector(x,y);
			}
			if(keys[16] && numClicks%2==0){//shift
				clickLocation = new vector(x,y);
				numClicks++;
			}
			if(keys[18]){//alt
				lineType = "remove";
			}
			else if(keys[83]){//S
				lineType = "sell";
			}
			else{
				lineType = "add";
			}
		});
		document.getElementById("runner").addEventListener("mousemove",function(e){
			var x;
			var y;
			if (e.pageX || e.pageY) { 
				x = e.pageX;
				y = e.pageY;
			}
			else { 
				x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
				y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
			} 
			x -= canvas.offsetLeft;
			y -= canvas.offsetTop;
			mouseLocation.setValues(x,y);
		});
		// document.getElementById("runner").addEventListener("mouseout",function(e){
		// 	isPaused = true;
		// })	

		// document.getElementById("runner").addEventListener("mouseover",function(e){
		// 	isPaused = false;
		// })	

		window.addEventListener("keydown", function (e) {
			keys[e.keyCode] = true;
			if((e.keyCode == 32 || e.keyCode == 38 || e.keyCode == 40)  && e.target == document.body) {
				e.preventDefault();
				return false;
			}
			if(e.keyCode == 68){ //D
				isDebug = !isDebug;
			}
		});
		window.addEventListener("keyup", function (e) {
			keys[e.keyCode] = false;
		});

		window.mobilecheck = function() {
			var check = false;
			(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
			return check;
		};
	}

	function updateFrameRate(){
		numFrames++;
		if(timeDiff() > 100){
			time[0] = Date.now();
			time[1] = Date.now();
			frameRate = numFrames*10;
			numFrames = 0;
			optimizedSize = false;
		}
	}
	function setCanvasSize(){
		var heightWithoutCanvas = document.getElementById('header').offsetHeight+document.getElementById('footer').offsetHeight;
		var totalHeight = document.body.scrollHeight;
		canvas.width  = window.innerWidth;
		canvas.height = Math.max(totalHeight-(heightWithoutCanvas+120),100);
		console.log(canvas.height,heightWithoutCanvas);
	}

	function checkKeys(){
		if(keys[90] && !removedLine){ //Z
			removedLine = true;
			var line = lines.pop();
			if(typeof line !== 'undefined'){
				oldLines.push(line);
			}
		}
		if(!keys[90]){//not Z
			removedLine = false;
		}
		if(keys[88] && !reAddedLine){//X
			reAddedLine = true;
			var line = oldLines.pop();
			if(typeof line !== 'undefined'){
				lines.push(line);
			}
		}
		if(!keys[88]){ //not X
			reAddedLine = false;
		}
		if(keys[65]){ //A

			if(cash-costOfSheep < -2000){loan+=(costOfSheep);}
			else if(cash-costOfSheep >= -2000 && cash-costOfSheep < 0){ loan += -(cash-costOfSheep);}
			else{cash -= costOfSheep;}
			animalPop.addArrow(new arrow(1,mouseLocation.x,mouseLocation.y,Math.random()*10-5,Math.random()*10-5));
		}
		if(keys[27]){//ESC
			numClicks = (numClicks%2==0)?numClicks : numClicks+1;
		}
		//isPaused = keys[80]; //P
	}
	function write(text,x,y,font,textAlign){
	var context = canvas.getContext('2d');
	context.save();	
	context.font=font;
	context.textAlign = textAlign;
	context.fillStyle = '#FFFFFF';
	context.lineWidth = 2;
	context.fillText(text,x,y);
	context.restore();	
	}
	function writeMultiLine(textArr,startX,startY,textAlign){
		var fontSize = 13;
		var buffer = 2;
		var font = "bold " + fontSize + "px Arial";
		var widestStrSize = 0;
		var textBoxHeight = fontSize * textArr.length * buffer;
		var context = canvas.getContext('2d');
		for(var i = 0; i < textArr.length; i++){
			widestStrSize = Math.max(context.measureText(textArr[i]).width,widestStrSize);
		}
		//drawBox(context, startX-buffer,startY-buffer,textBoxHeight+buffer,widestStrSize+buffer,'#FFFFFF','#D3D3D3',0.2);
		for(var i = 0; i < textArr.length; i++){
			write(textArr[i],startX,startY+i*(fontSize+buffer),font,textAlign);
		}
	}

	function init(){
		setEventListeners();
		setCanvasSize();
		var heart = [[867,455],[901,393],[923,338],[935,287],[935,233],[935,185],[909,123],[883,93],[846,60],
				  	[811,53],[765,53],[738,75],[716,125],[695,91],[667,66],[644,63],[608,65],[581,68],[551,93],
				  	[525,136],[509,168],[504,220],[506,279],[517,319],[541,364],[567,400],[594,433],[629,454],
				  	[674,484],[718,503],[750,521],[783,527]]
		lines = getPolygon(heart);	
		if(window.mobilecheck()){
			animalPop = new animalPopulation(50);
			document.getElementById("footer").style.fontsize = "20px";
		}
		else{
			animalPop = new animalPopulation(750);
		}
		lands = new land(50);
		window.requestAnimationFrame(draw);
	}
	function timeDiff(){
		return time[1]-time[0];
	}
	function draw() {
		checkKeys();

		updateFrameRate();

		var context = canvas.getContext('2d');	
		context.clearRect(0,0,canvas.width,canvas.height); // clear canvas

		//removes 1/3 of the array if the frame rate is too low
		if(frameRate < 20 && optimizedSize == false){
			optimizedSize = true;
			var removeSize = animalPop.curSize*3/4;
			animalPop.removeArrows(removeSize);
		}
		if(!isPaused){
			lands.update();
			animalPop.update();
		}
		lands.draw();
		for(var i = 0; i < lines.length; i++){
			lines[i].draw();
		}
		animalPop.draw();
		drawMouseLine();

		if(isPaused){
			write("PAUSED",canvas.width/2,canvas.height/2,"bold 13px Arial","center");
		}
		writeMultiLine(["Cash $"+Math.floor(cash), "Assets: $" + Math.floor(animalPop.curValue),"Loan: $" + Math.floor(loan)],canvas.width-280,canvas.height-70,"left");
		write("Version: "+version,canvas.width-100,canvas.height-10,"bold 13px Arial","left")
		time[1]=Date.now();
		window.requestAnimationFrame(draw);
	}
	init();
}
animations();