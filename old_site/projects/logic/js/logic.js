var canvas = document.getElementById('runner');
var operators;
var dragging = false;
var errMessage = "";
var keys = [];

var mouseOperator = null;
var followMouse = true;

var coords = [0,0];

var mouseArrow = null;

function mouseArrowObj(startOperator){
	this.startOperator = startOperator;
	this.draw = function(){
		lineTo(coords[0],coords[1],this.startOperator.x+this.startOperator.width/2,this.startOperator.y,'#FFFFFF');
	}
}

function easyWrite(text,x,y){
	var font = getFont();
	var textAlign = 'center';
	var color = '#FFFFFF'
	write(text,x,y,font,textAlign,color);
}
function write(text,x,y,font,textAlign,color){
	var context = canvas.getContext('2d');
	context.save();	
	context.font=font;
	context.textAlign = textAlign;
	context.fillStyle = '#FFFFFF'//color;
	context.fillText(text,x,y);
	context.restore();	
	}
function getFont(){
	var fontSize = 13;
	var font = "bold " + fontSize + "px Arial";
	return font;
}
function writeMultiLine(textArr,startX,startY,textAlign,colors){
	var font = getFont();
	var textBoxWidth = 0;
	var textBoxHeight = fontSize * textArr.length + (textArr.length * buffer);
	var context = canvas.getContext('2d');
	for(var i = 0; i < textArr.length; i++){
		textBoxWidth = Math.max(context.measureText(textArr[i]).width,textBoxWidth);
	}
	console.log(textBoxWidth,textBoxHeight)
	if(startY + textBoxHeight > canvas.height){
		startY = canvas.height - textBoxHeight;		
	}
	if(startX + textBoxWidth > canvas.width){
		startX = canvas.width - textBoxWidth;		
	}	//drawBox(context, startX-buffer,startY-buffer,textBoxHeight+buffer,widestStrSize+buffer,'#FFFFFF','#D3D3D3',0.2);
	for(var i = 0; i < textArr.length; i++){
		write(textArr[i],startX,startY+i*(fontSize+buffer),font,textAlign,colors[i]);
	}
}
function fillRect(ULx,ULy,width,height,fillColor){
	var context = canvas.getContext('2d');
	context.save();
	context.fillStyle = fillColor;
	context.fillRect(ULx,ULy,width,height);
	context.strokeStyle="#FFFFFF";
	context.strokeRect(ULx,ULy,width,height);
	context.restore();
}
function halfCurve(centerX,centerY,radius,fillColor){
	var context = canvas.getContext('2d');

	context.beginPath();
	context.arc(centerX, centerY, radius, Math.PI+Math.PI/2, Math.PI/2, false);
	context.closePath();
	context.fillStyle = fillColor;
	context.fill();
	context.strokeStyle="#FFFFFF";
	context.stroke();
}

