var currentseason = 2022;
var gamestoplay = 82;
var careergoals = 780;
var careerppgoals = 285;

function openPage(pageName, elmnt) {
  // Hide all elements with class="tabcontent" by default */
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Show the specific tab content
  document.getElementById(pageName).style.display = "block";
}

window.onload = function(){
	//document.getElementById("weightedpure").click();
	document.getElementById("default").click();
}

const dataUrl = "https://natfan9.github.io/Ovechkin-Tracker/ovitest.json";
const advUrl = "https://natfan9.github.io/Ovechkin-Tracker/advdata.json";
const toiUrl = "https://natfan9.github.io/Ovechkin-Tracker/advtoidata.json";

function weightedFunction(neededOutputs,basis) {
	var originaldata = toiUrl;
	var request = new XMLHttpRequest();
	request.open('GET', originaldata);
	request.responseType = 'json';
	request.send();

	request.onload = function() {
		var maindata = request.response;
		ev = "Even Strength";
		pp = "Power Play";

		var shotsweight = shotsWeight();
		var timeweight = timeWeight();
		var pctweight = pctWeight();

		function shotsWeight() {
			games = seasonGames(maindata);

			if (games < 20) {
				return 100 - (games * 2);
			} else {
				return 60;
			}
		}

		function timeWeight() {
			games = seasonGames(maindata);

			if (games < 20) {
				return 100 - (games * 4);
			} else {
				return 20;
			}
		}

		function pctWeight() {
			games = seasonGames(maindata);

			if (games < 40) {
				return 100 - (games * 1.5);
			} else {
				return 40;
			}
		}

		var games = seasonGames(maindata);
		var goalsarr = seasonTotals(maindata,"All","All",basis);
		var goals = sumArray(goalsarr);
		// var evgoals = seasonTotals(maindata,ev,"5v5",basis);
		var evgoals6v5 = seasonTotals(maindata,ev,"6v5",basis);
		var evgoals5v6 = seasonTotals(maindata,ev,"5v6",basis);
		var evgoals5v5 = seasonTotals(maindata,ev,"5v5",basis);
		var evgoals4v4 = seasonTotals(maindata,ev,"4v4",basis);
		var evgoals3v3 = seasonTotals(maindata,ev,"3v3",basis);
		var evgoals = {"6v5": evgoals6v5, "5v6": evgoals5v6, "5v5": evgoals5v5, "4v4": evgoals4v4, "3v3": evgoals3v3};
		// var ppgoals = seasonTotals(maindata,pp,"5v3",basis);
		var ppgoals6v4 = seasonTotals(maindata,pp,"6v4",basis);
		var ppgoals6v3 = seasonTotals(maindata,pp,"6v3",basis);
		var ppgoals5v4 = seasonTotals(maindata,pp,"5v4",basis);
		var ppgoals5v3 = seasonTotals(maindata,pp,"5v3",basis);
		var ppgoals4v3 = seasonTotals(maindata,pp,"4v3",basis);
		var ppgoals = {"6v4": ppgoals6v4, "6v3": ppgoals6v3, "5v4": ppgoals5v4, "5v3": ppgoals5v3, "4v3": ppgoals4v3};
		var totalevgoals = sumObjectArray(evgoals);
		var totalppgoals = sumObjectArray(ppgoals);
		var newcareergoals = careergoals + goals;
		document.getElementById("compgames").innerHTML = games;
		document.getElementById("compgoals").innerHTML = goals;
		document.getElementById("careergoals").innerHTML = newcareergoals;

		var evstrengths = ["6v5","5v6","5v5","4v4","3v3"];
    	var ppstrengths = ["6v4","6v3","5v4","5v3","4v3"];

		var evgoalsproj = 0;
		var evoverallgpg = 0;
		// Even Strength Loop
		for (man of evstrengths) {
			
			// Even Strength Shots
			var evshotsmoving = per60(maindata,ev,man,basis,30);
			var evshotsseason = per60(maindata,ev,man,basis,"season");
			var evshots = weightedAvgArray(evshotsmoving, evshotsseason, shotsweight);
			// console.log(evshots);

			// Even Strength Time On Ice
			var evtimemoving = TOI(maindata,ev,man,82);
			var evtimeseason = TOI(maindata,ev,man,"season");
			var evtime = weightedAvg([evtimemoving,evtimeseason],[timeweight,100-timeweight]);
			var evtimeseconds = evtime*60*60;
			var evtimedisplay = convertSeconds(evtimeseconds);
			// console.log(evtime);
			
			// Even Strength Shooting Percentage
			var evpctmoving = shootingPct(maindata,ev,man,basis,410);
			var evpctseason = shootingPct(maindata,ev,man,basis,"season");
			var evpct = weightedAvgArray(evpctmoving[0], evpctseason[0], pctweight);
			var evpctdisplay = weightedAvg([evpctmoving[1], evpctseason[1]], [pctweight,100-pctweight]) * 100;
			// console.log(evpct);

			var totalevgoalsproj = 0;
			var evgpg = 0;
			
			for (i in evshots) {
				var zoneproj = evshots[i] * evtime * evpct[i];
				evgpg += zoneproj;
				var evgoalsrem = zoneproj * (gamestoplay - games);
				var projevgoals = evgoals[man][i] + evgoalsrem;
				totalevgoalsproj += projevgoals;
			}

			evoverallgpg += evgpg;
			console.log(man + " " + basis + " Per 60: " + sumArray(evshots));
			console.log(man + " Time On Ice Per Game: " + evtimedisplay);
			console.log(man + " Shooting Percentage: " + evpctdisplay);
			console.log(man + " Goals Per Game: " + evgpg);
			console.log(man + " Goals Projection: " + totalevgoalsproj);
			console.log("----------")
			evgoalsproj += totalevgoalsproj;
			// document.getElementById(man).innerHTML = totalevgoalsproj.toFixed(2);
		}
		// console.log(evoverallgpg);

		document.getElementById("evgoals").innerHTML = evgoalsproj.toFixed(2);

		var ppgoalsproj = 0;
		var ppoverallgpg = 0;
		// Power Play Loop
		for (man of ppstrengths) {

			// Power Play Shots
			var ppshotsmoving = per60(maindata,pp,man,basis,30);
			var ppshotsseason = per60(maindata,pp,man,basis,"season");
			var ppshots = weightedAvgArray(ppshotsmoving, ppshotsseason, shotsweight);
			// console.log(ppshots);

			// Power Play Time On Ice
			var pptimemoving = TOI(maindata,pp,man,82);
			var pptimeseason = TOI(maindata,pp,man,"season");
			var pptime = weightedAvg([pptimemoving,pptimeseason],[timeweight,100-timeweight]);
			var pptimeseconds = pptime*60*60;
			var pptimedisplay = convertSeconds(pptimeseconds);
			// console.log(pptime);
			
			// Power Play Shooting Percentage
			var pppctmoving = shootingPct(maindata,pp,man,basis,410);
			var pppctseason = shootingPct(maindata,pp,man,basis,"season");
			var pppct = weightedAvgArray(pppctmoving[0], pppctseason[0], pctweight);
			var pppctdisplay = weightedAvg([pppctmoving[1], pppctseason[1]], [pctweight,100-pctweight]) * 100;
			// console.log(pppct);
			
			var totalppgoalsproj = 0;
			var ppgpg = 0;

			for (i in ppshots) {
				var zoneproj = ppshots[i] * pptime * pppct[i];
				ppgpg += zoneproj;
				var ppgoalsrem = zoneproj * (gamestoplay - games);
				var projppgoals = ppgoals[man][i] + ppgoalsrem;
				totalppgoalsproj += projppgoals;
			}

			ppoverallgpg += ppgpg;
			console.log(man + " " + basis + " Per 60: " + sumArray(ppshots));
			console.log(man + " Time On Ice Per Game: " + pptimedisplay);
			console.log(man + " Shooting Percentage: " + pppctdisplay);
			console.log(man + " Goals Per Game: " + ppgpg);
			console.log(man + " Goals Projection: " + totalppgoalsproj);
			console.log("----------");
			ppgoalsproj += totalppgoalsproj;
			// document.getElementById(man).innerHTML = totalppgoalsproj.toFixed(2);

		}
		// console.log(ppoverallgpg);

		document.getElementById("ppgoals").innerHTML = ppgoalsproj.toFixed(2);

		var totalgoalsproj = evgoalsproj + ppgoalsproj;		
		console.log("Total Goals Projection: " + (evgoalsproj + ppgoalsproj));
		document.getElementById("totalgoals").innerHTML = totalgoalsproj.toFixed(2);
		var totalcareergoals = careergoals + totalgoalsproj;
		document.getElementById("careergoalsproj").innerHTML = totalcareergoals.toFixed(0);

		neededOutputs({games:games,goals:goals,evgoals:totalevgoals,ppgoals:totalppgoals,evgpg:evoverallgpg,ppgpg:ppoverallgpg});
	}
}

