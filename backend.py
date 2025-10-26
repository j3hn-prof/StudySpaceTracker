from flask import Flask, jsonify, request
import pandas as pd
import math

app = Flask(__name__)
df = pd.read_csv("./study_spots.csv")  # CSV with Latitude and Longitude


class user:
    def __init__(self, location):
        self.location = location

#get scores 0-1 for each place in the dataframe
def getWeightedAverageForDBIndex(df, user):
    
    def findDistance(latStart, lonStart, latEnd, lonEnd):
        distX = latEnd - latStart
        distY = lonEnd - lonStart
        distMiles = ((distX**2 + distY**2) ** 0.5) * 69
        return distMiles
    #pythagorean theorem
    #one degree of latitude and longitude is approximately 69 miles

    latUser, lonUser = user.location
    
    distances= []
    for _, row in df.iterrows():
        distance= findDistance(latUser,lonUser,row["Latitude"], row["Longitude"])
        distances.append(distance)
    distances= pd.Series(distances, index= df.index)

    #normalizing helper function so that larger numbers don't dominate smaller ones
    def normalize(series):
        min = series.min()
        max = series.max()
        if min == max:
            return pd.Series([0.5] * len(series), index= series.index)
        return (series - min)/(max - min)
    #what the pd.Series is

    #normalize features before weighting
    rating= df["User Rating"]
    ratingNormal = normalize(rating)

    numRatings= df["Number of Ratings"]
    numRatingsNormal= normalize(numRatings)

    crowdedness = df["Current Capacity"] / df["Max Capacity"]
    crowdNormal = 1- normalize(crowdedness)
    #because the lower crowdNormal is the better (want less crowds)

    #calculate weight of rating combined with number of ratings(popularity)
    alpha= 3.0 #controls rate of increase of the curve 1-E^-X
    xParameter = alpha * numRatingsNormal
    popularity = [1 - math.exp(-x) for x in xParameter]
    popularity = pd.Series(popularity, index=numRatings.index)

    ratingNew = ratingNormal * popularity

    #calculate weight of location using graph of e^-x
    thresholdMiles = 50.0 #about 2 hours
    scale = 12.0 #how fast a longer distance decreases score
    # 12 is used because it is a moderate value

    xDist= [dist/scale for dist in distances]
    locationCurve = [math.exp(-x) for x in xDist]

    #0 if distance > 50.0, too far away
    locationAdjusted = []
    for i in range(len(distances)):
        if distances.iloc[i] <= thresholdMiles:
            locationAdjusted.append(locationCurve[i])
        else:
            locationAdjusted.append(0.0)
    locationCurve = pd.Series(locationAdjusted, index=df.index)

    #baseline of weights
    ratingWeight= 0.45 + (0.15 *numRatingsNormal)
    crowdWeight = 0.30
    locationWeight = 0.25


    #normalize weights to have sum=1
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

    #output scores now
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
    # Accept latitude & longitude as query params: ?lat=...&lon=...
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    if lat is None or lon is None:
        return jsonify({"error": "Please provide lat and lon query parameters, e.g. /ranked?lat=42.35&lon=-71.11"}), 400

    u = user((lat, lon))
    ranked = getRankedList(df, u)
    return jsonify(ranked)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
