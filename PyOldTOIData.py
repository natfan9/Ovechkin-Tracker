from datetime import date
from datetime import datetime
from datetime import timedelta
import urllib.request
import json
import pytz
import hockey_scraper

today = date.today()
now = datetime.now()
est = pytz.timezone("America/New_York")
pst = pytz.timezone("America/Los_Angeles")
loc_dt = est.localize(now)
pacific = loc_dt.astimezone(pst)
stringnow = pacific.strftime("%Y-%m-%d")
formattednow = datetime.strptime(stringnow, "%Y-%m-%d")
ltrVenues = [
    "Honda Center",
    "Gila River Arena",
    "Jobing.com Arena",
    "TD Garden",
    "KeyBank Center",
    "First Niagara Center",
    "Nationwide Arena",
    "Rogers Place",
    "Bridgestone Arena",
    "Prudential Center",
    "NYCB Live/Nassau Coliseum",
    "Nassau Veterans Memorial Coliseum",
    "Barclays Center",
    "UBS Arena",
    "Canadian Tire Centre",
    "PPG Paints Arena",
    "CONSOL Energy Center",
    "SAP Center at San Jose",
    "Enterprise Center",
    "Scottrade Center",
    "Amalie Arena",
    "Tampa Bay Times Forum",
    "Climate Pledge Arena"]
rtlVenues = [
    "Scotiabank Saddledome",
    "PNC Arena",
    "United Center",
    "Pepsi Center",
    "Ball Arena",
    "American Airlines Center",
    "Little Caesars Arena",
    "Joe Louis Arena",
    "Rexall Place",
    "BB&T Center",
    "FLA Live Arena",
    "STAPLES Center", "Staples Center",
    "Crypto.com Arena",
    "Xcel Energy Center",
    "Centre Bell",
    "Nassau Coliseum",
    "Madison Square Garden",
    "Wells Fargo Center",
    "Scotiabank Arena",
    "Air Canada Centre",
    "Rogers Arena",
    "T-Mobile Arena",
    "Bell MTS Place",
    "MTS Centre",
    "Canada Life Centre"]
homeLtRVenues = ["Navy-Marine Corps Memorial Stadium"]
homeRtLVenues = ["Capital One Arena","Verizon Center","Nationals Park"]
homeVenues = ["Navy-Marine Corps Memorial Stadium","Capital One Arena","Verizon Center","Nationals Park"]

def getGame(theJSON, i):
    gamefeed = ""
    gamePk = ""
    gameslice = slice(4,6)
    gamedate = datetime.strptime(theJSON["dates"][i]["date"], "%Y-%m-%d")
    if gamedate <= formattednow:
        gamePk = str(theJSON["dates"][i]["games"][0]["gamePk"])
        gamefeed = "https://statsapi.web.nhl.com" + theJSON["dates"][i]["games"][0]["link"]
        return [gamefeed, int(gamePk)]
    else:
        pass

def getOldGame(theJSON, i):
    gamePk = str(theJSON["dates"][i]["games"][0]["gamePk"])
    gamefeed = "https://statsapi.web.nhl.com" + theJSON["dates"][i]["games"][0]["link"]
    return [gamefeed, int(gamePk)]

def parseGame(data, gameID):
    theJSON = json.loads(data)
    minutesslice = slice(0,2)
    secondsslice = slice(3,5)
    # print(theJSON)
    if theJSON["gameData"]["status"]["detailedState"] == "Final": # Check to make sure the game is finished
        # Next Steps:
        # check to see if ovechkin played
        if "ID8471214" in theJSON["gameData"]["players"]:
            print("Ovechkin on roster")
            if (theJSON["gameData"]["venue"]["name"] in homeVenues):
                if not theJSON["liveData"]["boxscore"]["teams"]["home"]["players"]["ID8471214"]["stats"]:
                    print("Ovechkin rostered but did not play")
                else:
                    plays = dataScrape(gameID, "home", theJSON)
                    return plays
            else:
                if not theJSON["liveData"]["boxscore"]["teams"]["away"]["players"]["ID8471214"]["stats"]:
                    print("Ovechkin rostered but did not play")
                else:
                    plays = dataScrape(gameID, "away", theJSON)
                    return plays
        else:
            print("Ovechkin not on roster")
    else:
        print("Game not finished!")

