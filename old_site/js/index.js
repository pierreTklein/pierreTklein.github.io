var frameRate;
function animations(){
	var time = [Date.now(),Date.now()];
	var str = "elcome.";
	var i = 0; 
	var animateLinks = false;
	var linksLoaded = false;
	var op = 0;	
	var introLoaded = false;
	var canvas = document.getElementById('runner');
	var arrows;

	var neighborhood = 30;

	//for random numbers that are related to each other:
	var PNgenerator = new Simple1DNoise();
	var PNX = 0;
	var PNY = 10000;

	//for checking the frame rate:
	var elapsedTime = [Date.now(),Date.now()];
	var numFrames = 0;
	frameRate = 21;

	//to make sure that the function runs optimally
	var optimizedSize = false;


	function loadIntro(){
		if(i < str.length){
			if(timeDiff()>50){
				document.getElementById("Intro").innerHTML += str.charAt(i);
				i++;
				time[0]=Date.now(); 
			}
		}
		else if(linksLoaded == false && animateLinks == true){
			if(timeDiff()>10){
				op+=0.01
				document.getElementById("resumeLink").style.opacity = op;
				document.getElementById("projLink").style.opacity = op;
				time[0]=Date.now(); 
				//console.log("changed",document.getElementById("projLink").style.opacity);
			}
			if(document.getElementById("projLink").style.opacity == 1){
				linksLoaded = true;
				animateLinks = false;
			}	
		}
		else if(linksLoaded == false && animateLinks == false){
			if(timeDiff() > 200){
				animateLinks = true;
				time[0]=Date.now();
			}
		}
		else{
			introLoaded = true;
		}
	}

	 function Simple1DNoise() {
	    var MAX_VERTICES = 256;
	    var MAX_VERTICES_MASK = MAX_VERTICES -1;
	    var amplitude = 1;
	    var scale = 1;

	    var r = [];

	    for ( var i = 0; i < MAX_VERTICES; ++i ) {
	        r.push(Math.random());
	    }

	    var getVal = function( x ){
	        var scaledX = x * scale;
	        var xFloor = Math.floor(scaledX);
	        var t = scaledX - xFloor;
	        var tRemapSmoothstep = t * t * ( 3 - 2 * t );

	        /// Modulo using &
	        var xMin = xFloor & MAX_VERTICES_MASK;
	        var xMax = ( xMin + 1 ) & MAX_VERTICES_MASK;

	        var y = lerp( r[ xMin ], r[ xMax ], tRemapSmoothstep );

	        return y * amplitude;
	    };

	    /**
	    * Linear interpolation function.
	    * @param a The lower integer value
	    * @param b The upper integer value
	    * @param t The value between the two
	    * @returns {number}
	    */
	    var lerp = function(a, b, t ) {
	        return a * ( 1 - t ) + b * t;
	    };

	    // return the API
	    return {
	        getVal: getVal,
	        setAmplitude: function(newAmplitude) {
	            amplitude = newAmplitude;
	        },
	        setScale: function(newScale) {
	            scale = newScale;
	        }
	    };
	};

	function vector(x,y){
		this.x = x;
		this.y = y;		
		this.flagged = false;

		this.ang = 0;

		this.sub = function(v1,v2){
			this.x = v1.x - v2.x;
			this.y = v1.y - v2.y;
		}
		this.setValues = function(x,y){
			this.x = x;
			this.y = y;
			if((isNaN(this.x) || isNaN(this.y)) && !this.flagged){
				console.log(this.x, "setVal");
				this.flagged = true;
			}
		}
		this.magnitude = function(){
			return Math.sqrt((this.x*this.x)+(this.y*this.y));
		}
		this.add = function(otherV){
			this.x = this.x + otherV.x;
			this.y = this.y + otherV.y;			
			if((isNaN(this.x) || isNaN(this.y)) && !this.flagged){
				console.log(this.x, "add");
				this.flagged = true;
			}
		}
		this.addPieceWise = function(x,y){
			this.x += x;
			this.y += y;
		}
		this.mult = function(multiplier){
			this.x = this.x * multiplier;
			this.y = this.y * multiplier;
			if((isNaN(this.x) || isNaN(this.y)) && !this.flagged){
				console.log(this.x, "mult");
				this.flagged = true;
			}

		}
		this.div = function(divisor){
			if(divisor != 0){
				this.x = this.x / divisor;
				this.y = this.y / divisor;
			}
			if((isNaN(this.x) || isNaN(this.y)) && !this.flagged){
				console.log(this.x, "div");
				this.flagged = true;
			}

		}
		this.normalize = function(){
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
		this.limit = function(max){
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
		this.copyValues = function(vector){
			this.x = vector.x;
			this.y = vector.y;
			if((isNaN(this.x) || isNaN(this.y)) && !this.flagged){
				console.log(this.x, "copy");
				this.flagged = true;
			}
		}
		this.getAngle = function(){
			return Math.atan2(this.y,this.x);
		}
		this.dot = function(otherV){
			return this.x*otherV.x + this.y*otherV.y;
		}
		this.relativeAngle = function(otherV){
			return otherV.getAngle()-this.getAngle();
		}
		this.toString = function(){
			return this.x + "," + this.y;
		}
	}

	function arrow(mass,x,y,dx,dy){
		this.location = new vector(x,y);
		this.mass = mass;
		this.radius = Math.sqrt(100/Math.PI);
		
		this.maxV = 2.5;
		this.velocity = new vector(dx,dy);
		this.velocity.limit(this.maxV);
		this.heading = 0;//this.velocity.getAngle();

		this.maxF = 10;
		this.force = new vector(0,0);
		
		this.distanceTo = new vector(0,0);
		
		this.mag = 0;
	
		//for calculating the separation between arrows:
		this.maxSeparationF = 1;
		this.separationRadius = (this.radius * 2)+5;
		this.sumSeparations = new vector(0,0);
		this.separationForce = new vector(0,0);

		//for calculating the alignment force:
		this.maxAlignF = 1;
		this.sumAlignments = new vector(0,0);
		this.alignForce = new vector(0,0);

		
		//for calculating the cohesion force:
		this.maxCohesionF = 1;
		this.sumCohesion = new vector(0,0);
		this.cohesionForce = new vector(0,0);
		
		//for calculating the seeking force:
		this.maxSeekF = 1;
		this.desiredV = new vector(0,0);

		//random force
		this.randForce = new vector(0,0);


		//for drawing:
		this.firstVertex = new vector(0,0);
		this.applyForce = function(vector){
			this.force.add(vector);
		}
		this.update = function(curIndex, otherArrows, dt, randX, randY){
			this.force.setValues(0,0);
			
			this.distanceTo.setValues(0,0);

			this.separate(curIndex,otherArrows);
			this.separationForce.mult(1.5);

			this.align(curIndex,otherArrows);
			this.alignForce.mult(1.0);
	
			this.cohesion(curIndex,otherArrows);
			this.cohesionForce.mult(1.0);
			
			this.applyForce(this.separationForce);
			this.applyForce(this.alignForce);
			this.applyForce(this.cohesionForce);

			//this.randForce.setValues(PNgenerator.getVal(randX+this.location.x)-0.5,PNgenerator.getVal(randY+this.location.y)-0.5)

			//this.force.add(this.randForce);
			this.force.limit(this.maxF);

			if(this.force.magnitude() != 0){
				this.velocity.addPieceWise(this.force.x*(dt/this.mass),this.force.y*(dt/this.mass));
			}
			this.velocity.limit(this.maxV);

			if(this.velocity.magnitude() != 0){
				this.heading = this.velocity.getAngle();
			}
			this.location.addPieceWise(this.velocity.x*dt,this.velocity.y*dt);
			this.stayInBound();
		}
		this.separate = function(curIndex, otherArrows){
			this.numArrowsUsed = 0;
			this.sumSeparations.setValues(0,0);
			this.separationForce.setValues(0,0);
			this.mag = 0;
			for(var i = 0; i < otherArrows.length; i++){
				this.distanceTo.sub(this.location,otherArrows[i].location);
				this.mag = this.distanceTo.magnitude();
				//&& Math.abs(this.velocity.relativeAngle(this.distanceTo)) < Math.PI/2
				if(this.mag > 0 && this.mag < this.separationRadius){
					this.distanceTo.normalize();
					this.distanceTo.div(this.mag);
					this.sumSeparations.add(this.distanceTo);
					this.numArrowsUsed++;
				}
			}
			if(this.numArrowsUsed > 0){
				this.sumSeparations.div(this.numArrowsUsed);
			}
			if(this.sumSeparations.magnitude() > 0){
				this.sumSeparations.normalize();
				this.sumSeparations.mult(this.maxV);
				this.separationForce.sub(this.sumSeparations,this.velocity);
				this.separationForce.limit(this.maxSeparationF);
			}
		}
		this.align = function(curIndex, otherArrows){
			this.numArrowsUsed = 0;
			this.sumAlignments.setValues(0,0);
			this.alignForce.setValues(0,0);
			this.mag = 0;

			for(var i = 0; i < otherArrows.length; i++){
				this.distanceTo.sub(this.location,otherArrows[i].location);
				this.mag = this.distanceTo.magnitude();
				if(i != curIndex && this.mag > 0 && this.mag < neighborhood){
					//console.log("a.")
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
		this.cohesion = function(curIndex, otherArrows){
			this.numArrowsUsed = 0; 
			this.sumCohesion.setValues(0,0);
			this.cohesionForce.setValues(0,0);
			this.mag = 0;
			for(var i = 0; i < otherArrows.length; i++){
				this.distanceTo.sub(this.location,otherArrows[i].location);
				this.mag = this.distanceTo.magnitude();
				if(i != curIndex && this.mag > 0 && this.mag < neighborhood){
					this.sumCohesion.add(otherArrows[i].location);
					this.numArrowsUsed++;
				}
			}
			if(this.numArrowsUsed > 0){
				this.sumCohesion.div(this.numArrowsUsed);
				this.seek(this.sumCohesion,this.cohesionForce);
				//this.cohesionForce.copyValues(this.seekForce);
			}
		}
		this.seek = function(target,resultantForce){
			this.desiredV.setValues(0,0);
			this.desiredV.sub(target,this.location);
			this.desiredV.normalize();
			this.desiredV.mult(this.maxV);
			resultantForce.sub(this.desiredV,this.velocity);
			resultantForce.limit(this.maxSeekF);
		}
		this.stayInBound = function(){
			this.location.x = (this.location.x < 0) ? canvas.width : this.location.x;
			this.location.y = (this.location.y < 0) ? canvas.height : this.location.y;
			this.location.x = (this.location.x > canvas.width) ? 0 : this.location.x;
			this.location.y = (this.location.y > canvas.height) ? 0 : this.location.y;
		}

		this.reset = function(){
			this.location.setValues(x,y);
			this.velocity.setValues(Math.random()*10-5,Math.random()*10-5);
		}

		this.draw = function(){
			var context = canvas.getContext('2d');
			//this.drawCircle(context);
			this.drawTriangle(context);
		}
		this.drawCircle = function(context){
			context.beginPath();
			context.arc(this.location.x, this.location.y, this.radius, 0, 2 * Math.PI, false);
			context.fillStyle = '#000000';
			context.fill();
			context.stroke();
			context.closePath();
		}
		this.drawTriangle = function(context){
		    context.beginPath();
		    context.moveTo(this.location.x+(Math.cos(this.heading))*this.radius,this.location.y+(Math.sin(this.heading))*this.radius);
		    for(var i = 1; i < 3; i++){
			    this.firstVertex.setValues(this.location.x+(Math.cos(this.heading+(2*Math.PI/3)*i))*this.radius,this.location.y+(Math.sin(this.heading+(2*Math.PI/3)*i))*this.radius)
			    context.lineTo(this.firstVertex.x,this.firstVertex.y);
		    }
			context.fillStyle = '#FFFFFF';
		    context.fill();
		    context.closePath();
		}
		this.toString = function(){
			var str = this.location.toString() + ", [" + this.velocity.toString() + "," + this.velocity.magnitude() + "]," //+  this.force.toString() + "," + this.separationForce.toString() + "," + this.alignForce.toString() + "," + this.cohesionForce.toString()
			return str;
		}
	}



	function getArrows(numArrows){
		var arr = [];
		for(var i = 0; i < numArrows; i++){
			arr.push(new arrow(1,canvas.width/2,canvas.height/2,Math.random()*10-5,Math.random()*10-5))
		}
		return arr;
	}

	function setEventListeners(){
		window.onresize = setCanvasSize;
		document.getElementById("runner").addEventListener("click",function(e){
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
			arrows.push(new arrow(1,x,y,Math.random()*10-5,Math.random()*10-5))
		
			// for(var i = 0; i < arrows.length; i++){
			// 	arrows[i].reset();
			// }	
			console.log("added!")
		});
		window.mobilecheck = function() {
			var check = false;
			(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
			return check;
		};
	}

	function updateFrameRate(){
		numFrames++;
		if((elapsedTime[1]-elapsedTime[0]) > 100){
			elapsedTime[0] = Date.now();
			elapsedTime[1] = Date.now();
			frameRate = numFrames*10;
			numFrames = 0;
			optimizedSize = false;
		}
	}
	function setCanvasSize(){
		var heightWithoutCanvas = document.getElementById('header').offsetHeight+document.getElementById('footer').offsetHeight;
		var totalHeight = document.body.scrollHeight;
		canvas.width  = window.innerWidth;
		canvas.height = Math.max(totalHeight-(heightWithoutCanvas+100),100);
		console.log(canvas.height,heightWithoutCanvas);
	}
	function init(){
		setEventListeners();
		setCanvasSize();

		//updates the bottom credits to the current year:
		var year = new Date().getFullYear();
		document.getElementById("footer").innerHTML = "Pierre Theo Klein, McGill University,"+ year;

		if(window.mobilecheck()){
			arrows = getArrows(50);
			document.getElementById("footer").style.fontsize = "20px";
		}
		else{
			arrows = getArrows(750);
		}
		window.requestAnimationFrame(draw);
	}
	function timeDiff(){
		return time[1]-time[0];
	}
	function draw() {
		updateFrameRate();
		var context = canvas.getContext('2d');	
		context.clearRect(0,0,canvas.width,canvas.height); // clear canvas
		if(!introLoaded){
			loadIntro();
		}
		//removes 1/3 of the array if the frame rate is too low
		if(frameRate < 20 && optimizedSize == false){
			optimizedSize = true;
			var removeSize = arrows.length*3/4
			arrows = arrows.splice(removeSize,arrows.length-removeSize);
		}

		for(var i = 0; i < arrows.length; i++){
			arrows[i].update(i,arrows,0.4,PNX*(i+1),PNY*(i+1));
			arrows[i].draw();
		}
		PNX+=0.02;
		PNY+=0.02;
		time[1]=Date.now();
		elapsedTime[1]  = Date.now();
		window.requestAnimationFrame(draw);
		//console.log(arrows);
	}
	init();


}

document.getElementById("resumeLink").style.opacity = 0
document.getElementById("projLink").style.opacity = 0
animations();