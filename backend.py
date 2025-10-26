from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import math

app = Flask(__name__)
CORS(app)  # Allow frontend requests

df = pd.read_csv("./study_spots.csv")  # CSV with Latitude and Longitude

class User:
    def __init__(self, location):
        self.location = location


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
        min_val = series.min()
        max_val = series.max()
        if min_val == max_val:
            return pd.Series([0.5] * len(series), index=series.index)
        return (series - min_val) / (max_val - min_val)

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
        place_data = df.iloc[i].to_dict()  # ✅ convert to dict
        score = float(scores[i])
        ranked_list.append([place_data, score])

    ranked_list.sort(reverse=True, key=lambda x: x[1])
    return ranked_list


@app.route("/ranked", methods=["GET"])
def ranked_endpoint():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    if lat is None or lon is None:
        return jsonify({"error": "Please provide lat and lon query parameters, e.g. /ranked?lat=42.35&lon=-71.11"}), 400

    u = User((lat, lon))
    ranked = getRankedList(df, u)
    return jsonify(ranked)  # ✅ now JSON serializable


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
