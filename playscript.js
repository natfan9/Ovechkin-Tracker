var testaverage = [5, 2, 7, 6, 2, 2, 6, 2, 8, 5, 5, 9, 1, 10, 2, 10];

var sum = 0;
var period = 10;
for( var i = 0; i < period; i++ ){
    sum += testaverage[testaverage.length-period+i];
}

var avg = sum/period;

console.log(avg);

function readTextFile(file, callback) {
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
});