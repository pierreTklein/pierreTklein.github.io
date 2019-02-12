function animations(){
	var time = [Date.now(),Date.now()];
	var str = "atest Projects:";
	var i = 0; 
	var animateLinks = false;
	var linksLoaded = false;
	var op = 0;	
	var introLoaded = false;
	var links = document.getElementsByClassName("link");

	function loadIntro(){
		//console.log("loading");
		if(i < str.length){
			//console.log("LT");
			if(timeDiff()>50){
				document.getElementById("header").innerHTML += str.charAt(i);
				i++;
				time[0]=Date.now(); 
			}
		}
		else if(linksLoaded == false && animateLinks == true){
			//console.log("animate links");
			if(timeDiff()>10){
				op+=0.01
				setOpacity(op);
				time[0]=Date.now(); 
				//console.log("changed",document.getElementById("projLink").style.opacity);
			}
			if(op == 1){
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
	function setOpacity(op){
		for(var i = 0; i < links.length; i++){
			links[i].style.opacity = op;
		}
	}
	function timeDiff(){
		return time[1]-time[0];
	}
	function init(){
		setOpacity(0);
		window.requestAnimationFrame(draw);
	}

	function draw() {
		if(!introLoaded){
			loadIntro();
		}
		time[1] = Date.now();
		window.requestAnimationFrame(draw);
		//console.log(arrows);
	}
	init();
}
animations();
