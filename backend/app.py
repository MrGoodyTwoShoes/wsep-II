from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from orbit_engine import compute_satellite_positions
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5175", "http://localhost:5174", "http://127.0.0.1:5175", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# County coordinates for Kenya
COUNTY_COORDINATES = {
    'Mombasa': [39.6652, -4.0435],
    'Kwale': [39.4169, -4.6578],
    'Kilifi': [39.5469, -3.6298],
    'Tana River': [40.3006, -2.8001],
    'Lamu': [40.9031, -2.2825],
    'Taita-Taveta': [38.4669, -3.4031],
    'Garissa': [39.6469, 0.4534],
    'Wajir': [40.0554, 1.7400],
    'Mandera': [41.8606, 3.9375],
    'Marsabit': [37.6652, 2.7169],
    'Isiolo': [37.5873, 0.3517],
    'Meru': [37.6660, 0.0315],
    'Tharaka-Nithi': [37.8997, -0.4889],
    'Embu': [37.4621, -0.5348],
    'Kitui': [38.3670, -1.3143],
    'Machakos': [37.2652, -1.5171],
    'Makueni': [37.7469, -2.7241],
    'Nyandarua': [36.3671, -0.4292],
    'Nyeri': [36.9497, -0.4167],
    'Kirinyaga': [37.2717, -0.6367],
    "Murang'a": [36.7073, -0.6762],
    'Kiambu': [36.8099, -1.0253],
    'Turkana': [35.3395, 2.3184],
    'West Pokot': [35.2927, 1.4050],
    'Samburu': [37.1808, 1.1050],
    'Trans-Nzoia': [34.9027, 0.8194],
    'Uasin Gishu': [35.2981, 0.9117],
    'Elgeyo-Marakwet': [35.3192, 0.5383],
    'Nandi': [34.9568, 0.3964],
    'Baringo': [35.7806, 0.6289],
    'Laikipia': [36.7184, -0.0500],
    'Nakuru': [36.0726, -0.3031],
    'Narok': [35.4264, -1.0829],
    'Kajiado': [36.7796, -2.0469],
    'Kericho': [34.9336, -0.3667],
    'Bomet': [34.8000, -0.7878],
    'Kakamega': [34.7517, 0.2833],
    'Vihiga': [34.7337, 0.1064],
    'Bungoma': [34.5681, 0.5717],
    'Busia': [34.1121, 0.4744],
    'Siaya': [34.2822, 0.1778],
    'Kisumu': [34.7641, -0.1022],
    'Homabay': [34.4758, -0.5207],
    'Migori': [34.4731, -1.0597],
    'Kisii': [34.7767, -0.6833],
    'Nyamira': [34.9333, -0.5647],
    'Nairobi': [36.8219, -1.2921]
}

COUNTY_NAMES = list(COUNTY_COORDINATES.keys())

@app.get("/")
def home():
    return {"message": "WSEP backend online"}

@app.get("/satellites")
def satellites():
    return compute_satellite_positions()

