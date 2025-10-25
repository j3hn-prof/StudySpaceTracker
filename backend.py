from flask import Flask, jsonify, request
import pandas as pd
from math import radians, sin, cos, sqrt, atan2, exp

app = Flask(__name__)
df = pd.read_csv("./study_spots.csv")  # CSV with Latitude and Longitude

class user:
    def __init__(self, location):
        self.location = location

def getWeightedAverageForDBIndex(dataBase, user):
    # 
    # helper: haversine distance in kilometers
    def haversine_km(lat1, lon1, lat2, lon2):
        R = 6371.0
        lat1_r, lon1_r = radians(lat1), radians(lon1)
        lat2_r, lon2_r = radians(lat2), radians(lon2)
        dlat, dlon = lat2_r - lat1_r, lon2_r - lon1_r
        a = sin(dlat / 2) ** 2 + cos(lat1_r) * cos(lat2_r) * sin(dlon / 2) ** 2
        return 2 * R * atan2(sqrt(a), sqrt(1 - a))

    user_lat, user_lon = user.location

    # percent_filled (occupancy) as the "remaining score" per user's request:
    percent_filled = dataBase["Current Capacity"] / dataBase["Max Capacity"]  # 0..1, lower is better generally but we'll treat higher filled -> worse

    rating = dataBase["User Rating"]  # e.g., 4.3..4.6
    num_ratings = dataBase["Number of Ratings"]

    # distances (km)
    distances = []
    for _, row in dataBase.iterrows():
        distances.append(haversine_km(user_lat, user_lon, row["Latitude"], row["Longitude"]))
    distances = pd.Series(distances, index=dataBase.index)

    # normalize helper for rating and num_ratings and percent_filled (to 0..1)
    def minmax_norm(series):
        mn, mx = series.min(), series.max()
        if mn == mx:
            return pd.Series([0.5] * len(series), index=series.index)
        return (series - mn) / (mx - mn)

    # Normalize rating to 0..1 (higher better)
    rating_norm = minmax_norm(rating)
    # Normalize num_ratings to 0..1 (higher better)
    num_ratings_norm = minmax_norm(num_ratings)
    # Normalize percent_filled so that lower occupancy is better: invert after norm
    filled_norm_raw = minmax_norm(percent_filled)  # 0..1, higher = more filled
    filled_score = 1 - filled_norm_raw  # 0..1 where higher means more desirable (less filled)

    # Distance transform: we will use distance in km as x for e^-x (but scale x to control falloff).
    # Choose a scale factor so that e^-x drops reasonably with distance. Use scale = distance_km / scale_km.
    # Pick scale_km = 5.0 so that at ~5km e^-1 ~ 0.37 weight; at ~0.5km it's ~0.90.
    scale_km = 5.0
    x = distances / scale_km
    distance_weight_component = pd.Series([exp(-val) for val in x], index=distances.index)
    # distance_weight_component in (0,1], higher when close.

    # For rating/popularity combined weight factor we use (1 - e^-x_pop) where x_pop is a function of num_ratings (or maybe of normalized num_ratings).
    # We want rating+num_ratings to account for 0%..45% of the final score as function of (1 - e^-x_pop).
    # Let x_pop = alpha * normalized_num_ratings where normalized_num_ratings is 0..1; choose alpha so effect is visible.
    alpha = 3.0
    x_pop = alpha * num_ratings_norm
    pop_factor = 1 - pd.Series([exp(-val) for val in x_pop], index=num_ratings.index)  # 0..(1- e^-alpha) ~ 0..0.95

    # Now compute the dynamic weights per-row:
    # - distance contributes between 20% and 100% as function of e^-x (they asked: "as it gets bigger, the weight goes from 20% to 100%".
    #   Interpretation: When distance_weight_component is small (far), distance weight should be near 20% (0.2); when large (close), near 100% (1.0).
    #   We'll map distance_weight_component (0..1] -> weight multiplier in [0.2, 1.0] linearly.
    dist_weight_multiplier = 0.2 + 0.8 * distance_weight_component  # in [0.2,1.0]

    # - rating+num_ratings should account for 0%..45% of the rating as function of (1 - e^-x) i.e., pop_factor.
    #   We'll set max_pop_weight = 0.45 and use pop_factor to scale 0..0.45
    pop_weight = 0.45 * pop_factor  # per-row in [0, ~0.45]

    # Remaining weight goes to percent_filled (we'll denote fill_weight). Total dynamic allocation:
    # Let base distance influence be proportional to dist_weight_multiplier (we'll normalize sum of dynamic parts later).
    # For simpler interpretation: let three components raw weights be:
    #   w_dist_raw = dist_weight_multiplier
    #   w_pop_raw = pop_weight (already <=0.45)
    #   w_fill_raw = 1.0  (baseline)
    # Then normalize so sum = 1. Finally use these normalized weights to combine component scores.
    w_dist_raw = dist_weight_multiplier
    w_pop_raw = pop_weight
    w_fill_raw = pd.Series([1.0] * len(dataBase), index=dataBase.index)

    # Sum and normalize per-row
    weight_sum = w_dist_raw + w_pop_raw + w_fill_raw
    w_dist = w_dist_raw / weight_sum
    w_pop = w_pop_raw / weight_sum
    w_fill = w_fill_raw / weight_sum

    # For the "population/rating" component value, combine normalized rating and normalized num_ratings (both 0..1).
    # Use equal internal weighting between rating_norm and num_ratings_norm for their component.
    pop_value = (rating_norm + num_ratings_norm) / 2.0  # 0..1

    # Final score per row: weighted sum of
    # - distance contribution (we'll use distance_weight_component as the desirability measure for distance)
    # - pop_value (rating/popularity)
    # - filled_score (percent free desirability)
    scores = []
    for i in dataBase.index:
        d_contrib = distance_weight_component.loc[i]  # higher = closer
        p_contrib = pop_value.loc[i]
        f_contrib = filled_score.loc[i]

        score = (w_dist.loc[i] * d_contrib) + (w_pop.loc[i] * p_contrib) + (w_fill.loc[i] * f_contrib)
        # clamp 0..1
        score = max(0.0, min(1.0, float(score)))
        scores.append(score)

    return scores  # list aligned with DataFrame index

def getRankedList(dataBase, user):
    scores = getWeightedAverageForDBIndex(dataBase, user)
    paired = []
    for idx in dataBase.index:
        row_dict = dataBase.loc[idx].to_dict()
        paired.append({"row": row_dict, "score": float(scores[idx])})
    paired.sort(key=lambda x: x["score"], reverse=True)
    return paired

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
