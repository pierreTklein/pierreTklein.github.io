	//TODO:
	//  •space ships should bounce off of the walls perhaps?
	//  •limit the velocity of space ships
	//  •add a 'game win' at a certain number of won rounds
	//  •perhaps add a source of fuel?
	//  •Neural Network training?!
	//OTHER not so important stuff to do:
	//	•glowing sun, shadow effect on planets
	//	•add point mass capability
	//	•if paused is true, then you should be able to change the velocities of the bodies
	//
function run(){

	//GLOBAL VARIABLES:
	var dt = 0.2;
	//boolean value that determines whether the game is currently paused or not:
	var isPaused = false;

	//boolean value that determines whether to show the debug elements of the various bodies:
	var isDebug = false;

	//boolean value that determines whether we are in the "remove mode" of the game:
	var isRemoving = false;

	//gravitational constant
	var G = 0.5;

	//maximum and current sun masses:
	var maxSunMass = 20000;
	var curSunMass = 10000;

	//the number of suns in the game:
	var numSuns = 0;

	//initializes the system:
	var bodies = getSystem(0);
	var scenario = numSuns;
	var spaceShips = getMultipleSpaceShips(scenario);
	var bounceOffWalls = true;
	//boolean value that determines whether we loop the space ship explosion animation over and over again:
	var loopExplosion = false;

	//array that stores whether a key is being pressed:
	var keys = [];

	var countdown = true;
	var countDownNumber = 3;
	var countDownTime = [Date.now(),Date.now()];
	var scoreBoard = [0,0];	
	var winner = "";
	var someoneWon = false;
	var winCountDown = [Date.now(),Date.now()];

	//plugin for music:

	//var isMusicPlaying = false;
	// soundManager.url = './cgi-bin/soundmanager/swf/';

	// soundManager.onready(function() {
	//     soundManager.createSound({
	//         id: 'mySound',
	//         url: './cgi-bin/interstellar.mp3'
	//     });
	//     // ...and play it
	//     soundManager.play('mySound');
	// });

	//boolean value that determines whether the game is in "collision" mode (i.e. whether the bodies pass over each other or not):
	var collisionEnabled = true;

	//this is the variable that holds the current body being created by click with mouse:
	var curBody = null;

	//if mouse is creating body:
	var isCreatingBody = false;

	//start time of body creation via mouse, and end time:
	var start;
	var end;


	//zoom property:
	var scale = 1;

	//to check frame rate:
	var elapsedTime = [Date.now(),Date.now()];
	var numFrames = 0;
	var frameRate = 1;


	//body object:
	function body(name, mass, x, y, dx, dy,isStationary){
		this.name = name;
		this.x = x;
		this.y = y;
		this.mass = mass;
		this.radius = Math.sqrt(this.mass/Math.PI);
		this.dx = dx;
		this.dy = dy;

		//counts the number of masses it is 
		this.numMasses = 1;

		//color of the body:
		this.color = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';

		//for debug purposes, to see what the maximum velocity the body achieved:
		this.maxV = 0;
		this.isStationary = isStationary;

		//the vectors for location and velocity:
		this.location = [this.x,this.y];
		this.velocity = [this.dx,this.dy];

		//this is if collisions are enabled; if this body collides with another body, then I flag this body for removal.
		this.flagRemove = false;

		//These variables are just to make sure we don't continuously remake new arrays every time we update the body:
		//•distanceTo: variable used to store the distance from current body to another body
		this.distanceTo = [0,0];
		//•finalForce: variable used to store the sum of the forces of all other bodies upon this body
		this.finalForce = [0,0];
		//•vectorForce: stores the force of one body on this one, in vector form
		this.vectorForce = [0,0];
		this.update = function(allBodies,index,dt){
			//if the body is not stationary, then calculate the movement of the body
			if(!this.isStationary){
				this.curForce = this.totalForce(allBodies,index);
				//note that there is a multiplier to make the game faster:
				this.dx += (this.curForce[0]*(dt*5)) / this.mass;
				this.dy += (this.curForce[1]*(dt*5)) / this.mass;
				this.x+=this.dx*dt;
				this.y+=this.dy*dt;
				this.location[0] = this.x;
				this.location[1] = this.y;
				this.velocity[0] = this.dx;
				this.velocity[1] = this.dy;
				this.maxV = Math.max(this.maxV,this.getMagnitude());
				this.checkBoundary();
			}
		}
		//updates the radius based off of the current mass
		this.updateRadius=function(){
			this.radius = Math.sqrt(this.mass/Math.PI);
		}
		//returns the location in vector format
		this.getLocation=function(){
			return this.location;
		}
		//returns the velocity in vector format
		this.getVelocity=function(){
			return this.velocity;
		}
		//returns the magnitude of the velocity
		this.getMagnitude = function(){
			return Math.sqrt(Math.pow(this.dx,2)+Math.pow(this.dy,2));
		}
		//sets the velocity of the body
		this.setVelocity = function(dx,dy){
			if(!isStationary){
				this.dx = dx;
				this.dy = dy;
				this.velocity[0] = this.dx;
				this.velocity[1] = this.dy;
			}
		}
		//resets the current location, velocity, and mass of the object to the value it was created with
		this.reset=function(){
			this.x = x;
			this.y = y;
			this.dx = dx;
			this.dy = dy;
			this.mass = mass;
		}
		//assigns a random velocity to the body
		this.setRandomVelocity=function(){
			this.dx = (Math.random()*2-1)*Math.random()*10;
			this.dy = (Math.random()*2-1)*Math.random()*10;
			this.velocity[0] = this.dx;
			this.velocity[1] = this.dy;
		}
		//returns the distance from this body to the other body, in magnitude format
		this.getDistance=function(otherBody){
			var otherLocation = otherBody.getLocation();
			this.distanceTo[0] = (this.x-otherLocation[0]);
			this.distanceTo[1] = (this.y-otherLocation[1]);
			var magnitudeDistance = Math.sqrt(Math.pow(this.distanceTo[0],2)+Math.pow(this.distanceTo[1],2));
			return magnitudeDistance;
		}
		//sets the mass of the body AND updates the radius
		this.setMass=function(mass){
			this.mass = mass;
			this.updateRadius();
		}
		//calculates the force all other bodies have on this current body. OtherBodies is an array containing other body objects, 
		//and index is the index in the array that this current body is in. 
		//ex: this = D, otherBodies = [A,B,C,D,E], index = 3.
		this.totalForce = function(otherBodies,index){
			this.finalForce[0] = 0;
			this.finalForce[1] = 0;
			for(var i = 0; i < otherBodies.length; i++){
				//if this object and the object at index i are valid bodies (i.e. they are not flagged for removal), then calculate the force between them: 
				if(this.isValidBody(i,index,otherBodies)){
					var otherBody = otherBodies[i];
					var otherLocation = otherBody.getLocation();
					var magnitudeDistance = this.getDistance(otherBody);
					var touching = this.isTouching(otherBody);
					if(touching){
						//if the bodies are overlapping, determine how to react
						this.calculateTouching(otherBody, otherLocation, magnitudeDistance);
					}
					else{
						var partialForce =-G * (this.mass * otherBody.mass)/Math.pow(magnitudeDistance,2);
						this.vectorForce[0] = partialForce*(this.distanceTo[0]/magnitudeDistance);
						this.vectorForce[1] = partialForce*(this.distanceTo[1]/magnitudeDistance);
						this.finalForce[0] += this.vectorForce[0];
						this.finalForce[1] += this.vectorForce[1];
					}
				}
			}
			return this.finalForce;
		}
		//if the body at index "index" is not the same as the current body (at index i), and both bodies have not been flagged for removaL
		this.isValidBody = function(i,index,otherBodies){
			if(i != index && !otherBodies[i].flagRemove && !this.flagRemove){return true;}
			else{return false;}
		}
		//calculates by how much the two bodies are touching, and whether to amalgamate them
		this.calculateTouching = function(otherBody, otherLocation, magnitudeDistance){
			//if collisions are enabled and the distance between the two bodies is less than one of the radii, then amalgamate the two bodies into one.
			if(collisionEnabled && (magnitudeDistance < this.radius || magnitudeDistance < otherBody.radius)){
				//calculates the new mass and new velocity based off of inelastic collisions:
				var newMass = this.mass+otherBody.mass;
				var newdx = (this.dx*this.mass+otherBody.dx*otherBody.mass)/newMass;
				var newdy = (this.dy*this.mass+otherBody.dy*otherBody.mass)/newMass;
				
				//chooses the name of the larger mass:
				//var newName = (this.mass > otherBody.mass) ? this.name : otherBody.name;
				
				//combines the two names together:
				var newName = (this.mass > otherBody.mass) ? this.name+otherBody.name.charAt(0) : otherBody.name+this.name.charAt(0);

				//if one of the two bodies is stationary, then the resultant body will also be stationary
				var isStat  = (this.isStationary || otherBody.isStationary) ? true : false;

				//the first two if-else cases are for when either this body, or the other body is the Sun. 
				//If so, then we need to make sure that the sun is the one staying alive.
				if(this.name == "Sun"){
					this.setMass((newMass>maxSunMass)?maxSunMass:newMass);
					this.isStationary = isStat;
					otherBody.flagRemove = true;
					curSunMass = this.mass;
				}
				else if(otherBody.name == "Sun"){
					otherBody.setMass((newMass>maxSunMass)?maxSunMass:newMass);
					otherBody.isStationary = isStat;
					this.flagRemove = true;
					curSunMass = otherBody.mass;
				}//The other two cases are for regular situations. Kill the body with a lower mass basically by flagging it for removal
				else if(this.mass<otherBody.mass){
					otherBody.setMass(newMass);
					otherBody.setVelocity(newdx,newdy);
					otherBody.name = newName;
					otherBody.isStationary = isStat;
					this.flagRemove = true;
				}
				else{
					this.setMass(newMass);
					this.setVelocity(newdx,newdy);
					this.name = newName;
					this.isStationary = isStat;
					otherBody.flagRemove = true;
				}

				//console.log("Conglomeration");

			}
			else{
				//this is for when collisions are not enabled, or for when the magnitude of overlap is not significant enough.
				//The distance between the two forces is the radius of this body + the radius of the other body,
				//so that we limit the wackiness of the forces
				var radiusDistance = (this.radius+otherBody.radius);
				var partialForce =-G * (this.mass * otherBody.mass)/Math.pow(radiusDistance,2);
				//to make sure we don't have a divide-by-zero error
				if(magnitudeDistance == 0){
					this.vectorForce[0] = 0;
					this.vectorForce[1] = 0;
				}
				else{
					this.vectorForce[0] = partialForce*(this.distanceTo[0]/magnitudeDistance);
					this.vectorForce[1] = partialForce*(this.distanceTo[1]/magnitudeDistance);
					this.finalForce[0] += this.vectorForce[0];
					this.finalForce[1] += this.vectorForce[1];
				}
			}
		}
		//draws the circle onto the canvas, with a boolean value as to whether debug is set or not.
		this.drawImg=function(context,debug){
			var canvas = document.getElementById('runner');
			var centerX = this.x*scale+canvas.width/2;
			var centerY = this.y*scale+canvas.height/2;
			var radius = this.radius*scale
			context.beginPath();
			context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
			context.fillStyle = this.color;
			context.fill();
			//draws the border of the circle in a darker shade
			context.lineWidth = radius/10;
			context.strokeStyle = ColorLuminance(this.color,-0.5);
			context.stroke();
			if(debug){
				context.closePath();
				this.debug(context,centerX,centerY);
			}

			context.closePath();
			//console.log("drew!");
		}
		//draws the debug elements of the body on context. Takes as input the 
		this.debug = function(context,centerX,centerY){
			context.lineWidth = 3;
			context.font="12px Georgia";
			context.fillStyle = 'white';
			context.fillText("Name: "+this.name, centerX,centerY+5);
			context.closePath();
			context.beginPath();
			context.moveTo(centerX, centerY);
			context.lineTo(centerX+this.dx*2*scale, centerY+this.dy*2*scale);
			context.strokeStyle = 'red';
			context.stroke();
			context.closePath();
			context.beginPath();
			context.moveTo(centerX, centerY);
			context.lineTo(centerX+this.finalForce[0]*2*scale, centerY+this.finalForce[1]*2*scale);
			context.strokeStyle = 'green';
			context.stroke();
		}
		this.isTouching=function(other){
			var otherRadius = other.radius;
			var distance = this.getDistance(other);
			if(distance < otherRadius+this.radius){
				return true;
			}
			else{
				return false;
			}
		}
		this.checkBoundary = function(){
			var canvas = document.getElementById('runner');
			var context = canvas.getContext('2d');
			var canvasX = this.x*scale+canvas.width/2;
			var canvasY = this.y*scale+canvas.height/2;
			var maxX = canvas.width;
			var maxY = canvas.height;
			canvasX = (canvasX > maxX)? 0 : ((canvasX < 0 )?maxX : canvasX);
			canvasY = (canvasY > maxY)? 0 : ((canvasY < 0 )?maxY : canvasY);
			if(canvasX == maxX || canvasX == 0){
				this.x = (canvasX-canvas.width/2)/scale;
				//this.dx = -this.dx;
			}
			if(canvasY == maxY || canvasY == 0){
				this.y = (canvasY-canvas.height/2)/scale;
				//this.dy = -this.dy;
			}
		}
	}
	//scenario 0 is for when there are 0 stars. 1 is for 1 star, and 2 is for two stars. Other stars have a default case.
	function getMultipleSpaceShips(scenario){
		if(scenario == 0){
			var p1 = getSpaceShip("player_1",200,-300,0,0,0,false);
			var p2 = getSpaceShip("player_2",200,300,0,0,0,false);
			p2.vehicleAngle = Math.PI;
			return [p1,p2]
		}
		else if(scenario == 1){
			var p1 = getSpaceShip("player_1",200,150,150,7,-7,false);
			var p2 = getSpaceShip("player_2",200,-150,150,7,7,false);
			return [p1,p2]
		}
		else if(scenario == 2){
			var p1 = getSpaceShip("player_1",200,270,200,10.1,-10.1,false);
			var p2 = getSpaceShip("player_2",200,-270,200,10.1,10.1,false);
			return [p1,p2]
		}
		else{
			var p1 = getSpaceShip("player_1",200,0,200,10.3,0,false);
			var p2 = getSpaceShip("player_2",200,-270,200,10.1,10.1,false);
			return [p1,p2]
		}
	}

	//this creates a body object, with specific properties that adhere only to that body.
	function getSpaceShip(name,mass,x,y,dx,dy,isStationary){
		var spaceShip = new body(name,mass,x,y,dx,dy,isStationary);
		var shipImgs = [new Image(),new Image(),new Image()];
		var j = 0;
		for(var i = 0; i < shipImgs.length; i++){
			shipImgs[i].src = "./images/spaceShip/"+spaceShip.name+"/"+j+".png"
			j+=5;
		}

		//array of sprites for the animation of the explosion
		var crashImgs = [new Image(),new Image(),new Image(),new Image(),
						new Image(),new Image(),new Image(),new Image(),
						new Image(),new Image(),new Image(),new Image(),
						new Image(),new Image(),new Image(),new Image(),
						new Image(),new Image(),new Image(),new Image()];
		//set the sources for each of the images:
		for(var i = 0; i < crashImgs.length; i++){
			crashImgs[i].src = "./images/explosion/"+i+".png"
		}
		//variable that stores the png of the thrust:
		spaceShip.thrustSprite = new Image();
		spaceShip.thrustSprite.src = "./images/spaceShip/flameSprite.png"
		spaceShip.allImgs = shipImgs;
		//current image that will be shown on the canvas:
		spaceShip.mainImg = shipImgs[1];
		//the angle the space ship is facing:
		spaceShip.vehicleAngle = 0;
		//the current force of the thruster:
		spaceShip.thrusterForce = 0;
		//the angle of the velocity of the space ship:
		spaceShip.thrusterAngle = 0;
		//the force of the thruster, when firing: 
		spaceShip.maxThrusterForce = 200;
		//boolean value determining whether the space ship has crashed
		spaceShip.hasCrashed = false;
		//when crashed, this variable stores the current frame in the explosion animation:
		spaceShip.gifFrame = 0;
		//counts the number of update cycles when the ship has crashed: 
		spaceShip.numFrames = 0;
		//whether the thruster is firing or not:
		spaceShip.isThrusting = false;
		//total number of bullets in a space ship:
		spaceShip.numBullets = 1000;
		//the mass of each bullet:
		spaceShip.bulletMass = 10;
		//the name of each bullet:
		spaceShip.bulletName = spaceShip.name + "'s bullet"

		//function that resets the space ship to original settings when it was first created
		spaceShip.reset = function(){
			spaceShip.mainImg = shipImgs[1];
			spaceShip.vehicleAngle = 0;
			spaceShip.thrusterForce = 0;
			spaceShip.thrusterAngle = 0;
			spaceShip.hasCrashed = false;
			spaceShip.gifFrame = 0;
			spaceShip.numFrames = 0;
			spaceShip.numBullets = 1000;
			this.x = x;
			this.y = y;
			this.dx = dx;
			this.dy = dy;
			this.mass = mass;
		}

		//setter method for angle
		spaceShip.changeAngle = function(dA){
			this.vehicleAngle+=dA
			if(this.vehicleAnlge>2){this.vehicleAngle = 2-this.vehicleAngle;}
			if(this.vehicleAnlge<0){this.vehicleAngle = 2+this.vehicleAngle;}
		}
		//setter method for thrust
		spaceShip.setThrust = function(thrust){
			this.thrusterForce = thrust;
		}
		//if this is called, it will initiate the crashing
		spaceShip.calculateTouching = function(otherBody, otherLocation, magnitudeDistance){
			if(collisionEnabled){
				this.hasCrashed = true;
				//change the velocity and force to 0:
				this.dx = 0;
				this.dy = 0;
				this.velocity[0] = 0;
				this.velocity[1] = 0;
				this.curForce[0] = 0;
				this.curForce[1] = 0;
				this.finalForce[0] = 0;
				this.finalForce[1] = 0;

			}
		}

		//checks to see which keys are currently pressed:
		spaceShip.checkKeys = function(dt){
			//two space ships, different controls. 
			//Player 1 has WASD for forward, left, backwards, and right. Shift for firing.
			//Player 2 has Up, Down, Left, and Right. Right option for firing.
			if(this.name == "player_1"){
				if(keys[87]){//W
					this.mainImg = shipImgs[1];
					this.setThrust(this.maxThrusterForce*dt);
					this.isThrusting = true;
				}
				if(keys[67]){//C
					this.shoot();
				}
				if(keys[83]){//S
					this.mainImg = shipImgs[1];
					this.setThrust(-this.maxThrusterForce*dt);		
					this.isThrusting = false;
				}
				if(keys[65]){//A
					this.mainImg = shipImgs[0];
					spaceShip.changeAngle(-0.2*dt);
				}		
				if(keys[68]){//D
					this.mainImg = shipImgs[2];
					spaceShip.changeAngle(0.2*dt);
				}
				if(!keys[68]&&!keys[65]){//if not leaning
					this.mainImg = shipImgs[1];
				}
				if(!keys[87]){//if not thrusting
					this.isThrusting = false;
				}
			}
			else if(this.name == "player_2"){
				if(keys[38]){//up
					this.mainImg = shipImgs[1];
					this.setThrust(this.maxThrusterForce*dt);
					this.isThrusting = true;
				}
				if(keys[188]){//<
					this.shoot();
				}
				if(keys[40]){//down
					this.mainImg = shipImgs[1];
					this.setThrust(-this.maxThrusterForce*dt);		
					this.isThrusting = false;
				}
				if(keys[37]){//left
					this.mainImg = shipImgs[0];
					spaceShip.changeAngle(-0.2*dt);
				}		
				if(keys[39]){//right
					this.mainImg = shipImgs[2];
					spaceShip.changeAngle(0.2*dt);
				}
				if(!keys[37]&&!keys[39]){//if not left or right
					this.mainImg = shipImgs[1];
				}
				if(!keys[38]){//if not up
					this.isThrusting = false;
				}
			}
		}
		//shoot function, creates a new body
		spaceShip.shoot = function(){
			if(this.numBullets > 0){
				var bDx = this.dx + Math.cos(this.vehicleAngle)*10;
				var bDy = this.dy + Math.sin(this.vehicleAngle)*10;
				var x = this.x + Math.cos(this.vehicleAngle)*10
				var y = this.y + Math.sin(this.vehicleAngle)*10
				var bullet = new body(this.bulletName,this.bulletMass,x,y,bDx,bDy,false);
				bodies.push(bullet);
				this.numBullets--;
			}
		}
		//updates force, velocity, location, heading:
		spaceShip.update = function(allBodies,index,dt){
			if(!this.isStationary && !this.hasCrashed){
				this.checkKeys(dt);
				this.curForce = this.totalForce(allBodies,index);
				this.curForce[0]+= this.thrusterForce*Math.cos(this.vehicleAngle);
				this.curForce[1]+= this.thrusterForce*Math.sin(this.vehicleAngle);
				this.thrusterForce = 0;
				this.dx += (this.curForce[0]*(dt*5)) / this.mass;
				this.dy += (this.curForce[1]*(dt*5)) / this.mass;
				this.x+=this.dx*dt;
				this.y+=this.dy*dt;
				this.location[0] = this.x;
				this.location[1] = this.y;
				this.velocity[0] = this.dx;
				this.velocity[1] = this.dy;
				//this.maxV = Math.max(this.maxV,this.getMagnitude());
				if(this.getMagnitude()!=0){
					//y coordinate first, then x coordinate
					this.thrusterAngle = Math.atan2(this.dy/this.getMagnitude(),this.dx/this.getMagnitude());
				}
				this.checkBoundary();
			}
		}
		//checks to see if the given body should be taken into consideration when calculating the total force
		spaceShip.isValidBody = function(i,index,otherBodies){
			if(i != index && !otherBodies[i].flagRemove && !this.flagRemove && otherBodies[i].name!=this.bulletName){return true;}
			else{return false;}
		}

		//draw debug function
		spaceShip.debug=function(context,centerX,centerY){
			context.font="12px Georgia";
			context.fillStyle = 'white';
			context.fillText("Name: "+this.name+", num bullets: "+this.numBullets, centerX,centerY+5);
			context.closePath();
			context.beginPath();
			context.moveTo(centerX, centerY);
			context.lineTo(centerX+this.dx*2*scale, centerY+this.dy*2*scale);
			context.strokeStyle = 'red';
			context.stroke();
			context.closePath();
			context.beginPath();
			context.moveTo(centerX, centerY);
			context.lineTo(centerX+this.finalForce[0]*2*scale, centerY+this.finalForce[1]*2*scale);
			context.strokeStyle = 'green';
			context.stroke();
		}
		spaceShip.drawImg = function(context,debug){
			// save the current co-ordinate system before we screw with it lol
			context.save(); 
			var canvas = document.getElementById('runner');
			var centerX = this.x*scale+canvas.width/2;
			var centerY = this.y*scale+canvas.height/2;
			// move to the middle of where we want to draw our image
			context.translate(centerX,centerY);
			// rotate around that point, converting our angle from degrees to radians 
			context.rotate(this.vehicleAngle + Math.PI/2);
			// draw it up and to the left by half the width and height of the image 

			//if the space ship has crashed:
			if(this.hasCrashed){
				//cycle through the explosion animation:
				if(!loopExplosion){
					if(this.gifFrame < crashImgs.length){ this.mainImg = crashImgs[this.gifFrame]; }
					if(this.numFrames > 4){
						this.gifFrame +=1;
						this.numFrames = 0;
					}
					else{
						this.numFrames++;
					}
				}			
				else if(loopExplosion){
					this.mainImg = crashImgs[this.gifFrame];	
					if(this.numFrames > 4){
						this.gifFrame =(this.gifFrame + 1 > 18)? 0 : this.gifFrame + 1;
						this.numFrames = 0;
					}
					else{
						this.numFrames++;
					}
				}
				//draw the image:
				context.scale(scale*this.mass/300,scale*this.mass/300);
				context.drawImage(this.mainImg, -(this.mainImg.width/2), -(this.mainImg.height/2));

				// and restore the co-ords to how they were when we began
				context.restore(); 

			}
			else{
				context.scale(scale*this.mass/400,scale*this.mass/400);
				context.drawImage(this.mainImg, -(this.mainImg.width/2), -(this.mainImg.height/2));
				if(this.isThrusting){
					context.drawImage(this.thrustSprite, -this.thrustSprite.width/2, (this.mainImg.height/2)-10);
					console.log("drew sprite")
				}

				context.restore(); 
			}
			if(debug){
				//draw debugger value
				this.debug(context,centerX,centerY);
			}

		}
		return spaceShip;
	}


	//to calculate increase / decrease in luminescence 
	function ColorLuminance(hex, lum) {
		// validate hex string
		hex = String(hex).replace(/[^0-9a-f]/gi, '');
		if (hex.length < 6) {
			hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
		}
		lum = lum || 0;
		// convert to decimal and change luminosity
		var rgb = "#", c, i;
		for (i = 0; i < 3; i++) {
			c = parseInt(hex.substr(i*2,2), 16);
			c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
			rgb += ("00"+c).substr(c.length);
		}
		return rgb;
	}

	//creates a random system with given number of bodies
	function randomSystem(numberBodies){
		var canvas = document.getElementById('runner');
		var bodies = [];
		var massOfSun = curSunMass;
		//console.log(massOfSun,maxSunMass);
		var distanceBetweenSuns = (numSuns > 0) ? canvas.width/numSuns : 0;
		var initOffset = (numSuns%2 == 1) ? 0 : -distanceBetweenSuns/2;
		var prevX = initOffset;
		//adds all of the suns:
		for(var i = 0; i < numSuns; i++){
			//x coordinate at center of screen is 0.
			var width = canvas.width;
			var posOrNeg = (i%2==0) ? -1 : 1;
			var x = prevX + i*distanceBetweenSuns*posOrNeg;
			prevX = x;
			var sun = new body("Sun",massOfSun,x,0,0,0,true);
			bodies.push(sun);
		}
		//adds other bodies
		for(var i = 0; i < numberBodies; i++){
			var px = Math.random()*canvas.width;
			var py = Math.random()*canvas.height;
			var x = (px-canvas.width/2)/scale;
			var y = (py-canvas.height/2)/scale;
			var dx = (Math.random()*20)-10;
			var dy = (Math.random()*20)-10;
			var b = new body(createName(),Math.random()*900+50,x,y,dx,dy,true);
			bodies.push(b);
		}
		return bodies;
	}

	//adds a mass to a system
	function addMass(bodies){
		var canvas = document.getElementById('runner');
		var px = Math.random()*canvas.width;
		var py = Math.random()*canvas.height;
		var x = (px-canvas.width/2)/scale;
		var y = (py-canvas.height/2)/scale;
		bodies.push(new body(createName(),Math.random()*900+50,x,y,(Math.random()*20)-10,(Math.random()*20)-10,false));
	}
	//adds a mass to a system at location
	function addMassLocation(bodies,x,y){
		var canvas = document.getElementById('runner');
		bodies.push(new body(createName(),Math.random()*900+50,x,y,(Math.random()*20)-10,(Math.random()*20)-10,false));
	}
	//adds a mass to a system with mass and location
	function addMassMassAndLocation(bodies,mass,x,y){
		var canvas = document.getElementById('runner');
		bodies.push(new body(createName(),mass,x,y,(Math.random()*20)-10,(Math.random()*20)-10,false));
	}

	//returns string containing a planetary name
	function createName(){
		var list = ["Moon","Phobos","Io","Deimos","Europa","Ganymede","Callisto",
					"Amalthea","Himalia","Elara","Pasiphae","Sinope","Lysithea",
					"Carme","Ananke","Leda","Thebe","Adrastea","Metis","Callirrhoe",
					"Themisto","Megaclite","Taygete","Chaldene","Harpalyke","Kalyke",
					"Iocaste","Erinome","Isonoe","Jupiter"];

		var index = Math.floor(Math.random()*list.length);
		var name = list[index];
		var num = countStr(name);
		if(num>0){
			name+= (" "+(num+1));
		}
		return name;
	}

	//counts how many instances of a string is found in a system
	function countStr(str){
		var num = 0;
		console.log(str);
		for(var i = 0; i < bodies.length;i++){
			var name = bodies[i].name.replace(/[0-9 ]/g, '');
			if(name==str){
				num+=1;
			}
		}
		return num;
	}

	//removes a mass at given index from system
	function removeMass(bodies,index){
		console.log(index);
		var newarr = new Array(bodies.length - 1);
		var otherIndex = 0;
		for(var i = 0; i < newarr.length; i++){
			if(otherIndex != index){
				newarr[i] = bodies[otherIndex];
			}
			else{
				bodies[otherIndex]= null;
				i--;
			}
			otherIndex++;
		}
		bodies = newarr;
		return bodies;
	}	

	//removes multiple masses based off of whether a mass was flagged for removal
	function removeMasses(bodies){
		var newBods = [];
		for(var i = 0; i<bodies.length; i++){
			if(bodies[i].flagRemove == false){
				newBods.push(bodies[i]);
			}
			else{
				console.log("this one removed:",bodies[i])
			}
		}
		bodies = newBods;
		return bodies;
	}

	//returns a random system with n bodies
	function getSystem(numberBodies){
		return randomSystem(numberBodies);
		//return bodies;
	}

	//returns mouse position in canvas based off of event and canvas
	function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
		  x: (evt.clientX - rect.left - canvas.width/2)/scale,
		  y: (evt.clientY - rect.top - canvas.height/2)/scale
		};
	}

	//returns index of mass if a mass exists at a given coordinate
	function getMassIndexAtPos(pos){
		coords = [pos.x,pos.y];
		for(var i = 1; i < bodies.length; i++){
			var curBody = bodies[i];
			var dist = getDistance(curBody.getLocation(),coords);
			//console.log("location:"+ curBody.getLocation() + "distance: "+ dist + ", " + "radius of index "+i+": "+curBody.radius);
			if(getDistance(curBody.getLocation(),coords)<=curBody.radius){
				return i;
			}
		}
		return -1;
	}

	//returns the distance between two points
	function getDistance(pos1,pos2){
		distanceTo = [0,0];
		distanceTo[0] = (pos1[0]-pos2[0]);
		distanceTo[1] = (pos1[1]-pos2[1]);
		return Math.sqrt(Math.pow(distanceTo[0],2)+Math.pow(distanceTo[1],2));
	}
	//returns vector distance
	function getDistanceVector(pos1,pos2){
		distanceTo = [0,0];
		distanceTo[0] = (pos1[0]-pos2[0]);
		distanceTo[1] = (pos1[1]-pos2[1]);
		return distanceTo;
	}
	function changeMassOfSuns(){
		var mass = document.getElementById("sunMass").value * maxSunMass/100;
		curSunMass = mass;
		document.getElementById("labelForSM").innerHTML = "Mass of Sun ("+mass+" u):"
		for(var i = 0; i < bodies.length; i++){
			if(bodies[i].name == "Sun"){
				bodies[i].setMass(mass);
			}
		}
	}
	function newRound(){
		countdown = true;
		countDownNumber = 3;
		countDownTime = [Date.now(),Date.now()];	

		curSunMass = 10000;
		spaceShips = getMultipleSpaceShips(scenario);
		//console.log(spaceShips);
		console.log(bodies);
		var newBodies = [];
		for(var i = 0; i < bodies.length; i++){
			if(bodies[i].name == "Sun"){
				newBodies.push(bodies[i]);
			}
		}
		bodies = newBodies;
		console.log(bodies);
		document.getElementById("sunMass").value="50";		
		document.getElementById("labelForSM").innerHTML = "Mass of Sun ("+curSunMass+" u):";		
	}
	//loads all of the event listeners, aka user interactivity 
	function loadEventListeners(){
		var timeChange = 0.02;
		document.getElementById("restart").addEventListener("click", newRound
			// function restartGame(){
			// 	countdown = true;
			// 	countDownNumber = 3;
			// 	countDownTime = [Date.now(),Date.now()];	

			// 	curSunMass = 10000;
			// 	spaceShips = getMultipleSpaceShips(scenario);
			// 	for(var i = 0; i < bodies.length;i++){
			// 		if(bodies[i].name == "Sun"){
			// 			bodies[i].setMass(curSunMass);
			// 		}
			// 		else{
			// 			var canvas = document.getElementById('runner');
			// 			var px = Math.random()*canvas.width;
			// 			var py = Math.random()*canvas.height;
			// 			var dx = (Math.random()*20)-10;
			// 			var dy = (Math.random()*20)-10;
			// 			bodies[i].x = (px-canvas.width/2)/scale;
			// 			bodies[i].y = (py-canvas.height/2)/scale;
			// 			bodies[i].dx = (Math.random()*20)-10;
			// 			bodies[i].dy = (Math.random()*20)-10;

			// 		}
			// 	}
			// 	document.getElementById("sunMass").value="50";		
			// 	document.getElementById("labelForSM").innerHTML = "Mass of Sun ("+curSunMass+" u):";		

			// }
			);

		//add a body
		document.getElementById("add").addEventListener("click", function add(){addMass(bodies);});
		document.getElementById("remove_all").addEventListener("click", 
			function removeAllButSuns(){
				var newBodies = [];
				for(var i = 0; i < bodies.length; i++){
					if(bodies[i].name == "Sun"){
						newBodies.push(bodies[i]);
					}
				}
				bodies = newBodies;
			}
		);

		document.getElementById("remove_gone").addEventListener("click", 
			function removeOutOfBound(){
				var canvas = document.getElementById('runner');
				var width = canvas.width;
				var height = canvas.height;
				for(var i = 0; i < bodies.length; i++){
					var pos = bodies[i].getLocation();
					var pixelX = pos[0]*scale+canvas.width/2
					var pixelY = pos[1]*scale+canvas.height/2

					if(pixelX < 0 || pixelY < 0 || pixelX > width || pixelY > height){
						bodies[i].flagRemove = true;
					}
				}
				var newBods = [];
				for(var i = 0; i<bodies.length; i++){
					console.log(i,bodies);
					if(bodies[i].flagRemove == false){
						newBods.push(bodies[i]);
					}
					else{
						console.log("this one removed:",bodies[i])
					}
				}
				bodies = newBods;
		});

		document.getElementById("remove_select").addEventListener("click", 
			function remove(event){
				if(isRemoving == false){
					isRemoving = true;
					isPaused = true;
					document.getElementById("remove_select").innerHTML = "remove mode: ON";
					document.getElementById("pause_and_resume").innerHTML = "resume";

				}
				else{
					document.getElementById("remove_select").innerHTML = "remove mode: OFF";
					document.getElementById("pause_and_resume").innerHTML = "pause";
					isRemoving = false;
					isPaused = false;
				}
			});

		document.getElementById("pause_and_resume").addEventListener("click", 
			function pOrR(){
				var val = document.getElementById("pause_and_resume"); 
				if(isRemoving == false){
					if(isPaused){
						val.innerHTML = "pause";
					}else{
						val.innerHTML = "resume";
					} 
					isPaused =!isPaused; 

				}
				else{
					//val.innerHTML = "paused; deselect remove mode"
				}
			});
		document.getElementById("collisions").addEventListener("click", 
			function toggleCollision(){
				var val = document.getElementById("collisions"); 
				if(collisionEnabled){
					val.innerHTML = "collisions: OFF";
				}else{
					val.innerHTML = "collisions: ON";
				} 
				collisionEnabled = !collisionEnabled;

			});

		//toggle debug mode
		document.getElementById("debug").addEventListener("click",
			function changeDebug(){
				isDebug = !isDebug; 
				element = document.getElementById("debug");
				if(isDebug){
					element.innerHTML = "debug: ON";
				}
				else{
					element.innerHTML = "debug: OFF";
				}
			});

		//removes a body IF removing mode is ON
		var runnerElement = document.getElementById("runner");
		runnerElement.onmousedown = function () {
			if(isRemoving == false){
				//if paused is true, then you should be able to change the velocities of the items
				if(isPaused){

				}
				start = new Date();
				isCreatingBody = true;
				var mousePos = getMousePos(document.getElementById("runner"), event); 
				console.log("mouse down");
				curBody = new body(createName(),1,mousePos.x,mousePos.y,0,0,false);
			}
		};
		runnerElement.onmouseup = function () {
			end = new Date();
			var diff = end - start;
			var mousePos = getMousePos(document.getElementById("runner"), event); 
			var canvas = document.getElementById('runner');
			var mousePos = getMousePos(canvas,event);
			var index = getMassIndexAtPos(mousePos);
			if(isRemoving == true){
				if(index != -1 && index != 0){
					console.log("removed body");
					bodies = removeMass(bodies,index);
				}
				else{
					console.log("misclick," + mousePos.x,mousePos.y + ","+index);
				}
			}
			else{
				if(isCreatingBody){
					console.log(curBody);
					var startV = getDistanceVector(curBody.getLocation(),[mousePos.x,mousePos.y]);
					if(getDistance(curBody.getLocation(),[mousePos.x,mousePos.y])>curBody.radius){
						var startV = getDistanceVector(curBody.getLocation(),[mousePos.x,mousePos.y]);
						curBody.setVelocity(startV[0]*.1,startV[1]*.1);
					}
					else{
						curBody.setRandomVelocity();
					}	
					console.log("mouse up"+", vel:"+curBody.getVelocity());
					bodies.push(curBody);
					isCreatingBody = false;
				}
			}
		};
		runnerElement.onmouseout = function(){
			if(isCreatingBody == true){
				curBody.setRandomVelocity();
				console.log("mouse out"+", vel:"+curBody.getVelocity());
				bodies.push(curBody);
				isCreatingBody = false;
			}
		}
		//slider for zoom scale:
		document.getElementById("zoomScale").addEventListener("mousemove", 
			function changeZoomScale(){
				console.log("dragging");
				var zoomScale = document.getElementById("zoomScale").value / 20;
				if(zoomScale == 0){
					zoomScale = 0.05;
				}
				document.getElementById("labelForZoomScale").innerHTML = "Zoom factor ("+Math.ceil(1/zoomScale * 10) / 10+"x):"
				console.log("set zoom to:"+zoomScale)
				scale = zoomScale;
			});
		document.getElementById("zoomScale").addEventListener("click", 
			function changeZoomScale(){
				console.log("dragging");
				var zoomScale = document.getElementById("zoomScale").value / 20;
				if(zoomScale == 0){
					zoomScale = 0.05;
				}
				document.getElementById("labelForZoomScale").innerHTML = "Zoom factor ("+Math.ceil(1/zoomScale * 10) / 10+"x):"
				console.log("set zoom to:"+zoomScale)
				scale = zoomScale;

			});

		//slider for time scale:
		document.getElementById("timeScale").addEventListener("mousemove", 
			function changeTimeScale(){
				console.log("dragging");
				var timeScale = document.getElementById("timeScale").value / 100;
				document.getElementById("labelForTimeScale").innerHTML = "Time scale ("+Math.ceil(timeScale*5 * 10) / 10+"x):"
				console.log("set time to:"+timeScale)
				dt = timeScale;
			});
		document.getElementById("timeScale").addEventListener("click", 
			function changeTimeScale(){
				console.log("dragging");
				var timeScale = document.getElementById("timeScale").value / 100;
				document.getElementById("labelForTimeScale").innerHTML = "Time scale ("+Math.ceil(timeScale*5 * 10) / 10+"x):"
				console.log("set time to:"+timeScale)
				dt = timeScale;

			});

		//slider for mass of sun:
		document.getElementById("sunMass").addEventListener("mousemove", changeMassOfSuns);
		document.getElementById("sunMass").addEventListener("click", changeMassOfSuns);
		window.addEventListener("keydown", function (e) {
			keys[e.keyCode] = true;
		});
		window.addEventListener("keyup", function (e) {
			keys[e.keyCode] = false;
		});
		window.onkeydown = function(e) {
		    if((e.keyCode == 32 || e.keyCode == 40 || e.keyCode == 38 || e.keyCode == 37 || e.keyCode == 39) && e.target == document.body) {
		        e.preventDefault();
		        return false;
		    }
		};
		// //MUSIC!!!!!!!!
		// document.getElementById("music").addEventListener("click", 
		// 	function toggleMusic(){
		// 		if(isMusicPlaying){
		// 			isMusicPlaying = false;
	 	//			soundManager.pause('mySound');
		// 		}
		// 		else{
		// 			isMusicPlaying = true;
	 	//			soundManager.play('mySound');
		// 		}
		// 	});
	}
	//find current frame rate
	function updateFrameRate(){
		if((elapsedTime[1]-elapsedTime[0]) > 1000){
			console.log("updated Frame rate:" + numFrames);
			elapsedTime[0] = Date.now();
			elapsedTime[1] = Date.now();
			frameRate = numFrames;
			numFrames = 0;
		}
	}

	//print the statistics of process 
	function printStats(){
		var massVal = "";
		var frameRateVal = frameRate;
		stats = "total number of masses: "+bodies.length+massVal+"; Time frame: "+dt+"\n"+"; frame rate: "+frameRateVal 
		document.getElementById("stats").innerHTML = stats;
	}

	//removes stats and table containing info
	function removeStats(){
		document.getElementById("stats").innerHTML = "";
		document.getElementById("datagrid").innerHTML = "";
	}

	//completes one round of updating, including calling update on every mass, and also removing masses if they collide, and visualizes mouse body
	function completeUpdate(ctx){
		var collision = false;
		var numCrashed = 0;
		if(countdown){
			countingDown();
		}
		else{
			for(var i = 0; i < bodies.length; i++){
				if(!isPaused){
					if(bodies[i].flagRemove){
						collision = true;
					}
					bodies[i].update(bodies,i,dt);
				}
				bodies[i].drawImg(ctx,isDebug);
			}
			if(collisionEnabled && collision == true){
				bodies = removeMasses(bodies);
			}
			for(var i = 0; i < spaceShips.length; i++){
				if(!isPaused){
					spaceShips[i].update(bodies,-1,dt);
				}
				spaceShips[i].drawImg(ctx,isDebug);
				if(spaceShips[i].hasCrashed){
					numCrashed++;
				}
			}
			if(someoneWon){
				if(countNumSeconds(winCountDown,5000)){
					console.log("Called new round in complete update");
					newRound();
					someoneWon = false;
				}
				else{
					var canvas = document.getElementById('runner');
					var context = canvas.getContext('2d');
					var pixelSize = 30;
					context.font=pixelSize+"px Georgia";
					context.fillStyle = 'white';
					context.textAlign = 'center'
					var str = winner+" wins this round!";
					context.fillText(str, canvas.width/2,canvas.height/2);
					winCountDown[1] = Date.now();
				}
			}
			else if(numCrashed == spaceShips.length - 1){
				for(var i = 0; i < spaceShips.length; i++){
					if(spaceShips[i].hasCrashed == false){
						winner = spaceShips[i].name;
						scoreBoard[i]++;
					}
				}
				winCountDown = [Date.now(),Date.now()];
				someoneWon = true;
			}
			if(isCreatingBody){
				end = new Date();
				var diff = end - start;
				curBody.setMass(diff);
				curBody.drawImg(ctx,isDebug);

			}
		}
		paintScoreBoard();
		return bodies;
	}
	function paintScoreBoard(){
		var canvas = document.getElementById('runner');
		var context = canvas.getContext('2d');
		var pixelSize = 12;
		context.lineWidth = 3;
		context.font=pixelSize+"px Georgia";
		context.fillStyle = 'white';
		var str = "Scores:";
		context.fillText(str, canvas.width-100,canvas.height-100);
		for(var i = 0; i < scoreBoard.length;i++){
			context.fillText(spaceShips[i].name+": "+scoreBoard[i], canvas.width-100,canvas.height-100+(i+1)*pixelSize);
		}

	}
	function countNumSeconds(timeRange,dt){
		if(timeRange[1]-timeRange[0]>dt){
			timeRange[0] = Date.now();
			timeRange[1] = timeRange[0];
			return true;
		}
		else{
			timeRange[1] = Date.now();
		}
		return false;
	}
	//generates the table at the bottom of the page when you click "debug"
	function generateTable(){
		var table = document.getElementById('datagrid');
		var canvas = document.getElementById('runner');

		var tableHTML = "<table id=\"stats-table\" class=\"stats-table\"><thead><tr><th>Index</th><th>Name</th><th>Mass</th><th>Pixel Location</th><th>Location relative to the Sun</th><th>Velocity</th></tr></thead><tbody>"
		for(var i = 0; i < bodies.length;i++){
			tableHTML+="<tr><td data-title=\"Index\">"+i+"</td><td data-title=\"Name\">"+bodies[i].name+"</td><td data-title=\"Mass\">"+bodies[i].mass+"</td><td data-title=\"Pixel Location\">["+Math.round(bodies[i].x*scale)+","+Math.round(bodies[i].y*scale)+"]</td><td data-title=\"Location relative to the Sun\">["+Math.round(bodies[i].x)+","+Math.round(bodies[i].y)+"]</td><td data-title=\"Velocity\">["+Math.round(bodies[i].dx)+","+Math.round(bodies[i].dy)+"]</td></tr>"
		}
		tableHTML+="</tbody></table>"
		table.innerHTML = tableHTML;
	}
	//initializer for program, catches any errors.
	function init(){
		try{
			loadEventListeners();
			window.requestAnimationFrame(draw);
		}
		catch(err){
			document.getElementById("err").innerHTML="There seems to have been an error:"+err.message;
			console.log(err.message);
		}
	}
	function countingDown(){
		var canvas = document.getElementById('runner');
		var context = canvas.getContext('2d');
		context.lineWidth = 3;
		context.font="100px Georgia";
		context.fillStyle = 'white';
		context.textAlign = 'center'
		if(countDownNumber == 0){
			context.fillText(countDownNumber + "!", canvas.width/2,canvas.height/2);
		}
		else{
			context.fillText(countDownNumber + "...", canvas.width/2,canvas.height/2);
		}
		if((countDownTime[1]-countDownTime[0]) > 1000){
			countDownNumber= countDownNumber - 1;
			if(countDownNumber == -1){
				countdown = false;
				countDownNumber = 3;
			}
			countDownTime[0] = Date.now();
		}
		countDownTime[1] = Date.now();	
	}

	function draw() {
		var canvas = document.getElementById('runner');
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0,0,canvas.width,canvas.height); // clear canvas
		ctx.fillStyle = '#000000'
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = 'rgba(0,0,0,0.4)';
		ctx.strokeStyle = 'rgba(0,153,255,0.4)';
		ctx.save();
		bodies = completeUpdate(ctx);
		elapsedTime[1] = Date.now();
		numFrames=numFrames+1;
		updateFrameRate();
		if(isDebug){
			printStats();
			generateTable();
		}
		else{
			removeStats();
		}
		window.requestAnimationFrame(draw);

	}

	init();
}
run();