function pureFunction(neededOutputs,basis) {
	var originaldata = toiUrl;
	var request = new XMLHttpRequest();
	request.open('GET', originaldata);
	request.responseType = 'json';
	request.send();

	request.onload = function() {
		var maindata = request.response;
		ev = "Even Strength";
		pp = "Power Play";

		var games = seasonGames(maindata);
		var goalsarr = seasonTotals(maindata,"All","All",basis);
		var goals = sumArray(goalsarr);
		// var evgoals = seasonTotals(maindata,ev,"5v5",basis);
		var evgoals6v5 = seasonTotals(maindata,ev,"6v5",basis);
		var evgoals5v6 = seasonTotals(maindata,ev,"5v6",basis);
		var evgoals5v5 = seasonTotals(maindata,ev,"5v5",basis);
		var evgoals4v4 = seasonTotals(maindata,ev,"4v4",basis);
		var evgoals3v3 = seasonTotals(maindata,ev,"3v3",basis);
		var evgoals = {"6v5": evgoals6v5, "5v6": evgoals5v6, "5v5": evgoals5v5, "4v4": evgoals4v4, "3v3": evgoals3v3};
		// var ppgoals = seasonTotals(maindata,pp,"5v3",basis);
		var ppgoals6v4 = seasonTotals(maindata,pp,"6v4",basis);
		var ppgoals6v3 = seasonTotals(maindata,pp,"6v3",basis);
		var ppgoals5v4 = seasonTotals(maindata,pp,"5v4",basis);
		var ppgoals5v3 = seasonTotals(maindata,pp,"5v3",basis);
		var ppgoals4v3 = seasonTotals(maindata,pp,"4v3",basis);
		var ppgoals = {"6v4": ppgoals6v4, "6v3": ppgoals6v3, "5v4": ppgoals5v4, "5v3": ppgoals5v3, "4v3": ppgoals4v3};
		var totalevgoals = sumObjectArray(evgoals);
		var totalppgoals = sumObjectArray(ppgoals);
		var newcareergoals = careergoals + goals;
		document.getElementById("compgames").innerHTML = games;
		document.getElementById("compgoals").innerHTML = goals;
		document.getElementById("careergoals").innerHTML = newcareergoals;

		var evstrengths = ["6v5","5v6","5v5","4v4","3v3"];
    	var ppstrengths = ["6v4","6v3","5v4","5v3","4v3"];
		
		var evgoalsproj = 0;
		var evoverallgpg = 0;
		// Even Strength Loop
		for (man of evstrengths) {
			
			// Even Strength Shots
			var evshots = per60(maindata,ev,man,basis,30);
			// console.log(evshots);

			// Even Strength Time On Ice
			var evtime = TOI(maindata,ev,man,82);
			var evtimeseconds = evtime*60*60;
			var evtimedisplay = convertSeconds(evtimeseconds);
			// console.log(evtime);

			// Even Strength Shooting Percentage
			var evpct = shootingPct(maindata,ev,man,basis,410);
			var evpctdisplay = evpct[1] * 100;
			// console.log(evpct);
			
			var totalevgoalsproj = 0;
			var evgpg = 0;

			for (i in evshots) {
				var zoneproj = evshots[i] * evtime * evpct[0][i];
				evgpg += zoneproj;
				var evgoalsrem = zoneproj * (gamestoplay - games);
				var projevgoals = evgoals[man][i] + evgoalsrem;
				totalevgoalsproj += projevgoals;
			}

			evoverallgpg += evgpg;
			evgoalsproj += totalevgoalsproj;
			console.log(man + " " + basis + " Per 60: " + sumArray(evshots));
			console.log(man + " Time On Ice Per Game: " + evtimedisplay);
			console.log(man + " Shooting Percentage: " + evpctdisplay);
			console.log(man + " Goals Per Game: " + evgpg);
			console.log(man + " Goals Projection: " + totalevgoalsproj);
			console.log("----------");
			// document.getElementById(man).innerHTML = totalevgoalsproj.toFixed(2);

		}
		// console.log(evoverallgpg);

		document.getElementById("evgoals").innerHTML = evgoalsproj.toFixed(2);

		var ppgoalsproj = 0;
		var ppoverallgpg = 0;
		// Power Play Loop
		for (man of ppstrengths) {

			// Power Play Shots
			var ppshots = per60(maindata,pp,man,basis,30);
			// console.log(ppshots);

			// Power Play Time On Ice
			var pptime = TOI(maindata,pp,man,82);
			var pptimeseconds = pptime*60*60;
			var pptimedisplay = convertSeconds(pptimeseconds);
			// console.log(pptime);

			// Power Play Shooting Percentage
			var pppct = shootingPct(maindata,pp,man,basis,410);
			var pppctdisplay = evpct[1] * 100;
			// console.log(pppct);

			var totalppgoalsproj = 0;
			var ppgpg = 0;

			for (i in ppshots) {
				var zoneproj = ppshots[i] * pptime * pppct[0][i];
				ppgpg += zoneproj;
				var ppgoalsrem = zoneproj * (gamestoplay - games);
				var projppgoals = ppgoals[man][i] + ppgoalsrem;
				totalppgoalsproj += projppgoals;
			}

			ppoverallgpg += ppgpg;
			ppgoalsproj += totalppgoalsproj;
			console.log(man + " " + basis + " Per 60: " + sumArray(ppshots));
			console.log(man + " Time On Ice Per Game: " + pptimedisplay);
			console.log(man + " Shooting Percentage: " + pppctdisplay);
			console.log(man + " Goals Per Game: " + ppgpg);
			console.log(man + " Goals Projection: " + totalppgoalsproj);
			console.log("----------");
			// document.getElementById(man).innerHTML = totalppgoalsproj.toFixed(2);
		
		}
		// console.log(ppoverallgpg);

		document.getElementById("ppgoals").innerHTML = ppgoalsproj.toFixed(2);

		var totalgoalsproj = evgoalsproj + ppgoalsproj;		
		console.log("Total Goals Projection: " + (evgoalsproj + ppgoalsproj));
		document.getElementById("totalgoals").innerHTML = totalgoalsproj.toFixed(2);
		var totalcareergoals = careergoals + totalgoalsproj;
		document.getElementById("careergoalsproj").innerHTML = totalcareergoals.toFixed(0);

		neededOutputs({games:games,goals:goals,evgoals:totalevgoals,ppgoals:totalppgoals,evgpg:evoverallgpg,ppgpg:ppoverallgpg});
	}
}

