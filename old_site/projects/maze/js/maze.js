var boards;
var tileSize = 10;
function tester(testerNum, tileSize){
	this.canvas = document.getElementById('runner'+testerNum);
	this.board = new maze(tileSize,this.canvas);
	this.board.setUpMaze();
	this.board.resetVisited();

	/*PATHFINDING VALUES:
		• 0 = explore random path until dead end, and restart.
		• 1 = explore every possibility of every node via stack
		• 2 = astar
	*/
	this.targetI = Math.floor(this.board.maze.length/2);//Math.floor(Math.random()*this.board.maze.length-1);//this.board.maze.length-1;//
	this.targetJ = Math.floor(this.board.maze[0].length/2);//Math.floor(Math.random()*this.board.maze[0].length-1);//this.board.maze[0].length-1;//

	this.targetTile = this.board.maze[this.targetI][this.targetJ];
	this.targetTile.isTargetTile = true;
	this.mover = new mouse(this.board, this.board.maze[0][0],this.targetTile,testerNum-1);
	this.timer = new Time();

	this.copyOtherBoard = function(otherTester){
		otherTester.board.copyTo(this.board);
		this.targetI = otherTester.targetI;
		this.targetJ = otherTester.targetJ;

		this.resetMouse();
	}
	this.resetMouse = function(){
		this.board.resetVisited();
		this.mover.updateCurTile(this.board.maze[0][0]);
		this.targetTile = this.board.maze[this.targetI][this.targetJ];
		this.targetTile.isTargetTile = true;
		this.mover.targetTile = this.targetTile;
		this.mover.setStack();
		this.mover.foundTarget = false;
		this.timer = new Time();		
	}
	this.newBoard = function(){
		this.board = new maze(tileSize,this.canvas);
		this.board.setUpMaze();
		this.board.resetVisited();
		this.resetMouse();
	}

	this.update = function(){
		this.canvas.getContext('2d').clearRect(0,0,this.canvas.width,this.canvas.height); // clear canvas	
		this.canvas.getContext('2d').fillStyle = '#000000'
		this.canvas.getContext('2d').fillRect(0,0,this.canvas.width,this.canvas.height);
		this.board.draw();
		this.mover.move();
		this.mover.draw();
		if(!this.mover.foundTarget){
			this.timer.update();
			this.mover.curTile.drawPathHistory(this.canvas);
		}
		this.mover.curTile.drawPathHistory(this.canvas);
		write(this.canvas,this.timer.toString().toString(),this.canvas.width/2,this.canvas.height-3);
	}
}


