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
    "Barclays Center",
    "Canadian Tire Centre",
    "PPG Paints Arena",
    "CONSOL Energy Center",
    "SAP Center at San Jose",
    "Enterprise Center",
    "Scottrade Center",
    "Amalie Arena",
    "Tampa Bay Times Forum"]
rtlVenues = [
    "Scotiabank Saddledome",
    "PNC Arena",
    "United Center",
    "Pepsi Center",
    "American Airlines Center",
    "Little Caesars Arena",
    "Joe Louis Arena",
    "Rexall Place",
    "BB&T Center",
    "STAPLES Center", "Staples Center",
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
    "MTS Centre"]
homeLtRVenues = ["Navy-Marine Corps Memorial Stadium"]
homeRtLVenues = ["Capital One Arena","Verizon Center","Nationals Park"]
homeVenues = ["Navy-Marine Corps Memorial Stadium","Capital One Arena","Verizon Center","Nationals Park"]

def getGame(theJSON, i):
    gamefeed = ""
    gamePk = ""
    gameslice = slice(4,6)
    gamedate = datetime.strptime(theJSON["dates"][i]["date"], "%Y-%m-%d")
    if gamedate == formattednow:
        gamePk = str(theJSON["dates"][i]["games"][0]["gamePk"])
        if gamePk[gameslice] == "02":
            gamefeed = "https://statsapi.web.nhl.com" + theJSON["dates"][i]["games"][0]["link"]
            return [gamefeed, int(gamePk)]
    else:
        pass