def dataScrape(gameID, venue, gamefeed):
    if venue == "home":
        print("Ovechkin played at home")
    elif venue == "away":
        print("Ovechkin played on the road")
    else:
        print("venue error")

    capsgoalies = []
    oppsgoalies = []

    # for i in gamefeed["gameData"]["players"].values():
    #     if i["primaryPosition"]["code"] == "G":
    #         if i["currentTeam"]["name"] == "Washington Capitals":
    #             capsgoalies.append(i["fullName"].upper())
    #         else:
    #             oppsgoalies.append(i["fullName"].upper())

    for k,v in gamefeed["gameData"]["players"].items():
        if venue == "home":
            for i in gamefeed["liveData"]["boxscore"]["teams"][venue]["goalies"]:
                if k == "ID" + str(i):
                    capsgoalies.append(v["fullName"].upper())
            for j in gamefeed["liveData"]["boxscore"]["teams"]["away"]["goalies"]:
                if k == "ID" + str(j):
                    oppsgoalies.append(v["fullName"].upper())
        elif venue == "away":
            for i in gamefeed["liveData"]["boxscore"]["teams"][venue]["goalies"]:
                if k == "ID" + str(i):
                    capsgoalies.append(v["fullName"].upper())
            for j in gamefeed["liveData"]["boxscore"]["teams"]["home"]["goalies"]:
                if k == "ID" + str(j):
                    oppsgoalies.append(v["fullName"].upper())

    print(capsgoalies,oppsgoalies)

    scrape = hockey_scraper.scrape_games([gameID], True, data_format="Pandas")
    pandashifts = scrape["shifts"]
    pandaplays = scrape["pbp"]
    # print(shifts)

    pandashotlist = []
    eventlist = ["GOAL","SHOT","MISS"]
    shotdata = pandaplays.loc[pandaplays["Event"].isin(eventlist)]
    roshotdata = shotdata.loc[shotdata["Period"] <= 4]
    ovishotdata = roshotdata.loc[roshotdata["p1_ID"] == 8471214]
    for i, j in ovishotdata.iterrows():
        eventtime = parsePandaEventTime(j["Period"],j["Seconds_Elapsed"])
        coordinates = convertCoord(gamefeed,venue,j["Period"],j["xC"],j["yC"])
        pandashotlist.append({"type":j["Event"],"time":eventtime,"coordinates":coordinates})
        
        # print("Event", i, j["Event"], eventtime, "at", coordinates)

    # jsonshotlist = []
    # for i, j in enumerate(gamefeed["liveData"]["plays"]["allPlays"]):
    #     eventtime = parseJSONEventTime(j["about"]["period"],j["about"]["periodTime"])
    #     if "players" in j:
    #         if 1 <= j["about"]["period"] <= 4:
    #             if j["result"]["eventTypeId"] == "GOAL":
    #                 if j["players"][0]["player"]["id"] == 8471214:
    #                     coordinates = convertCoord(gamefeed, venue, j["about"]["period"], float(j["coordinates"]["x"]), float(j["coordinates"]["y"]))
    #                     jsonshotlist.append({"type":j["result"]["eventTypeId"],"time":eventtime,"coordinates":coordinates})
    #                     # print("Event", i, j["players"][0]["player"]["fullName"], j["result"]["event"], eventtime, "at", coordinates)
    #             elif j["result"]["eventTypeId"] == "SHOT":
    #                 if j["players"][0]["player"]["id"] == 8471214:
    #                     coordinates = convertCoord(gamefeed, venue, j["about"]["period"], float(j["coordinates"]["x"]), float(j["coordinates"]["y"]))
    #                     jsonshotlist.append({"type":j["result"]["eventTypeId"],"time":eventtime,"coordinates":coordinates})
    #                     # print("Event", i, j["players"][0]["player"]["fullName"], j["result"]["event"], eventtime, "at", coordinates)
    #             elif j["result"]["eventTypeId"] == "MISSED_SHOT":
    #                 if j["players"][0]["player"]["id"] == 8471214:
    #                     coordinates = convertCoord(gamefeed, venue, j["about"]["period"], float(j["coordinates"]["x"]), float(j["coordinates"]["y"]))
    #                     jsonshotlist.append({"type":j["result"]["eventTypeId"],"time":eventtime,"coordinates":coordinates})
    #                     # print("Event", i, j["players"][0]["player"]["fullName"], j["result"]["event"], eventtime, "at", coordinates)
    #             elif j["result"]["eventTypeId"] == "BLOCKED_SHOT":
    #                 if j["players"][1]["player"]["id"] == 8471214:
    #                     coordinates = convertCoord(gamefeed, venue, j["about"]["period"], float(j["coordinates"]["x"]), float(j["coordinates"]["y"]))
    #                     jsonshotlist.append({"type":j["result"]["eventTypeId"],"time":eventtime,"coordinates":coordinates})
    #                     # print("Event", i, j["players"][1]["player"]["fullName"], j["result"]["event"], eventtime, "at", coordinates)
    #             else:
    #                 pass
    #         else:
    #             pass
    #     else:
    #         pass
    
    shifts = []
    ovishifts = []

    for i, j in pandashifts.iterrows():
        shift = parseShift(j["Period"],j["Start"],j["End"])
        data = {}
        data["player"] = j["Player"]
        data["team"] = j["Team"]
        data["start"] = shift[0]
        data["end"] = shift[1]
        shifts.append(data)

    for i in shifts:
        if i["player"] == "ALEX OVECHKIN":
            ovishifts.append(i)

    oppsOnIceWithOvi = []
    capsOnIceWithOvi = []

    for i,a in enumerate(ovishifts):
        for b in shifts:
            if b in capsOnIceWithOvi:
                continue
            elif b in oppsOnIceWithOvi:
                continue
            else:
                if b["start"] < a["start"] and b["end"] > a["end"]:
                    if b["team"] == "WSH":
                        if b["start"] <= a["start"]:
                            start = a["start"]
                        else:
                            start = b["start"]

                        if b["end"] >= a["end"]:
                            end = a["end"]
                        else:
                            end = b["end"]
                        capsOnIceWithOvi.append({"player":b["player"],"team":b["team"],"start":start,"end":end})
                    else:
                        if b["start"] <= a["start"]:
                            start = a["start"]
                        else:
                            start = b["start"]

                        if b["end"] >= a["end"]:
                            end = a["end"]
                        else:
                            end = b["end"]
                        oppsOnIceWithOvi.append({"player":b["player"],"team":b["team"],"start":start,"end":end})
                    continue
                if b["start"] >= a["start"] and b["start"] < a["end"]:
                    if b["team"] == "WSH":
                        if b["start"] <= a["start"]:
                            start = a["start"]
                        else:
                            start = b["start"]

                        if b["end"] >= a["end"]:
                            end = a["end"]
                        else:
                            end = b["end"]
                        capsOnIceWithOvi.append({"player":b["player"],"team":b["team"],"start":start,"end":end})
                    else:
                        if b["start"] <= a["start"]:
                            start = a["start"]
                        else:
                            start = b["start"]

                        if b["end"] >= a["end"]:
                            end = a["end"]
                        else:
                            end = b["end"]
                        oppsOnIceWithOvi.append({"player":b["player"],"team":b["team"],"start":start,"end":end})
                    continue
                if b["end"] <= a["end"] and b["end"] > a["start"]:
                    if b["team"] == "WSH":
                        if b["start"] <= a["start"]:
                            start = a["start"]
                        else:
                            start = b["start"]

                        if b["end"] >= a["end"]:
                            end = a["end"]
                        else:
                            end = b["end"]
                        capsOnIceWithOvi.append({"player":b["player"],"team":b["team"],"start":start,"end":end})
                    else:
                        if b["start"] <= a["start"]:
                            start = a["start"]
                        else:
                            start = b["start"]

                        if b["end"] >= a["end"]:
                            end = a["end"]
                        else:
                            end = b["end"]
                        oppsOnIceWithOvi.append({"player":b["player"],"team":b["team"],"start":start,"end":end})
                    continue

    strengthseconds = []
    pandastrengthshotlist = []

    for c in range(0,3900):
        # print(c,"seconds")
        totCapsOnIce = 0
        totOppsOnIce = 0
        for d in capsOnIceWithOvi:
            if d["player"] in capsgoalies:
                pass
            else:
                if d["start"] <= c < d["end"]:
                    totCapsOnIce += 1
                    # print(d["player"])
        for e in oppsOnIceWithOvi:
            if e["player"] in oppsgoalies:
                pass
            else:
                if e["start"] <= c < e["end"]:
                    totOppsOnIce += 1
                    # print(e["player"])
        if totCapsOnIce > 6:
            print(c,"seconds",totCapsOnIce,"Caps On Ice")
            totCapsOnIce = 5
        if totOppsOnIce > 6:
            print(c,"seconds",totOppsOnIce,"Opponents On Ice")
            totOppsOnIce = 5
        strengthseconds.append(str(totCapsOnIce) + "v" + str(totOppsOnIce))
        # print(str(totCapsOnIce) + "v" + str(totOppsOnIce))
    
    for f in pandashotlist:
        strength = strengthseconds[f["time"]]
        if strength == "0v0":
            strength = strengthseconds[f["time"]-1]
        event = {"type":f["type"],"time":f["time"],"coordinates":f["coordinates"],"strength":strength}
        pandastrengthshotlist.append(event)

    strengths = {}
    for item in strengthseconds:
        if item in strengths.keys():
            strengths[item] += 1
        else:
            strengths[item] = 1
    return {"time":strengths,"events":pandastrengthshotlist}