function checkboxFunction() {
	var checkBox = document.getElementById("weightedpure");
	var shots = document.getElementById("shotsbutton");
	var fenwick = document.getElementById("fenwickbutton");
	var corsi = document.getElementById("corsibutton");

	if (checkBox.checked == true && shots.checked == true) {
		weightedFunction(milestoneFunction,"Shots");
	} else if (checkBox.checked == true && fenwick.checked == true) {
		weightedFunction(milestoneFunction,"Fenwick");
	// } else if (checkBox.checked == true && corsi.checked == true) {
	// 	console.log("Weighted Corsi");
	} else if (checkBox.checked == false && shots.checked == true) {
		pureFunction(milestoneFunction,"Shots");
	} else if (checkBox.checked == false && fenwick.checked == true) {
		pureFunction(milestoneFunction,"Fenwick");
	// } else if (checkBox.checked == false && corsi.checked == true) {
	// 	console.log("Pure Corsi");
	} else {
		weightedFunction(milestoneFunction,"Shots");
	}
}

weightedFunction(milestoneFunction,"Fenwick");

function milestoneFunction(obj) {
	var originaldata = "https://natfan9.github.io/Ovechkin-Tracker/milestones.json";
	var request = new XMLHttpRequest();
	request.open('GET', originaldata);
	request.responseType = 'json';
	request.send();

	request.onload = function() {
		var maindata = request.response;
		
		var scheduledata = "https://natfan9.github.io/Ovechkin-Tracker/schedule2022.json";
		var schedule = new XMLHttpRequest();
		schedule.open('GET', scheduledata);
		schedule.responseType = 'json';
		schedule.send();
		
		schedule.onload = function() {
			var xhrschedule = schedule.response;
			//Round Number Milestones
			var goalsleft725 = 825 - (obj.goals + careergoals);
			document.getElementById("725goalsleft").innerHTML = goalsleft725;
			var gamesleft725 = Math.ceil(goalsleft725 / (obj.evgpg + obj.ppgpg));
			document.getElementById("725gamesleft").innerHTML = gamesleft725;
			if (gamesleft725 <= gamestoplay - obj.games) {
				if (xhrschedule[obj.games + gamesleft725 - 1]["Venue"] === "home") {
					document.getElementById("725hitdate").innerHTML = xhrschedule[obj.games + gamesleft725 - 1]["Date"] + " vs " + xhrschedule[obj.games + gamesleft725 - 1]["Nickname"];
				} else {
					document.getElementById("725hitdate").innerHTML = xhrschedule[obj.games + gamesleft725 - 1]["Date"] + " @ " + xhrschedule[obj.games + gamesleft725 - 1]["Nickname"];
				}
			} else if (gamesleft725 > gamestoplay - obj.games && gamesleft725 <= gamestoplay - obj.games + 40) {
				document.getElementById("725hitdate").innerHTML = "Likely next season";
			} else if (gamesleft725 > gamestoplay - obj.games + 40) {
				document.getElementById("725hitdate").innerHTML = "Unable to project";
			}

			var goalsleft750 = 850 - (obj.goals + careergoals);
			document.getElementById("750goalsleft").innerHTML = goalsleft750;
			var gamesleft750 = Math.ceil(goalsleft750 / (obj.evgpg + obj.ppgpg));
			document.getElementById("750gamesleft").innerHTML = gamesleft750;
			if (gamesleft750 <= gamestoplay - obj.games) {
				if (xhrschedule[obj.games + gamesleft750 - 1]["Venue"] === "home") {
					document.getElementById("750hitdate").innerHTML = xhrschedule[obj.games + gamesleft750 - 1]["Date"] + " vs " + xhrschedule[obj.games + gamesleft750 - 1]["Nickname"];
				} else {
					document.getElementById("750hitdate").innerHTML = xhrschedule[obj.games + gamesleft750 - 1]["Date"] + " @ " + xhrschedule[obj.games + gamesleft750 - 1]["Nickname"];
				}
			} else if (gamesleft750 > gamestoplay - obj.games && gamesleft750 <= gamestoplay - obj.games + 40) {
				document.getElementById("750hitdate").innerHTML = "Likely next season";
			} else if (gamesleft750 > gamestoplay - obj.games + 40) {
				document.getElementById("750hitdate").innerHTML = "Unable to project";
			}

			var goalsleft775 = 875 - (obj.goals + careergoals);
			document.getElementById("775goalsleft").innerHTML = goalsleft775;
			var gamesleft775 = Math.ceil(goalsleft775 / (obj.evgpg + obj.ppgpg));
			document.getElementById("775gamesleft").innerHTML = gamesleft775;
			if (gamesleft775 <= gamestoplay - obj.games) {
				if (xhrschedule[obj.games + gamesleft775 - 1]["Venue"] === "home") {
					document.getElementById("775hitdate").innerHTML = xhrschedule[obj.games + gamesleft775 - 1]["Date"] + " vs " + xhrschedule[obj.games + gamesleft775 - 1]["Nickname"];
				} else {
					document.getElementById("775hitdate").innerHTML = xhrschedule[obj.games + gamesleft775 - 1]["Date"] + " @ " + xhrschedule[obj.games + gamesleft775 - 1]["Nickname"];
				}
			} else if (gamesleft775 > gamestoplay - obj.games && gamesleft775 <= gamestoplay - obj.games + 40) {
				document.getElementById("775hitdate").innerHTML = "Likely next season";
			} else if (gamesleft775 > gamestoplay - obj.games + 40) {
				document.getElementById("775hitdate").innerHTML = "Unable to project";
			}

			//Goals Leaderboard
			var goalsleaderboard = [];
			for (const a in maindata) {
				if (maindata[a]["Type"].startsWith("Goals")) {
					goalsleaderboard.push(maindata[a]["Player"]);
				}
			}
			for (i = 0; i < goalsleaderboard.length; i++) {
				var goalsleft = maindata[i]["Total"] - (obj.goals + careergoals);
				document.getElementById(maindata[i]["Player"] + "goalsleft").innerHTML = goalsleft;
				var gamesleft = Math.ceil(goalsleft / (obj.evgpg + obj.ppgpg));
				document.getElementById(maindata[i]["Player"] + "gamesleft").innerHTML = gamesleft;
				if (gamesleft <= gamestoplay - obj.games) {
					if (xhrschedule[obj.games + gamesleft - 1]["Venue"] === "home") {
						document.getElementById(maindata[i]["Player"] + "hitdate").innerHTML = xhrschedule[obj.games + gamesleft - 1]["Date"] + " vs " + xhrschedule[obj.games + gamesleft - 1]["Nickname"];
					} else {
						document.getElementById(maindata[i]["Player"] + "hitdate").innerHTML = xhrschedule[obj.games + gamesleft - 1]["Date"] + " @ " + xhrschedule[obj.games + gamesleft - 1]["Nickname"];
					}
				} else if (gamesleft > gamestoplay - obj.games && gamesleft <= gamestoplay - obj.games + 40) {
					document.getElementById(maindata[i]["Player"] + "hitdate").innerHTML = "Likely next season";
				} else if (gamesleft > gamestoplay - obj.games + 40) {
					document.getElementById(maindata[i]["Player"] + "hitdate").innerHTML = "Unable to project";
				}
			}

			//PPGs Leaderboard
			var ppgoalsleaderboard = [];
			for (const b in maindata) {
				if (maindata[b]["Type"].startsWith("PP")) {
					ppgoalsleaderboard.push(maindata[b]["Player"]);
				}
			}
			for (p = goalsleaderboard.length; p < goalsleaderboard.length+ppgoalsleaderboard.length; p++) {
				var ppgoalsleft = maindata[p]["Total"] - (obj.ppgoals + careerppgoals);
				document.getElementById(maindata[p]["Player"] + "ppgoalsleft").innerHTML = ppgoalsleft;
				var ppgamesleft = Math.ceil(ppgoalsleft / obj.ppgpg);
				document.getElementById(maindata[p]["Player"] + "ppgamesleft").innerHTML = ppgamesleft;
				if (ppgamesleft <= gamestoplay - obj.games) {
					if (xhrschedule[obj.games + ppgamesleft - 1]["Venue"] === "home") {
						document.getElementById(maindata[p]["Player"] + "pphitdate").innerHTML = xhrschedule[obj.games + ppgamesleft - 1]["Date"] + " vs " + xhrschedule[obj.games + ppgamesleft - 1]["Nickname"];
					} else {
						document.getElementById(maindata[p]["Player"] + "pphitdate").innerHTML = xhrschedule[obj.games + ppgamesleft - 1]["Date"] + " @ " + xhrschedule[obj.games + ppgamesleft - 1]["Nickname"];
					}
				} else if (ppgamesleft > gamestoplay - obj.games && ppgamesleft <= gamestoplay - obj.games + 40) {
					document.getElementById(maindata[p]["Player"] + "pphitdate").innerHTML = "Likely next season";
				} else if (ppgamesleft > gamestoplay - obj.games + 40) {
					document.getElementById(maindata[p]["Player"] + "pphitdate").innerHTML = "Unable to project";
				}
			}
		}
	}
}