# def getOldGame(theJSON, i):
#     gamefeed = ""
#     gamePk = ""
#     gameslice = slice(4,6)
#     gamePk = str(theJSON["dates"][i]["games"][0]["gamePk"])
#     if gamePk[gameslice] == "02":
#         gamefeed = "https://statsapi.web.nhl.com" + theJSON["dates"][i]["games"][0]["link"]
#         return [gamefeed, int(gamePk)]

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
                    # print(plays[1],plays[4])
                    stringtoi = theJSON["liveData"]["boxscore"]["teams"]["home"]["players"]["ID8471214"]["stats"]["skaterStats"]["timeOnIce"]
                    toisplit = stringtoi.split(":")
                    minutes = int(toisplit[0])
                    seconds = int(toisplit[1])
                    toi = (minutes * 60) + seconds
                    plays.append(toi)

                    evstringtoi = theJSON["liveData"]["boxscore"]["teams"]["home"]["players"]["ID8471214"]["stats"]["skaterStats"]["evenTimeOnIce"]
                    evtoisplit = evstringtoi.split(":")
                    evminutes = int(evtoisplit[0])
                    evseconds = int(evtoisplit[1])
                    evtoi = (evminutes * 60) + evseconds
                    plays.append(evtoi)

                    ppstringtoi = theJSON["liveData"]["boxscore"]["teams"]["home"]["players"]["ID8471214"]["stats"]["skaterStats"]["powerPlayTimeOnIce"]
                    pptoisplit = ppstringtoi.split(":")
                    ppminutes = int(pptoisplit[0])
                    ppseconds = int(pptoisplit[1])
                    pptoi = (ppminutes * 60) + ppseconds
                    plays.append(pptoi)
                    return plays
            else:
                if not theJSON["liveData"]["boxscore"]["teams"]["away"]["players"]["ID8471214"]["stats"]:
                    print("Ovechkin rostered but did not play")
                else:
                    plays = dataScrape(gameID, "away", theJSON)
                    # print(plays[1],plays[4])
                    stringtoi = theJSON["liveData"]["boxscore"]["teams"]["away"]["players"]["ID8471214"]["stats"]["skaterStats"]["timeOnIce"]
                    toisplit = stringtoi.split(":")
                    minutes = int(toisplit[0])
                    seconds = int(toisplit[1])
                    toi = (minutes * 60) + seconds
                    plays.append(toi)

                    evstringtoi = theJSON["liveData"]["boxscore"]["teams"]["away"]["players"]["ID8471214"]["stats"]["skaterStats"]["evenTimeOnIce"]
                    evtoisplit = evstringtoi.split(":")
                    evminutes = int(evtoisplit[0])
                    evseconds = int(evtoisplit[1])
                    evtoi = (evminutes * 60) + evseconds
                    plays.append(evtoi)

                    ppstringtoi = theJSON["liveData"]["boxscore"]["teams"]["away"]["players"]["ID8471214"]["stats"]["skaterStats"]["powerPlayTimeOnIce"]
                    pptoisplit = ppstringtoi.split(":")
                    ppminutes = int(pptoisplit[0])
                    ppseconds = int(pptoisplit[1])
                    pptoi = (ppminutes * 60) + ppseconds
                    plays.append(pptoi)
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

    shotsgoals = []
    fenwickgoals = []
    # corsigoals = []
    shots = []
    fenwick = []
    # corsi = []
    evshotsgoals = []
    evfenwickgoals = []
    # evcorsigoals = []
    evshots = []
    evfenwick = []
    # evcorsi = []
    ppshotsgoals = []
    ppfenwickgoals = []
    # ppcorsigoals = []
    ppshots = []
    ppfenwick = []
    # ppcorsi = []
    # print(gamefeed)
    scrape = hockey_scraper.scrape_games([gameID], False, data_format="Pandas")
    bigData = scrape["pbp"]
    eventlist = ["GOAL","SHOT","MISS"]
    shotdata = bigData.loc[bigData["Event"].isin(eventlist)]
    roshotdata = shotdata.loc[shotdata["Period"] <= 4]
    ovishotdata = roshotdata.loc[roshotdata["p1_ID"] == 8471214]
    # print(ovishotdata)
    for i, j in ovishotdata.iterrows():
        coordinates = convertCoord(gamefeed,venue,j["Period"],j["xC"],j["yC"])
        # print(i, j["Description"], newcoord)
        strength = j["Strength"]
        strsplit = strength.split("x")
        if venue == "home":
            if int(strsplit[0]) >= 5 and int(strsplit[1]) >= 5:
                if j["Event"] == "GOAL":
                    shotsgoals.append(1)
                    fenwickgoals.append(1)
                    # corsigoals.append(1)
                    shots.append(coordinates)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    evshotsgoals.append(1)
                    evfenwickgoals.append(1)
                    # evcorsigoals.append(1)
                    evshots.append(coordinates)
                    evfenwick.append(coordinates)
                    # evcorsi.append(coordinates)
                elif j["Event"] == "SHOT":
                    shotsgoals.append(0)
                    fenwickgoals.append(0)
                    # corsigoals.append(0)
                    shots.append(coordinates)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    evshotsgoals.append(0)
                    evfenwickgoals.append(0)
                    # evcorsigoals.append(0)
                    evshots.append(coordinates)
                    evfenwick.append(coordinates)
                    # evcorsi.append(coordinates)
                elif j["Event"] == "MISS":
                    fenwickgoals.append(0)
                    # corsigoals.append(0)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    evfenwickgoals.append(0)
                    # evcorsigoals.append(0)
                    evfenwick.append(coordinates)
                    # evcorsi.append(coordinates)
            elif int(strsplit[1]) == int(strsplit[0]):
                if j["Event"] == "GOAL":
                    shotsgoals.append(1)
                    fenwickgoals.append(1)
                    # corsigoals.append(1)
                    shots.append(coordinates)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    evshotsgoals.append(1)
                    evfenwickgoals.append(1)
                    # evcorsigoals.append(1)
                    evshots.append(coordinates)
                    evfenwick.append(coordinates)
                    # evcorsi.append(coordinates)
                elif j["Event"] == "SHOT":
                    shotsgoals.append(0)
                    fenwickgoals.append(0)
                    # corsigoals.append(0)
                    shots.append(coordinates)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    evshotsgoals.append(0)
                    evfenwickgoals.append(0)
                    # evcorsigoals.append(0)
                    evshots.append(coordinates)
                    evfenwick.append(coordinates)
                    # evcorsi.append(coordinates)
                elif j["Event"] == "MISS":
                    fenwickgoals.append(0)
                    # corsigoals.append(0)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    evfenwickgoals.append(0)
                    # evcorsigoals.append(0)
                    evfenwick.append(coordinates)
                    # evcorsi.append(coordinates)
            elif int(strsplit[1]) < int(strsplit[0]):
                if j["Event"] == "GOAL":
                    shotsgoals.append(1)
                    fenwickgoals.append(1)
                    # corsigoals.append(1)
                    shots.append(coordinates)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    ppshotsgoals.append(1)
                    ppfenwickgoals.append(1)
                    # ppcorsigoals.append(1)
                    ppshots.append(coordinates)
                    ppfenwick.append(coordinates)
                    # ppcorsi.append(coordinates)
                elif j["Event"] == "SHOT":
                    shotsgoals.append(0)
                    fenwickgoals.append(0)
                    # corsigoals.append(0)
                    shots.append(coordinates)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    ppshotsgoals.append(0)
                    ppfenwickgoals.append(0)
                    # ppcorsigoals.append(0)
                    ppshots.append(coordinates)
                    ppfenwick.append(coordinates)
                    # ppcorsi.append(coordinates)
                elif j["Event"] == "MISS":
                    fenwickgoals.append(0)
                    # corsigoals.append(0)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    ppfenwickgoals.append(0)
                    # ppcorsigoals.append(0)
                    ppfenwick.append(coordinates)
                    # ppcorsi.append(coordinates)
            else:
                pass
        elif venue == "away":
            if int(strsplit[0]) >= 5 and int(strsplit[1]) >= 5:
                if j["Event"] == "GOAL":
                    shotsgoals.append(1)
                    fenwickgoals.append(1)
                    # corsigoals.append(1)
                    shots.append(coordinates)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    evshotsgoals.append(1)
                    evfenwickgoals.append(1)
                    # evcorsigoals.append(1)
                    evshots.append(coordinates)
                    evfenwick.append(coordinates)
                    # evcorsi.append(coordinates)
                elif j["Event"] == "SHOT":
                    shotsgoals.append(0)
                    fenwickgoals.append(0)
                    # corsigoals.append(0)
                    shots.append(coordinates)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    evshotsgoals.append(0)
                    evfenwickgoals.append(0)
                    # evcorsigoals.append(0)
                    evshots.append(coordinates)
                    evfenwick.append(coordinates)
                    # evcorsi.append(coordinates)
                elif j["Event"] == "MISS":
                    fenwickgoals.append(0)
                    # corsigoals.append(0)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    evfenwickgoals.append(0)
                    # evcorsigoals.append(0)
                    evfenwick.append(coordinates)
                    # evcorsi.append(coordinates)
            elif int(strsplit[0]) == int(strsplit[1]):
                if j["Event"] == "GOAL":
                    shotsgoals.append(1)
                    fenwickgoals.append(1)
                    # corsigoals.append(1)
                    shots.append(coordinates)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    evshotsgoals.append(1)
                    evfenwickgoals.append(1)
                    # evcorsigoals.append(1)
                    evshots.append(coordinates)
                    evfenwick.append(coordinates)
                    # evcorsi.append(coordinates)
                elif j["Event"] == "SHOT":
                    shotsgoals.append(0)
                    fenwickgoals.append(0)
                    # corsigoals.append(0)
                    shots.append(coordinates)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    evshotsgoals.append(0)
                    evfenwickgoals.append(0)
                    # evcorsigoals.append(0)
                    evshots.append(coordinates)
                    evfenwick.append(coordinates)
                    # evcorsi.append(coordinates)
                elif j["Event"] == "MISS":
                    fenwickgoals.append(0)
                    # corsigoals.append(0)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    evfenwickgoals.append(0)
                    # evcorsigoals.append(0)
                    evfenwick.append(coordinates)
                    # evcorsi.append(coordinates)
            elif int(strsplit[0]) < int(strsplit[1]):
                if j["Event"] == "GOAL":
                    shotsgoals.append(1)
                    fenwickgoals.append(1)
                    # corsigoals.append(1)
                    shots.append(coordinates)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    ppshotsgoals.append(1)
                    ppfenwickgoals.append(1)
                    # ppcorsigoals.append(1)
                    ppshots.append(coordinates)
                    ppfenwick.append(coordinates)
                    # ppcorsi.append(coordinates)
                elif j["Event"] == "SHOT":
                    shotsgoals.append(0)
                    fenwickgoals.append(0)
                    # corsigoals.append(0)
                    shots.append(coordinates)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    ppshotsgoals.append(0)
                    ppfenwickgoals.append(0)
                    # ppcorsigoals.append(0)
                    ppshots.append(coordinates)
                    ppfenwick.append(coordinates)
                    # ppcorsi.append(coordinates)
                elif j["Event"] == "MISS":
                    fenwickgoals.append(0)
                    # corsigoals.append(0)
                    fenwick.append(coordinates)
                    # corsi.append(coordinates)
                    ppfenwickgoals.append(0)
                    # ppcorsigoals.append(0)
                    ppfenwick.append(coordinates)
                    # ppcorsi.append(coordinates)
            else:
                pass
    avgx = 0
    totalx = 0
    for i in range(0, len(fenwick)):
        totalx = totalx + fenwick[i][0]
    if len(fenwick) > 0:
        avgx = totalx / len(fenwick)
    if avgx > 100:
        # print("-------------------- INVERT HERE --------------------")
        for fen in range(0, len(fenwick)):
            fenwick[fen][0] = -fenwick[fen][0] + 178
            fenwick[fen][1] = -fenwick[fen][1]
        print(shots)
        print(fenwick)
        print(evshots)
        print(evfenwick)
        print(ppshots)
        print(ppfenwick)
        # print("---------------- INVERSION COMPLETE ----------------")
    return [shotsgoals, fenwickgoals, shots, fenwick, evshotsgoals, evfenwickgoals, evshots, evfenwick, ppshotsgoals, ppfenwickgoals, ppshots, ppfenwick]

