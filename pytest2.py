from datetime import date
from datetime import datetime
from datetime import timedelta
import urllib.request
import json
import pytz
import hockey_scraper

today = date.today()
now = datetime.now()
adjnow = now - timedelta(days=2)
est = pytz.timezone("America/New_York")
pst = pytz.timezone("America/Los_Angeles")
loc_dt = est.localize(adjnow)
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

def getGame(data):
    gamefeed = ""
    gamePk = ""
    gameslice = slice(4,6)
    pkslice = slice(4,10)
    gameId = ""
    theJSON = json.loads(data)
    for i,d in enumerate(theJSON["dates"]):
        if theJSON["dates"][i]["date"] == stringnow:
            gamePk = str(theJSON["dates"][i]["games"][0]["gamePk"])
            if gamePk[gameslice] == "02":
                # gamefeed = "https://statsapi.web.nhl.com" + theJSON["dates"][i]["games"][0]["link"]
                # gameId = str(gamePk)
                return int(gamePk)
    # if gamefeed != "":
    #     return [gamefeed,gameId]
    # else:
    #     return None

def main():
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
        # gameUrl = urllib.request.urlopen(gameJSON[0])
        # print ("result code: " + str(gameUrl.getcode()))
        # if (gameUrl.getcode() == 200):
        #     gamedata = gameUrl.read()
        #     shotinfo = parseGame(gamedata)
        #     exportdict = constructJSON(shotinfo)
        #     with open('data.json', 'w+') as outfile:
        #         json.dump(exportdict, outfile, indent=4)
        # else:
        #     print("Received error, cannot parse results")
        scraped_data = hockey_scraper.scrape_games([gameJSON], False, data_format="Pandas")
        print(scraped_data)


if __name__ == "__main__":
    main()