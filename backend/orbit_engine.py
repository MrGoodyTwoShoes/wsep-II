"""
orbit_engine.py — WSEP satellite position engine.

Uses simplified circular-orbit mechanics (Keplerian model) to propagate
satellite ground-tracks in real time, without requiring sgp4 as a dependency.

Key formulae
------------
Orbital period (s):
    T = 2π * sqrt(a³ / μ)
    where  a = R_earth + altitude_km  (semi-major axis, km)
           μ = 398,600.4418 km³/s²   (Earth's gravitational parameter)

Mean motion (deg/s):
    n = 360 / T

Ground-track longitude advance per second (accounts for Earth rotation):
    Δλ = n_ground = n - ω_earth   (ω_earth ≈ 0.004178° /s  =  360/86 164 s)

Sub-satellite latitude at time t (inclined circular orbit):
    φ(t) = arcsin( sin(inc) * sin(u(t)) )
    where u(t) = (u_0 + n * t) mod 360    (argument of latitude)

Sub-satellite longitude:
    λ(t) = λ_0 + (n_ground * t) - RAAN_drift
    RAAN drift due to J2 oblateness (°/day):
        Ω̇ = -2.06474e14 * n_rev * cos(inc) / a^7/2 / (1-e²)²
        simplified for e=0 → Ω̇ ≈ -9.964 * (R_earth/a)^(7/2) * cos(inc) deg/day
"""

from datetime import datetime
import math

# ── Physical constants ──────────────────────────────────────────────────────
R_EARTH_KM   = 6_371.0          # mean radius
MU           = 398_600.4418     # km³ s⁻²  standard gravitational parameter
OMEGA_EARTH  = 360.0 / 86_164.0 # deg s⁻¹  Earth sidereal rotation rate


def _orbital_period_s(altitude_km: float) -> float:
    """T = 2π √(a³/μ)"""
    a = R_EARTH_KM + altitude_km
    return 2.0 * math.pi * math.sqrt(a ** 3 / MU)


def _mean_motion_deg_s(altitude_km: float) -> float:
    """n = 360 / T  (degrees per second)"""
    return 360.0 / _orbital_period_s(altitude_km)


def _j2_raan_drift_deg_s(altitude_km: float, inc_deg: float) -> float:
    """
    Secular RAAN drift due to Earth's J2 oblateness.
    Ω̇ ≈ -9.964 * (R_earth / a)^(7/2) * cos(inc)   [deg / day]
    """
    a = R_EARTH_KM + altitude_km
    drift_deg_day = -9.964 * ((R_EARTH_KM / a) ** 3.5) * math.cos(math.radians(inc_deg))
    return drift_deg_day / 86_400.0  # convert to deg/s


