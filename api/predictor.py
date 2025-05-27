# api/predictor.py
import joblib
import pandas as pd
import requests
from pathlib import Path
import os
from dotenv import load_dotenv
load_dotenv()
import os
# Load environment variables
# Ensure you have a .env file with ORS_API_KEY defined


dotenv_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=dotenv_path)

ORS_API_KEY = os.getenv("ORS_API_KEY")
print("🔑 Loaded ORS_API_KEY:", ORS_API_KEY)  # Debug log

def get_route_distance_km(start, end):
    url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"
    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "coordinates": [
            [start[1], start[0]],  # ORS expects [lng, lat]
            [end[1], end[0]]
        ]
    }

    response = requests.post(url, headers=headers, json=body)

    print("🔁 ORS response status:", response.status_code)
    print("📦 ORS response text:", response.text)

    if response.status_code != 200:
        raise Exception("Failed to fetch route from ORS")

    data = response.json()

    route_coords = [
        [lat, lng] for lng, lat in data["features"][0]["geometry"]["coordinates"]
    ]
    dist_km = data["features"][0]["properties"]["summary"]["distance"] / 1000

    return dist_km, route_coords
# Load trained model
# model = joblib.load("model/xgb_eta_model1.pkl")
# print("✅ Model loaded:", type(model))


model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model", "xgb_eta_model1.pkl")
model = joblib.load(model_path)

def predict_eta(data: dict) -> float:
    """
    Accepts a dict and returns predicted delivery time.
    """
    df = pd.DataFrame([data])
    prediction = model.predict(df)[0]
    return float(round(prediction, 2))