function maze(tileSize,canvas){
	this.canvas = canvas;
	this.maze;
	this.width = canvas.width;
	this.height = canvas.height;
	this.tileSize = tileSize;
	this.createBoard = function(){
		var rowArr = [];
		var numRows = Math.floor(this.width/this.tileSize);
		var numCols = Math.floor(this.height/this.tileSize);
		for(var i = 0; i < numRows; i++){
			var colArr = [];
			for(var j = 0; j < numCols; j++){
				colArr.push(new tile(i,j,i*this.tileSize,j*this.tileSize,this.tileSize));
			}
			rowArr.push(colArr);
		}
		return rowArr;
	}
	this.maze = this.createBoard();
	this.resetWalls = function(){
		for(var i = 0; i < this.maze.length; i++){
			for(var j = 0; j < this.maze[i].length; j++){
				for(var k = 0; k < 4; k++){
					this.maze[i][j].walls[k] = true;
				}
			}
		}

	}
	this.setUpMaze = function(){
		this.resetWalls();
		/*
			Make the initial cell the current cell and mark it as visited
			While there are unvisited cells
			If the current cell has any neighbors which have not been visited
				Choose randomly one of the unvisited neighbors
				Push the current cell to the stack
				Remove the wall between the current cell and the chosen cell
				Make the chosen cell the current cell and mark it as visited
			Else if stack is not empty
				Pop a cell from the stack
				Make it the current cell
		*/
		var curCell = this.maze[0][0];
		curCell.isVisited = true;
		var newCell;
		var stack = [];
		var neighbors;
		var rand = 0;
		var di = 0;
		var dj = 0;
		//console.log(this.maze);
		var numVistedCells = 0;
		while(numVistedCells < (this.maze.length * this.maze[0].length)){
			neighbors = this.getFreeNeighbors(curCell.i,curCell.j);
			if(neighbors.length > 0){
				newCell = neighbors[Math.floor(Math.random()*neighbors.length)];
				stack.push(curCell);
				di = curCell.i - newCell.i;// - = left; + = right
				dj = curCell.j - newCell.j;// - = down; + = up
				// UP  DOWN LEFT RIGHT
				// [0] [1]  [2]   [3]
				if(di == -1){//curCell: right wall, newCell: left wall
					curCell.walls[3] = false;
					newCell.walls[2] = false;
				}
				if(di == 1){//curCell: left wall, newCell: right wall
					curCell.walls[2] = false;
					newCell.walls[3] = false;
				}
				if(dj == -1){//curCell: down, newCell: up
					curCell.walls[1] = false;
					newCell.walls[0] = false;
				}
				if(dj == 1){ //curCell: up, newCell: down
					curCell.walls[0] = false;
					newCell.walls[1] = false;
				}
				curCell = newCell;
				curCell.isVisited = true;
				numVistedCells++;
			}
			else if(stack.length > 0){
				curCell = stack.shift();
			}
			else{
				break;
			}
		}
	}
	this.copyTo = function(otherBoard){
		var newMaze = [];
		for(var i = 0; i < this.maze.length; i++){
			var newMazeCol = [];
			for(var j = 0; j < this.maze[i].length; j++){
				newMazeCol.push(this.maze[i][j].copy())
			}
			newMaze.push(newMazeCol);
		}
		otherBoard.maze = newMaze;
	}	

	this.resetVisited = function(){
		for(var i = 0; i < this.maze.length; i++){
			for(var j = 0; j < this.maze[i].length; j++){
				this.maze[i][j].indexSeen = -1;
				this.maze[i][j].isVisited = false;
			}
		}

	}
	this.getFreeNeighbors = function(i,j){
		var neighborArr = [];
		if(i > 0 && !this.maze[i-1][j].isVisited){
			neighborArr.push(this.maze[i-1][j]);
		}
		if(j > 0 && !this.maze[i][j-1].isVisited){
			neighborArr.push(this.maze[i][j-1]);				
		}
		if(i < this.maze.length-1 && !this.maze[i+1][j].isVisited){
			neighborArr.push(this.maze[i+1][j]);				
		}
		if(j < this.maze[0].length-1 && !this.maze[i][j+1].isVisited){
			neighborArr.push(this.maze[i][j+1]);				
		}
		return neighborArr;
	}
	this.getNeighborsWithoutWall = function(i,j){
		var neighborArr = [];
		// UP  DOWN LEFT RIGHT
		// [0] [1]  [2]   [3]
		if(i > 0 && !this.maze[i][j].walls[2] && !this.maze[i-1][j].isVisited){ // left?
			neighborArr.push(this.maze[i-1][j]);
		}
		if(j > 0 && !this.maze[i][j].walls[0]  && !this.maze[i][j-1].isVisited){//move up?
			neighborArr.push(this.maze[i][j-1]);				
		}
		if(i < this.maze.length-1 && !this.maze[i][j].walls[3] && !this.maze[i+1][j].isVisited){//move right?
			neighborArr.push(this.maze[i+1][j]);				
		}
		if(j < this.maze[0].length-1 && !this.maze[i][j].walls[1] && !this.maze[i][j+1].isVisited){ //move down?
			neighborArr.push(this.maze[i][j+1]);				
		}
		return neighborArr;

	}
	this.draw = function(){
		for(var i = 0; i < this.maze.length; i++){
			for(var j = 0; j < this.maze[i].length; j++){
				this.maze[i][j].draw(this.canvas);
			}
		}
	}
}
function tile(i,j,x,y,tileSize){
	//array coord:
	this.i = i;
	this.j = j;
	//pixel coord:
	this.x = x;
	this.y = y;	// UP  DOWN LEFT RIGHT
	this.walls = [true,true,true,true]; 
	this.isVisited = false;
	this.isTargetTile = false;
	this.tileSize = tileSize;
	this.color =  '#000000'

	this.pathHistory = [];

	this.depth = 0;
	this.indexSeen = -1; 

	this.getWalls = function(){
		return this.walls;
	}
	this.setWall = function(index,value){
		this.walls[index] = value;
	}
	this.getWall = function(index){
		return this.walls[index];
	}
}
tile.prototype.draw = function(canvas,isDrawingHistory){
	if(this.isVisited){this.color = '#FF0000';}
	else{this.color = '#000000'}

	if(isDrawingHistory === true){
		this.color = '#0000FF';
	}

	if(this.isTargetTile){
		this.color = '#FFD700';
	}
	var context = canvas.getContext('2d');
	context.save();
	context.fillStyle = this.color;
	context.fillRect(this.x,this.y,this.tileSize,this.tileSize);
	context.strokeStyle = '#FFFFFF'
    context.lineWidth = 1;
	context.beginPath();
	//write(this.i + "," + this.j,this.x+this.tileSize/3,this.y+this.tileSize/2,"bold 12px Arial","left",'#FFFFFF');
	if(this.walls[0]){
		context.moveTo(this.x,this.y);
		context.lineTo(this.x+this.tileSize,this.y);
		context.stroke();
		//write("wall 0",this.x+this.tileSize/4,this.y+2,"bold 12px Arial","left",'#FFFFFF');
    }
    if(this.walls[1]){
		context.moveTo(this.x,this.y+this.tileSize);
		context.lineTo(this.x+this.tileSize,this.y+this.tileSize);
		//context.stroke();
		//write("wall 1",this.x+this.tileSize/4,this.y+this.tileSize,"bold 12px Arial","left",'#FF0000');
    }
    if(this.walls[2]){
		context.moveTo(this.x,this.y);
		context.lineTo(this.x,this.y+this.tileSize);
		//write("wall 2",this.x+4,this.y+this.tileSize/2,"bold 12px Arial","left",'#FF0000');
		context.stroke();
    }
    if(this.walls[3]){
		context.moveTo(this.x+this.tileSize,this.y);
		context.lineTo(this.x+this.tileSize,this.y+this.tileSize);
		//write("wall 3",this.x+this.tileSize/4,this.y+this.tileSize/2,"bold 12px Arial","left",'#FFFFFF');
		//context.stroke();
    }
    // if(this.indexSeen!=-1){
    // 	write(this.indexSeen,this.x,this.y+9,"9px Arial","left",'#FFFFFF');
    // }
	context.closePath();
	context.restore();
}
tile.prototype.drawPathHistory = function(canvas){
	for(var i = 0; i < this.pathHistory.length; i++){
		this.pathHistory[i].draw(canvas,true);
	}
}