def propagate_ground_track(
    altitude_km: float,
    inclination_deg: float,
    raan_0_deg: float,
    u_0_deg: float,
    epoch_unix: float,
    t_unix: float
) -> dict:
    """
    Propagate a satellite's sub-satellite point from epoch to t_unix.

    Returns {'lat': float, 'lng': float, 'altitude_km': float,
             'period_min': float, 'velocity_km_s': float,
             'formulae': {...}}
    """
    dt = t_unix - epoch_unix                      # seconds since epoch

    n       = _mean_motion_deg_s(altitude_km)     # deg/s mean motion
    n_gnd   = n - OMEGA_EARTH                     # ground-track advance rate
    j2_dot  = _j2_raan_drift_deg_s(altitude_km, inclination_deg)

    # Argument of latitude at t
    u_t = (u_0_deg + n * dt) % 360.0

    # Sub-satellite latitude  φ = arcsin(sin(inc) · sin(u))
    sin_phi = math.sin(math.radians(inclination_deg)) * math.sin(math.radians(u_t))
    lat = math.degrees(math.asin(max(-1.0, min(1.0, sin_phi))))

    # Sub-satellite longitude  λ = λ_0 + n_gnd·dt + J2_drift·dt
    lng = (raan_0_deg + n_gnd * dt + j2_dot * dt) % 360.0
    if lng > 180.0:
        lng -= 360.0

    # Orbital velocity  v = √(μ / a)
    a = R_EARTH_KM + altitude_km
    velocity_km_s = math.sqrt(MU / a)

    period_min = _orbital_period_s(altitude_km) / 60.0

    return {
        'lat': round(lat, 5),
        'lng': round(lng, 5),
        'altitude_km': altitude_km,
        'period_min': round(period_min, 2),
        'velocity_km_s': round(velocity_km_s, 3),
        'formulae': {
            'T_s':       f'T = 2π√(a³/μ) = {_orbital_period_s(altitude_km):.1f} s',
            'n_deg_s':   f'n = 360/T = {n:.6f} °/s',
            'n_gnd':     f'n_gnd = n − ω_Earth = {n_gnd:.6f} °/s',
            'J2_drift':  f'Ω̇(J2) = {j2_dot*86400:.4f} °/day',
            'lat_eq':    'φ = arcsin(sin(inc)·sin(u))',
            'lng_eq':    'λ = RAAN₀ + n_gnd·Δt + J2_drift·Δt',
            'v_eq':      f'v = √(μ/a) = {velocity_km_s:.3f} km/s',
        }
    }


def _future_track(altitude_km, inc_deg, raan_0, u_0, epoch, steps=90, step_s=60):
    """Generate a ground-track polyline: list of [lat, lng] for the next `steps` minutes."""
    track = []
    for i in range(steps):
        t = epoch + i * step_s
        pt = propagate_ground_track(altitude_km, inc_deg, raan_0, u_0, epoch, t)
        track.append([pt['lat'], pt['lng']])
    return track


# ── Satellite catalogue ─────────────────────────────────────────────────────
# Columns: name, origin, category, alt_km, inc_deg, raan_0, u_0, year, data_focus, data_rate_kbps
_CATALOGUE = [
    # ── Kenya-made ────────────────────────────────────────────────────────
    ('1KUNS-PF',       'Kenya',         'kenya',          400, 51.6,  37.0,   0.0, 2018, 'Tech demo / STEM outreach',              50),
    ('Taifa-1',        'Kenya',         'kenya',          530, 43.0,  42.0,  60.0, 2023, 'Multispectral Earth observation',       120),
    # ── African-made ──────────────────────────────────────────────────────
    ('ZACUBE-2',       'South Africa',  'african',        580, 97.0,  18.0,  45.0, 2018, 'HF comms / ship AIS / space weather',   80),
    ('NigeriaSat-2',   'Nigeria',       'african',        700, 98.5,  25.0,  90.0, 2011, 'Multispectral land-use imagery',       200),
    ('EgyptSat-2',     'Egypt',         'african',        680, 97.9,  32.0, 135.0, 2014, 'High-res optical earth imaging',       250),
    ('ETRSS-1',        'Ethiopia',      'african',        600, 97.8,  12.0, 165.0, 2019, 'Remote sensing / agriculture',         180),
    ('GhanaSat-1',     'Ghana',         'african',        400, 51.6,  40.0, 200.0, 2017, 'Fisheries & coastal monitoring',        45),
    ('Mohammed-VI-A',  'Morocco',       'african',        620, 98.1, -10.0, 240.0, 2017, 'High-res optical reconnaissance',      300),
    # ── International satellites over Africa ──────────────────────────────
    ('Sentinel-2A',    'Europe (ESA)',   'international',  786, 98.6, -15.0, 280.0, 2015, 'Land / agri / vegetation (13 bands)',  450),
    ('Landsat-9',      'USA (USGS)',     'international',  705, 98.2,   5.0, 310.0, 2021, 'Land use / land cover change LULC',   384),
    ('Terra',          'USA (NASA)',     'international',  705, 98.2,  20.0, 350.0, 1999, 'MODIS: climate, vegetation, snow',    300),
    ('ISS',            'International', 'international',  408, 51.6,   0.0, 300.0, 1998, 'Multi-discipline research platform', 1000),
    # ── Climate / weather data satellites ────────────────────────────────
    ('NOAA-20',        'USA (NOAA)',     'climate',        824, 98.7,  -5.0,  20.0, 2017, 'VIIRS: weather, sea-surface, ozone',   500),
    ('Suomi-NPP',      'USA (NASA)',     'climate',        824, 98.7,  10.0,  50.0, 2011, 'CO₂, aerosols, cloud, radiance',       300),
    ('Aqua-MODIS',     'USA (NASA)',     'climate',        705, 98.2,  30.0,  80.0, 2002, 'Sea temp, precipitation, humidity',    350),
]