def parseShift(period, start, end):
    try:
        int(period)
    except:
        pass
    else:
        p = int(period) - 1
        start = int(start) + (p * 1200)
        end = int(end) + (p * 1200)
    return [start,end]

def parsePandaEventTime(period, time):
    period = int(period) - 1
    time = int(time) + (period * 1200)
    return time

def parseJSONEventTime(period, time):
    period = int(period) - 1
    stringtime = time
    timesplit = stringtime.split(":")
    minutes = int(timesplit[0])
    seconds = int(timesplit[1])
    inttime = (minutes * 60) + seconds
    time = inttime + (period * 1200)
    return time

def convertCoord(gamefeed, venue, period, x, y):
    if venue == "home":
        if gamefeed["gameData"]["venue"]["name"] in homeLtRVenues:
            if period == 1 or period == 3:
                # print("Caps shooting left to right at home")
                newX = -x + 89
                newY = y
                return [newX, newY]
            elif period == 2 or period == 4:
                # print("Caps shooting right to left at home")
                newX = x + 89
                newY = -y
                return [newX, newY]
            else:
                pass
        elif gamefeed["gameData"]["venue"]["name"] in homeRtLVenues:
            if period == 1 or period == 3:
                # print("Caps shooting right to left at home")
                newX = x + 89
                newY = -y
                return [newX, newY]
            elif period == 2 or period == 4:
                # print("Caps shooting left to right at home")
                newX = -x + 89
                newY = y
                return [newX, newY]
            else:
                pass
        else:
            print("venue error")
    elif venue == "away":
        if gamefeed["gameData"]["venue"]["name"] in ltrVenues:
            if period == 1 or period == 3:
                # print("Caps shooting right to left on the road")
                newX = x + 89
                newY = -y
                return [newX, newY]
            elif period == 2 or period == 4:
                # print("Caps shooting left to right on the road")
                newX = -x + 89
                newY = y
                return [newX, newY]
            else:
                pass
        elif gamefeed["gameData"]["venue"]["name"] in rtlVenues:
            if period == 1 or period == 3:
                # print("Caps shooting left to right on the road")
                newX = -x + 89
                newY = y
                return [newX, newY]
            elif period == 2 or period == 4:
                # print("Caps shooting right to left on the road")
                newX = x + 89
                newY = -y
                return [newX, newY]
            else:
                pass
        else:
            print("venue error")
    else:
        print("venue error")