@app.get("/dashboard")
def dashboard():
    """Unified dashboard endpoint returning all data for frontend."""
    import random
    
    baseline = {'temperature': 24.5, 'vegetation': 0.55, 'airQuality': 60}
    
    # Generate county data
    county_data = []
    for idx, name in enumerate(COUNTY_NAMES, start=1):
        county_data.append({
            'id': idx,
            'name': name,
            'temperature': round(baseline['temperature'] + (random.random() - 0.5) * 3, 2),
            'vegetation': round(baseline['vegetation'] + (random.random() - 0.25) * 0.4, 3),
            'airQuality': round(baseline['airQuality'] + (random.random() - 0.5) * 20, 1),
            'floodRisk': int(random.random() * 100),
            'droughtRisk': int(random.random() * 100),
            'heatwaveRisk': int(random.random() * 100)
        })
    
    # County geo features
    counties_geo = {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'properties': {'id': c['id'], 'name': c['name']},
                'geometry': {
                    'type': 'Point',
                    'coordinates': COUNTY_COORDINATES.get(c['name'], [36.8219, -1.2921])
                }
            }
            for c in county_data
        ]
    }
    
    # Get satellite data from orbit engine
    sat_payload = compute_satellite_positions()
    
    return {
        'global': {
            'temperature': 26.4,
            'co2': 426.1,
            'renewableShare': 46.2,
            'risk': 37.7
        },
        'energy': [
            {'name': 'Solar', 'value': 38},
            {'name': 'Wind', 'value': 22},
            {'name': 'Hydro', 'value': 28},
            {'name': 'Fossil', 'value': 12}
        ],
        'transport': {
            'petrol': 42,
            'diesel': 28,
            'ev': 30,
            'co2Reduction': 11,
            'adoptionTrend': [
                {'month': m, 'ev': v} for m, v in [
                    ('Jan', 15), ('Feb', 17), ('Mar', 21), ('Apr', 25), ('May', 28), ('Jun', 30),
                    ('Jul', 32), ('Aug', 35), ('Sep', 37), ('Oct', 39), ('Nov', 41), ('Dec', 44)
                ]
            ]
        },
        'trends': [
            {'time': '2018', 'temperature': 23.6, 'rainfall': 112, 'co2': 398},
            {'time': '2019', 'temperature': 24.0, 'rainfall': 105, 'co2': 404},
            {'time': '2020', 'temperature': 24.5, 'rainfall': 97, 'co2': 412},
            {'time': '2021', 'temperature': 25.0, 'rainfall': 101, 'co2': 418},
            {'time': '2022', 'temperature': 25.8, 'rainfall': 94, 'co2': 423},
            {'time': '2023', 'temperature': 26.4, 'rainfall': 102, 'co2': 426}
        ],
        'satelliteInsights': [
            {'id': 1, 'label': 'Vegetation loss in Turkana', 'severity': 'high', 'score': 84},
            {'id': 2, 'label': 'Urban heat increase Nairobi', 'severity': 'medium', 'score': 61},
            {'id': 3, 'label': 'Coastal erosion Mombasa', 'severity': 'high', 'score': 78},
            {'id': 4, 'label': 'Wetland shrinkage Kisumu', 'severity': 'low', 'score': 32}
        ],
        'riskAlerts': [
            {'id': 'flood', 'title': 'Flood', 'level': 'high', 'message': 'Western river basins alert: heavy rainfall expected.'},
            {'id': 'drought', 'title': 'Drought', 'level': 'medium', 'message': 'Southeast counties under moisture deficit 22%.'},
            {'id': 'heatwave', 'title': 'Heatwave', 'level': 'high', 'message': 'Nairobi and surrounding areas above 34°C for next 3 days.'}
        ],
        'projections': {
            'temperatureRise': 2.8,
            'riskEscalation': 17,
            'timeline': [
                {'year': 2025, 'temperature': 26.1, 'risk': 40},
                {'year': 2030, 'temperature': 27.8, 'risk': 52},
                {'year': 2035, 'temperature': 28.9, 'risk': 63},
                {'year': 2040, 'temperature': 30.2, 'risk': 74}
            ]
        },
        'countyData': county_data,
        'countiesGeo': counties_geo,
        'satellites': sat_payload
    }


def _county_bbox(county_name):
    base = COUNTY_COORDINATES.get(county_name)
    if not base:
        return -4.9, 33.5, 4.8, 41.9  # broad Kenya bounds

    lng, lat = base
    delta = 0.8
    return lat - delta, lng - delta, lat + delta, lng + delta


def _road_quality_from_surface(surface):
    scoring = {
        'asphalt': 90,
        'paved': 85,
        'concrete': 88,
        'gravel': 55,
        'compact': 60,
        'dirt': 30,
        'sand': 22,
        'mud': 18,
        'unknown': 50
    }
    return scoring.get(surface, 50)


@app.get('/road-status')
def road_status(county: str = None):
    import requests
    from statistics import mean

    if county:
        min_lat, min_lng, max_lat, max_lng = _county_bbox(county)
        area_label = county
    else:
        min_lat, min_lng, max_lat, max_lng = -4.9, 33.5, 4.8, 41.9
        area_label = 'Kenya (region)'

    query = f"""[out:json][timeout:20];
(
  way['highway']({min_lat},{min_lng},{max_lat},{max_lng});
);
out body geom tags;"""

    highways = []
    overall_scores = []

    try:
        response = requests.get('https://overpass-api.de/api/interpreter', params={'data': query}, timeout=30)
        response.raise_for_status()
        data = response.json()

        for elem in data.get('elements', []):
            tags = elem.get('tags', {})
            highway = tags.get('highway')
            if not highway:
                continue
            surface = tags.get('surface', 'unknown').lower()
            condition = tags.get('condition', 'unknown').lower()
            score = _road_quality_from_surface(surface)
            if condition in ['bad', 'very_bad', 'poor']:
                score = max(0, score - 30)
            if condition in ['excellent', 'good', 'fair']:
                score = min(100, score + 10)

            overall_scores.append(score)

            highways.append({
                'id': elem.get('id'),
                'name': tags.get('name', 'unknown'),
                'highway': highway,
                'surface': surface,
                'condition': condition,
                'quality_score': score,
                'length_m': round(elem.get('length', 0) if elem.get('length') else 0, 1)
            })

            if len(highways) >= 20:
                break

    except Exception:
        highways = []
        overall_scores = []

    avg_quality = round(mean(overall_scores), 1) if overall_scores else 56.3

    return {
        'area': area_label,
        'roadCount': len(highways),
        'roadQuality': avg_quality,
        'driveTime': 'approx. 2h 10m',
        'nextInspection': '2 months',
        'highways': highways
    }