function weightedAvg(arrValues, arrWeights) {

  var result = arrValues.map(function (value, i) {

    var weight = arrWeights[i];
    var sum = value * weight;

    return [sum, weight];
  }).reduce(function (p, c) {

    return [p[0] + c[0], p[1] + c[1]];
  }, [0, 0]);

  return result[0] / result[1];
}

function weightedAvgArray(moving, season, weight){
	arr = [];
	for (i in moving) {
		var weightedavg = weightedAvg([moving[i],season[i]],[weight,100-weight]);
		arr.push(weightedavg);
	}
	return arr;
}

function sumArray(arr){
	sum = 0;
	for (i in arr) {
		sum += arr[i];
	}
	return sum;
}

function sumObjectArray(obj){
	sum = 0;
	for (k of Object.values(obj)) {
		sum += sumArray(k);
	}
	return sum;
}

function convertSeconds(timeinseconds) {
	var minutes = Math.floor(timeinseconds / 60);
	var seconds = Math.round(timeinseconds % 60);
	
	if (seconds < 10) {
		return minutes + ":0" + seconds;
	} else {
		return minutes + ":" + seconds;
	}
}

var get = function (obj, path, def) {

	// Cache the current object
	var current = obj;

	// For each item in the path, dig into the object
	for (var i = 0; i < path.length; i++) {

		// If the item isn't found, return the default (or null)
		if (!current[path[i]]) return def;

		// Otherwise, update the current  value
		current = current[path[i]];

	}
	return current;

};

function avgArray(jsonObj,path,period) {
	var bigarray = [];
	var sum = 0;
	var patharray = [];
	for (var i = 0; i < path.length; i++) {
		patharray.push(path[i]);
	}
	for (var a in jsonObj) {
		patharray.unshift(a);
		bigarray.push(get(jsonObj,patharray,0));
		patharray.shift(a);
	}
	for (var b = 0; b < period; b++) {
    	sum += bigarray[bigarray.length-period+b];
	}
	var avg = sum/period;
	return avg;
}

function avgSeason(jsonObj,path) {
	var bigarray = [];
	var patharray = [];
	for (var i = 0; i < path.length; i++) {
		patharray.push(path[i]);
	}
	for (const a in jsonObj) {
		if (jsonObj[a]["Game"].startsWith("G" + currentseason)) {
			patharray.unshift(a);
			bigarray.push(get(jsonObj,patharray,0));
			patharray.shift(a);
		}
	}

	var sum = 0;
	for (var b = 0; b < bigarray.length; b++) {
    	sum += bigarray[b];
	}

	var avg = sum/bigarray.length;
	return avg;
}