def playSort(playinfo,gameno):
    print(playinfo["time"])
    avgx = 0
    totalx = 0
    for a in playinfo["events"]:
        totalx = totalx + a["coordinates"][0]
    if totalx > 0:
        avgx = totalx / len(playinfo["events"])
    if avgx > 100:
        print("Inverting coordinates...")
        for x in playinfo["events"]:
            x["coordinates"][0] = -x["coordinates"][0] + 178
            x["coordinates"][1] = -x["coordinates"][1]
        print("Inversion complete!")
    shotcoords = {"6v5":[],"6v4":[],"6v3":[],"5v6":[],"5v5":[],"5v4":[],"5v3":[],"4v4":[],"4v3":[],"3v3":[]}
    shotgoals = {"6v5":[],"6v4":[],"6v3":[],"5v6":[],"5v5":[],"5v4":[],"5v3":[],"4v4":[],"4v3":[],"3v3":[]}
    fenwickcoords = {"6v5":[],"6v4":[],"6v3":[],"5v6":[],"5v5":[],"5v4":[],"5v3":[],"4v4":[],"4v3":[],"3v3":[]}
    fenwickgoals = {"6v5":[],"6v4":[],"6v3":[],"5v6":[],"5v5":[],"5v4":[],"5v3":[],"4v4":[],"4v3":[],"3v3":[]}
    times = {"6v5":0,"6v4":0,"6v3":0,"5v6":0,"5v5":0,"5v4":0,"5v3":0,"4v4":0,"4v3":0,"3v3":0}
    euf = 0
    for b in playinfo["events"]:
        if b["strength"] in shotcoords:
            if b["type"] == "GOAL":
                shotcoords[b["strength"]].append(b["coordinates"])
                shotgoals[b["strength"]].append(1)
                fenwickcoords[b["strength"]].append(b["coordinates"])
                fenwickgoals[b["strength"]].append(1)
            elif b["type"] == "SHOT":
                shotcoords[b["strength"]].append(b["coordinates"])
                shotgoals[b["strength"]].append(0)
                fenwickcoords[b["strength"]].append(b["coordinates"])
                fenwickgoals[b["strength"]].append(0)
            elif b["type"] == "MISS":
                fenwickcoords[b["strength"]].append(b["coordinates"])
                fenwickgoals[b["strength"]].append(0)
        else:
            euf += 1
    print(euf,"events unaccounted for")
    for c,d in playinfo["time"].items():
        if c in times:
            times[c] = d
    evstrengths = ["6v5","5v6","5v5","4v4","3v3"]
    ppstrengths = ["6v4","6v3","5v4","5v3","4v3"]
    # Construct JSON
    gamedata = {}
    gamedata["Game"] = "G" + str(gameno)
    gamedata["Goals"] = {}
    gamedata["Goals"]["Shots"] = shotgoals["6v5"] + shotgoals["6v4"] + shotgoals["6v3"] + shotgoals["5v6"] + shotgoals["5v5"] + shotgoals["5v4"] + shotgoals["5v3"] + shotgoals["4v4"] + shotgoals["4v3"] + shotgoals["3v3"]
    gamedata["Goals"]["Fenwick"] = fenwickgoals["6v5"] + fenwickgoals["6v4"] + fenwickgoals["6v3"] + fenwickgoals["5v6"] + fenwickgoals["5v5"] + fenwickgoals["5v4"] + fenwickgoals["5v3"] + fenwickgoals["4v4"] + fenwickgoals["4v3"] + fenwickgoals["3v3"]
    gamedata["TOI"] = times["6v5"] + times["6v4"] + times["6v3"] + times["5v6"] + times["5v5"] + times["5v4"] + times["5v3"] + times["4v4"] + times["4v3"] + times["3v3"]
    gamedata["Shots"] = shotcoords["6v5"] + shotcoords["6v4"] + shotcoords["6v3"] + shotcoords["5v6"] + shotcoords["5v5"] + shotcoords["5v4"] + shotcoords["5v3"] + shotcoords["4v4"] + shotcoords["4v3"] + shotcoords["3v3"]
    gamedata["Fenwick"] = fenwickcoords["6v5"] + fenwickcoords["6v4"] + fenwickcoords["6v3"] + fenwickcoords["5v6"] + fenwickcoords["5v5"] + fenwickcoords["5v4"] + fenwickcoords["5v3"] + fenwickcoords["4v4"] + fenwickcoords["4v3"] + fenwickcoords["3v3"]
    gamedata["Even Strength"] = {}
    gamedata["Even Strength"]["Goals"] = {}
    gamedata["Even Strength"]["Goals"]["Shots"] = shotgoals["6v5"] + shotgoals["5v6"] + shotgoals["5v5"] + shotgoals["4v4"] + shotgoals["3v3"]
    gamedata["Even Strength"]["Goals"]["Fenwick"] = fenwickgoals["6v5"] + fenwickgoals["5v6"] + fenwickgoals["5v5"] + fenwickgoals["4v4"] + fenwickgoals["3v3"]
    gamedata["Even Strength"]["TOI"] = times["6v5"] + times["5v6"] + times["5v5"] + times["4v4"] + times["3v3"]
    gamedata["Even Strength"]["Shots"] = shotcoords["6v5"] + shotcoords["5v6"] + shotcoords["5v5"] + shotcoords["4v4"] + shotcoords["3v3"]
    gamedata["Even Strength"]["Fenwick"] = fenwickcoords["6v5"] + fenwickcoords["5v6"] + fenwickcoords["5v5"] + fenwickcoords["4v4"] + fenwickcoords["3v3"]
    for strength in evstrengths:
        gamedata["Even Strength"][strength] = {}
        gamedata["Even Strength"][strength]["Goals"] = {}
        gamedata["Even Strength"][strength]["Goals"]["Shots"] = shotgoals[strength]
        gamedata["Even Strength"][strength]["Goals"]["Fenwick"] = fenwickgoals[strength]
        gamedata["Even Strength"][strength]["TOI"] = times[strength]
        gamedata["Even Strength"][strength]["Shots"] = shotcoords[strength]
        gamedata["Even Strength"][strength]["Fenwick"] = fenwickcoords[strength]
    gamedata["Power Play"] = {}
    gamedata["Power Play"]["Goals"] = {}
    gamedata["Power Play"]["Goals"]["Shots"] = shotgoals["6v4"] + shotgoals["6v3"] + shotgoals["5v4"] + shotgoals["5v3"] + shotgoals["4v3"]
    gamedata["Power Play"]["Goals"]["Fenwick"] = fenwickgoals["6v4"] + fenwickgoals["6v3"] + fenwickgoals["5v4"] + fenwickgoals["5v3"] + fenwickgoals["4v3"]
    gamedata["Power Play"]["TOI"] = times["6v4"] + times["6v3"] + times["5v4"] + times["5v3"] + times["4v3"]
    gamedata["Power Play"]["Shots"] = shotcoords["6v4"] + shotcoords["6v3"] + shotcoords["5v4"] + shotcoords["5v3"] + shotcoords["4v3"]
    gamedata["Power Play"]["Fenwick"] = fenwickcoords["6v4"] + fenwickcoords["6v3"] + fenwickcoords["5v4"] + fenwickcoords["5v3"] + fenwickcoords["4v3"]
    for strength in ppstrengths:
        gamedata["Power Play"][strength] = {}
        gamedata["Power Play"][strength]["Goals"] = {}
        gamedata["Power Play"][strength]["Goals"]["Shots"] = shotgoals[strength]
        gamedata["Power Play"][strength]["Goals"]["Fenwick"] = fenwickgoals[strength]
        gamedata["Power Play"][strength]["TOI"] = times[strength]
        gamedata["Power Play"][strength]["Shots"] = shotcoords[strength]
        gamedata["Power Play"][strength]["Fenwick"] = fenwickcoords[strength]
    
    return gamedata