function drawLineWithArrowhead(p0,p1,headLength,color){
	var context = canvas.getContext('2d');
	var PI=Math.PI;
	var degreesInRadians200=200*PI/180;
	var degreesInRadians160=160*PI/180;

	// calc the angle of the line
	var dx=p1.x-p0.x;
	var dy=p1.y-p0.y;
	var angle=Math.atan2(dy,dx);

	// calc arrowhead points
	var x200=p1.x+headLength*Math.cos(angle+degreesInRadians200);
	var y200=p1.y+headLength*Math.sin(angle+degreesInRadians200);
	var x160=p1.x+headLength*Math.cos(angle+degreesInRadians160);
	var y160=p1.y+headLength*Math.sin(angle+degreesInRadians160);

	context.save();
	context.strokeStyle=color;
	context.lineWidth = 1.2;
	// draw line plus arrowhead
	context.beginPath();
	// draw the line from p0 to p1
	context.moveTo(p0.x,p0.y);
	context.lineTo(p1.x,p1.y);
	// draw partial arrowhead at 200 degrees
	context.moveTo(p1.x,p1.y);
	context.lineTo(x200,y200);
	// draw partial arrowhead at 160 degrees
	context.moveTo(p1.x,p1.y);
	context.lineTo(x160,y160);
	// stroke the line and arrowhead
	context.stroke();
	context.restore();
}
function lineTo(p1x, p1y,p2x,p2y,color){
	drawLineWithArrowhead({x:p2x,y:p2y},{x:p1x,y:p1y},10,color);
}
function thickLineTo(p1x,p1y,p2x,p2y,color){
	var context = canvas.getContext('2d');
	context.save();
	context.lineWidth = 1.2;
	context.strokeStyle=color;
	context.beginPath();
	context.moveTo(p1x,p1y);
	context.lineTo(p2x,p2y);
	context.stroke();
	context.restore();
	
}
//LOGIC GATES:
function TRUE(){
	this.x = 0;
	this.y = 0;
	this.width = 20;

	this.output = true;
	this.lastEvaluateID = 0;
	this.name = "TRUE";
	this.evaluate = function(id){
		this.lastEvaluateID = id;
		return this.output;
	}
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";

		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		write(this.name,this.x,this.y-13,getFont(),'center','#000000');
	}
	this.maxDepth = function(){
		return 0;
	}
	this.maxWidth = function(){
		return 0;
	}
}
function FALSE(){
	this.x = 0;
	this.y = 0;
	this.width = 20;

	this.output = false;
	this.lastEvaluateID = 0;
	this.name = "FALSE";

	this.evaluate = function(id){
		this.lastEvaluateID = id;
		return this.output;
	}
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";

		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		write(this.name,this.x,this.y-13,getFont(),'center','#000000');
	}
	this.maxDepth = function(){
		return 0;
	}
	this.maxWidth = function(){
		return 0;
	}
}
function SWITCH(a,tag){
	this.x = 0;
	this.y = 0;
	this.width = 20;

	this.output = (typeof a === 'undefined')?false:a;
	this.lastEvaluateID = 0;
	this.name = "SWITCH";
	this.tag = tag;
	this.evaluate = function(id){
		this.lastEvaluateID = id;
		return this.output;
	}
	this.toggle = function(){
		this.output = !this.output;
	}
	this.setSwitch = function(value){
		this.output = value;
	}
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";

		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		var identifier = (typeof this.tag === 'undefined')? this.name : this.tag;
		write(identifier,this.x,this.y-13,getFont(),'center','#000000');
	}
	this.maxDepth = function(){
		return 0;
	}
	this.maxWidth = function(){
		return 0;
	}
}
function AND(a,b,tag){
	this.x = 10;
	this.y = 10;
	this.width = 20;
	this.name = "AND";
	this.tag = tag;
	if(typeof a ==='undefined' || typeof b === 'undefined'){
		this.inputs = [null,null];
	}
	else{
		this.inputs = [a,b];
	}
	this.output = false;

	this.lastEvaluateID = 0;

	this.evaluate = function(id){
		if(this.lastEvaluateID == id){
			return this.output;
		}
		this.lastEvaluateID = id;
		this.output = true;
		for(var i = 0 ; i < this.inputs.length; i++){
			if(this.inputs[i] == null){
				this.output = false;
			}
			else{
				if(this.inputs[i].lastEvaluateID != id){
					this.inputs[i].evaluate(id);
				}
				if(this.inputs[i].output == false){
					this.output = false;
				}
			}
		}
		return this.output;
	}
	this.addInput = function(otherGate){
		if(this.inputs.length > 0 && this.inputs[0] == null){
			this.inputs[0] = otherGate;
		}
		else if(this.inputs.length > 1 && this.inputs[1] == null){
			this.inputs[1] = otherGate;			
		}
		else{
			this.inputs.push(otherGate);	
		}
	}
	this.addMultInputs = function(list){
		for(var i = 0; i < list.length; i++){
			this.inputs.push(list[i]);
		}
	}
	this.setInputsToList = function(list){
		this.inputs = list;
	}
	this.insertInput = function(inputNum,otherGate){
		this.inputs[inputNum] = otherGate;
	}
	this.removeInput = function(inputNum){
		this.inputs[inputNum] = null;
	}
	this.test = function(a,b){
		if(a && b){return true;}
		else{return false;}
	}
	this.maxDepth = function(){
		var curMax = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				var depth = this.inputs[i].maxDepth()+1;
				if(depth > curMax){curMax = depth;}
			}
		}
		return curMax;
	}
	this.maxWidth = function(){
		var numNotNull = 0;
		var childWidths = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				numNotNull++;
				childWidths += this.inputs[i].maxWidth();
			}
		}
		return (numNotNull > childWidths)?numNotNull : childWidths;
	}
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";

		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		//halfCurve(this.x,this.y,this.width/2,fillColor);
		write(this.name,this.x,this.y-13,getFont(),'center','#000000');
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i] != null){
				var color = (this.inputs[i].output)?"#00FF00":"#FFFFFF";
				lineTo(this.x-this.width/2,this.y,this.inputs[i].x+this.inputs[i].width/2,this.inputs[i].y,color);
			}
		}
	}
}
function OR(a,b,tag){
	this.x = 0;
	this.y = 0;
	this.width = 20;
	this.name = "OR"
	this.tag = tag;
	if(typeof a ==='undefined' || typeof b === 'undefined'){
		this.inputs = [null,null];
	}
	else{
		this.inputs = [a,b];
	}
	this.output = false;

	this.lastEvaluateID = 0;

	this.evaluate = function(id){
		if(this.lastEvaluateID == id){
			return this.output;
		}
		this.lastEvaluateID = id;
		this.output = false;
		for(var i = 0 ; i < this.inputs.length; i++){
			if(this.inputs[i] == null){
				console.log("null")
			}
			else{
				if(this.inputs[i].lastEvaluateID != id){
					this.inputs[i].evaluate(id);
				}
				if(this.inputs[i].output == true){
					this.output = true;
				}
			}
		}
		return this.output;
	}
	this.addInput = function(otherGate){
		if(this.inputs.length > 0 && this.inputs[0] == null){
			this.inputs[0] = otherGate;
		}
		else if(this.inputs.length > 1 && this.inputs[1] == null){
			this.inputs[1] = otherGate;			
		}
		else{
			this.inputs.push(otherGate);	
		}
	}
	this.addMultInputs = function(list){
		for(var i = 0; i < list.length; i++){
			this.inputs.push(list[i]);
		}
	}
	this.setInputsToList = function(list){
		this.inputs = list;
	}
	this.insertInput = function(inputNum,otherGate){
		this.inputs[inputNum] = otherGate;
	}
	this.removeInput = function(inputNum){
		this.inputs[inputNum] = null;
	}

	this.test = function(a,b){
		if(a || b){return true;}
		else{return false;}
	}
	this.maxDepth = function(){
		var curMax = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				var depth = this.inputs[i].maxDepth()+1;
				if(depth > curMax){curMax = depth;}
			}
		}
		return curMax;
	}
	this.maxWidth = function(){
		var numNotNull = 0;
		var childWidths = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				numNotNull++;
				childWidths += this.inputs[i].maxWidth();
			}
		}
		return (numNotNull > childWidths)?numNotNull : childWidths;
	}

	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";
		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		write(this.name,this.x,this.y-13,getFont(),'center','#000000');
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i] != null){
				var color = (this.inputs[i].output)?"#00FF00":"#FFFFFF";
				lineTo(this.x-this.width/2,this.y,this.inputs[i].x+this.inputs[i].width/2,this.inputs[i].y,color);
			}
		}
	}
}
function XOR(a,b,tag){
	this.x = 0;
	this.y = 0;
	this.width = 20;
	this.name = "XOR"
	this.tag = tag;
	if(typeof a ==='undefined' ||typeof b === 'undefined'){
		this.inputs = [null,null];
	}
	else{
		this.inputs = [a,b];
	}
	this.output = false;

	this.lastEvaluateID = 0;

	this.evaluate = function(id){
		if(this.lastEvaluateID == id){
			return this.output;
		}
		this.lastEvaluateID = id;
		var numTrue = 0;
		for(var i = 0 ; i < this.inputs.length; i++){
			if(this.inputs[i] == null){
				this.output =  false;
			}
			else{
				if(this.inputs[i].lastEvaluateID != id){
					this.inputs[i].evaluate(id);
				}
				if(this.inputs[i].output == true){
					numTrue++;
				}
			}
		}
		if(numTrue%2==1){this.output = true;}
		else{this.output = false;}
		return this.output;
	}
	this.addInput = function(otherGate){
		if(this.inputs.length > 0 && this.inputs[0] == null){
			this.inputs[0] = otherGate;
		}
		else if(this.inputs.length > 1 && this.inputs[1] == null){
			this.inputs[1] = otherGate;			
		}
		else{
			this.inputs.push(otherGate);	
		}
	}

	this.addMultInputs = function(list){
		for(var i = 0; i < list.length; i++){
			this.inputs.push(list[i]);
		}
	}
	this.setInputsToList = function(list){
		this.inputs = list;
	}
	this.insertInput = function(inputNum,otherGate){
		this.inputs[inputNum] = otherGate;
	}
	this.removeInput = function(inputNum){
		this.inputs[inputNum] = null;
	}

	this.test = function(a,b){
		if(a || b && !(a&&b)){return true;}
		else{return false;}
	}
	this.maxDepth = function(){
		var curMax = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				var depth = this.inputs[i].maxDepth()+1;
				if(depth > curMax){curMax = depth;}
			}
		}
		return curMax;
	}
	this.maxWidth = function(){
		var numNotNull = 0;
		var childWidths = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				numNotNull++;
				childWidths += this.inputs[i].maxWidth();
			}
		}
		return (numNotNull > childWidths)?numNotNull : childWidths;
	}
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";

		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		write(this.name,this.x,this.y-13,getFont(),'center','#000000');
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i] != null){
				var color = (this.inputs[i].output)?"#00FF00":"#FFFFFF";
				lineTo(this.x-this.width/2,this.y,this.inputs[i].x+this.inputs[i].width/2,this.inputs[i].y,color);
			}
		}
	}
}
function NOT(a,tag){
	this.x = 0;
	this.y = 0;
	this.width = 20;
	this.name = "NOT"
	this.tag = tag;
	if(typeof a ==='undefined'){
		this.inputs = [null];
	}
	else{
		this.inputs = [a];
	}
	this.output = false;

	this.lastEvaluateID = 0;

	this.evaluate = function(id){
		if(this.lastEvaluateID == id){
			return this.output;
		}
		this.lastEvaluateID = id;
		var numTrue = 0;
		for(var i = 0 ; i < this.inputs.length; i++){
			if(this.inputs[i] == null){
				this.output =  false;
			}
			else{
				if(this.inputs[i].lastEvaluateID != id){
					this.inputs[i].evaluate(id);
				}
				if(this.inputs[i].output == true){
					this.output = false;
				}
				else{
					this.output = true;
				}
			}
		}
		return this.output;
	}
	this.addInput = function(otherGate){
		if(this.inputs.length > 0 && this.inputs[0] == null){
			this.inputs[0] = otherGate;
		}
		else if(this.inputs.length == 0){
			this.inputs.push(otherGate);
		}
	}
	this.addMultInputs = function(list){
		for(var i = 0; i < list.length; i++){
			this.inputs.push(list[i]);
		}
	}
	this.setInputsToList = function(list){
		this.inputs = list;
	}
	this.insertInput = function(inputNum,otherGate){
		this.inputs[inputNum] = otherGate;
	}
	this.removeInput = function(inputNum){
		this.inputs[inputNum] = null;
	}

	this.test = function(a){
		return !a;
	}
	this.maxDepth = function(){
		var curMax = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				var depth = this.inputs[i].maxDepth()+1;
				if(depth > curMax){curMax = depth;}
			}
		}
		return curMax;
	}
	this.maxWidth = function(){
		var numNotNull = 0;
		var childWidths = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				numNotNull++;
				childWidths += this.inputs[i].maxWidth();
			}
		}
		return (numNotNull > childWidths)?numNotNull : childWidths;
	}
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";

		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		write(this.name,this.x,this.y-13,getFont(),'center','#000000');
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i] != null){
				var color = (this.inputs[i].output)?"#00FF00":"#FFFFFF";
				lineTo(this.x-this.width/2,this.y,this.inputs[i].x+this.inputs[i].width/2,this.inputs[i].y,color);
			}
		}
	}
}
function NAND(a,b,tag){
	this.x = 0;
	this.y = 0;
	this.width = 20;
	this.name = "NAND"
	this.tag = tag;
	if(typeof a ==='undefined' || typeof b === 'undefined'){
		this.inputs = [null,null];
	}
	else{
		this.inputs = [a,b];
	}
	this.output = false;

	this.lastEvaluateID = 0;

	this.evaluate = function(id){
		if(this.lastEvaluateID == id){
			return this.output;
		}
		this.lastEvaluateID = id;
		this.output = false;
		for(var i = 0 ; i < this.inputs.length; i++){
			if(this.inputs[i] != null){
				if(this.inputs[i].lastEvaluateID != id){
					this.inputs[i].evaluate(id);
				}
				if(this.inputs[i].output == false){
					this.output = true;
				}
			}
		}
		return this.output;
	}
	this.addInput = function(otherGate){
		if(this.inputs.length > 0 && this.inputs[0] == null){
			this.inputs[0] = otherGate;
		}
		else if(this.inputs.length > 1 && this.inputs[1] == null){
			this.inputs[1] = otherGate;			
		}
		else{
			this.inputs.push(otherGate);	
		}
	}
	this.addMultInputs = function(list){
		for(var i = 0; i < list.length; i++){
			this.inputs.push(list[i]);
		}
	}
	this.insertInput = function(inputNum,otherGate){
		this.inputs[inputNum] = otherGate;
	}
	this.setInputsToList = function(list){
		this.inputs = list;
	}
	this.removeInput = function(inputNum){
		this.inputs[inputNum] = null;
	}

	this.test = function(a,b){
		if(!(a&&b)){return true;}
		else{return false;}
	}
	this.maxDepth = function(){
		var curMax = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				var depth = this.inputs[i].maxDepth()+1;
				if(depth > curMax){curMax = depth;}
			}
		}
		return curMax;
	}
	this.maxWidth = function(){
		var numNotNull = 0;
		var childWidths = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				numNotNull++;
				childWidths += this.inputs[i].maxWidth();
			}
		}
		return (numNotNull > childWidths)?numNotNull : childWidths;
	}
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";

		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		write(this.name,this.x,this.y-13,getFont(),'center','#000000');
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i] != null){
				var color = (this.inputs[i].output)?"#00FF00":"#FFFFFF";
				lineTo(this.x-this.width/2,this.y,this.inputs[i].x+this.inputs[i].width/2,this.inputs[i].y,color);
			}
		}
	}
}
function NOR(a,b,tag){
	this.x = 0;
	this.y = 0;
	this.width = 20;
	this.name = "NOR"
	this.tag = tag;

	if(typeof a ==='undefined' ||typeof b === 'undefined'){
		this.inputs = [null,null];
	}
	else{
		this.inputs = [a,b];
	}
	this.output = false;

	this.lastEvaluateID = 0;

	this.evaluate = function(id){
		if(this.lastEvaluateID == id){
			return this.output;
		}
		this.lastEvaluateID = id;
		this.output = true;
		for(var i = 0 ; i < this.inputs.length; i++){
			if(this.inputs[i] == null){
				this.output =  false;
			}
			else{
				if(this.inputs[i].lastEvaluateID != id){
					this.inputs[i].evaluate(id);
				}
				if(this.inputs[i].output == true){
					this.output = false;
				}
			} 
		}
		return this.output;
	}
	this.addInput = function(otherGate){
		if(this.inputs.length > 0 && this.inputs[0] == null){
			this.inputs[0] = otherGate;
		}
		else if(this.inputs.length > 1 && this.inputs[1] == null){
			this.inputs[1] = otherGate;			
		}
		else{
			this.inputs.push(otherGate);	
		}
	}
	this.addMultInputs = function(list){
		for(var i = 0; i < list.length; i++){
			this.inputs.push(list[i]);
		}
	}
	this.insertInput = function(inputNum,otherGate){
		this.inputs[inputNum] = otherGate;
	}
	this.setInputsToList = function(list){
		if(list.length == 0){
			this.inputs = [null,null];

		}
		if(list.length == 1){
			this.inputs = [list[0],null];
		}
		else{
			this.inputs = list;
		}
	}
	this.removeInput = function(inputNum){
		this.inputs[inputNum] = null;
	}

	this.test = function(a,b){
		if(!a&&!b){return true;}
		else{return false;}
	}
	this.maxDepth = function(){
		var curMax = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				var depth = this.inputs[i].maxDepth()+1;
				if(depth > curMax){curMax = depth;}
			}
		}
		return curMax;
	}
	this.maxWidth = function(){
		var numNotNull = 0;
		var childWidths = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				numNotNull++;
				childWidths += this.inputs[i].maxWidth();
			}
		}
		return (numNotNull > childWidths)?numNotNull : childWidths;
	}
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";

		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		write(this.name,this.x,this.y-13,getFont(),'center','#000000');
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i] != null){
				var color = (this.inputs[i].output)?"#00FF00":"#FFFFFF";
				lineTo(this.x-this.width/2,this.y,this.inputs[i].x+this.inputs[i].width/2,this.inputs[i].y,color);
			}
		}
	}
}
function XNOR(a,b,tag){
	this.x = 0;
	this.y = 0;
	this.width = 20;
	this.name = "XNOR"
	this.tag = tag;
	if(typeof a ==='undefined' ||typeof b === 'undefined'){
		this.inputs = [null,null];
	}
	else{
		this.inputs = [a,b];
	}
	this.output = false;


	this.lastEvaluateID = 0;

	this.evaluate = function(id){
		if(this.lastEvaluateID == id){
			return this.output;
		}
		this.lastEvaluateID = id;
		this.output = true;
		for(var i = 1; i < this.inputs.length; i++){
			if(this.inputs[i] == null || this.inputs[i-1] == null){
				this.output =  false;
				break;
			}
			else{
				if(this.inputs[i].lastEvaluateID != id){
					this.inputs[i].evaluate(id);
				}
				if(this.inputs[i-1].lastEvaluateID != id){
					this.inputs[i-1].evaluate(id);					
				}
				if(this.inputs[i].output != this.inputs[i-1].output){
					this.output = false;
				}
			}
		}
		return this.output;
	}
	this.addInput = function(otherGate){
		if(this.inputs.length > 0 && this.inputs[0] == null){
			this.inputs[0] = otherGate;
		}
		else if(this.inputs.length > 1 && this.inputs[1] == null){
			this.inputs[1] = otherGate;			
		}
		else{
			this.inputs.push(otherGate);	
		}
	}
	this.addMultInputs = function(list){
		for(var i = 0; i < list.length; i++){
			this.inputs.push(list[i]);
		}
	}
	this.setInputsToList = function(list){
		this.inputs = list;
	}
	this.insertInput = function(inputNum,otherGate){
		this.inputs[inputNum] = otherGate;
	}
	this.removeInput = function(inputNum){
		this.inputs[inputNum] = null;
	}

	this.test = function(a,b){
		if(a==b){return true;}
		else{return false;}
	}
	this.maxDepth = function(){
		var curMax = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				var depth = this.inputs[i].maxDepth()+1;
				if(depth > curMax){curMax = depth;}
			}
		}
		return curMax;
	}
	this.maxWidth = function(){
		var numNotNull = 0;
		var childWidths = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				numNotNull++;
				childWidths += this.inputs[i].maxWidth();
			}
		}
		return (numNotNull > childWidths)?numNotNull : childWidths;
	}

	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";

		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		write(this.name,this.x,this.y-13,getFont(),'center','#000000');
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i] != null){
				var color = (this.inputs[i].output)?"#00FF00":"#FFFFFF";
				lineTo(this.x-this.width/2,this.y,this.inputs[i].x+this.inputs[i].width/2,this.inputs[i].y,color);
			}
		}
	}
}

