/*var testaverage = [5, 2, 7, 6, 2, 2, 6, 2, 8, 5, 5, 9, 1, 10, 2, 10];

var sum = 0;
var period = 10;
for( var i = 0; i < period; i++ ){
    sum += testaverage[testaverage.length-period+i];
}

var avg = sum/period;

console.log(avg);*/

/*function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

//usage:
readTextFile("ovitest.json", function(text){
    var data = JSON.parse(text);
    console.log(data["201914"]["Shots"]);
});*/

var originaldata = "ovitest.json";
var request = new XMLHttpRequest();
request.open('GET', originaldata);
request.responseType = 'json';
request.send();

request.onload = function() {
	console.log(request.response);
	var bunchadata = request.response;
	evShotsPer60(bunchadata);
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
	console.log(avg);
}

/*var foo = {
	"201901": {
		"Goals": 1,
		"Shots": 5,
	},
	"201902": {
		"Goals": 0,
		"Shots": 7,
	},
	"201903": {
		"Goals": 2,
		"Shots": 2,
	},
}

for (const shots in foo) {
	console.log(foo[shots]["Shots"]);
}*/