# epoch: Jan 1 2026 00:00 UTC  (stable reference so positions are consistent across calls)
EPOCH_UNIX = 1_767_225_600.0


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
                'timestamp': data['timestamp'],
                'source': 'open-notify live'
            }
    except Exception:
        pass
    return None   # will be filled from propagated ISS position


def _kenya_climate_data():
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
            {'day': 'Tue', 'condition': 'Rain',           'high': 29, 'low': 21},
            {'day': 'Wed', 'condition': 'Cloudy',         'high': 30, 'low': 21},
            {'day': 'Thu', 'condition': 'Sun + clouds',   'high': 31, 'low': 22},
            {'day': 'Fri', 'condition': 'Thunderstorms',  'high': 28, 'low': 20},
            {'day': 'Sat', 'condition': 'Mostly sunny',   'high': 32, 'low': 22},
            {'day': 'Sun', 'condition': 'Sunny',          'high': 33, 'low': 22}
        ]
    }


def compute_satellite_positions():
    """
    Propagate all catalogue satellites to 'now', return positions + orbit tracks.
    """
    now = datetime.utcnow().timestamp()

    sats = []
    iss_live = _iss_location()

    for idx, (name, origin, category, alt_km, inc, raan0, u0, year, data_focus, data_rate_kbps) in enumerate(_CATALOGUE, start=1):
        pos = propagate_ground_track(alt_km, inc, raan0, u0, EPOCH_UNIX, now)

        # For ISS prefer live API lat/lng if available, but keep propagated for track
        if name == 'ISS' and iss_live:
            pos['lat'] = iss_live['lat']
            pos['lng'] = iss_live['lng']

        track = _future_track(alt_km, inc, raan0, u0, EPOCH_UNIX, steps=90, step_s=60)

        over_kenya  = -4  <= pos['lat'] <= 4  and 33 <= pos['lng'] <= 42
        in_africa   = -35 <= pos['lat'] <= 37 and -20 <= pos['lng'] <= 55

        sats.append({
            'id':               idx,
            'name':             name,
            'origin':           origin,
            'category':         category,          # kenya | african | international | climate
            'deployed_year':    year,
            'data_focus':       data_focus,
            'data_rate_kbps':   data_rate_kbps,
            'orbit':            'LEO',
            'altitude_km':      alt_km,
            'inclination_deg':  inc,
            'position': {
                'lat': pos['lat'],
                'lng': pos['lng']
            },
            'period_min':       pos['period_min'],
            'velocity_km_s':    pos['velocity_km_s'],
            'over_africa':      bool(in_africa),
            'over_kenya':       bool(over_kenya),
            'ground_track':     track,         # list of [lat, lng]
            'formulae':         pos['formulae'],
            'climate_data':     _kenya_climate_data() if over_kenya else None
        })

    iss_pos = next((s for s in sats if s['name'] == 'ISS'), sats[-1])

    return {
        'count':            len(sats),
        'satellites':       sats,
        'kenya_climate':    _kenya_climate_data(),
        'weather_forecast': _weather_forecast(),
        'iss_location':     iss_live or {'lat': iss_pos['position']['lat'],
                                         'lng': iss_pos['position']['lng'],
                                         'source': 'propagated'}
    }

