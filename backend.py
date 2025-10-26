from flask import Flask, jsonify, request
from flask_cors import CORS  # Import CORS
import pandas as pd
import math

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for the app
CORS(app)  # This will enable CORS for all routes by default

df = pd.read_csv("./study_spots.csv")  # CSV with Latitude and Longitude
dfcoffee = pd.read_csv("./coffee_shops.csv")

class user:
    def __init__(self, location):
        self.location = location


def getWeightedAverageForCoffee(dfcoffee):
    CGS = 0
    CDS= 0
    Kil = 0
    Mugar =0
    Warren =0 

    def findScore(row):
        # Calculate scores for all entries in dfcoffee
        # Assign scores at the end to one of the 5 places

        # Weighted score
        score = (0.25 * row["Number of Customers Per Day"]
            + 0.20 * row["Average Order Value"]
            + 0.20 * row["Location Foot Traffic"]
            + 0.20 * row["Daily Revenue"]
            - 0.10 * row["Marketing Spend Per Day"]
            - 0.05 * row["Number of Employees"])
        return score
    
    for i in range(1, len(dfcoffee)+1 ):
        row = dfcoffee.iloc[i-1]
        score = findScore(row)

        numberC = (i-1) % 5  # Goes from 0 to 4
        if numberC == 0:
            CGS += score
        elif numberC == 1:
            CDS += score
        elif numberC == 2:
            Kil += score
        elif numberC == 3:
            Mugar += score
        else:
            Warren += score

    scoresList = [CGS, CDS, Kil, Mugar, Warren]

    def normalizeCoffee(scoresList):
        min1 = min(scoresList)
        max1 = max(scoresList)
        normalized = []
        for number in scoresList:
            if max1 == min1:
                normalized.append(0.5)
            else:
                normalized.append((number - min1) / (max1 - min1))
        return normalized
    
    normScoresList = normalizeCoffee(scoresList)

    places = ["CGS", "CDS", "Kilachand", "Mugar", "Warren"]
    for name, score in zip(places, normScoresList):
        print(f"{name}: {round(score, 3)}")
    
    return normScoresList


def getWeightedAverageForDBIndex(df, user):
    
    def findDistance(latStart, lonStart, latEnd, lonEnd):
        distX = latEnd - latStart
        distY = lonEnd - lonStart
        distMiles = ((distX**2 + distY**2) ** 0.5) * 69
        return distMiles

    latUser, lonUser = user.location
    
    distances = []
    for _, row in df.iterrows():
        distance = findDistance(latUser, lonUser, row["Latitude"], row["Longitude"])
        distances.append(distance)
    distances = pd.Series(distances, index=df.index)

    def normalize(series):
        min = series.min()
        max = series.max()
        if min == max:
            return pd.Series([0.5] * len(series), index=series.index)
        return (series - min) / (max - min)

    rating = df["User Rating"]
    ratingNormal = normalize(rating)

    numRatings = df["Number of Ratings"]
    numRatingsNormal = normalize(numRatings)

    crowdedness = df["Current Capacity"] / df["Max Capacity"]
    crowdNormal = 1 - normalize(crowdedness)

    alpha = 3.0
    xParameter = alpha * numRatingsNormal
    popularity = [1 - math.exp(-x) for x in xParameter]
    popularity = pd.Series(popularity, index=numRatings.index)

    ratingNew = ratingNormal * popularity

    thresholdMiles = 50.0
    scale = 12.0

    xDist = [dist / scale for dist in distances]
    locationCurve = [math.exp(-x) for x in xDist]

    locationAdjusted = []
    for i in range(len(distances)):
        if distances.iloc[i] <= thresholdMiles:
            locationAdjusted.append(locationCurve[i])
        else:
            locationAdjusted.append(0.0)
    locationCurve = pd.Series(locationAdjusted, index=df.index)

    ratingWeight = 0.45 + (0.15 * numRatingsNormal)
    crowdWeight = 0.30
    locationWeight = 0.25

    finalRatingWeight = []
    finalCrowdWeight = []
    finalLocationWeight = []
    for i in range(len(df)):
        total = ratingWeight.iloc[i] + crowdWeight + locationWeight
        finalRatingWeight.append(ratingWeight.iloc[i] / total)
        finalCrowdWeight.append(crowdWeight / total)
        finalLocationWeight.append(locationWeight / total)
    finalRatingWeight = pd.Series(finalRatingWeight, index=df.index)
    finalCrowdWeight = pd.Series(finalCrowdWeight, index=df.index)
    finalLocationWeight = pd.Series(finalLocationWeight, index=df.index)

    scores = []
    for i in df.index:
        r = ratingNew.loc[i]
        c = crowdNormal.loc[i]
        l = locationCurve.loc[i]
        score = (finalRatingWeight.loc[i] * r) + (finalCrowdWeight.loc[i] * c) + (finalLocationWeight.loc[i] * l)
        score = min(max(score, 0), 1)
        scores.append(score)

    return scores


def getRankedList(df, user):
    scores = getWeightedAverageForDBIndex(df, user)
    ranked_list = []
    for i in range(len(df)):
        placeName = df.iloc[i]["Name"]
        score = scores[i]
        ranked_list.append([placeName, score])
    
    ranked_list.sort(reverse=True, key=lambda x: x[1])
        
    for item in ranked_list:
        name = item[0]
        score = item[1]
        print(f"{name}: {score:.3f}")
        
    return ranked_list


@app.route("/ranked", methods=["GET"])
def ranked_endpoint():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    if lat is None or lon is None:
        return jsonify({"error": "Please provide lat and lon query parameters, e.g. /ranked?lat=42.35&lon=-71.11"}), 400

    u = user((lat, lon))
    ranked = getRankedList(df, u)
    return jsonify(ranked)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
