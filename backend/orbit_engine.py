from datetime import datetime
import math


def _iss_location():
    try:
        import requests
        res = requests.get('http://api.open-notify.org/iss-now.json', timeout=4)
        res.raise_for_status()
        data = res.json()
        if data.get('message') == 'success':
            return {
                'lat': float(data['iss_position']['latitude']),
                'lng': float(data['iss_position']['longitude']),
                'timestamp': data['timestamp']
            }
    except Exception:
        pass

    # fallback / best effort static estimate if external service unavailable
    return {
        'lat': 0.0,
        'lng': 0.0,
        'timestamp': int(datetime.utcnow().timestamp()),
        'note': 'live ISS API not available; placeholder coordinates'
    }


def _kenya_climate_data():
    # Mock climate data oriented to Kenya, can be replaced by real observed sources.
    return {
        'temperature_c': 23.4,
        'humidity_pct': 72,
        'co2_ppm': 412.5,
        'rainfall_mm': 2.3,
        'air_quality_index': 72,
        'vegetation_index': 0.51
    }


def _weather_forecast():
    return {
        'today': 'Mostly sunny with isolated showers. 23–30°C.',
        'tomorrow': 'Partly cloudy; brief afternoon thunderstorms. 24–31°C.',
        'week': [
            {'day': 'Mon', 'condition': 'Clouds/Showers', 'high': 31, 'low': 22},
            {'day': 'Tue', 'condition': 'Rain', 'high': 29, 'low': 21},
            {'day': 'Wed', 'condition': 'Cloudy', 'high': 30, 'low': 21},
            {'day': 'Thu', 'condition': 'Sun + clouds', 'high': 31, 'low': 22},
            {'day': 'Fri', 'condition': 'Thunderstorms', 'high': 28, 'low': 20},
            {'day': 'Sat', 'condition': 'Mostly sunny', 'high': 32, 'low': 22},
            {'day': 'Sun', 'condition': 'Sunny', 'high': 33, 'low': 22}
        ]
    }


def compute_satellite_positions():
    """Return a set of Africa-focused LEO satellites with metadata and climate output."""
    center = {'lat': 0.0, 'lng': 20.0}
    providers = [
        {'name': 'KenSat-K1', 'origin': 'Kenya', 'deployed': 2023, 'expected_return': 'not expected to return home'},
        {'name': 'AfriObserver-2', 'origin': 'South Africa', 'deployed': 2022, 'expected_return': 2048},
        {'name': 'NileEye-3', 'origin': 'Egypt', 'deployed': 2021, 'expected_return': 2050},
        {'name': 'BlueNile-4', 'origin': 'Nigeria', 'deployed': 2024, 'expected_return': 2062},
        {'name': 'EuroClimate-5', 'origin': 'Europe', 'deployed': 2025, 'expected_return': 2075},
        {'name': 'ISS', 'origin': 'International', 'deployed': 1998, 'expected_return': 'not expected to return home'}
    ]

    sats = []
    now = datetime.utcnow()
    angle_base = now.timestamp() * 0.08

    for idx, meta in enumerate(providers, start=1):
        angle = (angle_base + idx * 60) % 360
        radius = 3.5 + (idx * 0.3)
        lat = center['lat'] + math.sin(math.radians(angle)) * radius
        lng = (center['lng'] + math.cos(math.radians(angle)) * radius + 180) % 360 - 180
        # keep within Africa bounds roughly
        if lat > 35: lat = 35
        if lat < -35: lat = -35
        if lng > 55: lng = 55
        if lng < -20: lng = -20

        over_kenya = -4 <= lat <= 4 and 33 <= lng <= 42
        in_africa = -35 <= lat <= 35 and -20 <= lng <= 55

        sat = {
            'id': idx,
            'name': meta['name'],
            'origin': meta['origin'],
            'deployed_year': meta['deployed'],
            'expected_return': meta['expected_return'],
            'orbit': 'LEO',
            'altitude_km': round(400 + idx * 30, 2),
            'position': {
                'lat': round(lat, 6),
                'lng': round(lng, 6)
            },
            'over_africa': bool(in_africa),
            'over_kenya': bool(over_kenya),
            'climate_data': _kenya_climate_data() if over_kenya else None
        }

        sats.append(sat)

    return {
        'count': len(sats),
        'satellites': sats,
        'kenya_climate': _kenya_climate_data(),
        'weather_forecast': _weather_forecast(),
        'iss_location': _iss_location()
    }

