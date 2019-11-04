var originaldata = "ovitest.json";
var request = new XMLHttpRequest();
request.open('GET', originaldata);
request.responseType = 'json';
request.send();

request.onload = function() {
	console.log(request.response);
	var bunchadata = request.response;
	var evshots = evShotsPer60(bunchadata);
	document.getElementById("evshots").innerHTML = evshots.toPrecision(4);
	var evdisplaytoi = evDisplayTOI(bunchadata);
	document.getElementById("evtoi").innerHTML = evdisplaytoi;
	var evtoi = evTOI(bunchadata);
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
	console.log(totalevshots);
	console.log(totaltime);

	var period = 20;
	
	var shotssum = 0;
	for (var a = 0; a < period; a++) {
    	shotssum += totalevshots[totalevshots.length-period+a];
	}
	var avgshots = shotssum/period;
	console.log(avgshots);
	
	var timesum = 0;
	for (var b = 0; b < period; b++) {
    	timesum += totaltime[totaltime.length-period+b];
	}
	var avgtime = timesum/period;
	console.log(avgtime);
	
	var avgtimehour = avgtime/60/60;
	
	var avg = avgshots/avgtimehour;
	return avg;
}

function evDisplayTOI(jsonObj) {
	var totaltime = [];
	for (const time in jsonObj) {
		totaltime.push(jsonObj[time]["EV TOI"]);
	}
	console.log(totaltime);

	var period = 82;
	
	var timesum = 0;
	for (var b = 0; b < period; b++) {
    	timesum += totaltime[totaltime.length-period+b];
	}
	var avgtime = timesum/period;
	console.log(avgtime);
	
	var hours = Math.floor(avgtime / 3600);
	avgtime %= 3600;
	var minutes = Math.floor(avgtime / 60);
	var seconds = avgtime % 60;
	
	return hours + ":" + minutes + ":" + seconds;
}

function evTOI(jsonObj) {
	var totaltime = [];
	for (const time in jsonObj) {
		totaltime.push(jsonObj[time]["EV TOI"]);
	}
	console.log(totaltime);

	var period = 82;
	
	var timesum = 0;
	for (var b = 0; b < period; b++) {
    	timesum += totaltime[totaltime.length-period+b];
	}
	var avgtime = timesum/period;
	console.log(avgtime);
	
	return avgtime;
}