tile.prototype.score = function(targetTile){
	return this.distanceTo2(targetTile);//-this.depth;
}
tile.prototype.distanceTo2 = function(otherTile){
	return (otherTile.x-this.x)*(otherTile.x-this.x)+(otherTile.y-this.y)*(otherTile.y-this.y);
}

tile.prototype.copy = function(){
	var newTile = new tile(this.i,this.j,this.x,this.y,this.tileSize);
	for(var i = 0; i < this.walls.length; i++){
		newTile.walls[i] = this.walls[i];
	}
	newTile.isVisited = this.isVisited;
	newTile.color = this.color;
	newTile.depth = this.depth;
	newTile.indexSeen = this.indexSeen;
	return newTile;
}

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
function mouse(board, startTile, targetTile, pathFindingType){
	this.board = board;
	this.curTile = startTile;
	this.targetTile = targetTile;
	this.foundTarget = false;
	this.x = this.curTile.x;
	this.y = this.curTile.y;
	this.i = this.curTile.i;
	this.j = this.curTile.j;
	this.tileSize = board.tileSize;
	this.index = 0;
	this.pathFindingType = pathFindingType;
	this.stack;
	/*PATHFINDING VALUES:
		• 0 = queue approach.
		• 1 = stack approach, depth-first search.
		• 2 = A*

	*/
	this.setStack = function(){
		switch(this.pathFindingType){
			case 0: //queue approach
				this.stack = new buckets.Queue();
				break;
			case 1: //Stack approach
				this.stack = new buckets.Stack();
				break;
			case 2: //priority queue approach (A*)
				this.stack = new buckets.PriorityQueue(this.astarComparator);
				break;
		}
	}
	this.setStack();

	this.astarComparator = function(a,b){
		return (b.score(targetTile)-a.score(targetTile));
	}
	this.updateNewTileHistory = function(newTile){
		if(newTile.pathHistory.length == 0 && !newTile.isVisited){
			for(var i = 0; i < this.curTile.pathHistory.length; i++){
				newTile.pathHistory.push(this.curTile.pathHistory[i]);
			}
			newTile.pathHistory.push(this.curTile);
		}
	}
	this.move = function(){
		this.curTile.isVisited = true;
		this.curTile.indexSeen = this.index++;
		switch(this.pathFindingType){
			case 0:
				this.breadthFirstSearch();
				break;
			case 1:
				this.depthFirstSearch();
				break;
			case 2: 
				this.aStarSearch();
				break;
		}
	}
	//requires a priority queue
	this.aStarSearch = function(){
		var potMoves = this.board.getNeighborsWithoutWall(this.i,this.j);
		if(this.curTile == this.targetTile){
			this.foundTarget = true;
		}
		else if(potMoves.length > 0){
			//var newCell = potMoves[Math.floor(Math.random()*potMoves.length)];
			for(var k = 0; k < potMoves.length; k++){
				potMoves[k].depth = this.curTile.depth+1;
				this.updateNewTileHistory(potMoves[k])
				this.stack.enqueue(potMoves[k]);
			}
			//this.stack.enqueue(this.curTile);
			this.updateCurTile(this.stack.dequeue());
			while(this.curTile.isVisited){
				this.updateCurTile(this.stack.dequeue());
			}
			this.curTile.isVisited = true;
			this.index++;
		}
		else if(!this.stack.isEmpty()){
			this.updateCurTile(this.stack.dequeue());
			while(this.curTile.isVisited){
				this.updateCurTile(this.stack.dequeue());
			}
		}
		else{
		}

	}
	//the algorithm used to create the maze 
	this.queueMove = function(){
		var potMoves = this.board.getNeighborsWithoutWall(this.i,this.j);
		if(this.curTile == this.targetTile){
			this.foundTarget = true;

		}
		else if(potMoves.length > 0){
			var newCell = potMoves[Math.floor(Math.random()*potMoves.length)];
			this.stack.push(this.curTile);
			this.updateNewTileHistory(newCell);
			this.updateCurTile(newCell);
			this.curTile.isVisited = true;
			this.index++;
		}
		else if(this.stack.length > 0){
			this.updateCurTile(this.stack.shift());
		}
		else{
		}
	}
	//requires a queue
	this.breadthFirstSearch = function(){
		var potMoves = this.board.getNeighborsWithoutWall(this.i,this.j);
		if(this.curTile == this.targetTile){
			this.foundTarget = true;
		}
		else{
			for(var i = 0; i < potMoves.length; i++){
				this.updateNewTileHistory(potMoves[i]);
				this.stack.enqueue(potMoves[i]);
			}
			if(this.stack.size() > 0){
				this.updateCurTile(this.stack.dequeue());
				//this.curTile.isVisited = true;
				this.index++;
			}
		}
	}
	//requires a stack
	this.depthFirstSearch = function(){
		var potMoves = this.board.getNeighborsWithoutWall(this.i,this.j);
		if(this.curTile == this.targetTile){
			this.foundTarget = true;
		}
		else if(potMoves.length > 0){
			var newCell = potMoves[0];
			if(potMoves.length > 1){
				this.stack.push(this.curTile);
			}
			this.updateNewTileHistory(newCell);
			this.updateCurTile(newCell);
			this.curTile.isVisited = true;
			this.index++;
		}
		else if(this.stack.size() > 0){
			this.updateCurTile(this.stack.pop());
		}
		else{
		}		
	}

	this.updateCurTile = function(newTile){
		this.curTile = newTile;
		this.x = this.curTile.x;
		this.y = this.curTile.y;
		this.i = this.curTile.i;
		this.j = this.curTile.j;

	}
	this.randomMove =function(){
		var potMoves = this.board.getNeighborsWithoutWall(this.i,this.j);
		if(this.curTile == this.targetTile){
			this.foundTarget = true;
		}
		else if(potMoves.length > 0){
			//console.log(this.i,this.j,potMoves);
			var newMove = potMoves[Math.floor(Math.random()*potMoves.length)];
			newMove.isVisited = true;
			this.updateCurTile(newMove);
		}
		else{
			this.index = 0;
			this.board.resetVisited();
			this.updateCurTile(startTile);
		}		
	}

	this.draw = function(){
		var context = board.canvas.getContext('2d');
		context.save();
		context.fillStyle = '#00FF00';
		context.fillRect(this.x,this.y,this.tileSize,this.tileSize);
	    context.restore();
	}
}

