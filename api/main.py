# api/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from predictor import predict_eta
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from predictor import get_route_distance_km

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:3000"] for stricter security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class Coords(BaseModel):
    start: list[float]
    end: list[float]

# from api.predictor import get_route_distance_km

@app.post("/get-distance")
def get_distance(coords: Coords):
    dist_km, route_coords = get_route_distance_km(coords.start, coords.end)
    return {
        "distance_km": round(dist_km, 2),
        "route_coords": route_coords
    }


class ETARequest(BaseModel):
    distance_km: float
    order_items: int
    weather: str
    traffic: int
    rider_queue: int
    prep_time_min: int
    order_hour: int

@app.get("/")
def read_root():
    return {"message": "SmartETA API is live"}

@app.post("/predict")
def get_eta(request: ETARequest):
    data = request.dict()
    eta = predict_eta(data)
    return {"predicted_eta": eta}