//ACCESSORIES:
function SCREEN(a,b,c,d,e,f,g,h,tag){
	if(typeof a ==='undefined' ||typeof b === 'undefined'||typeof c === 'undefined'||typeof d === 'undefined'||typeof e === 'undefined'||typeof f === 'undefined'||typeof g === 'undefined'||typeof h === 'undefined'){
		this.inputs = [null,null,null,null,null,null,null,null];
	}
	else{
		this.inputs = [a,b,c,d,e,f,g,h];
		if(a||b||c||d||e||f||g||h){
			this.output = true;
		}
	}
	this.x = 0;
	this.y = 0;
	this.width = 40;
	this.height = 80;
	this.name = "SCREEN"
	this.tag = tag;
	this.output = false;

	this.evaluate = function(id){
		if(this.lastEvaluateID == id){
			return this.output;
		}
		this.lastEvaluateID = id;
		this.output = true;
		for(var i = 1; i < this.inputs.length; i++){
			if(this.inputs[i] == null || this.inputs[i-1] == null){

			}
			else{
				if(this.inputs[i].lastEvaluateID != id){
					this.inputs[i].evaluate(id);
				}
				if(this.inputs[i].output){
					this.output = true;
				}
			}
		}
		return this.output;
	}
	this.addInput = function(otherGate){
		var placed = false;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]==null){
				this.inputs[i] = otherGate;
				placed = true;
				break;
			}
		}
		if(!placed && this.inputs.length < 8){
			this.inputs[i].push(otherGate);
		}
	}
	this.addMultInputs = function(list){
		var originalLength = this.inputs.length;
		if(originalLength < 8){
			for(var i = 0; i < Math.min((8-originalLength),list.length); i++){
				this.inputs.push(list[i]);
			}
		}
		else if(originalLength == 8){
			var j = 0;
			for(var i = 0; i < this.inputs.length; i++){
				if(this.inputs[i]==null && j < list.length){
					this.inputs[i] = list[j];
					j++;
				}
			}
		}
	}
	this.setInputsToList = function(list){
		if(list.lenth == 8){
			this.inputs = list;
		}
		else if(list.length < 8){
			for(var i = 0; i < this.inputs.length; i++){
				if(i < list.length){
					this.inputs[i] = list[i];
				}
				else{
					this.inputs[i] = null;
				}
			}
		}
	}
	this.insertInput = function(inputNum,otherGate){
		this.inputs[inputNum] = otherGate;
	}
	this.removeInput = function(inputNum){
		this.inputs[inputNum] = null;
	}

	this.test = function(a,b){
		if(a==b){return true;}
		else{return false;}
	}
	this.maxDepth = function(){
		var curMax = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				var depth = this.inputs[i].maxDepth()+1;
				if(depth > curMax){curMax = depth;}
			}
		}
		return curMax;
	}
	this.maxWidth = function(){
		var numNotNull = 0;
		var childWidths = 0;
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i]!=null){
				numNotNull++;
				childWidths += this.inputs[i].maxWidth();
			}
		}
		return (numNotNull > childWidths)?numNotNull : childWidths;
	}

	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		//base color:
		fillRect(this.x-this.width/2,this.y-this.height/2,this.width,this.height,'#696969');

		write(this.name,this.x,this.y-(this.height/2+3),getFont(),'center','#000000');
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i] != null){
				var color = (this.inputs[i].output)?"#00FF00":"#FFFFFF";
				//draw line to the input node
				lineTo(this.x-this.width/2,this.y-(this.height/2)+(this.height/this.inputs.length*i),this.inputs[i].x+this.inputs[i].width/2,this.inputs[i].y,color);
				//draw lines to represent the numbers:
				// ____
				// |  | 
				// ----
				// |__|.

				if(this.inputs[i].output == true){
					var hbuffer = this.width/10;
					var vbuffer = this.height/12;
					var x1 = 0;
					var x2 = 0;
					var y1 = 0;
					var y2 = 0;
					switch(i){
						case 0: //middle middle horizontal bar
							x1 = this.x-this.width/2+hbuffer;
							y1 = this.y;
							x2 = this.x+this.width/2-hbuffer;
							y2 = y1;
							break;
						case 1: //top left vertical bar
							x1 = this.x-this.width/2+hbuffer;
							y1 = this.y-this.height/2+(2*vbuffer);
							x2 = x1;
							y2 = this.y-vbuffer;
							break;
						case 2: //top middle horizontal bar
							x1 = this.x-this.width/2+hbuffer;
							y1 = this.y-this.height/2+vbuffer;
							x2 = this.x+this.width/2-hbuffer;
							y2 = y1;
							break;
						case 3: //top right vertical bar
							x1 = this.x+this.width/2-hbuffer;
							y1 = this.y-this.height/2+(2*vbuffer);
							x2 = x1;
							y2 = this.y-vbuffer;
							break;
						case 4: //bottom left vertical bar
							x1 = this.x-this.width/2+hbuffer;
							y1 = this.y+vbuffer
							x2 = x1;
							y2 = this.y+this.height/2-(2*vbuffer);
							break;
						case 5: //bottom bottom horizontal bar
							x1 = this.x-this.width/2+hbuffer;
							y1 = this.y+this.height/2-vbuffer;
							x2 = this.x+this.width/2-hbuffer;
							y2 = y1;
							break;
						case 6: //bottom right vertical bar
							x1 = this.x+this.width/2-hbuffer;
							y1 = this.y+vbuffer
							x2 = x1;
							y2 = this.y+this.height/2-(2*vbuffer);
							break;
					}
					thickLineTo(x1,y1,x2,y2,color);
				}
			}
		}
	}
}

