import { useMemo, useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const routeCoordinates = [
    [[-1.286389, 36.817223], [-4.043477, 39.668207]],
    [[-1.286389, 36.817223], [-0.102209, 34.761711]],
    [[-0.102209, 34.761711], [-4.043477, 39.668207]]
]

export default function GeoSpatialMap({ countiesGeo, countyData, selectedCounty, onSelectCounty, layerState, satelliteData = [] }) {
    const [localSats, setLocalSats] = useState([
        { id: 'local-1', name: 'SimSat-1', origin: 'KE', lat: -0.2, lng: 37.1, angle: 0 },
        { id: 'local-2', name: 'SimSat-2', origin: 'NG', lat: -0.2, lng: 37.1, angle: 120 },
        { id: 'local-3', name: 'SimSat-3', origin: 'ZA', lat: -0.2, lng: 37.1, angle: 240 }
    ])

    useEffect(() => {
        const interval = setInterval(() => {
            setLocalSats(prev => prev.map(sat => ({
                ...sat,
                angle: (sat.angle + 1) % 360,
                lat: -0.2 + Math.sin(sat.angle * Math.PI / 180) * 2,
                lng: 37.1 + Math.cos(sat.angle * Math.PI / 180) * 2
            })))
        }, 100)
        return () => clearInterval(interval)
    }, [])

    const effectiveSatellites = satelliteData.length > 0 ? satelliteData : localSats

    const combined = useMemo(() => {
        const m = new Map()
        countyData.forEach(c => m.set(c.name, c))
        return m
    }, [countyData])

    return (
        <div className="h-full rounded-xl bg-[#06140e]/80 p-1">
            <MapContainer
                center={[-0.2, 37.1]}
                zoom={6.8}
                minZoom={5.4}
                maxZoom={10}
                style={{ width: '100%', height: '100%' }}
                className="rounded-lg"
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {countiesGeo.features.map(feature => {
                    const { id, name } = feature.properties
                    const [lng, lat] = feature.geometry.coordinates
                    const county = combined.get(name)
                    if (!county) return null

                    const radius = 7 + county.vegetation * 8
                    const intensity = layerState.climate ? Math.min(1, county.temperature / 40) : 0.35
                    const fillColor = layerState.climate ? `rgba(57,255,20,${0.35 + intensity * 0.5})` : 'rgba(0,255,255,0.4)'

                    return (
                        <CircleMarker
                            key={id}
                            center={[lat, lng]}
                            radius={selectedCounty === id ? radius * 1.8 : radius}
                            color={selectedCounty === id ? '#39ff14' : '#63f59a'}
                            fillColor={fillColor}
                            fillOpacity={0.6}
                            weight={selectedCounty === id ? 3 : 1}
                            eventHandlers={{
                                click: () => onSelectCounty(id),
                                mouseover: e => e.target.openTooltip(),
                                mouseout: e => e.target.closeTooltip()
                            }}
                        >
                            <Tooltip permanent={selectedCounty === id}>
                                <div className="text-xs text-slate-900 break-words">
                                    <div className="font-bold text-sm text-black">{name}</div>
                                    <div>Temp: {Number(county.temperature).toLocaleString('en-US', { maximumFractionDigits: 4 })} °C</div>
                                    <div>Veg index: {Number(county.vegetation).toLocaleString('en-US', { maximumFractionDigits: 4 })}</div>
                                    <div>Air Q: {Number(county.airQuality).toLocaleString('en-US', { maximumFractionDigits: 4 })}</div>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    )
                })}

                {layerState.transport && routeCoordinates.map((coords, idx) => (
                    <Polyline
                        key={idx}
                        pathOptions={{ color: '#22d3ee', weight: 2, dashArray: '6 8' }}
                        positions={coords.map(([lat, lng]) => [lat, lng])}
                    />
                ))}

                {layerState.agriculture && countyData.slice(0, 7).map(county => (
                    <CircleMarker
                        key={`farm-${county.id}`}
                        center={[-0.7 + (county.id % 5) * 0.8, 34.2 + (county.id % 5) * 0.6]}
                        radius={4}
                        fillColor="#a3e635"
                        color="#a3e635"
                        fillOpacity={0.7}
                    />
                ))}

                {effectiveSatellites.map(sat => (
                    <CircleMarker
                        key={sat.id}
                        center={[sat.position?.lat ?? sat.lat, sat.position?.lng ?? sat.lng]}
                        radius={sat.over_kenya ? 5 : 3}
                        fillColor={sat.over_kenya ? '#facc15' : '#22d3ee'}
                        color={sat.over_kenya ? '#f59e0b' : '#22d3ee'}
                        fillOpacity={0.85}
                    >
                        <Tooltip>
                            <div className="text-xs text-slate-900">
                                <div className="font-bold text-sm text-black">{sat.name || `Satellite ${sat.id}`}</div>
                                <div>Origin: {sat.origin || 'Unknown'}</div>
                                <div>Orbit: {sat.orbit || 'LEO'}</div>
                                <div>Deployed: {sat.deployed_year || 'n/a'}</div>
                                <div>Return: {sat.expected_return || 'unknown'}</div>
                                {sat.climate_data && (
                                    <>
                                        <div className="mt-1 text-xs font-semibold">Kenya climate snapshot</div>
                                        <div>Temp: {sat.climate_data.temperature_c} °C</div>
                                        <div>CO²: {sat.climate_data.co2_ppm} ppm</div>
                                        <div>AQI: {sat.climate_data.air_quality_index}</div>
                                    </>
                                )}
                            </div>
                        </Tooltip>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    )
}