function per60(jsonObj, strengthname, strengthnum, shottype, period) {
	if (period === "season") {
		var avgtime = avgSeason(jsonObj,[strengthname,strengthnum,"TOI"]);
		var avgtimehour = avgtime/60/60;
		var allshots = [];
		var shotsbygame = [];
		var allgoals = [];
		var goalsbygame = [];

		for (var a in jsonObj) {
			if (jsonObj[a]["Game"].startsWith("G" + currentseason)) {
				shotsbygame.push(jsonObj[a][strengthname][strengthnum][shottype]);
			}
		}
		for (var b in shotsbygame) {
			for (var c in shotsbygame[b]) {
				allshots.push(shotsbygame[b][c]);
			}
		}

		for (var d in jsonObj) {
			if (jsonObj[d]["Game"].startsWith("G" + currentseason)) {
				goalsbygame.push(jsonObj[d][strengthname][strengthnum]["Goals"][shottype]);
			}
		}
		for (var e in goalsbygame) {
			for (var f in goalsbygame[e]) {
				allgoals.push(goalsbygame[e][f]);
			}
		}

		var bgl = 0, z1 = 0, z2 = 0, z3 = 0, z4 = 0, z5 = 0, z6 = 0, z7 = 0, z8 = 0, z8 = 0, z9 = 0, z10 = 0, z11 = 0, z12 = 0, z13 = 0, z14 = 0, z15 = 0, z16 = 0, z17 = 0, z18 = 0, z19 = 0, z20 = 0, nz = 0, dz = 0;
		for (var i in allshots) {
			shotparse = parseShot(allshots[i], allgoals[i]);
			switch (shotparse[0]) {
				case 0:
					bgl++; break
				case 1:
					z1++; break
				case 2:
					z2++; break
				case 3:
					z3++; break
				case 4:
					z4++; break
				case 5:
					z5++; break
				case 6:
					z6++; break
				case 7:
					z7++; break
				case 8:
					z8++; break
				case 9:
					z9++; break
				case 10:
					z10++; break
				case 11:
					z11++; break
				case 12:
					z12++; break
				case 13:
					z13++; break
				case 14:
					z14++; break
				case 15:
					z15++; break
				case 16:
					z16++; break
				case 17:
					z17++; break
				case 18:
					z18++; break
				case 19:
					z19++; break
				case 20:
					z20++; break
				case 21:
					nz++; break
				case 22:
					dz++;
			}
		}
		if (avgtimehour != 0) {
			var bglavg = bgl/avgtimehour/shotsbygame.length;
			var z1avg = z1/avgtimehour/shotsbygame.length;
			var z2avg = z2/avgtimehour/shotsbygame.length;
			var z3avg = z3/avgtimehour/shotsbygame.length;
			var z4avg = z4/avgtimehour/shotsbygame.length;
			var z5avg = z5/avgtimehour/shotsbygame.length;
			var z6avg = z6/avgtimehour/shotsbygame.length;
			var z7avg = z7/avgtimehour/shotsbygame.length;
			var z8avg = z8/avgtimehour/shotsbygame.length;
			var z9avg = z9/avgtimehour/shotsbygame.length;
			var z10avg = z10/avgtimehour/shotsbygame.length;
			var z11avg = z11/avgtimehour/shotsbygame.length;
			var z12avg = z12/avgtimehour/shotsbygame.length;
			var z13avg = z13/avgtimehour/shotsbygame.length;
			var z14avg = z14/avgtimehour/shotsbygame.length;
			var z15avg = z15/avgtimehour/shotsbygame.length;
			var z16avg = z16/avgtimehour/shotsbygame.length;
			var z17avg = z17/avgtimehour/shotsbygame.length;
			var z18avg = z18/avgtimehour/shotsbygame.length;
			var z19avg = z19/avgtimehour/shotsbygame.length;
			var z20avg = z20/avgtimehour/shotsbygame.length;
			var nzavg = nz/avgtimehour/shotsbygame.length;
			var dzavg = dz/avgtimehour/shotsbygame.length;
		} else {
			var bglavg = 0, z1avg = 0, z2avg = 0, z3avg = 0, z4avg = 0, z5avg = 0, z6avg = 0, z7avg = 0, z8avg = 0, z8avg = 0, z9avg = 0, z10avg = 0, z11avg = 0, z12avg = 0, z13avg = 0, z14avg = 0, z15avg = 0, z16avg = 0, z17avg = 0, z18avg = 0, z19avg = 0, z20avg = 0, nzavg = 0, dzavg = 0; 
		}
		// var total = bglavg + z1avg + z2avg + z3avg + z4avg + z5avg + z6avg + z7avg + z8avg + z9avg + z10avg + z11avg + z12avg + z13avg + z14avg + z15avg + z16avg + z17avg + z18avg + z19avg + z20avg + nzavg + dzavg;
		return [bglavg, z1avg, z2avg, z3avg, z4avg, z5avg, z6avg, z7avg, z8avg, z9avg, z10avg, z11avg, z12avg, z13avg, z14avg, z15avg, z16avg, z17avg, z18avg, z19avg, z20avg, nzavg, dzavg];
	} else {
		var avgtime = avgArray(jsonObj,[strengthname,strengthnum,"TOI"],period);
		var avgtimehour = avgtime/60/60;
		var allshots = [];
		var shotsperiod = [];
		var shotsbygame = [];
		var allgoals = [];
		var goalsperiod = [];
		var goalsbygame = [];

		for (var a in jsonObj) {
			shotsbygame.push(jsonObj[a][strengthname][strengthnum][shottype]);
		}
		for (var b = 0; b < period; b++) {
			shotsperiod.push(shotsbygame[shotsbygame.length-period+b]);
		}
		for (var c in shotsperiod) {
			for (var d in shotsperiod[c]) {
				allshots.push(shotsperiod[c][d]);
			}
		}

		for (var e in jsonObj) {
			goalsbygame.push(jsonObj[e][strengthname][strengthnum]["Goals"][shottype]);
		}
		for (var f = 0; f < period; f++) {
			goalsperiod.push(goalsbygame[goalsbygame.length-period+f]);
		}
		for (var g in goalsperiod) {
			for (var h in goalsperiod[g]) {
				allgoals.push(goalsperiod[g][h]);
			}
		}
		var bgl = 0, z1 = 0, z2 = 0, z3 = 0, z4 = 0, z5 = 0, z6 = 0, z7 = 0, z8 = 0, z8 = 0, z9 = 0, z10 = 0, z11 = 0, z12 = 0, z13 = 0, z14 = 0, z15 = 0, z16 = 0, z17 = 0, z18 = 0, z19 = 0, z20 = 0, nz = 0, dz = 0;
		for (var i in allshots) {
			shotparse = parseShot(allshots[i], allgoals[i]);
			switch (shotparse[0]) {
				case 0:
					bgl++; break
				case 1:
					z1++; break
				case 2:
					z2++; break
				case 3:
					z3++; break
				case 4:
					z4++; break
				case 5:
					z5++; break
				case 6:
					z6++; break
				case 7:
					z7++; break
				case 8:
					z8++; break
				case 9:
					z9++; break
				case 10:
					z10++; break
				case 11:
					z11++; break
				case 12:
					z12++; break
				case 13:
					z13++; break
				case 14:
					z14++; break
				case 15:
					z15++; break
				case 16:
					z16++; break
				case 17:
					z17++; break
				case 18:
					z18++; break
				case 19:
					z19++; break
				case 20:
					z20++; break
				case 21:
					nz++; break
				case 22:
					dz++;
			}
		}
		if (avgtimehour != 0) {
			var bglavg = bgl/avgtimehour/period;
			var z1avg = z1/avgtimehour/period;
			var z2avg = z2/avgtimehour/period;
			var z3avg = z3/avgtimehour/period;
			var z4avg = z4/avgtimehour/period;
			var z5avg = z5/avgtimehour/period;
			var z6avg = z6/avgtimehour/period;
			var z7avg = z7/avgtimehour/period;
			var z8avg = z8/avgtimehour/period;
			var z9avg = z9/avgtimehour/period;
			var z10avg = z10/avgtimehour/period;
			var z11avg = z11/avgtimehour/period;
			var z12avg = z12/avgtimehour/period;
			var z13avg = z13/avgtimehour/period;
			var z14avg = z14/avgtimehour/period;
			var z15avg = z15/avgtimehour/period;
			var z16avg = z16/avgtimehour/period;
			var z17avg = z17/avgtimehour/period;
			var z18avg = z18/avgtimehour/period;
			var z19avg = z19/avgtimehour/period;
			var z20avg = z20/avgtimehour/period;
			var nzavg = nz/avgtimehour/period;
			var dzavg = dz/avgtimehour/period;
		} else {
			var bglavg = 0, z1avg = 0, z2avg = 0, z3avg = 0, z4avg = 0, z5avg = 0, z6avg = 0, z7avg = 0, z8avg = 0, z8avg = 0, z9avg = 0, z10avg = 0, z11avg = 0, z12avg = 0, z13avg = 0, z14avg = 0, z15avg = 0, z16avg = 0, z17avg = 0, z18avg = 0, z19avg = 0, z20avg = 0, nzavg = 0, dzavg = 0; 
		}
		// var total = bglavg + z1avg + z2avg + z3avg + z4avg + z5avg + z6avg + z7avg + z8avg + z9avg + z10avg + z11avg + z12avg + z13avg + z14avg + z15avg + z16avg + z17avg + z18avg + z19avg + z20avg + nzavg + dzavg;
		return [bglavg, z1avg, z2avg, z3avg, z4avg, z5avg, z6avg, z7avg, z8avg, z9avg, z10avg, z11avg, z12avg, z13avg, z14avg, z15avg, z16avg, z17avg, z18avg, z19avg, z20avg, nzavg, dzavg];
	}
}

