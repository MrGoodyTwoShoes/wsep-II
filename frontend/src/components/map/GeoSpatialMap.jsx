import { useMemo, useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cashCropData } from '../../data/mockData'

// ── Static transport corridors (shown when no county selected) ──────────────
const TRANSPORT_ROUTES = [
    { name: 'SGR / A109  Nairobi–Mombasa', coords: [[-1.2921, 36.8219], [-2.0, 38.2], [-4.0435, 39.6652]], color: '#22d3ee' },
    { name: 'A1  Nairobi–Kisumu',           coords: [[-1.2921, 36.8219], [-0.6, 36.0], [-0.1022, 34.7641]], color: '#22d3ee' },
    { name: 'A104  Nairobi–Eldoret',        coords: [[-1.2921, 36.8219], [-0.5, 35.8], [0.5144, 35.2698]], color: '#22d3ee' },
    { name: 'B8  Kisumu–Mombasa coast',     coords: [[-0.1022, 34.7641], [-1.5, 37.5], [-4.0435, 39.6652]], color: '#a78bfa' },
]

// ── Satellite colour by category ────────────────────────────────────────────
const SAT_COLORS = {
    kenya:         '#39ff14',
    african:       '#facc15',
    international: '#c084fc',
    climate:       '#67e8f9',
    // legacy origin-based fallbacks
    'Kenya':         '#39ff14',
    'South Africa':  '#facc15',
    'Egypt':         '#fb923c',
    'Nigeria':       '#f472b6',
    'Europe':        '#67e8f9',
    'International': '#c084fc',
    'USA':           '#a78bfa',
}
function satColor(sat) {
    return SAT_COLORS[sat.category] || SAT_COLORS[sat.origin] || '#ffffff'
}

// ── Route style based on quality + flood risk ────────────────────────────────
// road:  good → 🟢 green  /  medium → 🟡 yellow  /  poor → 🔴 red
// water: safe → 🔵 blue   /  flood risk > 60 → 💙 bright cyan (UNSAFE)
export function getRouteStyle(baseQuality, floodRisk, transportType) {
    if (transportType === 'water') {
        if (floodRisk > 60) return { color: '#00ffff', weight: 5,   opacity: 1.0,  dashArray: null,    label: '⚠ Unsafe — flooding' }
        return                      { color: '#1a88ff', weight: 3,   opacity: 0.88, dashArray: '5 5',   label: '✓ Safe waterway' }
    }
    // Road — degrade quality by flood risk
    let quality = baseQuality
    if      (floodRisk > 70)                               quality = 'poor'
    else if (floodRisk > 40 && baseQuality === 'good')     quality = 'medium'
    else if (floodRisk > 40 && baseQuality === 'medium')   quality = 'poor'

    if (quality === 'good')   return { color: '#39ff14', weight: 3.5, opacity: 0.92, dashArray: null,    label: '✓ Good — clear weather' }
    if (quality === 'medium') return { color: '#facc15', weight: 2.5, opacity: 0.85, dashArray: '5 6',   label: '⚡ Moderate risk' }
    return                           { color: '#ef4444', weight: 2.5, opacity: 0.80, dashArray: '3 8',   label: '✗ High risk / poor road' }
}

// ── View controller — animates map camera ─────────────────────────────────
function MapController({ center, zoom, triggerRef }) {
    const map = useMap()
    useEffect(() => {
        // Only pan when an explicit view-button click set the gate flag.
        // This prevents satellite ticks / re-renders from snapping the map.
        if (!triggerRef.current) return
        triggerRef.current = false
        map.setView(center, zoom, { animate: true, duration: 1.2 })
    }, [center, zoom, map, triggerRef])
    return null
}

// ── County zoom when selection changes ───────────────────────────────────
function CountyZoom({ selectedCounty, countiesGeo }) {
    const map = useMap()
    useEffect(() => {
        if (!selectedCounty || !countiesGeo) return
        const feat = countiesGeo.features.find(f => f.properties.id === selectedCounty)
        if (!feat) return
        const [lng, lat] = feat.geometry.coordinates
        map.flyTo([lat, lng], 10, { animate: true, duration: 1.5 })
    }, [selectedCounty])
    return null
}

// ── Glowing polyline (3 overlapping layers for neon glow) ─────────────────
function GlowPolyline({ positions, color, weight, opacity, dashArray, children }) {
    return (
        <>
            <Polyline positions={positions} pathOptions={{ color, weight: weight + 8, opacity: opacity * 0.08, dashArray: null, lineCap: 'round' }} />
            <Polyline positions={positions} pathOptions={{ color, weight: weight + 3, opacity: opacity * 0.28, dashArray: null, lineCap: 'round' }} />
            <Polyline positions={positions} pathOptions={{ color, weight, opacity, dashArray, lineCap: 'round' }}>
                {children}
            </Polyline>
        </>
    )
}

// ── JavaScript orbital propagator (mirrors orbit_engine.py) ─────────────────
// Runs client-side so satellites are always visible even when backend is offline.
const _R  = 6371.0                    // Earth radius km
const _MU = 398600.4418               // gravitational parameter km³/s²
const _WE = 360 / 86164               // Earth sidereal rotation rate deg/s
const _EP = 1_767_225_600.0           // epoch: 2026-01-01 00:00 UTC (unix)