def main():
    if (today.month >= 8):
        currentseason = today.year
    else:
        currentseason = today.year - 1
    
    season = 0
    
    with open('advtoidata.json') as json_file:
        finalJSON = json.load(json_file)
    
    print(finalJSON)

    # finalJSON = []

    for i in range(-1,1): # -6,1 to get 6 previous seasons plus current season
        season = currentseason + i
        scheduleUrl = str("https://statsapi.web.nhl.com/api/v1/schedule?teamId=15&season=" + str(season) + str(season + 1) + "&gameType=R")
        print(scheduleUrl)
        webUrl = urllib.request.urlopen(scheduleUrl)
        print ("result code: " + str(webUrl.getcode()))
        if season < currentseason:
            if (webUrl.getcode() == 200):
                data = webUrl.read()
                oldgameJSON = json.loads(data)
                for i,d in enumerate(oldgameJSON["dates"]):
                    gameJSON = getOldGame(oldgameJSON, i)
                    # print(gameJSON)
                    if gameJSON != None:
                        print(gameJSON)
                        gameUrl = urllib.request.urlopen(gameJSON[0])
                        print ("result code: " + str(gameUrl.getcode()))
                        if (gameUrl.getcode() == 200):
                            gamedata = gameUrl.read()
                            shotinfo = parseGame(gamedata, gameJSON[1])
                            if shotinfo != None:
                                exportdict = playSort(shotinfo,gameJSON[1])
                                print(exportdict)
                                finalJSON.append(exportdict)
                        else:
                            print("Received error, cannot parse results")
            else:
                print("Received error, cannot parse results")
        else:
            if (webUrl.getcode() == 200):
                data = webUrl.read()
                newgameJSON = json.loads(data)
                for i,d in enumerate(newgameJSON["dates"]):
                    gameJSON = getGame(newgameJSON, i)
                    # print(gameJSON)
                    if gameJSON != None:
                        print(gameJSON)
                        gameUrl = urllib.request.urlopen(gameJSON[0])
                        print ("result code: " + str(gameUrl.getcode()))
                        if (gameUrl.getcode() == 200):
                            gamedata = gameUrl.read()
                            shotinfo = parseGame(gamedata, gameJSON[1])
                            if shotinfo != None:
                                exportdict = playSort(shotinfo,gameJSON[1])
                                print(exportdict)
                                finalJSON.append(exportdict)
                        else:
                            print("Received error, cannot parse results")
            else:
                print("Received error, cannot parse results")
    with open('advtoidata.json', 'w+') as outfile:
        json.dump(finalJSON, outfile)

if __name__ == "__main__":
    main()