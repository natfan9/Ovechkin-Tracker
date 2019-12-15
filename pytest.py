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
    pkslice = slice(4,10)
    gameId = ""
    gamedate = datetime.strptime(theJSON["dates"][i]["date"], "%Y-%m-%d")
    if gamedate <= formattednow:
        gamePk = str(theJSON["dates"][i]["games"][0]["gamePk"])
        if gamePk[gameslice] == "02":
            gamefeed = "https://statsapi.web.nhl.com" + theJSON["dates"][i]["games"][0]["link"]
            gameId = str(gamePk)[pkslice]
            return [gamefeed,gameId]
    else:
        pass
    # if gamefeed != "":
    #     return [gamefeed,gameId]
    # else:
    #     return None

def getOldGame(theJSON, i):
    gamefeed = ""
    gamePk = ""
    gameslice = slice(4,6)
    pkslice = slice(4,10)
    gameId = ""
    # theJSON = json.loads(data)
    # for i,d in enumerate(theJSON["dates"]):
    gamePk = str(theJSON["dates"][i]["games"][0]["gamePk"])
    if gamePk[gameslice] == "02":
        gamefeed = "https://statsapi.web.nhl.com" + theJSON["dates"][i]["games"][0]["link"]
        gameId = str(gamePk)[pkslice]
        print(theJSON["dates"][i]["games"][0]["venue"]["name"])
        return [gamefeed,gameId]
    # if gamefeed != "":
    #     return [gamefeed,gameId]
    # else:
    #     return None

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
            if 1 <= d["about"]["period"] <= 4:
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
            else:
                pass
    avgx = 0
    totalx = 0
    for i in range(0, len(corsi)):
        totalx = totalx + corsi[i][0]
    if len(corsi) > 0:
        avgx = totalx / len(corsi)
    if avgx > 100:
        print("-------------------- INVERT HERE --------------------")
        for cor in range(0, len(corsi)):
            corsi[cor][0] = -corsi[cor][0] + 178
            corsi[cor][1] = -corsi[cor][1]
        print(shots)
        print(fenwick)
        print(corsi)
        print("---------------- INVERSION COMPLETE ----------------")
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

def constructJSON(plays,season,gameno):
    # print(plays)
    gamedata = {}
    if plays != None:
        gamedata["Game"] = "G" + str(season) + str(gameno)
        gamedata["Goals"] = {}
        gamedata["Goals"]["Shots"] = plays[0]
        gamedata["Goals"]["Fenwick"] = plays[1]
        gamedata["Goals"]["Corsi"] = plays[2]
        gamedata["TOI"] = plays[6]
        gamedata["Shots"] = plays[3]
        gamedata["Fenwick"] = plays[4]
        gamedata["Corsi"] = plays[5]
        # gamedata["Even Strength"] = {}
        # gamedata["Even Strength"]["Goals"] = {}
        # gamedata["Even Strength"]["Goals"]["Shots"] = plays[7]
        # gamedata["Even Strength"]["Goals"]["Fenwick"] = plays[8]
        # gamedata["Even Strength"]["Goals"]["Corsi"] = plays[9]
        # gamedata["Even Strength"]["TOI"] = plays[13]
        # gamedata["Even Strength"]["Shots"] = plays[10]
        # gamedata["Even Strength"]["Fenwick"] = plays[11]
        # gamedata["Even Strength"]["Corsi"] = plays[12]
        # gamedata["Power Play"] = {}
        # gamedata["Power Play"]["Goals"] = {}
        # gamedata["Power Play"]["Goals"]["Shots"] = plays[14]
        # gamedata["Power Play"]["Goals"]["Fenwick"] = plays[15]
        # gamedata["Power Play"]["Goals"]["Corsi"] = plays[16]
        # gamedata["Power Play"]["TOI"] = plays[20]
        # gamedata["Power Play"]["Shots"] = plays[17]
        # gamedata["Power Play"]["Fenwick"] = plays[18]
        # gamedata["Power Play"]["Corsi"] = plays[19]
    return gamedata

def main():
    # print(now)
    # print(now.tzinfo)
    # print(pacificnow)
    # print(d_aware)
    # print(now)
    # print(pacific)
    # print(stringnow)
    # print(formattednow)
    if (today.month >= 8):
        currentseason = today.year
    else:
        currentseason = today.year - 1

    # testGameUrl = "https://statsapi.web.nhl.com/api/v1/game/2019020451/feed/live"
    # webUrl = urllib.request.urlopen(testGameUrl)
    # data = webUrl.read()
    # testgameJSON = json.loads(data)
    # scrapetest = hockey_scraper.nhl.game_scraper.scrape_pbp(game_id=2019020451,date="2019-12-06",game_json=testgameJSON,roster=[],players=testgameJSON["gameData"]["players"])
    # scrapetest = hockey_scraper.nhl.pbp.html_pbp.get_pbp("2019020451")
    # print(scrapetest)
    # scrapejson = hockey_scraper.nhl.pbp.json_pbp.parse_json()
    # scraped_data = hockey_scraper.scrape_games([2019020451], False, data_format="Pandas")
    # scraped_season = hockey_scraper.scrape_seasons([2019], False)
    # print(scraped_data)
    # f = open("textfile.csv", "w+")
    # f.write(scraped_data)
    # f.close()

    season = 0

    finalJSON = []
    
    for i in range(-6,1): # -6,1 to get 5 previous seasons plus current season
        season = currentseason + i
        scheduleUrl = str("https://statsapi.web.nhl.com/api/v1/schedule?teamId=15&startDate=" + str(season) + "-09-01&endDate=" + str(season + 1) + "-05-01")
        print(scheduleUrl)
        webUrl = urllib.request.urlopen(scheduleUrl)
        print ("result code: " + str(webUrl.getcode()))
        if season < currentseason:
            if (webUrl.getcode() == 200):
                data = webUrl.read()
                oldgameJSON = json.loads(data)
                for i,d in enumerate(oldgameJSON["dates"]):
                    gameJSON = getOldGame(oldgameJSON, i)
                    print(gameJSON)
                    if gameJSON != None:
                        gameUrl = urllib.request.urlopen(gameJSON[0])
                        print ("result code: " + str(gameUrl.getcode()))
                        if (gameUrl.getcode() == 200):
                            gamedata = gameUrl.read()
                            shotinfo = parseGame(gamedata)
                            exportdict = constructJSON(shotinfo,season,gameJSON[1])
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
                    print(gameJSON)
                    if gameJSON != None:
                        gameUrl = urllib.request.urlopen(gameJSON[0])
                        print ("result code: " + str(gameUrl.getcode()))
                        if (gameUrl.getcode() == 200):
                            gamedata = gameUrl.read()
                            shotinfo = parseGame(gamedata)
                            exportdict = constructJSON(shotinfo,season,gameJSON[1])
                            finalJSON.append(exportdict)
                        else:
                            print("Received error, cannot parse results")
            else:
                print("Received error, cannot parse results")
    with open('data.json', 'w+') as outfile:
        json.dump(finalJSON, outfile)

if __name__ == "__main__":
    main()