function shootingPct(jsonObj, strengthname, strengthnum, shottype, period) {
	if (period === "season") {
		var allshots = [];
		var shotsbygame = [];
		var allgoals = [];
		var goalsbygame = [];

		for (var a in jsonObj) {
			if (jsonObj[a]["Game"].startsWith("G" + currentseason)) {
				shotsbygame.push(jsonObj[a][strengthname][strengthnum][shottype]);
			}
		}
		for (var b in shotsbygame) {
			for (var c in shotsbygame[b]) {
				allshots.push(shotsbygame[b][c]);
			}
		}

		for (var d in jsonObj) {
			if (jsonObj[d]["Game"].startsWith("G" + currentseason)) {
				goalsbygame.push(jsonObj[d][strengthname][strengthnum]["Goals"][shottype]);
			}
		}
		for (var e in goalsbygame) {
			for (var f in goalsbygame[e]) {
				allgoals.push(goalsbygame[e][f]);
			}
		}

		var bgl = 0, z1 = 0, z2 = 0, z3 = 0, z4 = 0, z5 = 0, z6 = 0, z7 = 0, z8 = 0, z8 = 0, z9 = 0, z10 = 0, z11 = 0, z12 = 0, z13 = 0, z14 = 0, z15 = 0, z16 = 0, z17 = 0, z18 = 0, z19 = 0, z20 = 0, nz = 0, dz = 0;
		var bglgls = 0, z1gls = 0, z2gls = 0, z3gls = 0, z4gls = 0, z5gls = 0, z6gls = 0, z7gls = 0, z8gls = 0, z8gls = 0, z9gls = 0, z10gls = 0, z11gls = 0, z12gls = 0, z13gls = 0, z14gls = 0, z15gls = 0, z16gls = 0, z17gls = 0, z18gls = 0, z19gls = 0, z20gls = 0, nzgls = 0, dzgls = 0;

		for (var i in allshots) {
			shotparse = parseShot(allshots[i], allgoals[i]);
			if (shotparse[1] == 1) {
				switch (shotparse[0]) {
					case 0:
						bgl++; bglgls++; break
					case 1:
						z1++; z1gls++; break
					case 2:
						z2++; z2gls++; break
					case 3:
						z3++; z3gls++; break
					case 4:
						z4++; z4gls++; break
					case 5:
						z5++; z5gls++; break
					case 6:
						z6++; z6gls++; break
					case 7:
						z7++; z7gls++; break
					case 8:
						z8++; z8gls++; break
					case 9:
						z9++; z9gls++; break
					case 10:
						z10++; z10gls++; break
					case 11:
						z11++; z11gls++; break
					case 12:
						z12++; z12gls++; break
					case 13:
						z13++; z13gls++; break
					case 14:
						z14++; z14gls++; break
					case 15:
						z15++; z15gls++; break
					case 16:
						z16++; z16gls++; break
					case 17:
						z17++; z17gls++; break
					case 18:
						z18++; z18gls++; break
					case 19:
						z19++; z19gls++; break
					case 20:
						z20++; z20gls++; break
					case 21:
						nz++; nzgls++; break
					case 22:
						dz++; dzgls++;
				}
			} else {
				switch (shotparse[0]) {
					case 0:
						bgl++; break
					case 1:
						z1++; break
					case 2:
						z2++; break
					case 3:
						z3++; break
					case 4:
						z4++; break
					case 5:
						z5++; break
					case 6:
						z6++; break
					case 7:
						z7++; break
					case 8:
						z8++; break
					case 9:
						z9++; break
					case 10:
						z10++; break
					case 11:
						z11++; break
					case 12:
						z12++; break
					case 13:
						z13++; break
					case 14:
						z14++; break
					case 15:
						z15++; break
					case 16:
						z16++; break
					case 17:
						z17++; break
					case 18:
						z18++; break
					case 19:
						z19++; break
					case 20:
						z20++; break
					case 21:
						nz++; break
					case 22:
						dz++;
				}
			}
		}
		if (bgl == 0) { var bglpct = 0; } else { var bglpct = bglgls/bgl; }
		if (z1 == 0) { var z1pct = 0; } else { var z1pct = z1gls/z1; }
		if (z2 == 0) { var z2pct = 0; } else { var z2pct = z2gls/z2; }
		if (z3 == 0) { var z3pct = 0; } else { var z3pct = z3gls/z3; }
		if (z4 == 0) { var z4pct = 0; } else { var z4pct = z4gls/z4; }
		if (z5 == 0) { var z5pct = 0; } else { var z5pct = z5gls/z5; }
		if (z6 == 0) { var z6pct = 0; } else { var z6pct = z6gls/z6; }
		if (z7 == 0) { var z7pct = 0; } else { var z7pct = z7gls/z7; }
		if (z8 == 0) { var z8pct = 0; } else { var z8pct = z8gls/z8; }
		if (z9 == 0) { var z9pct = 0; } else { var z9pct = z9gls/z9; }
		if (z10 == 0) { var z10pct = 0; } else { var z10pct = z10gls/z10; }
		if (z11 == 0) { var z11pct = 0; } else { var z11pct = z11gls/z11; }
		if (z12 == 0) { var z12pct = 0; } else { var z12pct = z12gls/z12; }
		if (z13 == 0) { var z13pct = 0; } else { var z13pct = z13gls/z13; }
		if (z14 == 0) { var z14pct = 0; } else { var z14pct = z14gls/z14; }
		if (z15 == 0) { var z15pct = 0; } else { var z15pct = z15gls/z15; }
		if (z16 == 0) { var z16pct = 0; } else { var z16pct = z16gls/z16; }
		if (z17 == 0) { var z17pct = 0; } else { var z17pct = z17gls/z17; }
		if (z18 == 0) { var z18pct = 0; } else { var z18pct = z18gls/z18; }
		if (z19 == 0) { var z19pct = 0; } else { var z19pct = z19gls/z19; }
		if (z20 == 0) { var z20pct = 0; } else { var z20pct = z20gls/z20; }
		if (nz == 0) { var nzpct = 0; } else { var nzpct = nzgls/nz; }
		if (dz == 0) { var dzpct = 0; } else { var dzpct = dzgls/dz; }
		var total = (bglgls + z1gls + z2gls + z3gls + z4gls + z5gls + z6gls + z7gls + z8gls + z9gls + z10gls + z11gls + z12gls + z13gls + z14gls + z15gls + z16gls + z17gls + z18gls + z19gls + z20gls + nzgls + dzgls)/(bgl + z1 + z2 + z3 + z4 + z5 + z6 + z7 + z8 + z9 + z10 + z11 + z12 + z13 + z14 + z15 + z16 + z17 + z18 + z19 + z20 + nz + dz);
		// console.log(total);
		// console.log(["Behind Goal Line: "+bglgls+"/"+bgl, "Zone 1: "+z1gls+"/"+z1, "Zone 2: "+z2gls+"/"+z2, "Zone 3: "+z3gls+"/"+z3, "Zone 4: "+z4gls+"/"+z4, "Zone 5: "+z5gls+"/"+z5, "Zone 6: "+z6gls+"/"+z6, "Zone 7: "+z7gls+"/"+z7, "Zone 8: "+z8gls+"/"+z8, "Zone 9: "+z9gls+"/"+z9, "Zone 10: "+z10gls+"/"+z10, "Zone 11: "+z11gls+"/"+z11, "Zone 12: "+z12gls+"/"+z12, "Zone 13: "+z13gls+"/"+z13, "Zone 14: "+z14gls+"/"+z14, "Zone 15: "+z15gls+"/"+z15, "Zone 16: "+z16gls+"/"+z16, "Zone 17: "+z17gls+"/"+z17, "Zone 18: "+z18gls+"/"+z18, "Zone 19: "+z19gls+"/"+z19, "Zone 20: "+z20gls+"/"+z20, "Neutral Zone: "+nzgls+"/"+nz, "Defensive Zone: "+dzgls+"/"+dz]);
		return [[bglpct, z1pct, z2pct, z3pct, z4pct, z5pct, z6pct, z7pct, z8pct, z9pct, z10pct, z11pct, z12pct, z13pct, z14pct, z15pct, z16pct, z17pct, z18pct, z19pct, z20pct, nzpct, dzpct],total];
	} else {
		var allshots = [];
		var shotsperiod = [];
		var shotsbygame = [];
		var allgoals = [];
		var goalsperiod = [];
		var goalsbygame = [];
		for (var a in jsonObj) {
			shotsbygame.push(jsonObj[a][strengthname][strengthnum][shottype]);
		}
		for (var b = 0; b < period; b++) {
			shotsperiod.push(shotsbygame[shotsbygame.length-period+b]);
		}
		for (var c in shotsperiod) {
			for (var d in shotsperiod[c]) {
				allshots.push(shotsperiod[c][d]);
			}
		}

		for (var e in jsonObj) {
			goalsbygame.push(jsonObj[e][strengthname][strengthnum]["Goals"][shottype]);
		}
		for (var f = 0; f < period; f++) {
			goalsperiod.push(goalsbygame[goalsbygame.length-period+f]);
		}
		for (var g in goalsperiod) {
			for (var h in goalsperiod[g]) {
				allgoals.push(goalsperiod[g][h]);
			}
		}
		var bgl = 0, z1 = 0, z2 = 0, z3 = 0, z4 = 0, z5 = 0, z6 = 0, z7 = 0, z8 = 0, z8 = 0, z9 = 0, z10 = 0, z11 = 0, z12 = 0, z13 = 0, z14 = 0, z15 = 0, z16 = 0, z17 = 0, z18 = 0, z19 = 0, z20 = 0, nz = 0, dz = 0;
		var bglgls = 0, z1gls = 0, z2gls = 0, z3gls = 0, z4gls = 0, z5gls = 0, z6gls = 0, z7gls = 0, z8gls = 0, z8gls = 0, z9gls = 0, z10gls = 0, z11gls = 0, z12gls = 0, z13gls = 0, z14gls = 0, z15gls = 0, z16gls = 0, z17gls = 0, z18gls = 0, z19gls = 0, z20gls = 0, nzgls = 0, dzgls = 0;

		for (var i in allshots) {
			shotparse = parseShot(allshots[i], allgoals[i]);
			if (shotparse[1] == 1) {
				switch (shotparse[0]) {
					case 0:
						bgl++; bglgls++; break
					case 1:
						z1++; z1gls++; break
					case 2:
						z2++; z2gls++; break
					case 3:
						z3++; z3gls++; break
					case 4:
						z4++; z4gls++; break
					case 5:
						z5++; z5gls++; break
					case 6:
						z6++; z6gls++; break
					case 7:
						z7++; z7gls++; break
					case 8:
						z8++; z8gls++; break
					case 9:
						z9++; z9gls++; break
					case 10:
						z10++; z10gls++; break
					case 11:
						z11++; z11gls++; break
					case 12:
						z12++; z12gls++; break
					case 13:
						z13++; z13gls++; break
					case 14:
						z14++; z14gls++; break
					case 15:
						z15++; z15gls++; break
					case 16:
						z16++; z16gls++; break
					case 17:
						z17++; z17gls++; break
					case 18:
						z18++; z18gls++; break
					case 19:
						z19++; z19gls++; break
					case 20:
						z20++; z20gls++; break
					case 21:
						nz++; nzgls++; break
					case 22:
						dz++; dzgls++;
				}
			} else {
				switch (shotparse[0]) {
					case 0:
						bgl++; break
					case 1:
						z1++; break
					case 2:
						z2++; break
					case 3:
						z3++; break
					case 4:
						z4++; break
					case 5:
						z5++; break
					case 6:
						z6++; break
					case 7:
						z7++; break
					case 8:
						z8++; break
					case 9:
						z9++; break
					case 10:
						z10++; break
					case 11:
						z11++; break
					case 12:
						z12++; break
					case 13:
						z13++; break
					case 14:
						z14++; break
					case 15:
						z15++; break
					case 16:
						z16++; break
					case 17:
						z17++; break
					case 18:
						z18++; break
					case 19:
						z19++; break
					case 20:
						z20++; break
					case 21:
						nz++; break
					case 22:
						dz++;
				}
			}
		}
		if (bgl == 0) { var bglpct = 0; } else { var bglpct = bglgls/bgl; }
		if (z1 == 0) { var z1pct = 0; } else { var z1pct = z1gls/z1; }
		if (z2 == 0) { var z2pct = 0; } else { var z2pct = z2gls/z2; }
		if (z3 == 0) { var z3pct = 0; } else { var z3pct = z3gls/z3; }
		if (z4 == 0) { var z4pct = 0; } else { var z4pct = z4gls/z4; }
		if (z5 == 0) { var z5pct = 0; } else { var z5pct = z5gls/z5; }
		if (z6 == 0) { var z6pct = 0; } else { var z6pct = z6gls/z6; }
		if (z7 == 0) { var z7pct = 0; } else { var z7pct = z7gls/z7; }
		if (z8 == 0) { var z8pct = 0; } else { var z8pct = z8gls/z8; }
		if (z9 == 0) { var z9pct = 0; } else { var z9pct = z9gls/z9; }
		if (z10 == 0) { var z10pct = 0; } else { var z10pct = z10gls/z10; }
		if (z11 == 0) { var z11pct = 0; } else { var z11pct = z11gls/z11; }
		if (z12 == 0) { var z12pct = 0; } else { var z12pct = z12gls/z12; }
		if (z13 == 0) { var z13pct = 0; } else { var z13pct = z13gls/z13; }
		if (z14 == 0) { var z14pct = 0; } else { var z14pct = z14gls/z14; }
		if (z15 == 0) { var z15pct = 0; } else { var z15pct = z15gls/z15; }
		if (z16 == 0) { var z16pct = 0; } else { var z16pct = z16gls/z16; }
		if (z17 == 0) { var z17pct = 0; } else { var z17pct = z17gls/z17; }
		if (z18 == 0) { var z18pct = 0; } else { var z18pct = z18gls/z18; }
		if (z19 == 0) { var z19pct = 0; } else { var z19pct = z19gls/z19; }
		if (z20 == 0) { var z20pct = 0; } else { var z20pct = z20gls/z20; }
		if (nz == 0) { var nzpct = 0; } else { var nzpct = nzgls/nz; }
		if (dz == 0) { var dzpct = 0; } else { var dzpct = dzgls/dz; }
		var total = (bglgls + z1gls + z2gls + z3gls + z4gls + z5gls + z6gls + z7gls + z8gls + z9gls + z10gls + z11gls + z12gls + z13gls + z14gls + z15gls + z16gls + z17gls + z18gls + z19gls + z20gls + nzgls + dzgls)/(bgl + z1 + z2 + z3 + z4 + z5 + z6 + z7 + z8 + z9 + z10 + z11 + z12 + z13 + z14 + z15 + z16 + z17 + z18 + z19 + z20 + nz + dz);
		// console.log(total);
		// console.log(["Behind Goal Line: "+bglgls+"/"+bgl, "Zone 1: "+z1gls+"/"+z1, "Zone 2: "+z2gls+"/"+z2, "Zone 3: "+z3gls+"/"+z3, "Zone 4: "+z4gls+"/"+z4, "Zone 5: "+z5gls+"/"+z5, "Zone 6: "+z6gls+"/"+z6, "Zone 7: "+z7gls+"/"+z7, "Zone 8: "+z8gls+"/"+z8, "Zone 9: "+z9gls+"/"+z9, "Zone 10: "+z10gls+"/"+z10, "Zone 11: "+z11gls+"/"+z11, "Zone 12: "+z12gls+"/"+z12, "Zone 13: "+z13gls+"/"+z13, "Zone 14: "+z14gls+"/"+z14, "Zone 15: "+z15gls+"/"+z15, "Zone 16: "+z16gls+"/"+z16, "Zone 17: "+z17gls+"/"+z17, "Zone 18: "+z18gls+"/"+z18, "Zone 19: "+z19gls+"/"+z19, "Zone 20: "+z20gls+"/"+z20, "Neutral Zone: "+nzgls+"/"+nz, "Defensive Zone: "+dzgls+"/"+dz]);
		return [[bglpct, z1pct, z2pct, z3pct, z4pct, z5pct, z6pct, z7pct, z8pct, z9pct, z10pct, z11pct, z12pct, z13pct, z14pct, z15pct, z16pct, z17pct, z18pct, z19pct, z20pct, nzpct, dzpct],total];
	}
}