def constructJSON(plays,gameno):
    # print(plays)
    gamedata = {}
    if plays != None:
        gamedata["Game"] = "G" + str(gameno)
        gamedata["Goals"] = {}
        gamedata["Goals"]["Shots"] = plays[0]
        gamedata["Goals"]["Fenwick"] = plays[1]
        # gamedata["Goals"]["Corsi"] = plays[2]
        gamedata["TOI"] = plays[12]
        gamedata["Shots"] = plays[2]
        gamedata["Fenwick"] = plays[3]
        # gamedata["Corsi"] = plays[5]
        gamedata["Even Strength"] = {}
        gamedata["Even Strength"]["Goals"] = {}
        gamedata["Even Strength"]["Goals"]["Shots"] = plays[4]
        gamedata["Even Strength"]["Goals"]["Fenwick"] = plays[5]
        # gamedata["Even Strength"]["Goals"]["Corsi"] = plays[8]
        gamedata["Even Strength"]["TOI"] = plays[13]
        gamedata["Even Strength"]["Shots"] = plays[6]
        gamedata["Even Strength"]["Fenwick"] = plays[7]
        # gamedata["Even Strength"]["Corsi"] = plays[11]
        gamedata["Power Play"] = {}
        gamedata["Power Play"]["Goals"] = {}
        gamedata["Power Play"]["Goals"]["Shots"] = plays[8]
        gamedata["Power Play"]["Goals"]["Fenwick"] = plays[9]
        # gamedata["Power Play"]["Goals"]["Corsi"] = plays[14]
        gamedata["Power Play"]["TOI"] = plays[14]
        gamedata["Power Play"]["Shots"] = plays[10]
        gamedata["Power Play"]["Fenwick"] = plays[11]
        # gamedata["Power Play"]["Corsi"] = plays[17]
    return gamedata

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

