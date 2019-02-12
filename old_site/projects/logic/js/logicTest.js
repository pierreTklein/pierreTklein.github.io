var canvas = [];
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
		write(this.name,this.x,this.y,getFont(),'center','#FFFFFF');
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
		write(this.name,this.x,this.y,getFont(),'center','#000000');
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
		return this.output;
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
		write(this.name,this.x,this.y,getFont(),'left','#000000');
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
		this.inputs.push(otherGate);
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
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";

		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		write(this.name,this.x,this.y,getFont(),'center','#000000');
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
				debug("null")
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
		this.inputs.push(otherGate);
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
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";
		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		write(this.name,this.x,this.y,getFont(),'center','#000000');
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
		this.inputs.push(otherGate);
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
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";

		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		write(this.name,this.x,this.y,getFont(),'center','#000000');
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
					debug("input was true: " + this.inputs[i].output)
					this.output = false;
				}
				else{
					debug("input was false: " + this.inputs[i].output)
					this.output = true;
				}
			}
		}
		return this.output;
	}
	this.addInput = function(otherGate){
		this.inputs.push(otherGate);
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
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";

		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		write(this.name,this.x,this.y,getFont(),'center','#000000');
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
		for(var i = 0 ; i < this.inputs.length; i++){
			if(this.inputs[i] == null){
				this.output =  false;
			}
			else{
				if(this.inputs[i].lastEvaluateID != id){
					this.inputs[i].evaluate(id);
				}
				if(this.inputs[i].output == false){
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
		this.inputs.push(otherGate);
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
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";

		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		write(this.name,this.x,this.y,getFont(),'center','#000000');
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
		this.inputs.push(otherGate);
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
		if(!a&&!b){return true;}
		else{return false;}
	}
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";

		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		write(this.name,this.x,this.y,getFont(),'center','#000000');
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
		this.inputs.push(otherGate);
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
	this.draw = function(x,y){
		if(typeof x === 'number' && typeof y === 'number'){
			this.x = x;
			this.y = y;
		}
		var fillColor = (this.output)?"#7FFF00":"#000000";

		fillRect(this.x-this.width/2,this.y-this.width/2,this.width,this.width,fillColor);
		write(this.name,this.x,this.y,getFont(),'center','#000000');
		for(var i = 0; i < this.inputs.length; i++){
			if(this.inputs[i] != null){
				var color = (this.inputs[i].output)?"#00FF00":"#FFFFFF";
				lineTo(this.x-this.width/2,this.y,this.inputs[i].x+this.inputs[i].width/2,this.inputs[i].y,color);
			}
		}
	}
}


function testLogicWrapper(lastNode,switchArray){
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
					debug("Error, please only include switches in the switch array.");
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
	function testLogic(lastNode,switchArray,index,resultsArray){
		if(resultsArray.length != Math.pow(2,switchArray.length)+1 || resultsArray[0].length != switchArray.length+1){
			return "Error 1: invalid lengths."
		}
		else if(switchArray.length == 0){
			resultsArray[1][0] = lastNode.evaluate(id);
			return "Success";
		}
		else if(index < switchArray.length-1){
			testLogic(lastNode,switchArray,index+1,resultsArray);
			switchArray[index].toggle();
			testLogic(lastNode,switchArray,index+1,resultsArray);
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
	debug(testLogic(lastNode,switchArray,0,resultsArray));
	return resultsArray;
}
function write2D(twoDArr){
	for(var i = 0; i < twoDArr.length; i++){
		var str = "";
		for(var j = 0; j < twoDArr[i].length; j++){
			str+= "		|		"+twoDArr[i][j];
		}
		str+="		|";
		debug(str);
	}
}

function threeOutOfFourJudges(p,q,r,s){
	var evaluationID = new Date();

	//This is the Vanilla way of doing the problem:
	var p = new SWITCH(p);
	var q = new SWITCH(q);
	var r = new SWITCH(r);
	var s = new SWITCH(s);

	var pANDq = new AND(p,q);
	var rANDp = new AND(r,p);
	var qANDs = new AND(q,s);
	var rANDs = new AND(r,s);

	var topPortion = new OR(new AND(pANDq,r),new AND(rANDp,s));
	var bottomPortion = new OR(new AND(qANDs,p),new AND(rANDs,q));
	var complete = new OR(topPortion,bottomPortion);
	var results = testLogicWrapper(complete,[p,q,r,s]);
	write2D(results);
	//This is the less vanilla way of doing the problem:

	var AND_pqr = new AND(p,q);
		AND_pqr.addInput(r);

	var AND_rps = new AND(r,p);
		AND_rps.addInput(s);

	var AND_qsp = new AND(q,s);
		AND_qsp.addInput(p);

	var AND_rsq = new AND(r,s);
		AND_rsq.addInput(q);

	var mainOR = new OR(AND_pqr,AND_rps);
		mainOR.addInput(AND_qsp);
		mainOR.addInput(AND_rsq);
}
//threeOutOfFourJudges(true,false,true,true);

function manyAnds(){
	var andOp = new AND();
	var switchArr = [];
	for(var i = 0; i < 7; i++){
		switchArr.push(new SWITCH(true));
	}
	andOp.setInputsToList(switchArr);
	write2D(testLogicWrapper(andOp,switchArr));
}
//manyAnds();

function threeInput(){
	var a = new SWITCH(false,"a");
	var b = new SWITCH(false,"b");
	var c = new SWITCH(false,"c");
	var q = new AND(new NOT(new AND(a,b,"and(a,b)"),"not(and(a,b))"),new NOT(new OR(a,b,"or(a,b)"),"not(or(a,b))"),"and(not(and(a,b)),not(or(a,b)))");
		q.addInput(c);
	var results = testLogicWrapper(q,[a,b,c]);
	write2D(results);
}
//threeInput();


function scan(s,tokenset) {
	var TRUE = /^TRUE/;
	var FALSE = /^FALSE/;
	var AND = /^AND\(/;
	var OR = /^OR\(/;
	var XOR = /^XOR\(/;
	var NOT = /^NOT\(/;
	var NAND = /^NAND\(/;
	var XNOR = /^XNOR\(/;
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
        { name:"OR", regexp:OR } ,
        { name:"XOR", regexp:XOR },
        { name:"NOT", regexp:NOT },
        { name:"NAND", regexp:NAND },
        { name:"XNOR", regexp:XNOR },
        { name:"CLOSEPARENTHESIS", regexp: CLOSEPARENTHESIS},
        { name:"variable", regexp: variable},
        { name:"comma", regexp:comma}];

    // Now, iterative through our tokens array, and see what we find
    for (var i=0; i<tokens.length; i++) {
        var m;
        if (tokenset[tokens[i].name] && (m = s.match(tokens[i].regexp))) {
            return { token:tokens[i].name, value:m[0] };
        }
    }
    throw "Hey, there aren't supposed to be syntactic errors, but I encountered \""+s+"\"";
}

function parseString(str){
	//remove all spaces
	str=str.replace(/ /g,"");
	//debug(str);
	//this is the location that all of the below functions will start from. The functions will update the string.
	var strIndex = 0;
	var operators = [];

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
		var operatorTokenset = {AND:true,OR:true,XOR:true,NOT:true,NAND:true,XNOR:true};
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
		}
		gate.setInputsToList(list);
		//debug(gate);
		operators.push(gate);
		return gate;
	}

	function parseList(str,list){
		//here, we could either have another operator as the next element, or we could have a base case as the next element. 
		var operatorAndVarTokenset = {AND:true,OR:true,XOR:true,NOT:true,NAND:true,XNOR:true,TRUE:true,FALSE:true,variable:true,comma:true,CLOSEPARENTHESIS:true};
		var opToken = scan(str.substring(strIndex),operatorAndVarTokenset);
		//recursive step:
		if(opToken.token == "AND"||opToken.token == "OR"||opToken.token == "XOR"||opToken.token == "NOT"||opToken.token == "NAND"||opToken.token == "XNOR"){
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
var operators = parseString("AND(P,NOT(P))");
var switches = [];
for(var i = 0; i < operators.length; i++){
	if(operators[i].name == "SWITCH"){
		switches.push(operators[i]);
	}
}
//debug(operators[operators.length-1].inputs[0].name)
//debug(operators[operators.length-1].inputs[0].toggle())
//debug(operators[operators.length-1].inputs[1].evaluate(1));
write2D(testLogicWrapper(operators[operators.length-1],switches));


