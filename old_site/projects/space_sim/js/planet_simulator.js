//TODO:
//	•glowing sun, shadow effect on planets
//	•add point mass capability 
//	•implement space ship?!
//	•when two bodies overlap but collisions are turned off, calculate the force more accurately.


//GLOBAL VARIABLES:
var dt = 0.2;
var totalBodies = 2;
var isPaused = false;
var isDebug = false;
var isRemoving = false;
var G = 0.5;
var maxSunMass = 20000;
var curSunMass = 10000;
var numSuns = 3;
var isSunsStationary = true;	
var bodies = stableSystem();	//getSystem();
var isMusicPlaying = true;

var randomReset = false;

// soundManager.url = './cgi-bin/soundmanager/swf/';

// soundManager.onready(function() {
//     soundManager.createSound({
//         id: 'mySound',
//         url: './cgi-bin/audio/space-oddity.mp3'
//     });
//     // ...and play it
//     soundManager.play('mySound');
// });
//for when collision is enabled:
var collisionEnabled = true;

//this is the variable that holds the current body being created by click with mouse:
var curBody = null;

//if mouse is creating body:
var isCreatingBody = false;
//start time of body creation, and end time:
var start;
var end;


//for scaling purposes:
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
	this.color = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';
	this.maxV = 0;
	this.isStationary = isStationary;

	this.location = [this.x,this.y];
	this.velocity = [this.dx,this.dy];

	//this is if collisions are enabled; if this body collides with another body, then I flag this body for removal.
	this.flagRemove = false;

	//these variables are just to make sure we don't continuously remake new arrays
	this.distanceTo = [0,0];
	this.finalForce = [0,0];
	this.vectorForce = [0,0];
	this.update = function(allBodies,index,dt){
		if(!isStationary){
			this.curForce = this.totalForce(allBodies,index);
			this.dx += (this.curForce[0]*(dt*5)) / this.mass;
			this.dy += (this.curForce[1]*(dt*5)) / this.mass;
			this.x+=this.dx*dt;
			this.y+=this.dy*dt;
			this.location[0] = this.x;
			this.location[1] = this.y;
			this.velocity[0] = this.dx;
			this.velocity[1] = this.dy;
			this.maxV = Math.max(this.maxV,this.getMagnitude());
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

	this.updateRadius=function(){
		this.radius = Math.sqrt(this.mass/Math.PI);
	}
	this.getLocation=function(){
		return this.location;
	}
	this.getVelocity=function(){
		return this.velocity;
	}
	this.getMagnitude = function(){
		return Math.sqrt(Math.pow(this.dx,2)+Math.pow(this.dy,2));
	}
	this.getMagnitudeForce = function(){
		return Math.sqrt(Math.pow(this.finalForce[0],2)+Math.pow(this.finalForce[1],2));		
	}
	this.setVelocity = function(dx,dy){
		if(!isStationary){
			this.dx = dx;
			this.dy = dy;
			this.velocity[0] = this.dx;
			this.velocity[1] = this.dy;
		}

	}
	this.setRandomVelocity=function(){
		this.dx = (Math.random()*2-1)*Math.random()*10;
		this.dy = (Math.random()*2-1)*Math.random()*10;
		this.velocity[0] = this.dx;
		this.velocity[1] = this.dy;
	}
	this.getDistance=function(otherBody){
		var otherLocation = otherBody.getLocation();
		this.distanceTo[0] = (this.x-otherLocation[0]);
		this.distanceTo[1] = (this.y-otherLocation[1]);
		var magnitudeDistance = Math.sqrt(Math.pow(this.distanceTo[0],2)+Math.pow(this.distanceTo[1],2));
		return magnitudeDistance;
	}
	this.setMass=function(mass){
		this.mass = mass;
		this.updateRadius();
	}
	this.totalForce=function(otherBodies,index){
		this.finalForce[0] = 0;
		this.finalForce[1] = 0;
		for(var i = 0; i < otherBodies.length; i++){
			if(i != index && !otherBodies[i].flagRemove && !this.flagRemove){
				var otherBody = otherBodies[i];
				var otherLocation = otherBody.getLocation();
				var magnitudeDistance = this.getDistance(otherBody);
				var touching = this.isTouching(otherBody);
				if(touching){
					if(collisionEnabled && (magnitudeDistance < this.radius || magnitudeDistance < otherBody.radius)){
						var newMass = this.mass+otherBody.mass;
						var newdx = (this.dx*this.mass+otherBody.dx*otherBody.mass)/newMass;
						var newdy = (this.dy*this.mass+otherBody.dy*otherBody.mass)/newMass;
						var newName = (this.mass > otherBody.mass) ? this.name : otherBody.name;
						var isStat  = (this.isStationary || otherBody.isStationary) ? true : false;
						if(this.name == "Sun"){
							this.setMass(newMass);
							this.setVelocity(newdx,newdy);
							this.name = newName;
							this.isStationary = isStat;
							otherBody.flagRemove = true;
							curSunMass = this.mass;
							document.getElementById("sunMass").value = curSunMass*100/maxSunMass;
							document.getElementById("labelForSM").innerHTML = "Mass of Sun ("+Math.ceil(document.getElementById("sunMass").value*maxSunMass/100) +" u):"
							console.log("Value:"+document.getElementById("sunMass").value + "," +(maxSunMass*100/curSunMass));
						}
						else if(otherBody.name == "Sun"){
							otherBody.setMass((newMass>maxSunMass)?maxSunMass:newMass);
							otherBody.name = newName;
							otherBody.isStationary = isStat;
							this.flagRemove = true;
							curSunMass = otherBody.mass;
							document.getElementById("sunMass").value = Math.round((curSunMass*100/maxSunMass));
							document.getElementById("labelForSM").innerHTML = "Mass of Sun ("+Math.ceil(document.getElementById("sunMass").value*maxSunMass/100)+" u):"
							console.log("Value:"+document.getElementById("sunMass").value + "," +(maxSunMass*100/curSunMass));
						}
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

						console.log("Conglomeration");

					}
					else{
						var radiusDistance = (this.radius+otherBody.radius);
						var partialForce =-G * (this.mass * otherBody.mass)/Math.pow(radiusDistance,2);
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
					console.log("Collision");
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
		//console.log(image.src + "," +finalForce);
		return this.finalForce;
	}
	this.drawImg=function(context,debug,index){
		var canvas = document.getElementById('runner');
		var centerX = this.x*scale+canvas.width/2;
		var centerY = this.y*scale+canvas.height/2;
		var radius = this.radius*scale
		context.beginPath();
		context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
		context.fillStyle = this.color;
		context.fill();
		context.lineWidth = radius/10;
		context.strokeStyle = ColorLuminance(this.color,-0.5);
		context.stroke();
		if(debug){
			context.font="12px Georgia";
			context.fillStyle = 'white';
			context.fillText("Name: "+this.name, centerX,centerY+5);
			//context.fillText(Math.round(this.x)+","+Math.round(this.y) + ", index: "+index+", name:" +this.name,this.x,this.y);//+", V:"+Math.round(this.getMagnitude())+", MAX V: "+this.maxV+",",this.x,this.y);
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

		context.closePath();
		//console.log("drew!");
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
	//adds all of the suns:
	curSunMass = maxSunMass / 2;
	bodies = setSuns(canvas);
	//adds other bodies
	for(var i = 0; i < numberBodies; i++){
		var px = Math.random()*canvas.width;
		var py = Math.random()*canvas.height;
		var x = (px-canvas.width/2)/scale;
		var y = (py-canvas.height/2)/scale;
		var dx = (Math.random()*20)-10;
		var dy = (Math.random()*20)-10;
		var b = new body(createName(),Math.random()*900+50,x,y,dx,dy,false);
		bodies.push(b);
	}
	return bodies;
}
function setSuns(canvas){
	bodies = [];
	var massOfSun = curSunMass;
	//console.log(massOfSun,maxSunMass);
	var distanceBetweenSuns = (numSuns > 0) ? canvas.width/numSuns : 0;
	var initOffset = (numSuns%2 == 1) ? 0 : -distanceBetweenSuns/2;
	var prevX = initOffset;
	for(var i = 0; i < numSuns; i++){
		//x coordinate at center of screen is 0.
		var width = canvas.width;
		var posOrNeg = (i%2==0) ? -1 : 1;
		var x = prevX + i*distanceBetweenSuns*posOrNeg;
		prevX = x;
		var sun = new body("Sun",massOfSun,x,0,0,0,isSunsStationary);
		bodies.push(sun);
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
function addMassCircularOrbitAroundBody(mass, radiusOfOrbit, otherBody, orbitDirection){
	//v = sqrt(G*M_body / radius of orbit)
	var magnitudeVelocity = Math.sqrt(3.1*G*(otherBody.mass+mass)/radiusOfOrbit);
	var angleAroundBody = Math.random() * (2 * Math.PI); //angle between 0 and 2 radians
	var angleOfVelocity = (angleAroundBody + (Math.PI/2*orbitDirection))%(Math.PI*2) //this ensures that the satellite's velocity will be tangential to the circle around the body with radius R
	var x = Math.cos(angleAroundBody) * radiusOfOrbit+otherBody.x;
	var y = Math.sin(angleAroundBody) * radiusOfOrbit+otherBody.y;
	var dx = Math.cos(angleOfVelocity) * magnitudeVelocity+otherBody.dx;
	var dy = Math.sin(angleOfVelocity) * magnitudeVelocity+otherBody.dy;
	var isStationary = false;
	//console.log("Body",otherBody.mass,"MagV:",magnitudeVelocity,"Angle Body:",angleAroundBody,"Angle Vel:",angleOfVelocity,"Mass:",mass,"X:",x,"Y:",y,"Dx:",dx,"Dy:",dy);
	var satellite = new body(createName(),mass,x,y,dx,dy,isStationary);
	bodies.push(satellite);
}
function addPlanetAndMoon(){
	var radius = Math.random()*200+200;
	var planetMass = Math.random() * bodies[0].mass/100+bodies[0].mass/100
	var moonMass = Math.random() * planetMass/10+planetMass/10
	var orbitDirection = (Math.random()>0.5)? -1 : 1;
	addMassCircularOrbitAroundBody(planetMass, radius,bodies[0],orbitDirection);
	addMassCircularOrbitAroundBody(moonMass,2.5*bodies[bodies.length-1].radius,bodies[bodies.length-1],-orbitDirection);
}

function stableSystem(){
	var canvas = document.getElementById('runner');	
	numSuns = 1;
	setSuns(canvas);
	addPlanetAndMoon();
	return bodies;
}


//returns string containing a name
function createName(){
	var list = ["Moon","Phobos","Io","Deimos","Europa","Ganymede","Callisto","Amalthea","Himalia","Elara","Pasiphae","Sinope","Lysithea","Carme","Ananke","Leda","Thebe","Adrastea","Metis","Callirrhoe","Themisto","Megaclite","Taygete","Chaldene","Harpalyke","Kalyke","Iocaste","Erinome","Isonoe","Jupiter"];
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

//loads all of the event listeners, aka user interactivity 
function loadEventListeners(){
	var timeChange = 0.02;
	document.getElementById("restart").addEventListener("click", 
		function updateSystem(){
			curSunMass = 10000;
			for(var i = 0; i < bodies.length;i++){
				if(randomReset && bodies[i].name != "Sun"){
					var canvas = document.getElementById('runner');
					var px = Math.random()*canvas.width;
					var py = Math.random()*canvas.height;
					var dx = (Math.random()*20)-10;
					var dy = (Math.random()*20)-10;
					bodies[i].x = (px-canvas.width/2)/scale;
					bodies[i].y = (py-canvas.height/2)/scale;
					bodies[i].dx = (Math.random()*20)-10;
					bodies[i].dy = (Math.random()*20)-10;
				}
				else{	
					bodies[i].reset();
				}
				if(bodies[i].name == "Sun"){
					bodies[i].setMass(curSunMass);
				}
			}
			document.getElementById("sunMass").value="50";		
			document.getElementById("labelForSM").innerHTML = "Mass of Sun ("+curSunMass+" u):";		

		});

	//add a body
	document.getElementById("add").addEventListener("click", function add(){
		addMass(bodies);
	});
	document.getElementById("add_stable").addEventListener("click", function add(){
		addPlanetAndMoon();
	});
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
			for(var i = 1; i < bodies.length; i++){
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
		function changeTimeScale(){
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
		function changeTimeScale(){
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
	document.getElementById("sunMass").addEventListener("mousemove", 
		function changeMassOfSun(){
			console.log("dragging");
			var mass = document.getElementById("sunMass").value * maxSunMass/100;
			document.getElementById("labelForSM").innerHTML = "Mass of Sun ("+mass+" u):"
			if(bodies[0].name == "Sun"){

				bodies[0].setMass(mass);
				console.log("set mass to:"+mass)
			}
			else{
				console.log("no sun available.");
			}
		});
	document.getElementById("sunMass").addEventListener("click", 
		function changeMassOfSun(){
			console.log("dragging");
			var mass = document.getElementById("sunMass").value * maxSunMass/100;
			document.getElementById("labelForSM").innerHTML = "Mass of Sun ("+mass+" u):"
			if(bodies[0].name == "Sun"){

				bodies[0].setMass(mass);
				console.log("set mass to:"+mass)
			}
			else{
				console.log("no sun available.");
			}
		});

	// //MUSIC!!!!!!!!
	// document.getElementById("music").addEventListener("click", 
	// 	function toggleMusic(){
	// 		if(isMusicPlaying){
	// 			isMusicPlaying = false;
 //   				soundManager.pause('mySound');
	// 		}
	// 		else{
	// 			isMusicPlaying = true;

 //   				soundManager.play('mySound');
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
function completeUpdate(ctx,bodies){
	var collision = false;
	for(var i = 0; i < bodies.length; i++){
		if(!isPaused){
			if(bodies[i].flagRemove){
				collision = true;
			}
			bodies[i].update(bodies,i,dt);
		}
		bodies[i].drawImg(ctx,isDebug,i);
	}
	if(collisionEnabled && collision == true){
		bodies = removeMasses(bodies);
	}
	if(isCreatingBody){
		end = new Date();
		var diff = end - start;
		curBody.setMass(diff);
		curBody.drawImg(ctx,isDebug,"mouse mass");

	}
	return bodies;
}
//generates the table at the bottom of the page when you click "debug"
function generateTable(){
	var table = document.getElementById('datagrid');
	var canvas = document.getElementById('runner');

	var tableHTML = "<table id=\"stats-table\" class=\"stats-table\"><thead><tr><th>Index</th><th>Name</th><th>Mass</th><th>Pixel Location</th><th>Location relative to the Sun</th><th>Velocity</th><th>Mag. Force</th></tr></thead><tbody>"
	for(var i = 0; i < bodies.length;i++){
		tableHTML+="<tr><td data-title=\"Index\">"+i+"</td><td data-title=\"Name\">"+bodies[i].name+"</td><td data-title=\"Mass\">"+bodies[i].mass+"</td><td data-title=\"Pixel Location\">["+Math.round(bodies[i].x*scale)+","+Math.round(bodies[i].y*scale)+"]</td><td data-title=\"Location relative to the Sun\">["+Math.round(bodies[i].x)+","+Math.round(bodies[i].y)+"]</td><td data-title=\"Velocity\">["+Math.round(bodies[i].dx)+","+Math.round(bodies[i].dy)+"]</td><td data-title=\"Mag. Force\">["+Math.round(bodies[i].getMagnitudeForce())+"]</td></tr>"
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

function draw() {
	var canvas = document.getElementById('runner');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0,0,canvas.width,canvas.height); // clear canvas
	ctx.fillStyle = '#000000'
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.fillStyle = 'rgba(0,0,0,0.4)';
	ctx.strokeStyle = 'rgba(0,153,255,0.4)';
	ctx.save();
	bodies = completeUpdate(ctx,bodies);
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