function _period(alt) { const a = _R + alt; return 2 * Math.PI * Math.sqrt(a ** 3 / _MU) }
function _propagate(alt, inc, raan, u0) {
    const dt  = Date.now() / 1000 - _EP
    const n   = 360 / _period(alt)
    const ng  = n - _WE
    const a   = _R + alt
    const j2  = -9.964 * Math.pow(_R / a, 3.5) * Math.cos(inc * Math.PI / 180) / 86400
    const uT  = ((u0 + n * dt) % 360 + 360) % 360
    const lat = Math.asin(Math.max(-1, Math.min(1, Math.sin(inc * Math.PI / 180) * Math.sin(uT * Math.PI / 180)))) * 180 / Math.PI
    let   lng = (raan + ng * dt + j2 * dt) % 360
    if (lng > 180)  lng -= 360
    if (lng < -180) lng += 360
    const v   = Math.sqrt(_MU / a)
    return {
        lat: +lat.toFixed(5), lng: +lng.toFixed(5),
        period_min: +(_period(alt) / 60).toFixed(2),
        velocity_km_s: +v.toFixed(3),
        formulae: {
            T_s:      `T = 2π√(a³/μ) = ${_period(alt).toFixed(1)} s`,
            n_deg_s:  `n = 360/T = ${n.toFixed(6)} °/s`,
            n_gnd:    `n_gnd = n − ω_Earth = ${ng.toFixed(6)} °/s`,
            J2_drift: `Ω̇(J2) = ${(j2 * 86400).toFixed(4)} °/day`,
            lat_eq:   'φ = arcsin(sin(inc)·sin(u))',
            lng_eq:   'λ = RAAN₀ + n_gnd·Δt + J2_drift·Δt',
            v_eq:     `v = √(μ/a) = ${v.toFixed(3)} km/s`,
        }
    }
}
function _track(alt, inc, raan, u0, steps = 90) {
    const dt0 = Date.now() / 1000
    return Array.from({ length: steps }, (_, i) => {
        const dt   = dt0 + i * 60 - _EP
        const n    = 360 / _period(alt);  const ng = n - _WE
        const a    = _R + alt;  const j2  = -9.964 * Math.pow(_R / a, 3.5) * Math.cos(inc * Math.PI / 180) / 86400
        const uT   = ((u0 + n * dt) % 360 + 360) % 360
        const lat  = Math.asin(Math.max(-1, Math.min(1, Math.sin(inc * Math.PI / 180) * Math.sin(uT * Math.PI / 180)))) * 180 / Math.PI
        let   lng  = (raan + ng * dt + j2 * dt) % 360
        if (lng > 180)  lng -= 360
        if (lng < -180) lng += 360
        return [+lat.toFixed(4), +lng.toFixed(4)]
    })
}
const _CAT = [
    { id: 1,  name: '1KUNS-PF',      origin: 'Kenya',         category: 'kenya',         alt: 400, inc: 51.6, raan:  37.0, u0:   0, data: 'Tech demo / STEM outreach' },
    { id: 2,  name: 'Taifa-1',       origin: 'Kenya',         category: 'kenya',         alt: 530, inc: 43.0, raan:  42.0, u0:  60, data: 'Multispectral Earth observation' },
    { id: 3,  name: 'ZACUBE-2',      origin: 'South Africa',  category: 'african',       alt: 580, inc: 97.0, raan:  18.0, u0:  45, data: 'HF comms / ship AIS / space weather' },
    { id: 4,  name: 'NigeriaSat-2',  origin: 'Nigeria',       category: 'african',       alt: 700, inc: 98.5, raan:  25.0, u0:  90, data: 'Multispectral land-use imagery' },
    { id: 5,  name: 'EgyptSat-2',    origin: 'Egypt',         category: 'african',       alt: 680, inc: 97.9, raan:  32.0, u0: 135, data: 'High-res optical earth imaging' },
    { id: 6,  name: 'ETRSS-1',       origin: 'Ethiopia',      category: 'african',       alt: 600, inc: 97.8, raan:  12.0, u0: 165, data: 'Remote sensing / agriculture' },
    { id: 7,  name: 'GhanaSat-1',    origin: 'Ghana',         category: 'african',       alt: 400, inc: 51.6, raan:  40.0, u0: 200, data: 'Fisheries & coastal monitoring' },
    { id: 8,  name: 'Mohammed-VI-A', origin: 'Morocco',       category: 'african',       alt: 620, inc: 98.1, raan: -10.0, u0: 240, data: 'High-res optical reconnaissance' },
    { id: 9,  name: 'Sentinel-2A',   origin: 'Europe (ESA)',  category: 'international', alt: 786, inc: 98.6, raan: -15.0, u0: 280, data: 'Land / agri / vegetation (13 bands)' },
    { id: 10, name: 'Landsat-9',     origin: 'USA (USGS)',    category: 'international', alt: 705, inc: 98.2, raan:   5.0, u0: 310, data: 'Land use / land cover change LULC' },
    { id: 11, name: 'Terra',         origin: 'USA (NASA)',    category: 'international', alt: 705, inc: 98.2, raan:  20.0, u0: 350, data: 'MODIS: climate, vegetation, snow' },
    { id: 12, name: 'ISS',           origin: 'International', category: 'international', alt: 408, inc: 51.6, raan:   0.0, u0: 300, data: 'Multi-discipline research platform' },
    { id: 13, name: 'NOAA-20',       origin: 'USA (NOAA)',    category: 'climate',       alt: 824, inc: 98.7, raan:  -5.0, u0:  20, data: 'VIIRS: weather, sea-surface, ozone' },
    { id: 14, name: 'Suomi-NPP',     origin: 'USA (NASA)',    category: 'climate',       alt: 824, inc: 98.7, raan:  10.0, u0:  50, data: 'CO₂, aerosols, cloud, radiance' },
    { id: 15, name: 'Aqua-MODIS',    origin: 'USA (NASA)',    category: 'climate',       alt: 705, inc: 98.2, raan:  30.0, u0:  80, data: 'Sea temp, precipitation, humidity' },
]
function computeAllSats() {
    return _CAT.map(s => {
        const p = _propagate(s.alt, s.inc, s.raan, s.u0)
        const lat = p.lat, lng = p.lng
        return {
            ...s,
            altitude_km: s.alt, inclination_deg: s.inc,
            period_min: p.period_min, velocity_km_s: p.velocity_km_s,
            position: { lat, lng },
            over_kenya:  lat >= -5  && lat <= 5  && lng >= 34 && lng <= 42,
            over_africa: lat >= -36 && lat <= 38 && lng >= -18 && lng <= 52,
            ground_track: _track(s.alt, s.inc, s.raan, s.u0),
            formulae: p.formulae,
            data_focus: s.data,
        }
    })
}

