from fastapi import FastAPI
from orbit_engine import compute_satellite_positions

app = FastAPI()

@app.get("/")
def home():
    return {"message": "WSEP backend online"}

@app.get("/satellites")
def satellites():

    sats = compute_satellite_positions()

    return {
        "count": len(sats),
        "satellites": sats[:20]
    }