function TOI(jsonObj,strengthname,strengthnum,period) {
	if (period === "season") {
		var avgtime = avgSeason(jsonObj,[strengthname,strengthnum,"TOI"]);

		avgtime = avgtime / 60 / 60;

		return avgtime;
	} else {
		var avgtime = avgArray(jsonObj,[strengthname,strengthnum,"TOI"],period);
		
		avgtime = avgtime / 60 / 60;
		
		return avgtime;
	}
}

function seasonTotals(jsonObj,strengthname,strengthnum,basis) {
	var allshots = [];
	var shotsbygame = [];
	var allgoals = [];
	var goalsbygame = [];
	var bglgls = 0, z1gls = 0, z2gls = 0, z3gls = 0, z4gls = 0, z5gls = 0, z6gls = 0, z7gls = 0, z8gls = 0, z8gls = 0, z9gls = 0, z10gls = 0, z11gls = 0, z12gls = 0, z13gls = 0, z14gls = 0, z15gls = 0, z16gls = 0, z17gls = 0, z18gls = 0, z19gls = 0, z20gls = 0, nzgls = 0, dzgls = 0;

	if (strengthname === "All") {
		for (var a in jsonObj) {
			if (jsonObj[a]["Game"].startsWith("G" + currentseason)) {
				shotsbygame.push(jsonObj[a][basis]);
			}
		}
		for (var b in shotsbygame) {
			for (var c in shotsbygame[b]) {
				allshots.push(shotsbygame[b][c]);
			}
		}

		for (var d in jsonObj) {
			if (jsonObj[d]["Game"].startsWith("G" + currentseason)) {
				goalsbygame.push(jsonObj[d]["Goals"][basis]);
			}
		}
		for (var e in goalsbygame) {
			for (var f in goalsbygame[e]) {
				allgoals.push(goalsbygame[e][f]);
			}
		}
	} else {
		if (strengthnum === "All") {
			for (var a in jsonObj) {
				if (jsonObj[a]["Game"].startsWith("G" + currentseason)) {
					shotsbygame.push(jsonObj[a][strengthname][basis]);
				}
			}
			for (var b in shotsbygame) {
				for (var c in shotsbygame[b]) {
					allshots.push(shotsbygame[b][c]);
				}
			}

			for (var d in jsonObj) {
				if (jsonObj[d]["Game"].startsWith("G" + currentseason)) {
					goalsbygame.push(jsonObj[d][strengthname]["Goals"][basis]);
				}
			}
			for (var e in goalsbygame) {
				for (var f in goalsbygame[e]) {
					allgoals.push(goalsbygame[e][f]);
				}
			}
		} else {
			for (var a in jsonObj) {
				if (jsonObj[a]["Game"].startsWith("G" + currentseason)) {
					shotsbygame.push(jsonObj[a][strengthname][strengthnum][basis]);
				}
			}
			for (var b in shotsbygame) {
				for (var c in shotsbygame[b]) {
					allshots.push(shotsbygame[b][c]);
				}
			}
	
			for (var d in jsonObj) {
				if (jsonObj[d]["Game"].startsWith("G" + currentseason)) {
					goalsbygame.push(jsonObj[d][strengthname][strengthnum]["Goals"][basis]);
				}
			}
			for (var e in goalsbygame) {
				for (var f in goalsbygame[e]) {
					allgoals.push(goalsbygame[e][f]);
				}
			}
		}
	}
	for (var i in allshots) {
		shotparse = parseShot(allshots[i], allgoals[i]);
		if (shotparse[1] == 1) {
			switch (shotparse[0]) {
				case 0:
					bglgls++; break
				case 1:
					z1gls++; break
				case 2:
					z2gls++; break
				case 3:
					z3gls++; break
				case 4:
					z4gls++; break
				case 5:
					z5gls++; break
				case 6:
					z6gls++; break
				case 7:
					z7gls++; break
				case 8:
					z8gls++; break
				case 9:
					z9gls++; break
				case 10:
					z10gls++; break
				case 11:
					z11gls++; break
				case 12:
					z12gls++; break
				case 13:
					z13gls++; break
				case 14:
					z14gls++; break
				case 15:
					z15gls++; break
				case 16:
					z16gls++; break
				case 17:
					z17gls++; break
				case 18:
					z18gls++; break
				case 19:
					z19gls++; break
				case 20:
					z20gls++; break
				case 21:
					nzgls++; break
				case 22:
					dzgls++;
			}
		}
	}
	return [bglgls,z1gls,z2gls,z3gls,z4gls,z5gls,z6gls,z7gls,z8gls,z9gls,z10gls,z11gls,z12gls,z13gls,z14gls,z15gls,z16gls,z17gls,z18gls,z19gls,z20gls,nzgls,dzgls];
}