function write(canvas,text,x,y,font,textAlign,color){
	if(typeof font === 'undefined'){
		font = 'bold 12px Arial';
	}
	if(typeof textAlign === 'undefined'){
		textAlign = 'left';
	}
	if(typeof color === 'undefined'){
		color = '#FFFFFF'
	}
	var context = canvas.getContext('2d');
	context.save();	
	context.font=font;
	context.textAlign = textAlign;
	context.fillStyle = color;
	context.lineWidth = 2;
	context.fillText(text,x,y);
	context.restore();	
}
function writeMultiLine(textArr,startX,startY,textAlign,colors){
	var fontSize = 13;
	var buffer = 2;
	var font = "bold " + fontSize + "px Arial";
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


function setEventListeners(){
	document.getElementById("restart").addEventListener("click",function(e){
		for(var i = 0; i < boards.length; i++){
			boards[i].resetMouse();
		}
	});
	document.getElementById("reset").addEventListener("click",function(e){
		var nb = new tester(1,tileSize);
		for(var i = 0; i < boards.length; i++){
			boards[i].copyOtherBoard(nb);
		}
	});
}


function Time(){
	this.startTime = Date.now();
	this.curTime = Date.now();
	this.isPaused = false;

	this.reset = function(){
		this.startTime = Date.now();
		this.curTime = Date.now();
	}
	this.update = function(){
		if(!this.isPaused){
			this.curTime = Date.now();
		}
	}
	this.pauseTime = function(){
		this.isPaused = true;
	}	
	this.elapsedTime = function(){
		return this.curTime - this.startTime;
	}
	this.timeInterval = function(interval){
		if(this.elapsedTime > interval){
			return true;
		}
		else{
			return false;
		}
	}
	this.toString = function(){
		var millis = this.elapsedTime();
		var dur = {};
		var units = [
			{label:"milli.",mod:1000},
			{label:"sec.",	mod:60},
			{label:"min.", 	mod:60},
			{label:"hrs.",  mod:24},
			{label:"days",  mod:31}
		];
		// calculate the individual unit values...
		units.forEach(function(u){
		millis = (millis - (dur[u.label] = (millis % u.mod))) / u.mod;
		});
		// convert object to a string representation...
		var nonZero = function(u){ return dur[u.label]; };
		dur.toString = function(){
			return units
			    .reverse()
			    .filter(nonZero)
			    .map(function(u){
			        return dur[u.label] + " " + (dur[u.label]==1?u.label.slice(0,-1):u.label);
			    })
			    .join(', ');
			};
		return dur;
	};

}


function init(){
	boards = [new tester(1,tileSize),new tester(2,tileSize),new tester(3,tileSize)]
	boards[1].copyOtherBoard(boards[0]);
	boards[2].copyOtherBoard(boards[0]);
	setEventListeners();
	window.requestAnimationFrame(draw);
}


function draw() {
	for(var i = 0; i < boards.length; i++){
		boards[i].update();
	}
	window.requestAnimationFrame(draw);
}
init();