function testLogic(lastNode,switchArray){
	var resultsArray = [];
	var testNum = 1;
	for(var i = 0; i <= Math.pow(2,switchArray.length); i++){
		var row = [];
		for(var j = 0; j <= switchArray.length; j++){
			if(i==0){
				if(j == switchArray.length){
					row.push("Result");
				}
				else if(switchArray[j].name !== "SWITCH"){
					console.log("Error, please only include switches in the switch array.");
					return "Error";
				}
				else{
					var tag = "Swit. " + j;
					if(typeof switchArray[j].tag !== 'undefined'){
						tag = switchArray[j].tag;
					}
					row.push(tag);
				}
			}
			else{
				row.push("	")
			}
		}
		resultsArray.push(row);
	}

	function testLogicHelper(lastNode,switchArray,index,resultsArray){
		if(resultsArray.length != Math.pow(2,switchArray.length)+1 || resultsArray[0].length != switchArray.length+1){
			return "Error 1: invalid lengths."
		}
		else if(switchArray.length == 0){
			resultsArray[1][0] = lastNode.evaluate(id);
			return "Success";
		}
		else if(index < switchArray.length-1){
			testLogicHelper(lastNode,switchArray,index+1,resultsArray);
			switchArray[index].toggle();
			testLogicHelper(lastNode,switchArray,index+1,resultsArray);
			return "Success";
		}
		else{
			for(var i = 0; i <= index; i++){
				resultsArray[testNum][i] = switchArray[i].evaluate(testNum);
			}
			resultsArray[testNum][index+1] = lastNode.evaluate(testNum);
			testNum++;

			switchArray[index].toggle();
			for(var i = 0; i <= index; i++){
				resultsArray[testNum][i] = switchArray[i].evaluate(testNum);
			}
			resultsArray[testNum][index+1] = lastNode.evaluate(testNum);
			testNum++;
			return "Success";
		}
	}
	testLogicHelper(lastNode,switchArray,0,resultsArray);
	return resultsArray;
}
function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return [x,y];
}
//returns index of mass if a mass exists at a given coordinate
function getOperatorAtCoord(pos){
	for(var i = 0; i < operators.length; i++){
		var op = operators[i];

		var dist = Math.sqrt(Math.pow(op.x-pos[0],2) + Math.pow(op.y-pos[1],2));
		//console.log("location:"+ curBody.getLocation() + "distance: "+ dist + ", " + "radius of index "+i+": "+curBody.radius);
		if(dist < Math.sqrt(Math.pow(op.width,2) + Math.pow(op.width,2))){
			return i;
		}
	}
	return -1;
}