// ── Storm cloud DivIcon — CSS-circle cloud with optional lightning bolt ─────────
function makeStormIcon(danger) {
    const c = danger ? '#1a2f4a' : '#2d4a6b'
    const bolt = danger
        ? `<div style="position:absolute;bottom:-10px;left:15px;font-size:18px;line-height:1;filter:drop-shadow(0 0 6px #fbbf24);color:#fde047;">⚡</div>`
        : ''
    return L.divIcon({
        html: `<div style="position:relative;width:44px;height:42px">
          <div style="position:absolute;bottom:0;left:2px;width:40px;height:20px;background:${c};border-radius:40px 40px 8px 8px;opacity:0.88;box-shadow:0 2px 8px rgba(0,100,200,0.35);"></div>
          <div style="position:absolute;bottom:11px;left:8px;width:18px;height:18px;background:${c};border-radius:50%;opacity:0.93;"></div>
          <div style="position:absolute;bottom:13px;left:18px;width:16px;height:16px;background:${c};border-radius:50%;opacity:0.93;"></div>
          <div style="position:absolute;bottom:15px;left:26px;width:14px;height:14px;background:${c};border-radius:50%;opacity:0.90;"></div>
          ${bolt}
        </div>`,
        className: '',
        iconSize: [44, 52],
        iconAnchor: [22, 44],
    })
}

// ── View presets — defined OUTSIDE component so array refs are stable ─────────
// If defined inside the component, a new array is created on every render,
// which makes MapController's useEffect fire every satellite tick (every 4 s)
// and snap the map back to the preset — preventing free user panning.
const VIEW_CONFIG = {
    global: { center: [20, 20],     zoom: 2   },
    africa: { center: [0,   20],    zoom: 4   },
    kenya:  { center: [-0.2, 37.1], zoom: 6.8 },
}

