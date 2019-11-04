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
	var totalshots = [];
	for (const shots in jsonObj) {
		console.log(jsonObj[shots]["Shots"]);
		totalshots.push(jsonObj[shots]["Shots"]);
	}
	console.log(totalshots);
	
	var sum = 0;
	var period = 20;
	for (var i = 0; i < period; i++) {
    	sum += totalshots[totalshots.length-period+i];
	}
	
	var avg = sum/period;
	
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