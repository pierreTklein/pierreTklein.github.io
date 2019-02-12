var canvas = document.getElementById('runner');

var errMessage = "";
var keys = [];

var nodes = [];
var rootNode = null;

var coords = [0,0];
var mouseArrow = null;


/*THE CODE IN THIS SECTION HAS TO DO WITH THE MOUSE*/
	function getCursorPosition(canvas, event) {
	    var rect = canvas.getBoundingClientRect();
	    var x = event.clientX - rect.left;
	    var y = event.clientY - rect.top;
	    return [x,y];
	}

/*THE CODE IN THIS SECTION HAS TO DO WITH DRAWING IMAGES TO THE CANVAS*/
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
		context.fillStyle = color;
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
		//console.log(textBoxWidth,textBoxHeight)
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
		context.save();
		context.beginPath();
		context.arc(centerX, centerY, radius, Math.PI+Math.PI/2, Math.PI/2, false);
		context.closePath();
		context.fillStyle = fillColor;
		context.fill();
		context.strokeStyle="#FFFFFF";
		context.stroke();
		context.restore();
	}
	function fullCircle(centerX,centerY,radius,fillColor){
		var context = canvas.getContext('2d');
		context.save();
		context.beginPath();
		context.arc(centerX, centerY, radius, 0, Math.PI*2, false);
		context.closePath();
		context.fillStyle = fillColor;
		context.fill();
		context.strokeStyle="#FFFFFF";
		context.stroke();
		context.restore();
	}
	function drawQuadCurve(p1x,p1y,p2x,p2y,controlPointX,controlPointY,color){
		var context = canvas.getContext('2d');
		context.save();
		context.lineWidth = 1.2;
		context.strokeStyle='#FFFFFF';
		context.beginPath();
		context.moveTo(p1x,p1y);
		context.quadraticCurveTo(controlPointX,controlPointY,p2x,p2y);
		context.stroke();
		context.restore();
	}
	function drawQuadCurveWithArrowHead(p1x,p1y,p2x,p2y,controlPointX,controlPointY,headLength,color){
		var context = canvas.getContext('2d');
		context.save();
		context.lineWidth = 1.2;
		context.strokeStyle='#FFFFFF';
		context.beginPath();
		context.moveTo(p1x,p1y);
		context.quadraticCurveTo(controlPointX,controlPointY,p2x,p2y);
		context.stroke();
		context.restore();
		drawArrowHead({x:controlPointX,y:controlPointY},{x:p2x,y:p2y},headLength,color);
	}
	function drawArrowHead(p0,p1,headLength,color){
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
		context.beginPath();
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

	function drawLineWithArrowhead(p0,p1,headLength,color){
		var context = canvas.getContext('2d');
		context.save();
		context.strokeStyle=color;
		context.lineWidth = 1.2;
		context.beginPath();
		context.moveTo(p0.x,p0.y);
		context.lineTo(p1.x,p1.y);
		context.stroke();
		context.restore();
		drawArrowHead(p0,p1,headLength,color);
	}
	function lineTo(p1x,p1y,p2x,p2y,color){
		var headLength = 10;
		drawLineWithArrowhead({x:p2x,y:p2y},{x:p1x,y:p1y},headLength,color);
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

function node(name,x,y){
	this.x = Math.random() * canvas.width;
	this.y = Math.random() * canvas.height;
	if(typeof x === 'number' && typeof y === 'number'){
		this.x = x;
		this.y = y;
	}
	this.width = 20;

	this.strProperty = '*';

	this.parent = null;
	this.leftEdge = null;
	this.rightEdge = null;
	this.name = name;

	this.fillColor = "#000000";


	this.setLeftChild = function(child){
		this.leftEdge = new edge(this,child,0);
		child.parent = this;
		return true;
	}
	this.setRightChild = function(child){
		this.rightEdge = new edge(this,child,1);
		child.parent = this;
		return true;
	}
	this.isLeftChild = function(child){
		if(this.leftEdge == null){
			return false;
		}
		else if(this.leftEdge.node2 === child){
			return true;
		}
		return false;
	}
	this.isRightChild = function(child){
		if(this.rightEdge == null){
			return false;
		}
		else if(this.rightEdge.node2 === child){
			return true;
		}
		return false;
	}
	this.isLeaf = function(){
		if(this.rightEdge == null && this.leftEdge == null){
			return true;
		}
		return false;
	}
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		//centerX,centerY,radius,fillColor
		fullCircle(this.x,this.y,this.width,this.fillColor);
		var tag = this.name + ((this.strProperty == '*')? '' : ':\''+this.strProperty+'\'');
		write(tag,this.x,this.y+4,getFont(),'center','#FFFFFF');
		if(this.leftEdge !== null){
			this.leftEdge.draw();
		}
		if(this.rightEdge !== null){
			this.rightEdge.draw();
		}
	}
	this.overlaps = function(other){
		if(Math.abs(this.x-other.x)<this.radius){
			return true;
		}
		return false;
	}

}
function edge(node1,node2,weight){
	this.node1 = node1;
	this.node2 = node2;
	this.weight = weight;

	this.distance = [node2.x-node1.x,node2.y-node1.y];
	this.labelX = 0;
	this.labelY = 0;
	this.labelWidth = 13;
	this.labelHeight = 13;
	this.labelColor = '#000000';
	this.textColor = '#00FF00'
	this.isSelected = false;

	this.draw = function(){
		if(this.showFlow){
			this.labelWidth = 20;
		}
		else{
			this.labelWidth = 13;
		}
		var color = '#FFFFFF';
		this.updateDistance();
		var p1x = this.node1.x + this.normalizedDistance[0]*this.node1.width;
		var p1y = this.node1.y + this.normalizedDistance[1]*this.node1.width;
		var p2x = this.node2.x - this.normalizedDistance[0]*this.node2.width;
		var p2y = this.node2.y - this.normalizedDistance[1]*this.node2.width;

		var midX = p1x+(p2x-p1x)/2;
		var midY = p1y+(p2y-p1y)/2;
		if(this.isSelected){
			this.labelColor = '#FFFFFF'
			this.textColor = '#000000'	
		}
		else{
			this.labelColor = '#000000';
			this.textColor = '#00FF00'
		}

		this.labelX = midX;
		this.labelY = midY;
		lineTo(p2x,p2y,p1x,p1y,color);

		fillRect(this.labelX-this.labelWidth,this.labelY-this.labelHeight,this.labelWidth*2,this.labelHeight*2,this.labelColor);
		var labelText = ((this.showFlow)?(this.curFlow+'/') : '') + this.weight 
		write(labelText,this.labelX,this.labelY+this.labelHeight/3,getFont(),'center',this.textColor);

		this.node2.draw();
	}
	this.updateDistance = function(){
		this.distance[0] = this.node2.x-this.node1.x;
		this.distance[1] = this.node2.y-this.node1.y;
		this.normalizedDistance = [this.distance[0]/this.magnitudeDistance(),this.distance[1]/this.magnitudeDistance()];
	}
	this.magnitudeDistance = function(){
		return Math.sqrt(Math.pow(this.distance[0],2)+Math.pow(this.distance[1],2));
	}
	this.normalizedDistance = [this.distance[0]/this.magnitudeDistance(),this.distance[1]/this.magnitudeDistance()];
}

//this assumes that the end result of the whole circuit is the last element of the array
function recursiveOrganize(rootNode, startX,endX,y,yIncrement){
	if(!rootNode.isLeaf()){
		var numleavesL = 0;
		var numleavesR = 0;
		if(rootNode.leftEdge != null){
			numleavesL = numLeaves(rootNode.leftEdge.node2);
		}
		if(rootNode.rightEdge != null){
			numleavesR = numLeaves(rootNode.rightEdge.node2);
		}
		var ratio = (numleavesL)/(numleavesL+numleavesR);
		recursiveOrganize(rootNode.leftEdge.node2,startX,startX+ratio*(endX-startX),y+yIncrement,yIncrement);
		recursiveOrganize(rootNode.rightEdge.node2,startX+ratio*(endX-startX),endX,y+yIncrement,yIncrement);
	}
	rootNode.x = (startX+endX)/2;
	rootNode.y = y;
}

function numLeaves(rootNode){
	if(rootNode.isLeaf()){
		return 1;
	}
	else{
		var numleavesL = 0;
		var numleavesR = 0;
		if(rootNode.leftEdge != null){
			numleavesL = numLeaves(rootNode.leftEdge.node2);
		}
		if(rootNode.rightEdge != null){
			numleavesR = numLeaves(rootNode.rightEdge.node2);
		}
		return numleavesL+numleavesR;
	}
}

function organizeCircuit(rootNode){
	var depthArr = [];
	nodesAtEachDepth(rootNode,depthArr,0);
	for(var i = 0; i < depthArr.length; i++){
		for(var j = 0; j < depthArr[i].length; j++){
			depthArr[i][j].y = canvas.height/(depthArr.length+1)*(i+1);
			if(depthArr[i][j].parent === null){
				depthArr[i][j].x = canvas.width/2;
			}
			else if(depthArr[i][j].parent.isLeftChild(depthArr[i][j])){
				depthArr[i][j].x = depthArr[i][j].parent.x-canvas.width/Math.pow(2,i+1);
			}
			else{
				depthArr[i][j].x = depthArr[i][j].parent.x+canvas.width/Math.pow(2,i+1);				
			}
		}
	}
}

function huffmanClick(){
	var str = document.getElementById('text').value;
	rootNode = huffman(str);
	clickOrganize();
}
function heapify(dict){
	var keys = Object.keys(dict);
	var heap = new BinaryHeap(function(n){return n.name;});

	for(var i = 0; i < keys.length; i++){
		var n = new node(dict[keys[i]]);
		n.strProperty = keys[i];
		heap.push(n);
	}
	return heap;
}

function huffman(str){
	var dict = calculateFreq(str);
	var heap = heapify(dict);

	while(heap.size() > 1){
		minNode1 = heap.pop();
		minNode2 = heap.pop();
		parent = new node(minNode1.name+minNode2.name);
		parent.setLeftChild(minNode1);
		parent.setRightChild(minNode2);
		heap.push(parent);
	}
	return heap.pop();
}


function calculateFreq(str){
	var dict = {};
	for(var i = 0; i < str.length; i++){
		if(typeof dict[str.charAt(i)]  ==='undefined'){
			dict[str.charAt(i)] = 1;
		}
		else{
			dict[str.charAt(i)]++;
		}
	}
	return dict;
}

function clickOrganize(){
	//rootNode, startX,endX,y,yIncrement
	var depth = maxDepth(rootNode);
	var y = canvas.height/(depth+1);
	recursiveOrganize(rootNode,0,canvas.width,y,y);
	//organizeCircuit(rootNode);
}

function setEventListeners(){
	var runnerElement = document.getElementById("runner");
	runnerElement.addEventListener("keydown", function (e) {
		keys[e.keyCode] = false;
	});
	runnerElement.addEventListener("keyup", function (e) {
		keys[e.keyCode] = false;
	});
	//upload file
}
function maxDepth(rootNode){
	var maxDepthL = 0;
	var maxDepthR = 0;
	if(rootNode.leftEdge !== null){
		maxDepthL = maxDepth(rootNode.leftEdge.node2);
	}
	if(rootNode.rightEdge !== null){
		maxDepthR = maxDepth(rootNode.rightEdge.node2);
	}
	return Math.max(maxDepthL,maxDepthR)+1;
}

function nodesAtEachDepth(rootNode,depthArr,curDepth){
	if(rootNode == null){
		return 1;
	}
	else{
		if(depthArr.length < curDepth+1){
			depthArr.push([]);
		}
		depthArr[curDepth].push(rootNode);
		var maxDepthL = 0;
		var maxDepthR = 0;
		if(rootNode.leftEdge !== null){
			maxDepthL = nodesAtEachDepth(rootNode.leftEdge.node2,depthArr,curDepth+1);
		}
		if(rootNode.rightEdge !== null){
			maxDepthR = nodesAtEachDepth(rootNode.rightEdge.node2,depthArr,curDepth+1);
		}
		return Math.max(maxDepthL,maxDepthR)+1;
	}
}

function countNodesAtDepth(rootNode,curDepth,maxDepth){
	if(curDepth >= maxDepth){
		return 1;
	}
	else if(rootNode == null){
		return 0;
	}
	else{
		var left = countNodesAtDepth(rootNode.leftEdge.node2,curDepth+1,maxDepth);
		var right = countNodesAtDepth(rootNode.rightEdge.node2,curDepth+1,maxDepth);
		return left+right;
	}
}

function clearScreen(){
	nodes = [];
	rootNode = null;
	//console.log('cleared')
}

function init(){
	rootNode = huffman('abracadabra');//'The quick brown fox jumps over the lazy dog')
	clickOrganize();
	//organizeCircuit(rootNode);
	setEventListeners();
	window.requestAnimationFrame(draw);
}

function draw() {
	canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height); // clear canvas	
	canvas.getContext('2d').fillStyle = '#000000'
	canvas.getContext('2d').fillRect(0,0,canvas.width,canvas.height);
	window.requestAnimationFrame(draw);
	rootNode.draw();
}
init();
