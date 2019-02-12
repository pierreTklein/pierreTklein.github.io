function changeColor(id,colorPair,isChecking){
	var element = document.getElementById(id);
	var className  = element.className;
	var index = (colorPair[0]==className)?1:0;
	console.log(colorPair[index]);
	if(id=="pause_and_resume"){
		if(!checkForRemoveMode() && isChecking){
			return;
		}
	}
	element.className = colorPair[index];
}
function changeColors(ids,isChecking){
	for(var i = 0; i < ids.length; i++){
		changeColor(ids[i],isChecking);
	}
}
function changeRemoveModeAndPause(){
	if(!(document.getElementById("pause_and_resume").className == "buttonRed" && document.getElementById("remove_select").className == "buttonRed")){
		changeColor("pause_and_resume",["buttonRed","buttonGreen"],false);
	}
	changeColor("remove_select",["buttonRed","buttonGreen"],false);

}


function checkForRemoveMode(){
	if(document.getElementById("remove_select").className == "buttonRed"){
		console.log("remove select is red.");
		return true;
	}
	else{
		console.log("remove select is green.");
		return false;
	}
}
