import pandas as pd
df= pd.read_csv("coffee_shops.csv")

df= df.dropna()
df.columns = [
    "Number of Customers Per Day",
    "Average Order Value",
    "Operating Hours Per Day",
    "Number of Employees",
    "Marketing Spend Per Day",
    "Location Foot Traffic",
    "Daily Revenue"
]
df.to_csv("coffee_shops.csv", index=False)
