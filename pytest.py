from datetime import date
from datetime import datetime
from datetime import timedelta
import urllib.request
import json
# import pytz

today = date.today()
now = datetime.now()
# timezone = pytz.timezone("America/New York")
# d_aware = timezone.localize(now)
pacificnow = now - timedelta(days=7,hours=3)
formattednow = pacificnow.strftime("%Y-%m-%d")
ltrVenues = [
    "Gila River Arena",
    "Jobing.com Arena",
    "TD Garden",
    "Keybank Center",
    "First Niagara Center",
    "PNC Arena",
    "Nationwide Arena",
    "Joe Louis Arena",
    "Rogers Place",
    "Bridgestone Arena",
    "Prudential Center",
    "NYCB Live/Nassau Coliseum",
    "Barclays Center",
    "PPG Paints Arena",
    "CONSOL Energy Center",
    "SAP Center at San Jose",
    "Enterprise Center",
    "Scottrade Center",
    "Amalie Arena",
    "Tampa Bay Times Forum",
    "T-Mobile Arena"]
rtlVenues = [
    "Honda Center",
    "Scotiabank Saddledome",
    "United Center",
    "Pepsi Center",
    "American Airlines Center",
    "Little Caesars Arena",
    "Rexall Place",
    "BB&T Center",
    "STAPLES Center",
    "Xcel Energy Center",
    "Centre Bell",
    "Nassau Coliseum",
    "Madison Square Garden",
    "Canadian Tire Centre",
    "Wells Fargo Center",
    "Scotiabank Arena",
    "Air Canada Centre",
    "Rogers Arena",
    "Bell MTS Place",
    "MTS Centre"]
homeLtRVenues = ["Navy-Marine Corps Memorial Stadium"]
homeRtLVenues = ["Capital One Arena","Verizon Center","Nationals Park"]
homeVenues = ["Navy-Marine Corps Memorial Stadium","Capital One Arena","Verizon Center","Nationals Park"]

def getGame(data):
    gamefeed = ""
    gamePk = ""
    gameslice = slice(4,6)
    pkslice = slice(4,10)
    gameId = ""
    theJSON = json.loads(data)
    for i,d in enumerate(theJSON["dates"]):
        if theJSON["dates"][i]["date"] == formattednow:
            gamePk = str(theJSON["dates"][i]["games"][0]["gamePk"])
            if gamePk[gameslice] == "02":
                gamefeed = "https://statsapi.web.nhl.com" + theJSON["dates"][i]["games"][0]["link"]
                gameId = str(gamePk)[pkslice]
    if gamefeed != "":
        return [gamefeed,gameId]
    else:
        return None

# def getOldGame(data):
#     theJSON = json.loads(data)
#     print(theJSON)

def parseGame(data):
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
                    plays = parsePlays(theJSON, "home")
                    # print(plays[1],plays[4])
                    stringtoi = theJSON["liveData"]["boxscore"]["teams"]["home"]["players"]["ID8471214"]["stats"]["skaterStats"]["timeOnIce"]
                    minutes = int(stringtoi[minutesslice])
                    seconds = int(stringtoi[secondsslice])
                    toi = (minutes * 60) + seconds
                    plays.append(toi)
                    return plays
            else:
                if not theJSON["liveData"]["boxscore"]["teams"]["away"]["players"]["ID8471214"]["stats"]:
                    print("Ovechkin rostered but did not play")
                else:
                    plays = parsePlays(theJSON, "away")
                    # print(plays[1],plays[4])
                    stringtoi = theJSON["liveData"]["boxscore"]["teams"]["away"]["players"]["ID8471214"]["stats"]["skaterStats"]["timeOnIce"]
                    minutes = int(stringtoi[minutesslice])
                    seconds = int(stringtoi[secondsslice])
                    toi = (minutes * 60) + seconds
                    plays.append(toi)
                    return plays
        else:
            print("Ovechkin not on roster")
    else:
        print("Game not finished!")