def main():
    if (today.month >= 8):
        currentseason = today.year
    else:
        currentseason = today.year - 1

    with open('advdata.json') as json_file:
        finalJSON = json.load(json_file)
    print(finalJSON)
    scheduleUrl = str("https://statsapi.web.nhl.com/api/v1/schedule?teamId=15&startDate=" + str(currentseason) + "-09-01&endDate=" + str(currentseason + 1) + "-05-01")
    print(scheduleUrl)
    webUrl = urllib.request.urlopen(scheduleUrl)
    print ("result code: " + str(webUrl.getcode()))
    if (webUrl.getcode() == 200):
        data = webUrl.read()
        newgameJSON = json.loads(data)
        for i,d in enumerate(newgameJSON["dates"]):
            gameJSON = getGame(newgameJSON, i)
            # print(gameJSON[0])
            if gameJSON != None:
                gameUrl = urllib.request.urlopen(gameJSON[0])
                print ("result code: " + str(gameUrl.getcode()))
                if (gameUrl.getcode() == 200):
                    gamedata = gameUrl.read()
                    shotinfo = parseGame(gamedata, gameJSON[1])
                    if shotinfo != []:
                        exportdict = constructJSON(shotinfo,gameJSON[1])
                        print(exportdict)
                        finalJSON.append(exportdict)
                else:
                    print("Received error, cannot parse results")
    else:
        print("Received error, cannot parse results")
    with open('advdata.json', 'w+') as outfile:
        json.dump(finalJSON, outfile)

if __name__ == "__main__":
    main()