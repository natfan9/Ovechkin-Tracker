var currentseason = 2019;
var gamestoplay = 82;
var careergoals = 658;
var careerppgoals = 247;

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
function weightedShots(neededOutputs) {
	var originaldata = dataUrl;
	var request = new XMLHttpRequest();
	request.open('GET', originaldata);
	request.responseType = 'json';
	request.send();

	request.onload = function() {
		var maindata = request.response;

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

		function evDisplayTOI() {
			var time82games = evTOI(maindata) * 60 * 60;
			var timeseason = seasonEVTOI(maindata) * 60 * 60;

			var avgtime = weightedAvg([time82games,timeseason],[timeweight,100-timeweight]);

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

		function ppDisplayTOI() {
			var time82games = ppTOI(maindata) * 60 * 60;
			var timeseason = seasonPPTOI(maindata) * 60 * 60;

			var avgtime = weightedAvg([time82games,timeseason],[timeweight,100-timeweight]);

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

		var games = seasonGames(maindata);
		document.getElementById("compgames").innerHTML = games;
		var goals = seasonGoals(maindata);
		document.getElementById("compgoals").innerHTML = goals;
		var newcareergoals = careergoals + goals;
		document.getElementById("careergoals").innerHTML = newcareergoals;

		//Even Strength Shots
		var evshots20 = evShotsPer60(maindata);
		var evshotsseason = seasonEVShotsPer60(maindata);
		var evshots = weightedAvg([evshots20,evshotsseason],[shotsweight,100-shotsweight]);
		document.getElementById("evshots").innerHTML = evshots.toPrecision(4);

		//Even Strength Time on Ice Display
		var evdisplaytoi = evDisplayTOI(maindata);
		document.getElementById("evtoi").innerHTML = evdisplaytoi;

		//Eve Strength Time on Ice Calculation
		var evtoi82 = evTOI(maindata);
		var evtoiseason = seasonEVTOI(maindata);
		var evtoi = weightedAvg([evtoi82,evtoiseason],[timeweight,100-timeweight]);

		//Even Strength Shooting Percentage
		var evpct246 = evShootPct(maindata);
		var evpctseason = seasonEVShootPct(maindata);
		var evpct = weightedAvg([evpct246,evpctseason],[pctweight,100-pctweight]);

		var evdisplaypct = evpct * 100;
		document.getElementById("evpct").innerHTML = evdisplaypct.toPrecision(4) + "%";

		//Power Play Shots
		var ppshots20 = ppShotsPer60(maindata);
		var ppshotsseason = seasonPPShotsPer60(maindata);
		var ppshots = weightedAvg([ppshots20,ppshotsseason],[shotsweight,100-shotsweight]);
		document.getElementById("ppshots").innerHTML = ppshots.toPrecision(4);

		//Power Play Time on Ice Display
		var ppdisplaytoi = ppDisplayTOI(maindata);
		document.getElementById("pptoi").innerHTML = ppdisplaytoi;

		//Power Play Time on Ice Calculation
		var pptoi82 = ppTOI(maindata);
		var pptoiseason = seasonPPTOI(maindata);
		var pptoi = weightedAvg([pptoi82,pptoiseason],[timeweight,100-timeweight]);

		//Power Play Shooting Percentage
		var pppct246 = ppShootPct(maindata);
		var pppctseason = seasonPPShootPct(maindata);
		var pppct = weightedAvg([pppct246,pppctseason],[pctweight,100-pctweight]);

		var ppdisplaypct = pppct * 100;
		document.getElementById("pppct").innerHTML = ppdisplaypct.toPrecision(4) + "%";

		var evgpg = evshots * evtoi * evpct;
		var ppgpg = ppshots * pptoi * pppct;

		var evgoals = seasonEVGoals(maindata);
		var ppgoals = seasonPPGoals(maindata);

		var evgoalsrem = evgpg * (gamestoplay - games);
		var ppgoalsrem = ppgpg * (gamestoplay - games);

		var projevgoals = evgoals + evgoalsrem;
		document.getElementById("evgoals").innerHTML = projevgoals.toPrecision(4);
		var projppgoals = ppgoals + ppgoalsrem;
		document.getElementById("ppgoals").innerHTML = projppgoals.toPrecision(4);
		var projtotalgoals = projevgoals + projppgoals;
		document.getElementById("totalgoals").innerHTML = projtotalgoals.toPrecision(4);
		var projcareergoals = careergoals + projtotalgoals;
		document.getElementById("careergoalsproj").innerHTML = projcareergoals.toPrecision(3);
		
		document.getElementById("evshotslabel").innerHTML = "Weighted Shots/60";
		document.getElementById("evtoilabel").innerHTML = "Weighted Time On Ice";
		document.getElementById("evpctlabel").innerHTML = "Weighted Shooting %";
		document.getElementById("ppshotslabel").innerHTML = "Weighted Shots/60";
		document.getElementById("pptoilabel").innerHTML = "Weighted Time On Ice";
		document.getElementById("pppctlabel").innerHTML = "Weighted Shooting %";
		
		neededOutputs({games:games,goals:goals,evgoals:evgoals,ppgoals:ppgoals,evgpg:evgpg,ppgpg:ppgpg});
	}
}

function pureShots(neededOutputs) {
	var originaldata = dataUrl;
	var request = new XMLHttpRequest();
	request.open('GET', originaldata);
	request.responseType = 'json';
	request.send();

	request.onload = function() {
		var maindata = request.response;
		
		var games = seasonGames(maindata);
		document.getElementById("compgames").innerHTML = games;
		var goals = seasonGoals(maindata);
		document.getElementById("compgoals").innerHTML = goals;
		var newcareergoals = careergoals + goals;
		document.getElementById("careergoals").innerHTML = newcareergoals;

		//Even Strength Shots
		var evshots = evShotsPer60(maindata);
		document.getElementById("evshots").innerHTML = evshots.toPrecision(4);

		//Even Strength Time on Ice Display
		var evdisplaytoi = evDisplayTOI82(maindata);
		document.getElementById("evtoi").innerHTML = evdisplaytoi;

		//Eve Strength Time on Ice Calculation
		var evtoi = evTOI(maindata);
		
		//Even Strength Shooting Percentage
		var evpct = evShootPct(maindata);
		
		var evdisplaypct = evpct * 100;
		document.getElementById("evpct").innerHTML = evdisplaypct.toPrecision(4) + "%";

		//Power Play Shots
		var ppshots = ppShotsPer60(maindata);
		document.getElementById("ppshots").innerHTML = ppshots.toPrecision(4);

		//Power Play Time on Ice Display
		var ppdisplaytoi = ppDisplayTOI82(maindata);
		document.getElementById("pptoi").innerHTML = ppdisplaytoi;

		//Power Play Time on Ice Calculation
		var pptoi = ppTOI(maindata);
		
		//Power Play Shooting Percentage
		var pppct = ppShootPct(maindata);
		
		var ppdisplaypct = pppct * 100;
		document.getElementById("pppct").innerHTML = ppdisplaypct.toPrecision(4) + "%";

		var evgpg = evshots * evtoi * evpct;
		var ppgpg = ppshots * pptoi * pppct;

		var evgoals = seasonEVGoals(maindata);
		var ppgoals = seasonPPGoals(maindata);

		var evgoalsrem = evgpg * (gamestoplay - games);
		var ppgoalsrem = ppgpg * (gamestoplay - games);

		var projevgoals = evgoals + evgoalsrem;
		document.getElementById("evgoals").innerHTML = projevgoals.toPrecision(4);
		var projppgoals = ppgoals + ppgoalsrem;
		document.getElementById("ppgoals").innerHTML = projppgoals.toPrecision(4);
		var projtotalgoals = projevgoals + projppgoals;
		document.getElementById("totalgoals").innerHTML = projtotalgoals.toPrecision(4);
		var projcareergoals = careergoals + projtotalgoals;
		document.getElementById("careergoalsproj").innerHTML = projcareergoals.toPrecision(3);
		
		document.getElementById("evshotslabel").innerHTML = "20 Game Shots/60";
		document.getElementById("evtoilabel").innerHTML = "82 Game Time On Ice";
		document.getElementById("evpctlabel").innerHTML = "3 Year Shooting %";
		document.getElementById("ppshotslabel").innerHTML = "20 Game Shots/60";
		document.getElementById("pptoilabel").innerHTML = "82 Game Time On Ice";
		document.getElementById("pppctlabel").innerHTML = "3 Year Shooting %";

		neededOutputs({games:games,goals:goals,evgoals:evgoals,ppgoals:ppgoals,evgpg:evgpg,ppgpg:ppgpg});
	}
}

function checkboxFunction() {
	var checkBox = document.getElementById("weightedpure");
	var shots = document.getElementById("shotsbutton");
	var fenwick = document.getElementById("fenwickbutton");
	var corsi = document.getElementById("corsibutton");

	/*if (checkBox.checked == true){
		if (shots.checked == true){
			weightedShots(milestoneFunction);
		} else if (fenwick.checked == true){
			console.log("Weighted Fenwick");
		} else if (corsi.checked == true){
			console.log("Weighted Corsi");
		} else {
			weightedShots(milestoneFunction);
		}
	} else {
		if (shots.checked == true){
			pureShots(milestoneFunction);
		} else if (fenwick.checked == true){
			console.log("Pure Fenwick");
		} else if (corsi.checked == true){
			console.log("Pure Corsi");
		} else {
			pureShots(milestoneFunction);
		}
	}*/
	
	if (checkBox.checked == true){
		weightedShots(milestoneFunction);
	} else {
		pureShots(milestoneFunction);
	}
}

weightedShots(milestoneFunction);

function milestoneFunction(obj) {
	var originaldata = "https://natfan9.github.io/Ovechkin-Tracker/milestones.json";
	var request = new XMLHttpRequest();
	request.open('GET', originaldata);
	request.responseType = 'json';
	request.send();

	request.onload = function() {
		var maindata = request.response;
		
		var scheduledata = "https://natfan9.github.io/Ovechkin-Tracker/schedule2019.json";
		var schedule = new XMLHttpRequest();
		schedule.open('GET', scheduledata);
		schedule.responseType = 'json';
		schedule.send();
		
		schedule.onload = function() {
			var xhrschedule = schedule.response;
			//Round Number Milestones
			var goalsleft700 = 700 - (obj.goals + careergoals);
			document.getElementById("700goalsleft").innerHTML = goalsleft700;
			var gamesleft700 = Math.ceil(goalsleft700 / (obj.evgpg + obj.ppgpg));
			document.getElementById("700gamesleft").innerHTML = gamesleft700;
			if (gamesleft700 < gamestoplay - obj.games) {
				if (xhrschedule[obj.games + gamesleft700 - 1]["Venue"] === "home") {
					document.getElementById("700hitdate").innerHTML = xhrschedule[obj.games + gamesleft700 - 1]["Date"] + " vs " + xhrschedule[obj.games + gamesleft700 - 1]["Nickname"];
				} else {
					document.getElementById("700hitdate").innerHTML = xhrschedule[obj.games + gamesleft700 - 1]["Date"] + " @ " + xhrschedule[obj.games + gamesleft700 - 1]["Nickname"];
				}
			} else if (gamesleft700 > gamestoplay - obj.games && gamesleft700 < gamestoplay - obj.games + 40) {
				document.getElementById("700hitdate").innerHTML = "Likely next season";
			} else if (gamesleft700 > gamestoplay - obj.games + 40) {
				document.getElementById("700hitdate").innerHTML = "Unable to project";
			}

			var goalsleft725 = 725 - (obj.goals + careergoals);
			document.getElementById("725goalsleft").innerHTML = goalsleft725;
			var gamesleft725 = Math.ceil(goalsleft725 / (obj.evgpg + obj.ppgpg));
			document.getElementById("725gamesleft").innerHTML = gamesleft725;
			if (gamesleft725 < gamestoplay - obj.games) {
				if (xhrschedule[obj.games + gamesleft725 - 1]["Venue"] === "home") {
					document.getElementById("725hitdate").innerHTML = xhrschedule[obj.games + gamesleft725 - 1]["Date"] + " vs " + xhrschedule[obj.games + gamesleft725 - 1]["Nickname"];
				} else {
					document.getElementById("725hitdate").innerHTML = xhrschedule[obj.games + gamesleft725 - 1]["Date"] + " @ " + xhrschedule[obj.games + gamesleft725 - 1]["Nickname"];
				}
			} else if (gamesleft725 > gamestoplay - obj.games && gamesleft725 < gamestoplay - obj.games + 40) {
				document.getElementById("725hitdate").innerHTML = "Likely next season";
			} else if (gamesleft725 > gamestoplay - obj.games + 40) {
				document.getElementById("725hitdate").innerHTML = "Unable to project";
			}

			var goalsleft750 = 750 - (obj.goals + careergoals);
			document.getElementById("750goalsleft").innerHTML = goalsleft750;
			var gamesleft750 = Math.ceil(goalsleft750 / (obj.evgpg + obj.ppgpg));
			document.getElementById("750gamesleft").innerHTML = gamesleft750;
			if (gamesleft750 < gamestoplay - obj.games) {
				if (xhrschedule[obj.games + gamesleft750 - 1]["Venue"] === "home") {
					document.getElementById("750hitdate").innerHTML = xhrschedule[obj.games + gamesleft750 - 1]["Date"] + " vs " + xhrschedule[obj.games + gamesleft750 - 1]["Nickname"];
				} else {
					document.getElementById("750hitdate").innerHTML = xhrschedule[obj.games + gamesleft750 - 1]["Date"] + " @ " + xhrschedule[obj.games + gamesleft750 - 1]["Nickname"];
				}
			} else if (gamesleft750 > gamestoplay - obj.games && gamesleft750 < gamestoplay - obj.games + 40) {
				document.getElementById("750hitdate").innerHTML = "Likely next season";
			} else if (gamesleft750 > gamestoplay - obj.games + 40) {
				document.getElementById("750hitdate").innerHTML = "Unable to project";
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
				if (gamesleft < gamestoplay - obj.games) {
					if (xhrschedule[obj.games + gamesleft - 1]["Venue"] === "home") {
						document.getElementById(maindata[i]["Player"] + "hitdate").innerHTML = xhrschedule[obj.games + gamesleft - 1]["Date"] + " vs " + xhrschedule[obj.games + gamesleft - 1]["Nickname"];
					} else {
						document.getElementById(maindata[i]["Player"] + "hitdate").innerHTML = xhrschedule[obj.games + gamesleft - 1]["Date"] + " @ " + xhrschedule[obj.games + gamesleft - 1]["Nickname"];
					}
				} else if (gamesleft > gamestoplay - obj.games && gamesleft < gamestoplay - obj.games + 40) {
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
				if (ppgamesleft < gamestoplay - obj.games) {
					if (xhrschedule[obj.games + ppgamesleft - 1]["Venue"] === "home") {
						document.getElementById(maindata[p]["Player"] + "pphitdate").innerHTML = xhrschedule[obj.games + ppgamesleft - 1]["Date"] + " vs " + xhrschedule[obj.games + ppgamesleft - 1]["Nickname"];
					} else {
						document.getElementById(maindata[p]["Player"] + "pphitdate").innerHTML = xhrschedule[obj.games + ppgamesleft - 1]["Date"] + " @ " + xhrschedule[obj.games + ppgamesleft - 1]["Nickname"];
					}
				} else if (ppgamesleft > gamestoplay - obj.games && ppgamesleft < gamestoplay - obj.games + 40) {
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

function avgArray(jsonObj,path,period) {
	var bigarray = [];
	var sum = 0;
	for (const a in jsonObj) {
		bigarray.push(jsonObj[a][path]);
	}
	for (var b = 0; b < period; b++) {
    	sum += bigarray[bigarray.length-period+b];
	}
	var avg = sum/period;
	return avg;
}

function avgSeason(jsonObj,path) {
	var bigarray = [];
	for (const a in jsonObj) {
		if (jsonObj[a]["Game"].startsWith("G" + currentseason)) {
			bigarray.push(jsonObj[a][path]);
		}
	}

	var sum = 0;
	for (var b = 0; b < bigarray.length; b++) {
    	sum += bigarray[b];
	}

	var avg = sum/bigarray.length;
	return avg;
}

function evShotsPer60(jsonObj) {	
	var avgshots = avgArray(jsonObj,"EV Shots",20);
	var avgtime = avgArray(jsonObj,"EV TOI",20);

	var avgtimehour = avgtime/60/60;
	
	var avg = avgshots/avgtimehour;
	return avg;
}

function evFenwickPer60(jsonObj) {
	var avgshots = avgArray(jsonObj,"EV Fenwick",20);
	var avgtime = avgArray(jsonObj,"EV TOI",20);

	var avgtimehour = avgtime/60/60;
	
	var avg = avgshots/avgtimehour;
	return avg;
}

function evCorsiPer60(jsonObj) {
	var avgshots = avgArray(jsonObj,"EV Corsi",20);
	var avgtime = avgArray(jsonObj,"EV TOI",20);

	var avgtimehour = avgtime/60/60;
	
	var avg = avgshots/avgtimehour;
	return avg;
}

function evDisplayTOI82(jsonObj) {
	var avgtime = avgArray(jsonObj,"EV TOI",82);
	
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
	var avgtime = avgArray(jsonObj,"EV TOI",82);
	
	avgtime = avgtime / 60 / 60;
	
	return avgtime;
}

function evShootPct(jsonObj) {
	var avgshots = avgArray(jsonObj,"EV Shots",246);
	var avggoals = avgArray(jsonObj,"EV Goals",246);
		
	var avg = avggoals/avgshots;
	return avg;
}

function evFenwickPct(jsonObj) {
	var avgshots = avgArray(jsonObj,"EV Fenwick",246);
	var avggoals = avgArray(jsonObj,"EV Goals",246);

	var avg = avggoals/avgshots;
	return avg;
}

function evCorsiPct(jsonObj) {
	var avgshots = avgArray(jsonObj,"EV Corsi",246);
	var avggoals = avgArray(jsonObj,"EV Goals",246);
		
	var avg = avggoals/avgshots;
	return avg;
}

function ppShotsPer60(jsonObj) {
	var avgshots = avgArray(jsonObj,"PP Shots",20);
	var avgtime = avgArray(jsonObj,"PP TOI",20);

	var avgtimehour = avgtime/60/60;
	
	var avg = avgshots/avgtimehour;
	return avg;
}

function ppFenwickPer60(jsonObj) {
	var avgshots = avgArray(jsonObj,"PP Fenwick",20);
	var avgtime = avgArray(jsonObj,"PP TOI",20);

	var avgtimehour = avgtime/60/60;
	
	var avg = avgshots/avgtimehour;
	return avg;
}

function ppCorsiPer60(jsonObj) {
	var avgshots = avgArray(jsonObj,"PP Corsi",20);
	var avgtime = avgArray(jsonObj,"PP TOI",20);

	var avgtimehour = avgtime/60/60;
	
	var avg = avgshots/avgtimehour;
	return avg;
}

function ppDisplayTOI82(jsonObj) {
	var avgtime = avgArray(jsonObj,"PP TOI",82);
	
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
	var avgtime = avgArray(jsonObj,"PP TOI",82);
	
	avgtime = avgtime / 60 / 60;
	
	return avgtime;
}

function ppShootPct(jsonObj) {
	var avgshots = avgArray(jsonObj,"PP Shots",246);
	var avggoals = avgArray(jsonObj,"PP Goals",246);
		
	var avg = avggoals/avgshots;
	return avg;
}

function ppFenwickPct(jsonObj) {
	var avgshots = avgArray(jsonObj,"PP Fenwick",246);
	var avggoals = avgArray(jsonObj,"PP Goals",246);
		
	var avg = avggoals/avgshots;
	return avg;
}

function ppCorsiPct(jsonObj) {
	var avgshots = avgArray(jsonObj,"PP Corsi",246);
	var avggoals = avgArray(jsonObj,"PP Goals",246);
		
	var avg = avggoals/avgshots;
	return avg;
}

function seasonEVShotsPer60(jsonObj) {
	var avgshots = avgSeason(jsonObj,"EV Shots");
	var avgtime = avgSeason(jsonObj,"EV TOI");
	
	var avgtimehour = avgtime/60/60;
	
	var avg = avgshots/avgtimehour;
	return avg;
}

function seasonEVFenwickPer60(jsonObj) {
	var avgshots = avgSeason(jsonObj,"EV Fenwick");
	var avgtime = avgSeason(jsonObj,"EV TOI");
	
	var avgtimehour = avgtime/60/60;
	
	var avg = avgshots/avgtimehour;
	return avg;
}

function seasonEVCorsiPer60(jsonObj) {
	var avgshots = avgSeason(jsonObj,"EV Corsi");
	var avgtime = avgSeason(jsonObj,"EV TOI");
	
	var avgtimehour = avgtime/60/60;
	
	var avg = avgshots/avgtimehour;
	return avg;
}
/**
function seasonEVDisplayTOI(jsonObj) {
	var avgtime = avgSeason(jsonObj,"EV TOI");
	
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
**/
function seasonEVTOI(jsonObj) {
	var avgtime = avgSeason(jsonObj,"EV TOI");
	
	avgtime = avgtime / 60 / 60;
	
	return avgtime;
}

function seasonEVShootPct(jsonObj) {
	var avggoals = avgSeason(jsonObj,"EV Goals");
	var avgshots = avgSeason(jsonObj,"EV Shots");
		
	var avg = avggoals/avgshots;
	return avg;
}

function seasonEVFenwickPct(jsonObj) {
	var avggoals = avgSeason(jsonObj,"EV Goals");
	var avgshots = avgSeason(jsonObj,"EV Fenwick");
		
	var avg = avggoals/avgshots;
	return avg;
}

function seasonEVCorsiPct(jsonObj) {
	var avggoals = avgSeason(jsonObj,"EV Goals");
	var avgshots = avgSeason(jsonObj,"EV Corsi");
		
	var avg = avggoals/avgshots;
	return avg;
}

function seasonPPShotsPer60(jsonObj) {
	var avgshots = avgSeason(jsonObj,"PP Shots");
	var avgtime = avgSeason(jsonObj,"PP TOI");
	
	var avgtimehour = avgtime/60/60;
	
	var avg = avgshots/avgtimehour;
	return avg;
}

function seasonPPFenwickPer60(jsonObj) {
	var avgshots = avgSeason(jsonObj,"PP Fenwick");
	var avgtime = avgSeason(jsonObj,"PP TOI");
	
	var avgtimehour = avgtime/60/60;
	
	var avg = avgshots/avgtimehour;
	return avg;
}

function seasonPPCorsiPer60(jsonObj) {
	var avgshots = avgSeason(jsonObj,"PP Corsi");
	var avgtime = avgSeason(jsonObj,"PP TOI");
	
	var avgtimehour = avgtime/60/60;
	
	var avg = avgshots/avgtimehour;
	return avg;
}
/**
function seasonPPDisplayTOI(jsonObj) {
	var avgtime = avgSeason(jsonObj,"PP TOI");
	
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
**/
function seasonPPTOI(jsonObj) {
	var avgtime = avgSeason(jsonObj,"PP TOI");
	
	avgtime = avgtime / 60 / 60;
	
	return avgtime;
}

function seasonPPShootPct(jsonObj) {
	var avggoals = avgSeason(jsonObj,"PP Goals");
	var avgshots = avgSeason(jsonObj,"PP Shots");
		
	var avg = avggoals/avgshots;
	return avg;
}

function seasonPPFenwickPct(jsonObj) {
	var avggoals = avgSeason(jsonObj,"PP Goals");
	var avgshots = avgSeason(jsonObj,"PP Fenwick");
		
	var avg = avggoals/avgshots;
	return avg;
}

function seasonPPCorsiPct(jsonObj) {
	var avggoals = avgSeason(jsonObj,"PP Goals");
	var avgshots = avgSeason(jsonObj,"PP Corsi");
		
	var avg = avggoals/avgshots;
	return avg;
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

function seasonGoals(jsonObj) {
	var seasongoals = [];
	for (const season in jsonObj) {
		if (jsonObj[season]["Game"].startsWith("G" + currentseason)) {
			seasongoals.push(jsonObj[season]["Goals"]);
		}
	}
	
	var goalssum = 0;
	for (var a = 0; a < seasongoals.length; a++) {
    	goalssum += seasongoals[a];
	}
		
	return goalssum;
}

function seasonEVGoals(jsonObj) {
	var seasongoals = [];
	for (const season in jsonObj) {
		if (jsonObj[season]["Game"].startsWith("G" + currentseason)) {
			seasongoals.push(jsonObj[season]["EV Goals"]);
		}
	}
	
	var goalssum = 0;
	for (var a = 0; a < seasongoals.length; a++) {
    	goalssum += seasongoals[a];
	}
		
	return goalssum;
}

function seasonPPGoals(jsonObj) {
	var seasongoals = [];
	for (const season in jsonObj) {
		if (jsonObj[season]["Game"].startsWith("G" + currentseason)) {
			seasongoals.push(jsonObj[season]["PP Goals"]);
		}
	}
	
	var goalssum = 0;
	for (var a = 0; a < seasongoals.length; a++) {
    	goalssum += seasongoals[a];
	}
		
	return goalssum;
}