export default function GeoSpatialMap({
    countiesGeo, countyData, selectedCounty, onSelectCounty, layerState, satelliteData = []
}) {
    // Positions update every 4 s — dots move smoothly across the map.
    // Tracks update every 60 s — fixes the jarring lurch that happened when the
    // 90-min future arc was recomputed from a slightly different "now" every tick.
    // (In 60 s a LEO satellite moves ~460 km; the track shift is imperceptible at global zoom.)
    const [satPositions, setSatPositions] = useState(() => computeAllSats())
    const [satTracks,    setSatTracks]    = useState(() => computeAllSats())
    const [showSats,    setShowSats]    = useState(false)
    const [showHeat,    setShowHeat]    = useState(false)
    const [showFlood,   setShowFlood]   = useState(false)
    const [showStorm,   setShowStorm]   = useState(false)
    const [showKenya,   setShowKenya]   = useState(false)
    const [showAfrican, setShowAfrican] = useState(false)
    const [showIntl,    setShowIntl]    = useState(false)
    const [showClimate, setShowClimate] = useState(false)
    const [viewMode, setViewMode]       = useState('kenya')
    const viewJustChanged = useRef(false)
    const intervalRef     = useRef(null)
    const trackTimerRef   = useRef(null)

    useEffect(() => {
        // Position tick — every 4 s
        const positionTick = () => {
            setSatPositions(computeAllSats())
            fetch('http://127.0.0.1:8000/satellites/live')
                .then(r => r.ok ? r.json() : Promise.reject())
                .then(d => { if (d.satellites?.length > 0) setSatPositions(d.satellites) })
                .catch(() => {})
        }
        positionTick()
        intervalRef.current = setInterval(positionTick, 4000)

        // Track tick — every 60 s (stable arc lines)
        trackTimerRef.current = setInterval(() => setSatTracks(computeAllSats()), 60000)

        return () => {
            clearInterval(intervalRef.current)
            clearInterval(trackTimerRef.current)
        }
    }, [])

    // Merge: fast-moving position dots + slow-moving stable track lines
    const liveSats = useMemo(
        () => satPositions.map(sat => {
            const withTrack = satTracks.find(t => t.id === sat.id)
            return withTrack ? { ...sat, ground_track: withTrack.ground_track } : sat
        }),
        [satPositions, satTracks]
    )

    const combined = useMemo(() => {
        const m = new Map()
        countyData.forEach(c => m.set(c.name, c))
        return m
    }, [countyData])

    const viewConfig = VIEW_CONFIG[viewMode]
    const { center, zoom } = viewConfig

    // Resolve selected county's crop route for the map
    const selectedCropRoute = useMemo(() => {
        if (!selectedCounty) return null
        const feat = countiesGeo.features.find(f => f.properties.id === selectedCounty)
        if (!feat) return null
        const county = combined.get(feat.properties.name)
        if (!county) return null
        const cropInfo = cashCropData[county.name]
        if (!cropInfo) return null
        const style = getRouteStyle(cropInfo.routeQuality, county.floodRisk, cropInfo.transportType)
        return { cropInfo, county, style }
    }, [selectedCounty, countiesGeo, combined])

    return (
        <div className="flex flex-col rounded-xl bg-[#06140e]/80 p-1" style={{ height: '100%', minHeight: '380px' }}>
            {/* ── Controls bar — 2-row layout ── */}
            <div className="flex flex-col gap-0.5 px-2 py-1 text-xs text-green-300 border-b border-green-900/60">
                {/* Row 1: View presets + orbital tracks + terrain overlays */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-green-200 mr-1">View:</span>
                    {['global', 'africa', 'kenya'].map(v => (
                        <button
                            key={v}
                            onClick={() => { viewJustChanged.current = true; setViewMode(v) }}
                            className={`rounded px-2 py-0.5 border transition-all ${viewMode === v ? 'bg-green-500/30 border-green-400 text-green-100' : 'border-green-700/50 hover:border-green-500'}`}
                        >
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowSats(p => !p)}
                        className={`ml-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 font-semibold transition-all ${
                            showSats ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300' : 'border-green-700/50 text-green-600 hover:border-green-500/60'
                        }`}
                    >
                        🛰 Sat Tracks
                        {showSats && <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />{liveSats.length} live</span>}
                    </button>
                    <button onClick={() => setShowHeat(p => !p)} title="Thermal heat signature overlay"
                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-0.5 font-semibold transition-all ${showHeat ? 'bg-orange-400/20 border-orange-400 text-orange-300' : 'border-green-700/50 text-green-600 hover:border-orange-500/60'}`}>
                        🌡 Heat
                    </button>
                    <button onClick={() => setShowFlood(p => !p)} title="Flood risk overlay"
                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-0.5 font-semibold transition-all ${showFlood ? 'bg-blue-400/20 border-blue-400 text-blue-300' : 'border-green-700/50 text-green-600 hover:border-blue-500/60'}`}>
                        🌊 Flood
                    </button>
                    <button onClick={() => setShowStorm(p => !p)} title="Storm cloud overlays on rainy counties"
                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-0.5 font-semibold transition-all ${showStorm ? 'bg-indigo-400/20 border-indigo-400 text-indigo-300 animate-pulse' : 'border-green-700/50 text-green-600 hover:border-indigo-500/60'}`}>
                        ⛈ Storms
                    </button>
                </div>
                {/* Row 2: Per-satellite-category data maps */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-green-200 mr-1">Sat Data:</span>
                    <button onClick={() => setShowKenya(p => !p)}
                        title="Taifa-1 multispectral — NDVI vegetation health per county"
                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-0.5 font-semibold transition-all ${showKenya ? 'bg-green-500/20 border-green-400 text-green-200' : 'border-green-700/50 text-green-600 hover:border-green-500/60'}`}>
                        🇰🇪 NDVI
                    </button>
                    <button onClick={() => setShowAfrican(p => !p)}
                        title="NigeriaSat-2 / ETRSS-1 — AQI & land-use index"
                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-0.5 font-semibold transition-all ${showAfrican ? 'bg-yellow-400/20 border-yellow-400 text-yellow-200' : 'border-green-700/50 text-green-600 hover:border-yellow-500/60'}`}>
                        🌍 AQI
                    </button>
                    <button onClick={() => setShowIntl(p => !p)}
                        title="Sentinel-2A / Landsat-9 — LULC drought stress"
                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-0.5 font-semibold transition-all ${showIntl ? 'bg-amber-400/20 border-amber-400 text-amber-200' : 'border-green-700/50 text-green-600 hover:border-amber-500/60'}`}>
                        🌐 LULC
                    </button>
                    <button onClick={() => setShowClimate(p => !p)}
                        title="NOAA-20 / Suomi-NPP / Aqua-MODIS — climate risk composite"
                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-0.5 font-semibold transition-all ${showClimate ? 'bg-purple-400/20 border-purple-400 text-purple-200' : 'border-green-700/50 text-green-600 hover:border-purple-500/60'}`}>
                        🌤 Climate
                    </button>
                </div>
            </div>

            <MapContainer
                center={center}
                zoom={zoom}
                minZoom={1}
                maxZoom={18}
                style={{ flex: 1, width: '100%', minHeight: '340px' }}
                className="rounded-lg"
                worldCopyJump={true}
            >
                <MapController center={center} zoom={zoom} triggerRef={viewJustChanged} />
                <CountyZoom selectedCounty={selectedCounty} countiesGeo={countiesGeo} />
                <TileLayer
                    attribution='&copy; OpenStreetMap &copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* ── County climate dots ── */}
                {layerState.climate && countiesGeo.features.map(feature => {
                    const { id, name } = feature.properties
                    const [lng, lat] = feature.geometry.coordinates
                    const county = combined.get(name)
                    if (!county) return null
                    const radius = 7 + county.vegetation * 8
                    const intensity = Math.min(1, county.temperature / 40)
                    const fillColor = `rgba(57,255,20,${0.35 + intensity * 0.5})`
                    return (
                        <CircleMarker
                            key={id}
                            center={[lat, lng]}
                            radius={selectedCounty === id ? radius * 1.8 : radius}
                            color={selectedCounty === id ? '#39ff14' : '#63f59a'}
                            fillColor={fillColor}
                            fillOpacity={0.6}
                            weight={selectedCounty === id ? 3 : 1}
                            eventHandlers={{ click: () => onSelectCounty(id) }}
                        >
                            <Tooltip>
                                <div style={{ background: '#050f08', border: '1px solid #00ff88', borderRadius: 8, padding: '6px 10px', color: '#b7ffba', fontSize: 12 }}>
                                    <strong style={{ color: '#39ff14' }}>{name}</strong>
                                    <div>🌡 {Number(county.temperature).toFixed(2)} °C</div>
                                    <div>🌿 NDVI {Number(county.vegetation).toFixed(3)}</div>
                                    <div>💨 AQI {Number(county.airQuality).toFixed(1)}</div>
                                    <div style={{ marginTop: 4, fontSize: 10, color: '#88ffcc' }}>
                                        Flood {county.floodRisk}% · Drought {county.droughtRisk}% · Heat {county.heatwaveRisk}%
                                    </div>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    )
                })}

                {/* ── Heat signature overlay (satellite thermal band) ──────────────── */}
                {showHeat && countiesGeo.features.map(feature => {
                    const { id, name } = feature.properties
                    const [lng, lat] = feature.geometry.coordinates
                    const county = combined.get(name)
                    if (!county) return null
                    // Normalise temp 18–40°C → 0–1.  Cyan → Orange → Red gradient
                    const t = Math.min(1, Math.max(0, (county.temperature - 18) / 22))
                    let r, g, b
                    if (t < 0.5) {
                        const s = t * 2
                        r = Math.round(34  + s * (249 - 34))
                        g = Math.round(211 + s * (115 - 211))
                        b = Math.round(238 + s * (22  - 238))
                    } else {
                        const s = (t - 0.5) * 2
                        r = Math.round(249 + s * (239 - 249))
                        g = Math.round(115 - s * 115)
                        b = Math.round(22  + s * (68  - 22))
                    }
                    const fillColor = `rgb(${r},${g},${b})`
                    return (
                        <CircleMarker
                            key={`heat-${id}`}
                            center={[lat, lng]}
                            radius={19}
                            color="transparent"
                            fillColor={fillColor}
                            fillOpacity={0.42}
                            weight={0}
                            eventHandlers={{ click: () => onSelectCounty(id) }}
                        >
                            <Tooltip>
                                <div style={{ background: '#050f08', border: `1px solid ${fillColor}`, borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#fde8cc' }}>
                                    🌡 <strong style={{ color: fillColor }}>{name}</strong>: {Number(county.temperature).toFixed(1)} °C
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    )
                })}

                {/* ── Flood risk satellite overlay ──────────────────────────────── */}
                {showFlood && countiesGeo.features.map(feature => {
                    const { id, name } = feature.properties
                    const [lng, lat] = feature.geometry.coordinates
                    const county = combined.get(name)
                    if (!county || county.floodRisk < 45) return null
                    const radius = 14 + county.floodRisk * 0.12
                    const alpha  = 0.15 + (county.floodRisk - 45) / 55 * 0.50
                    const danger = county.floodRisk >= 70
                    return (
                        <CircleMarker
                            key={`flood-${id}`}
                            center={[lat, lng]}
                            radius={radius}
                            color={danger ? '#93c5fd' : '#3b82f6'}
                            fillColor={danger ? '#1e40af' : '#1d4ed8'}
                            fillOpacity={alpha}
                            weight={danger ? 2 : 1.2}
                            eventHandlers={{ click: () => onSelectCounty(id) }}
                        >
                            <Tooltip>
                                <div style={{ background: '#050f08', border: '1px solid #3b82f6', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#bfdbfe' }}>
                                    🌊 <strong>{name}</strong>: Flood risk {county.floodRisk}%{danger ? ' ⚠ HIGH' : ''}
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    )
                })}

                {/* ── Storm cloud markers (rainy counties: floodRisk > 55) ── */}
                {showStorm && countiesGeo.features.map(feature => {
                    const { id, name } = feature.properties
                    const [lng, lat] = feature.geometry.coordinates
                    const county = combined.get(name)
                    if (!county || county.floodRisk <= 55) return null
                    const danger = county.floodRisk >= 70
                    return (
                        <Marker
                            key={`storm-${id}`}
                            position={[lat + 0.15, lng - 0.10]}
                            icon={makeStormIcon(danger)}
                            eventHandlers={{ click: () => onSelectCounty(id) }}
                        >
                            <Tooltip>
                                <div style={{ background: '#050f08', border: '1px solid #6366f1', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#c7d2fe' }}>
                                    ⛈ <strong>{name}</strong>{danger ? ' ⚡ SEVERE STORM' : ' — Active rainfall'}
                                    <div style={{ fontSize: 10 }}>Flood risk {county.floodRisk}% · Heatwave {county.heatwaveRisk}%</div>
                                </div>
                            </Tooltip>
                        </Marker>
                    )
                })}

                {/* ── Kenya Sat (Taifa-1 Multispectral) — NDVI vegetation index ── */}
                {showKenya && countiesGeo.features.map(feature => {
                    const { id, name } = feature.properties
                    const [lng, lat] = feature.geometry.coordinates
                    const county = combined.get(name)
                    if (!county) return null
                    const ndvi = Math.max(0, Math.min(1, county.vegetation))
                    let r, g, b
                    if (ndvi < 0.5) {
                        const s = ndvi * 2
                        r = Math.round(210 - s * 20); g = Math.round(50 + s * 170); b = 20
                    } else {
                        const s = (ndvi - 0.5) * 2
                        r = Math.round(190 - s * 170); g = Math.round(220 - s * 40); b = Math.round(20 + s * 20)
                    }
                    const fc = `rgb(${r},${g},${b})`
                    return (
                        <CircleMarker key={`knsat-${id}`} center={[lat, lng]} radius={18}
                            color="transparent" fillColor={fc} fillOpacity={0.46} weight={0}
                            eventHandlers={{ click: () => onSelectCounty(id) }}>
                            <Tooltip>
                                <div style={{ background: '#050f08', border: `1px solid ${fc}`, borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#d0ffd4' }}>
                                    🇰🇪 <strong style={{ color: fc }}>{name}</strong>
                                    <div style={{ fontSize: 10 }}>Taifa-1 Multispectral · NDVI {county.vegetation.toFixed(3)}</div>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    )
                })}

                {/* ── African Sat (NigeriaSat-2 / ETRSS-1) — AQI land-use index ── */}
                {showAfrican && countiesGeo.features.map(feature => {
                    const { id, name } = feature.properties
                    const [lng, lat] = feature.geometry.coordinates
                    const county = combined.get(name)
                    if (!county) return null
                    const t = Math.min(1, county.airQuality / 160)
                    let r, g, b
                    if (t < 0.33) {
                        const s = t / 0.33
                        r = Math.round(20 + s * 240); g = Math.round(200 - s * 70); b = 30
                    } else if (t < 0.67) {
                        const s = (t - 0.33) / 0.34
                        r = 255; g = Math.round(130 - s * 100); b = Math.round(30 - s * 30)
                    } else {
                        const s = (t - 0.67) / 0.33
                        r = Math.round(255 - s * 40); g = Math.round(30 + s * 10); b = 0
                    }
                    const fc = `rgb(${r},${g},${b})`
                    return (
                        <CircleMarker key={`afsat-${id}`} center={[lat, lng]} radius={18}
                            color="transparent" fillColor={fc} fillOpacity={0.44} weight={0}
                            eventHandlers={{ click: () => onSelectCounty(id) }}>
                            <Tooltip>
                                <div style={{ background: '#050f08', border: `1px solid ${fc}`, borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#fef9c3' }}>
                                    🌍 <strong style={{ color: fc }}>{name}</strong>
                                    <div style={{ fontSize: 10 }}>NigeriaSat-2 / ETRSS-1 · AQI {Number(county.airQuality).toFixed(1)}</div>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    )
                })}

                {/* ── International Sat (Sentinel-2A / Landsat-9) — LULC Drought Stress ── */}
                {showIntl && countiesGeo.features.map(feature => {
                    const { id, name } = feature.properties
                    const [lng, lat] = feature.geometry.coordinates
                    const county = combined.get(name)
                    if (!county) return null
                    const d = Math.min(1, county.droughtRisk / 100)
                    let r, g, b
                    if (d < 0.4) {
                        const s = d / 0.4
                        r = Math.round(30 + s * 200); g = Math.round(200 - s * 60); b = Math.round(180 - s * 140)
                    } else if (d < 0.75) {
                        const s = (d - 0.4) / 0.35
                        r = Math.round(230 + s * 10); g = Math.round(140 - s * 90); b = Math.round(40 - s * 30)
                    } else {
                        const s = (d - 0.75) / 0.25
                        r = Math.round(240 - s * 30); g = Math.round(50 - s * 30); b = 10
                    }
                    const fc = `rgb(${r},${g},${b})`
                    return (
                        <CircleMarker key={`intsat-${id}`} center={[lat, lng]} radius={18}
                            color="transparent" fillColor={fc} fillOpacity={0.44} weight={0}
                            eventHandlers={{ click: () => onSelectCounty(id) }}>
                            <Tooltip>
                                <div style={{ background: '#050f08', border: `1px solid ${fc}`, borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#fde8cc' }}>
                                    🌐 <strong style={{ color: fc }}>{name}</strong>
                                    <div style={{ fontSize: 10 }}>Sentinel-2A / Landsat-9 · Drought {county.droughtRisk}%</div>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    )
                })}

                {/* ── Climate Sat (NOAA-20 / Suomi-NPP / Aqua-MODIS) — Climate Risk ── */}
                {showClimate && countiesGeo.features.map(feature => {
                    const { id, name } = feature.properties
                    const [lng, lat] = feature.geometry.coordinates
                    const county = combined.get(name)
                    if (!county) return null
                    const risk = Math.min(1, (county.floodRisk * 0.45 + county.heatwaveRisk * 0.35 + county.droughtRisk * 0.20) / 100)
                    let r, g, b
                    if (risk < 0.4) {
                        const s = risk / 0.4
                        r = Math.round(20 + s * 100); g = Math.round(80 + s * 30); b = Math.round(200 + s * 45)
                    } else if (risk < 0.72) {
                        const s = (risk - 0.4) / 0.32
                        r = Math.round(120 + s * 100); g = Math.round(110 - s * 80); b = Math.round(245 - s * 50)
                    } else {
                        const s = (risk - 0.72) / 0.28
                        r = Math.round(220 + s * 20); g = Math.round(30 - s * 20); b = Math.round(195 - s * 140)
                    }
                    const fc = `rgb(${r},${g},${b})`
                    return (
                        <CircleMarker key={`clsat-${id}`} center={[lat, lng]} radius={18}
                            color="transparent" fillColor={fc} fillOpacity={0.44} weight={0}
                            eventHandlers={{ click: () => onSelectCounty(id) }}>
                            <Tooltip>
                                <div style={{ background: '#050f08', border: `1px solid ${fc}`, borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#f0e6ff' }}>
                                    🌤 <strong style={{ color: fc }}>{name}</strong>
                                    <div style={{ fontSize: 10 }}>NOAA-20 / Suomi-NPP · Climate Risk {Math.round(risk * 100)}%</div>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    )
                })}

                {/* ── Cash crop farm nodes (all counties) ── */}
                {layerState.agriculture && countyData.map(county => {
                    const feat = countiesGeo.features.find(f => f.properties.id === county.id)
                    if (!feat) return null
                    const [lng, lat] = feat.geometry.coordinates
                    const cropInfo = cashCropData[county.name]
                    if (!cropInfo) return null
                    const isSelected = selectedCounty === county.id
                    return (
                        <CircleMarker
                            key={`farm-${county.id}`}
                            center={[lat + 0.05, lng + 0.05]}
                            radius={isSelected ? 7 : 4}
                            fillColor={isSelected ? '#facc15' : '#a3e635'}
                            color={isSelected ? '#fef08a' : '#86efac'}
                            fillOpacity={isSelected ? 0.95 : 0.65}
                            weight={isSelected ? 2 : 1}
                            eventHandlers={{ click: () => onSelectCounty(county.id) }}
                        >
                            <Tooltip>
                                <div style={{ background: '#050f08', border: '1px solid #a3e635', borderRadius: 6, padding: '5px 8px', fontSize: 11, color: '#d9ffc0' }}>
                                    <strong>{cropInfo.icon} {county.name}</strong>
                                    <div>{cropInfo.crop}</div>
                                    <div style={{ fontSize: 10, color: '#86efac' }}>→ {cropInfo.destination}</div>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    )
                })}

                {/* ── Selected county cash crop route (glowing) ── */}
                {layerState.agriculture && selectedCropRoute && (
                    <GlowPolyline
                        key={`crop-route-${selectedCounty}`}
                        positions={selectedCropRoute.cropInfo.route}
                        color={selectedCropRoute.style.color}
                        weight={selectedCropRoute.style.weight}
                        opacity={selectedCropRoute.style.opacity}
                        dashArray={selectedCropRoute.style.dashArray}
                    >
                        <Tooltip sticky>
                            <div style={{ background: '#050f08', border: `1px solid ${selectedCropRoute.style.color}`, borderRadius: 8, padding: '7px 10px', minWidth: 200, fontSize: 11, color: '#e2fce2' }}>
                                <div style={{ fontWeight: 700, color: selectedCropRoute.style.color, marginBottom: 4 }}>
                                    {selectedCropRoute.cropInfo.icon} {selectedCropRoute.cropInfo.crop}
                                </div>
                                <div>{selectedCropRoute.county.name} County</div>
                                <div style={{ color: '#88ffcc' }}>→ {selectedCropRoute.cropInfo.destination}</div>
                                <div style={{ marginTop: 4 }}>
                                    via {selectedCropRoute.cropInfo.transportType === 'water' ? '⛵ waterway' : '🚛 road'}
                                </div>
                                <div style={{ marginTop: 4, fontWeight: 600 }}>
                                    Status: {selectedCropRoute.style.label}
                                </div>
                                <div style={{ fontSize: 9, color: '#66bb88', marginTop: 3 }}>
                                    Base quality: {selectedCropRoute.cropInfo.routeQuality} · Flood risk: {selectedCropRoute.county.floodRisk}%
                                </div>
                            </div>
                        </Tooltip>
                    </GlowPolyline>
                )}

                {/* ── Static transport corridors (when no county route shown) ── */}
                {layerState.transport && TRANSPORT_ROUTES.map((route, idx) => (
                    <Polyline
                        key={idx}
                        pathOptions={{ color: route.color, weight: 2, dashArray: '6 8', opacity: 0.65 }}
                        positions={route.coords}
                    >
                        <Tooltip sticky>
                            <div style={{ background: '#050f08', border: '1px solid #22d3ee', borderRadius: 6, padding: '4px 8px', color: '#a5f3fc', fontSize: 11 }}>
                                🚛 {route.name}
                            </div>
                        </Tooltip>
                    </Polyline>
                ))}

                {/* ── Satellite ground tracks ── */}
                {showSats && liveSats.map(sat => {
                    if (!sat.ground_track || sat.ground_track.length < 2) return null
                    const color = satColor(sat)
                    const segments = []
                    let seg = [sat.ground_track[0]]
                    for (let i = 1; i < sat.ground_track.length; i++) {
                        const [, prevLng] = sat.ground_track[i - 1]
                        const [, curLng]  = sat.ground_track[i]
                        if (Math.abs(curLng - prevLng) > 180) { segments.push(seg); seg = [] }
                        seg.push(sat.ground_track[i])
                    }
                    if (seg.length > 1) segments.push(seg)
                    return segments.map((s, si) => (
                        <Polyline
                            key={`track-${sat.id}-${si}`}
                            positions={s}
                            pathOptions={{ color, weight: 1, opacity: 0.30, dashArray: '3 6' }}
                        />
                    ))
                })}

                {/* ── Satellite position markers ── */}
                {showSats && liveSats.map(sat => {
                    const pos = sat.position || { lat: sat.lat, lng: sat.lng }
                    if (pos.lat == null) return null
                    const color = satColor(sat)
                    const r = sat.over_kenya ? 7 : sat.over_africa ? 6 : 4
                    const f = sat.formulae || {}
                    const catLabel = { kenya: '🇰🇪', african: '🌍', international: '🌐', climate: '🌤' }[sat.category] || ''
                    return (
                        <CircleMarker
                            key={`sat-${sat.id}`}
                            center={[pos.lat, pos.lng]}
                            radius={r}
                            color={color}
                            fillColor={color}
                            fillOpacity={0.9}
                            weight={sat.over_kenya ? 3 : 1.5}
                        >
                            <Tooltip>
                                <div style={{ background: '#050f08', border: `1px solid ${color}`, borderRadius: 8, padding: '7px 10px', minWidth: 220, color: '#e2fce2', fontSize: 11 }}>
                                    <div style={{ fontWeight: 700, color, marginBottom: 4 }}>🛰 {catLabel} {sat.name}</div>
                                    <div>{sat.origin} · LEO {sat.altitude_km} km · {sat.inclination_deg}° inc</div>
                                    <div>T = {sat.period_min} min · v = {sat.velocity_km_s} km/s</div>
                                    <div>φ {pos.lat}°  λ {pos.lng}°</div>
                                    {sat.data_focus && <div style={{ color: '#88ffcc', marginTop: 3 }}>📡 {sat.data_focus}</div>}
                                    <hr style={{ borderColor: color + '44', margin: '5px 0' }} />
                                    <div style={{ fontSize: 9.5, color: '#88ffcc', fontFamily: 'monospace' }}>
                                        <div>{f.T_s}</div>
                                        <div>{f.n_deg_s}</div>
                                        <div>{f.n_gnd}</div>
                                        <div>{f.J2_drift}</div>
                                        <div>{f.v_eq}</div>
                                    </div>
                                    {sat.over_kenya && <div style={{ marginTop: 5, color: '#facc15' }}>⚠ Currently over Kenya</div>}
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    )
                })}
            </MapContainer>

            {/* ── Route legend strip ── */}
            {layerState.agriculture && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-2 py-1 text-[9px] text-green-400 border-t border-green-700/30">
                    {[
                        { color: '#39ff14', label: 'Good road' },
                        { color: '#facc15', label: 'Moderate risk' },
                        { color: '#ef4444', label: 'High risk' },
                        { color: '#1a88ff', label: 'Safe water' },
                        { color: '#00ffff', label: 'Unsafe (flood)' },
                    ].map(({ color, label }) => (
                        <span key={label} className="flex items-center gap-1">
                            <span className="inline-block h-1.5 w-4 rounded" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                            {label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