function parseString(str,existingOperators){
	//sanitize the string:
	str = sanitize(str);
	//debug(str);
	//this is the location that all of the below functions will start from. The functions will update the string.
	var strIndex = 0;
	var operators = existingOperators;
	if(typeof existingOperators === 'undefined'){
		operators = [];
	}

	function sanitize(str){
		//removes all newlines, tabs, and spaces from the string
		var newStr = str.replace(/[\n\t\s]+/g,"");
		return newStr;
	}

	function scan(s,tokenset) {
		var TRUE = /^TRUE/i;
		var FALSE = /^FALSE/i;
		var AND = /^AND\(/i;
		var OR = /^OR\(/i;
		var NOR = /^NOR\(/i;
		var XOR = /^XOR\(/i;
		var NOT = /^NOT\(/i;
		var NAND = /^NAND\(/i;
		var XNOR = /^XNOR\(/i;
		var SCREEN = /^SCREEN\(/i;
		var variable = /^[A-Za-z0-9]+/;
		var CLOSEPARENTHESIS = /^\)/;
		var comma = /^,/;
	    // just for debugging
	    // var ss = "{ ";
	    // for (var t in tokenset) {
	    //     ss += t + ": "+tokenset[t]+", ";
	    // }
	    // addDebugText("Token set: "+ss+"}\n");

	    var tokens = [
	        { name:"TRUE", regexp:TRUE },
	        { name:"FALSE", regexp:FALSE },
	        { name:"AND", regexp:AND }, 
	        { name:"OR", regexp:OR },
	        { name:"NOR", regexp:NOR},
	        { name:"XOR", regexp:XOR },
	        { name:"NOT", regexp:NOT },
	        { name:"NAND", regexp:NAND },
	        { name:"XNOR", regexp:XNOR },
	        { name:"CLOSEPARENTHESIS", regexp: CLOSEPARENTHESIS},
	        { name:"variable", regexp: variable},
	        { name:"comma", regexp:comma},
	        { name:"SCREEN", regexp: SCREEN}];

	    // Now, iterative through our tokens array, and see what we find
	    for (var i=0; i<tokens.length; i++) {
	        var m;
	        if (tokenset[tokens[i].name] && (m = s.match(tokens[i].regexp))) {
	            return { token:tokens[i].name, value:m[0] };
	        }
	    }
	    throw "Hey! Something went wrong with your logic. Please look over it!";
	}

	function findOperatorIndex(list, tag,callID){
		for(var i = 0; i < list.length; i++){
			console.log(list[i].tag + ", "+tag + "," +callID);
			if(list[i].tag == tag){
				return i;
			}
		}
		return -1;
	}

	function parseOperator(str){
		//here, we want to see what boolean operation there is to start it all off.
		var operatorTokenset = {AND:true,OR:true,XOR:true,NOR:true, NOT:true,NAND:true,XNOR:true, SCREEN: true};
		var opToken = scan(str.substring(strIndex),operatorTokenset);
		strIndex += opToken.value.length;
		//then parse the inside of the operator:
		var list = [];
		parseList(str,list);
		//create the gate from the array that is returned from the inside:
		var gate;
		switch(opToken.token){
			case "AND":
				gate = new AND();
				break;
			case "OR":
				gate = new OR();
				break;
			case "NOR":
				gate = new NOR();
				break;
			case "XOR":
				gate = new XOR();
				break;
			case "NOT":
				gate = new NOT();
				break;
			case "NAND":
				gate = new NAND();
				break;
			case "XNOR":
				gate = new XNOR();
				break;
			case "SCREEN":
				gate = new SCREEN();
				break;
		}
		gate.setInputsToList(list);
		//debug(gate);
		operators.push(gate);
		return gate;
	}

	function parseList(str,list){
		//here, we could either have another operator as the next element, or we could have a base case as the next element. 
		var operatorAndVarTokenset = {AND:true,OR:true,XOR:true,NOT:true,NAND:true,NOR:true, XNOR:true,TRUE:true,FALSE:true,SCREEN: true, variable:true,comma:true,CLOSEPARENTHESIS:true};
		var opToken = scan(str.substring(strIndex),operatorAndVarTokenset);
		//recursive step:
		if(opToken.token == "AND"||opToken.token == "OR"||opToken.token=="NOR" || opToken.token == "XOR"||opToken.token == "NOT"||opToken.token == "NAND"||opToken.token == "XNOR"){
			list.push(parseOperator(str));
			parseList(str,list);
		}
		else if(opToken.token == "TRUE" || opToken.token == "FALSE" || opToken.token == "variable"){ //base case type 1
			var bc;
			switch(opToken.token){
				case "TRUE":
					bc = new TRUE();
					operators.push(bc);
					break;
				case "FALSE":
					bc = new FALSE();
					operators.push(bc);
					break;
				case "variable":
					var containedList = (findOperatorIndex(operators,opToken.value, "1")!= -1)? operators : ((findOperatorIndex(list,opToken.value,"2")!= -1)? list : null);
					if(containedList != null){
						console.log("BC was already created");
						bc = containedList[findOperatorIndex(containedList,opToken.value,"3")];
					}
					else{
						//add the list of operators to the operators array, if they haven't been seen yet
						bc = new SWITCH(true, opToken.value);
						operators.push(bc);
					}
					break;
				default:
					console.log("BC IS NOT TRUE OR FALSE OR VARIABLE")
			}
			strIndex += opToken.value.length;

			//so that we don't have redundant inputs
			if(typeof bc.tag === 'undefined' || findOperatorIndex(list,bc.tag,"5") == -1 ){
				list.push(bc);
			}
			parseList(str,list);
		}
		else if(opToken.token == "comma"){ //that means there's another element in the list, so we want to remove the comma and move forward by one step
			strIndex++;
			parseList(str,list);
		}
		else if(opToken.token == "CLOSEPARENTHESIS"){ //that means we're at the end of the list so it is safe to pop out.
			strIndex++;
			return;
		}
		else{
			console.log("Error");
		}
	}
	try{
		parseOperator(str);
	}catch(err){
		errMessage = err;
		console.log(err);
		operators = [];
	}
	return operators;
}
function setupExpression(str,existingOperators){ //
	var operators = parseString(str,existingOperators);
	organizeCircuit(operators);
	return operators;
}
//this assumes that the end result of the whole circuit is the last element of the array
function organizeCircuit(operators){
	var maxDepth = 0;
	//how far from the edges will the nodes be
	var borderBuffer = 10;
	//how far apart from each layer will the nodes be
	var widthBuffer = 0;
	//how many nodes are at each layer
	var frequencyOfEachDepth = [];
	var maxHeight = 0;
	for(var i = 0; i < operators.length; i++){
		var curDepth = operators[i].maxDepth();

		if(curDepth > maxDepth){
			maxDepth = operators[i].maxDepth();
		}
		if(typeof frequencyOfEachDepth[curDepth] === 'undefined'){
			frequencyOfEachDepth[curDepth] = 1;
		}
		else{
			frequencyOfEachDepth[curDepth]++;	
			if(frequencyOfEachDepth[curDepth] > maxHeight){
				maxHeight = frequencyOfEachDepth[curDepth];
			}		
		}
	}

	for(var i = 0; i < frequencyOfEachDepth.length; i++){
		frequencyOfEachDepth[i] = 0;
	}

	widthBuffer = canvas.width / (maxDepth+2);
	if(maxHeight <= 1){maxHeight = 1};
	heightBuffer = canvas.height / (maxHeight+1);
	
	for(var i = 0; i < operators.length; i++){
		var curDepth = operators[i].maxDepth();
		operators[i].x = widthBuffer + widthBuffer*curDepth;
		operators[i].y = heightBuffer + heightBuffer*frequencyOfEachDepth[curDepth];
		frequencyOfEachDepth[curDepth]++;
	}
}
function generateTruthTable(){
	var switches = [];
	for(var i = 0; i < operators.length; i++){
		if(operators[i].name == "SWITCH"){
			switches.push(operators[i]);
		}
	}
	var results = testLogic(operators[operators.length-1],switches);
	//now we generate the html for it:
	var table = "<table>"
	for(var i = 0; i < results.length; i++){
		table+="<tr>"
		for(var j = 0; j < results[i].length; j++){
			if(i==0){
				table+="<th>"+results[i][j]+"</th>";
			}
			else{
				var styler = "";
				if(results[i][j]){
					styler = " style=\"background-color:rgba(0,255,0,0.5);\""
				}
				else{
					styler = " style=\"background-color:rgba(255,0,0,0.5);\""
				}
				table+="<td"+styler+">"+results[i][j]+"</td>";				
			}
		}
		table+="</tr>"
	}
	openWindow()
	function openWindow() {
	    var newWindow = window.open("", null, "height=400,width=400,status=yes,toolbar=no,menubar=no,location=no");  
		newWindow.document.write("<style>table, th, td {border: 1px solid black;}</style>") 
	    newWindow.document.write(table);
	}

	function setValue(value) {
	    document.getElementById('value').value = value;
	}
}

function randomStr(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 4; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;

}

function appendToDiagram(){
	errMessage = "";
	var textarea = document.getElementById("expression");
	var str = textarea.value;
	operators = setupExpression(str,operators);
	return operators;
}

function updateDiagram(){
	errMessage = "";
	var textarea = document.getElementById("expression");
	var str = textarea.value;
	operators = setupExpression(str);
	return operators;
}
function clear(){
	console.log("cleared");
	operators = [];
}

function setEventListeners(){
	var runnerElement = document.getElementById("runner");
	runnerElement.addEventListener("mousedown", function(){
    	dragging = true;
	}, false);
	runnerElement.addEventListener("mouseup", function(){
    	dragging = false;
	}, false);

	runnerElement.addEventListener("mousemove", function () {
		coords = getCursorPosition(canvas,event);
		var index = getOperatorAtCoord(coords);
		if(index != -1 && dragging){
			operators[index].x = coords[0];
			operators[index].y = coords[1];
		}
	});
	runnerElement.addEventListener("click",function() {
		//this means we're placing a logic gate down
		if(mouseOperator != null){
			operators.unshift(mouseOperator);
			mouseOperator = null;
			followMouse = false;
		}
		if(keys[67]){//if we hold down C and then click, then start drawing arrow. If we already started drawing, then delete arrow.
			var coords = getCursorPosition(canvas,event);
			var index = getOperatorAtCoord(coords);
			if(mouseArrow == null){
				if(index != -1){
					mouseArrow = new mouseArrowObj(operators[index]);
				}

			}
		}
		else{
			var coords = getCursorPosition(canvas,event);
			var index = getOperatorAtCoord(coords);
			if(mouseArrow != null){
				if(index != -1 && (operators[index].name != "TRUE" || operators[index].name != "FALSE" || operators[index].name != "SWITCH")){
					operators[index].addInput(mouseArrow.startOperator);
				}
				mouseArrow = null;
			}
			else if(index != -1 && operators[index].name == "SWITCH" ){
				operators[index].toggle();
			}
		}
	});
	window.addEventListener("keypress",function(event){
		var kc = event.keyCode;
		switch(kc){
			case 49: //1
				mouseOperator = new TRUE();
				break;
			case 50://2
				mouseOperator = new FALSE();
				break;
			case 51://3
				mouseOperator = new SWITCH(true,randomStr());
				break;
			case 52://4
				mouseOperator = new AND();
				break;
			case 53://5
				mouseOperator = new OR();
				break;
			case 54://6
				mouseOperator = new NOR();
				break;
			case 55://7
				mouseOperator = new XOR();
				break;
			case 56://8
				mouseOperator = new NOT();
				break;
			case 57://9
				mouseOperator = new NAND();
				break;
			case 48://0
				mouseOperator = new XNOR();
				break;
			case 115: //S
				mouseOperator = new SCREEN();
				break;
			default:
				mouseOperator = null;	
				break;
		}
		if(mouseOperator!= null){
			followMouse = true;
			mouseOperator.x = coords[0];
			mouseOperator.y = coords[1];
			//console.log(kc, mouseOperator)
		}
	});
	window.addEventListener("keydown", function (e) {
		keys[e.keyCode] = true;
	});
	window.addEventListener("keyup", function (e) {
		keys[e.keyCode] = false;
	});

	document.getElementById("appendExpression").onclick = function(){appendToDiagram()};

	document.getElementById("submitExpression").onclick = function() {updateDiagram()};
}
function init(){
	operators = setupExpression("OR(OR(AND(AND(P,Q),R),AND(AND(P,Q),S)),OR(AND(AND(P,R),S),AND(AND(Q,R),S)))");
	setEventListeners();
	window.requestAnimationFrame(draw);
}


function draw() {
	canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height); // clear canvas	
	canvas.getContext('2d').fillStyle = '#000000'
	canvas.getContext('2d').fillRect(0,0,canvas.width,canvas.height);
	var id = Math.random();
	for(var i = 0; i < operators.length; i++){
		operators[i].evaluate(id);

	}
	for(var i = 0; i < operators.length; i++){
		operators[i].draw();
	}
	if(errMessage != ""){
		easyWrite(errMessage,canvas.width/2,canvas.height/2);
	}
	if(mouseOperator != null && followMouse){
		mouseOperator.draw();
		mouseOperator.x = coords[0];
		mouseOperator.y = coords[1];
	}
	if(mouseArrow != null){
		mouseArrow.draw();
	}
	window.requestAnimationFrame(draw);
}
init();
