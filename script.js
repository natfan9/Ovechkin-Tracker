var originaldata = "ovitest.json";
var request = new XMLHttpRequest();
request.open('GET', originaldata);
request.responseType = 'json';
request.send();

request.onload = function() {
	var maindata = request.response;
	var evshots = evShotsPer60(maindata);
	document.getElementById("evshots").innerHTML = evshots.toPrecision(4);
	var evdisplaytoi = evDisplayTOI(maindata);
	document.getElementById("evtoi").innerHTML = evdisplaytoi;
	var evtoi = evTOI(maindata);
	var evshootpct = evShootPct(maindata);
	document.getElementById("evpct").innerHTML = evshootpct.toPrecision(4) + "%";
	var ppshots = ppShotsPer60(maindata);
	document.getElementById("ppshots").innerHTML = ppshots.toPrecision(4);
	var ppdisplaytoi = ppDisplayTOI(maindata);
	document.getElementById("pptoi").innerHTML = ppdisplaytoi;
	var pptoi = ppTOI(maindata);
	var ppshootpct = ppShootPct(maindata);
	document.getElementById("pppct").innerHTML = ppshootpct.toPrecision(4) + "%";
	
	var evgpg = evshots * evtoi * evshootpct;
	var ppgpg = ppshots * pptoi * ppshootpct;
	
	console.log(evgpg);
	console.log(ppgpg);
}

function evShotsPer60(jsonObj) {
	var totalevshots = [];
	var totaltime = [];
	for (const shots in jsonObj) {
		totalevshots.push(jsonObj[shots]["EV Shots"]);
	}
	for (const time in jsonObj) {
		totaltime.push(jsonObj[time]["EV TOI"]);
	}
	
	var period = 20;
	
	var shotssum = 0;
	for (var a = 0; a < period; a++) {
    	shotssum += totalevshots[totalevshots.length-period+a];
	}
	var avgshots = shotssum/period;
	
	var timesum = 0;
	for (var b = 0; b < period; b++) {
    	timesum += totaltime[totaltime.length-period+b];
	}
	var avgtime = timesum/period;
	
	var avgtimehour = avgtime/60/60;
	
	var avg = avgshots/avgtimehour;
	return avg;
}

function evDisplayTOI(jsonObj) {
	var totaltime = [];
	for (const time in jsonObj) {
		totaltime.push(jsonObj[time]["EV TOI"]);
	}

	var period = 82;
	
	var timesum = 0;
	for (var b = 0; b < period; b++) {
    	timesum += totaltime[totaltime.length-period+b];
	}
	var avgtime = timesum/period;
	
	var hours = Math.floor(avgtime / 3600);
	avgtime %= 3600;
	var minutes = Math.floor(avgtime / 60);
	var seconds = Math.round(avgtime % 60);
	
	if (seconds < 10) {
		return minutes + ":0" + seconds;
	} else {
		return minutes + ":" + seconds;
	}
}

function evTOI(jsonObj) {
	var totaltime = [];
	for (const time in jsonObj) {
		totaltime.push(jsonObj[time]["EV TOI"]);
	}

	var period = 82;
	
	var timesum = 0;
	for (var b = 0; b < period; b++) {
    	timesum += totaltime[totaltime.length-period+b];
	}
	var avgtime = timesum/period;
	
	avgtime = avgtime / 60 / 60;
	
	return avgtime;
}

function evShootPct(jsonObj) {
	var totalevshots = [];
	var totalevgoals = [];
	for (const shots in jsonObj) {
		totalevshots.push(jsonObj[shots]["EV Shots"]);
	}
	for (const goals in jsonObj) {
		totalevgoals.push(jsonObj[goals]["EV Goals"]);
	}

	var period = 246;
	
	var shotssum = 0;
	for (var a = 0; a < period; a++) {
    	shotssum += totalevshots[totalevshots.length-period+a];
	}
	var avgshots = shotssum/period;
	
	var goalssum = 0;
	for (var b = 0; b < period; b++) {
    	goalssum += totalevgoals[totalevgoals.length-period+b];
	}
	var avggoals = goalssum/period;
		
	var avg = avggoals/avgshots * 100;
	return avg;
}

function ppShotsPer60(jsonObj) {
	var totalppshots = [];
	var totaltime = [];
	for (const shots in jsonObj) {
		totalppshots.push(jsonObj[shots]["PP Shots"]);
	}
	for (const time in jsonObj) {
		totaltime.push(jsonObj[time]["PP TOI"]);
	}

	var period = 20;
	
	var shotssum = 0;
	for (var a = 0; a < period; a++) {
    	shotssum += totalppshots[totalppshots.length-period+a];
	}
	var avgshots = shotssum/period;
	
	var timesum = 0;
	for (var b = 0; b < period; b++) {
    	timesum += totaltime[totaltime.length-period+b];
	}
	var avgtime = timesum/period;
	
	var avgtimehour = avgtime/60/60;
	
	var avg = avgshots/avgtimehour;
	return avg;
}

function ppDisplayTOI(jsonObj) {
	var totaltime = [];
	for (const time in jsonObj) {
		totaltime.push(jsonObj[time]["PP TOI"]);
	}

	var period = 82;
	
	var timesum = 0;
	for (var b = 0; b < period; b++) {
    	timesum += totaltime[totaltime.length-period+b];
	}
	var avgtime = timesum/period;
	
	var hours = Math.floor(avgtime / 3600);
	avgtime %= 3600;
	var minutes = Math.floor(avgtime / 60);
	var seconds = Math.round(avgtime % 60);
	
	if (seconds < 10) {
		return minutes + ":0" + seconds;
	} else {
		return minutes + ":" + seconds;
	}
}

function ppTOI(jsonObj) {
	var totaltime = [];
	for (const time in jsonObj) {
		totaltime.push(jsonObj[time]["PP TOI"]);
	}

	var period = 82;
	
	var timesum = 0;
	for (var b = 0; b < period; b++) {
    	timesum += totaltime[totaltime.length-period+b];
	}
	var avgtime = timesum/period;
	
	avgtime = avgtime / 60 / 60;
	
	return avgtime;
}

function ppShootPct(jsonObj) {
	var totalppshots = [];
	var totalppgoals = [];
	for (const shots in jsonObj) {
		totalppshots.push(jsonObj[shots]["PP Shots"]);
	}
	for (const goals in jsonObj) {
		totalppgoals.push(jsonObj[goals]["PP Goals"]);
	}

	var period = 246;
	
	var shotssum = 0;
	for (var a = 0; a < period; a++) {
    	shotssum += totalppshots[totalppshots.length-period+a];
	}
	var avgshots = shotssum/period;
	
	var goalssum = 0;
	for (var b = 0; b < period; b++) {
    	goalssum += totalppgoals[totalppgoals.length-period+b];
	}
	var avggoals = goalssum/period;
		
	var avg = avggoals/avgshots * 100;
	return avg;
}