def parsePlays(gamefeed, venue):
    if venue == "home":
        print("Ovechkin played at home")
    elif venue == "away":
        print("Ovechkin played on the road")
    else:
        print("venue error")
    shotsgoals = []
    fenwickgoals = []
    corsigoals = []
    shots = []
    fenwick = []
    corsi = []
    # index all plays under liveData > plays > allPlays (array)
    for i,d in enumerate(gamefeed["liveData"]["plays"]["allPlays"]):
        # print("Event ", i, d)
        # pluck plays made by ovechkin
        if "players" in d:
            # print("Player event", i, d)
                # print("Ovechkin event", i, d)
                # pluck plays that are goals, shots, misses, blocked shots
            if d["result"]["eventTypeId"] == "GOAL":
                if d["players"][0]["player"]["id"] == 8471214:
                    coordinates = convertCoord(gamefeed, venue, d, float(d["coordinates"]["x"]), float(d["coordinates"]["y"]))
                    print("Ovechkin GOAL", d["about"]["periodTime"], "into the", d["about"]["ordinalNum"], "at", coordinates)
                    shotsgoals.append(1)
                    fenwickgoals.append(1)
                    corsigoals.append(1)
                    shots.append(coordinates)
                    fenwick.append(coordinates)
                    corsi.append(coordinates)
            elif d["result"]["eventTypeId"] == "SHOT":
                if d["players"][0]["player"]["id"] == 8471214:
                    coordinates = convertCoord(gamefeed, venue, d, float(d["coordinates"]["x"]), float(d["coordinates"]["y"]))
                    print("Ovechkin SHOT", d["about"]["periodTime"], "into the", d["about"]["ordinalNum"], "at", coordinates)
                    shotsgoals.append(0)
                    fenwickgoals.append(0)
                    corsigoals.append(0)
                    shots.append(coordinates)
                    fenwick.append(coordinates)
                    corsi.append(coordinates)
            elif d["result"]["eventTypeId"] == "MISSED_SHOT":
                if d["players"][0]["player"]["id"] == 8471214:
                    coordinates = convertCoord(gamefeed, venue, d, float(d["coordinates"]["x"]), float(d["coordinates"]["y"]))
                    print("Ovechkin MISS", d["about"]["periodTime"], "into the", d["about"]["ordinalNum"], "at", coordinates)
                    fenwickgoals.append(0)
                    corsigoals.append(0)
                    fenwick.append(coordinates)
                    corsi.append(coordinates)
            elif d["result"]["eventTypeId"] == "BLOCKED_SHOT":
                if d["players"][1]["player"]["id"] == 8471214:
                    coordinates = convertCoord(gamefeed, venue, d, float(d["coordinates"]["x"]), float(d["coordinates"]["y"]))
                    print("Ovechkin BLOCKED", d["about"]["periodTime"], "into the", d["about"]["ordinalNum"], "at", coordinates)
                    corsigoals.append(0)
                    corsi.append(coordinates)
            else:
                pass
    return [shotsgoals,fenwickgoals,corsigoals,shots,fenwick,corsi]

def convertCoord(gamefeed, venue, event, x, y):
    if venue == "home":
        if gamefeed["gameData"]["venue"]["name"] in homeLtRVenues:
            if event["about"]["period"] == 1 or event["about"]["period"] == 3:
                # print("Caps shooting left to right at home")
                newX = -x + 89
                newY = y
                return [newX, newY]
            elif event["about"]["period"] == 2 or event["about"]["period"] == 4:
                # print("Caps shooting right to left at home")
                newX = x + 89
                newY = -y
                return [newX, newY]
            else:
                pass
        elif gamefeed["gameData"]["venue"]["name"] in homeRtLVenues:
            if event["about"]["period"] == 1 or event["about"]["period"] == 3:
                # print("Caps shooting right to left at home")
                newX = x + 89
                newY = -y
                return [newX, newY]
            elif event["about"]["period"] == 2 or event["about"]["period"] == 4:
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
            if event["about"]["period"] == 1 or event["about"]["period"] == 3:
                # print("Caps shooting right to left on the road")
                newX = x + 89
                newY = -y
                return [newX, newY]
            elif event["about"]["period"] == 2 or event["about"]["period"] == 4:
                # print("Caps shooting left to right on the road")
                newX = -x + 89
                newY = y
                return [newX, newY]
            else:
                pass
        elif gamefeed["gameData"]["venue"]["name"] in rtlVenues:
            if event["about"]["period"] == 1 or event["about"]["period"] == 3:
                # print("Caps shooting left to right on the road")
                newX = -x + 89
                newY = y
                return [newX, newY]
            elif event["about"]["period"] == 2 or event["about"]["period"] == 4:
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

def constructJSON(plays):
    # print(plays)
    gamedata = {}
    gamedata["Goals"] = {}
    gamedata["Goals"]["Shots"] = plays[0]
    gamedata["Goals"]["Fenwick"] = plays[1]
    gamedata["Goals"]["Corsi"] = plays[2]
    gamedata["TOI"] = plays[6]
    gamedata["Shots"] = plays[3]
    gamedata["Fenwick"] = plays[4]
    gamedata["Corsi"] = plays[5]
    return gamedata

def main():
    # print(now)
    # print(now.tzinfo)
    # print(formattednow)
    # print(pacificnow)
    if (today.month >= 8):
        currentseason = today.year
    else:
        currentseason = today.year - 1

    scheduleUrl = str("https://statsapi.web.nhl.com/api/v1/schedule?teamId=15&startDate=" + str(currentseason) + "-09-01&endDate=" + str(currentseason + 1) + "-05-01")
    print(scheduleUrl)
    webUrl = urllib.request.urlopen(scheduleUrl)
    print ("result code: " + str(webUrl.getcode()))
    if (webUrl.getcode() == 200):
        data = webUrl.read()
        gameJSON = getGame(data)
        print(gameJSON)
    else:
        print("Received error, cannot parse results")

    if gameJSON != None:
        gameUrl = urllib.request.urlopen(gameJSON[0])
        print ("result code: " + str(gameUrl.getcode()))
        if (gameUrl.getcode() == 200):
            gamedata = gameUrl.read()
            shotinfo = parseGame(gamedata)
            exportdict = constructJSON(shotinfo)
            with open('data.json', 'w+') as outfile:
                json.dump(exportdict, outfile, indent=4)
        else:
            print("Received error, cannot parse results")

if __name__ == "__main__":
    main()