function parseShot(coordArray, goal) {
	if (coordArray[0] < 0) {
		// console.log("Behind Goal Line");
		return [0, goal];
	} else if (coordArray[0] >= 0 && coordArray[0] < 15) {
		if (coordArray[1] < -22.5) {
			// console.log("Zone 1");
			return [1, goal];
		} else if (coordArray[1] > -22.5 && coordArray[1] < -7.5) {
			// console.log("Zone 2");
			return [2, goal];
		} else if (coordArray[1] > -7.5 && coordArray[1] < 7.5) {
			// console.log("Zone 3");
			return [3, goal];
		} else if (coordArray[1] > 7.5 && coordArray[1] < 22.5) {
			// console.log("Zone 4");
			return [4, goal];
		} else if (coordArray[1] > 22.5) {
			// console.log("Zone 5");
			return [5, goal];
		}
	} else if (coordArray[0] >= 15 && coordArray[0] < 30) {
		if (coordArray[1] < -22.5) {
			// console.log("Zone 6");
			return [6, goal];
		} else if (coordArray[1] > -22.5 && coordArray[1] < -7.5) {
			// console.log("Zone 7");
			return [7, goal];
		} else if (coordArray[1] > -7.5 && coordArray[1] < 7.5) {
			// console.log("Zone 8");
			return [8, goal];
		} else if (coordArray[1] > 7.5 && coordArray[1] < 22.5) {
			// console.log("Zone 9");
			return [9, goal];
		} else if (coordArray[1] > 22.5) {
			// console.log("Zone 10");
			return [10, goal];
		}
	} else if (coordArray[0] >= 30 && coordArray[0] < 45) {
		if (coordArray[1] < -22.5) {
			// console.log("Zone 11");
			return [11, goal];
		} else if (coordArray[1] > -22.5 && coordArray[1] < -7.5) {
			// console.log("Zone 12");
			return [12, goal];
		} else if (coordArray[1] > -7.5 && coordArray[1] < 7.5) {
			// console.log("Zone 13");
			return [13, goal];
		} else if (coordArray[1] > 7.5 && coordArray[1] < 22.5) {
			// console.log("Zone 14");
			return [14, goal];
		} else if (coordArray[1] > 22.5) {
			// console.log("Zone 15");
			return [15, goal];
		}
	} else if (coordArray[0] >= 45 && coordArray[0] < 64) {
		if (coordArray[1] < -22.5) {
			// console.log("Zone 16");
			return [16, goal];
		} else if (coordArray[1] > -22.5 && coordArray[1] < -7.5) {
			// console.log("Zone 17");
			return [17, goal];
		} else if (coordArray[1] > -7.5 && coordArray[1] < 7.5) {
			// console.log("Zone 18");
			return [18, goal];
		} else if (coordArray[1] > 7.5 && coordArray[1] < 22.5) {
			// console.log("Zone 19");
			return [19, goal];
		} else if (coordArray[1] > 22.5) {
			// console.log("Zone 20");
			return [20, goal];
		}
	} else if (coordArray[0] >= 64 && coordArray[0] < 114) {
		// console.log("Neutral Zone");
		return [21, goal];
	} else if (coordArray[0] >= 114) {
		// console.log("Defensive Zone");
		return [22, goal];
	}
}

function seasonGames(jsonObj) {
	var seasongames = [];
	for (const season in jsonObj) {
		if (jsonObj[season]["Game"].startsWith("G" + currentseason)) {
			seasongames.push(jsonObj[season]["Goals"]);
		}
	}
		
	return seasongames.length;
}