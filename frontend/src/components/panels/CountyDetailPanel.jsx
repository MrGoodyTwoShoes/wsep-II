import { motion } from 'framer-motion'
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts'
import { cashCropData } from '../../data/mockData'
import { getRouteStyle } from '../map/GeoSpatialMap'

// ── Climate risk index formula ─────────────────────────────────────────────
// Risk = 0.40·(ΔT/T_ref) + 0.30·(CO₂/600) + 0.30·(event_score/100)
// where ΔT = county_temp − 20°C baseline, T_ref = 15°C, CO₂ in ppm
const RISK_INDEX_FORMULA = 'Risk = 0.40·(ΔT/15) + 0.30·(CO₂/600) + 0.30·(events/100)'
const TEMP_FORMULA       = 'T_county = T_base + ΔT_local  |  T_base = 24.5°C (Kenya avg)'
const VEG_FORMULA        = 'NDVI = (NIR − Red) / (NIR + Red)  ∈ [0, 1]'
const AQI_FORMULA        = 'AQI = 0.50·PM₂.₅ + 0.30·NO₂ + 0.20·O₃  (normalised 0–300)'

export default function CountyDetailPanel({ data, regions = [], countyList = [], onSelectCounty, onClose, inline = false }) {
    const hasCounty = Boolean(data)
    const riskData = hasCounty ? [
        { name: 'Flood',    value: data.floodRisk,    fill: '#3b82f6' },
        { name: 'Drought',  value: data.droughtRisk,  fill: '#f59e0b' },
        { name: 'Heatwave', value: data.heatwaveRisk, fill: '#ef4444' }
    ] : []

    const computedRisk = hasCounty
        ? (0.40 * ((data.temperature - 20) / 15) + 0.30 * (data.airQuality / 300) + 0.30 * ((data.floodRisk + data.droughtRisk + data.heatwaveRisk) / 300)).toFixed(3)
        : null

    const title = hasCounty ? `${data.name} County Overview` : '47 Counties Overview'

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={inline ? 'relative mb-4 flex w-full flex-col rounded-2xl border border-green-400/70 bg-[#011307]/95 p-4 shadow-neon' : 'fixed right-4 top-20 z-50 h-[calc(100vh-100px)] w-[400px] max-w-[420px] overflow-y-auto rounded-2xl border border-green-400/70 bg-[#011307]/95 p-5 shadow-neon'}
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-green-100">{title}</h3>
                        <p className="text-xs text-green-300">
                            {hasCounty ? 'Detailed local metrics and risk summary.' : 'Click any county card to view full details.'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-md border border-green-500/50 px-2 py-1 text-xs text-green-100 hover:bg-green-500/20"
                    >
                        Close
                    </button>
                </div>

                {hasCounty ? (
                    <>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="rounded-xl border border-green-500/40 p-2 min-w-0">
                                <div className="flex items-center justify-between text-[9px] uppercase text-green-300">
                                    <span>Temp</span>
                                    <span className="text-[9px] text-green-400">(°C)</span>
                                </div>
                                <div className="text-xl font-semibold text-green-100 break-all leading-tight">{Number(data.temperature).toFixed(2)}°C</div>
                                <div className="mt-1 text-[9px] text-green-300 break-words leading-snug">T = T_base + ΔT_local</div>
                            </div>
                            <div className="rounded-xl border border-green-500/40 p-2 min-w-0">
                                <div className="flex items-center justify-between text-[9px] uppercase text-green-300">
                                    <span>NDVI</span>
                                    <span className="text-[9px] text-green-400">(veg)</span>
                                </div>
                                <div className="text-xl font-semibold text-green-100 break-all leading-tight">{Number(data.vegetation).toFixed(3)}</div>
                                <div className="mt-1 text-[9px] text-green-300 break-words leading-snug">(NIR−Red)/(NIR+Red)</div>
                            </div>
                            <div className="rounded-xl border border-green-500/40 p-2 min-w-0">
                                <div className="flex items-center justify-between text-[9px] uppercase text-green-300">
                                    <span>AQI</span>
                                    <span className="text-[9px] text-green-400">(air)</span>
                                </div>
                                <div className="text-xl font-semibold text-green-100 break-all leading-tight">{Number(data.airQuality).toFixed(1)}</div>
                                <div className="mt-1 text-[9px] text-green-300 break-words leading-snug">PM₂.₅·0.5 + NO₂·0.3 + O₃·0.2</div>
                            </div>
                        </div>

                        <div className="mt-6 h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart cx="50%" cy="50%" innerRadius="15%" outerRadius="100%" data={riskData} startAngle={90} endAngle={-270}>
                                    <RadialBar
                                        minAngle={15}
                                        isAnimationActive={true}
                                        animationDuration={900}
                                        animationBegin={100}
                                        label={{ position: 'insideStart', fill: '#24c02a' }}
                                        background
                                        clockWise
                                        dataKey="value"
                                    />
                                    <Legend iconSize={8} layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ color: '#9beaaa' }} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-2 text-xs text-green-200">
                            Risk trends indicate top pressure point: {hasCounty && riskData.length ? riskData.slice().sort((a, b) => b.value - a.value)[0].name : 'N/A'}
                        </div>

                        {/* ── Formula Reference Box ── */}
                        <div className="mt-3 rounded-xl border border-green-600/30 bg-black/60 p-3 text-[9px] font-mono text-green-400 space-y-1">
                            <div className="mb-1 text-[10px] font-bold text-green-300 not-italic font-sans">Formulae used for this county</div>
                            <div>🌡 {TEMP_FORMULA}</div>
                            <div>🌿 {VEG_FORMULA}</div>
                            <div>💨 {AQI_FORMULA}</div>
                            <div>⚠ {RISK_INDEX_FORMULA}</div>
                            {computedRisk && (
                                <div className="mt-1 text-yellow-300">
                                    Computed Risk Index = {computedRisk} (0–1 scale)
                                </div>
                            )}
                        </div>

                        {/* ── Cash Crop & Transport Route ── */}
                        {(() => {
                            const cropInfo = cashCropData[data.name]
                            if (!cropInfo) return null
                            const routeStyle = getRouteStyle(cropInfo.routeQuality, data.floodRisk, cropInfo.transportType)
                            return (
                                <div className="mt-3 rounded-xl border border-lime-600/40 bg-[#061a0e]/90 p-3">
                                    <div className="text-xs font-bold text-lime-300 uppercase tracking-wider mb-2">
                                        🌾 County Cash Crop &amp; Export Route
                                    </div>
                                    <div className="flex items-start gap-3 mb-2">
                                        <span className="text-2xl">{cropInfo.icon}</span>
                                        <div>
                                            <div className="text-sm font-semibold text-green-100">{cropInfo.crop}</div>
                                            <div className="text-xs text-green-400 mt-0.5">→ {cropInfo.destination}</div>
                                            <div className="text-xs text-green-500 mt-0.5">
                                                via {cropInfo.transportType === 'water' ? '⛵ waterway' : cropInfo.transportType === 'rail' ? '🚂 rail' : '🚛 road'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs flex items-center gap-2">
                                        <span className="text-green-400">Route condition:</span>
                                        <span style={{ color: routeStyle.color, fontWeight: 700 }}>{routeStyle.label}</span>
                                    </div>
                                    <div className="text-[9px] text-green-600 mt-1">
                                        Base quality: {cropInfo.routeQuality} · Flood risk: {data.floodRisk}%
                                        {data.floodRisk > 60 && <span className="text-red-400 ml-1">⚠ Flood risk downgrades route</span>}
                                    </div>
                                </div>
                            )
                        })()}

                        {/* ── Map Route Legend ── */}
                        <div className="mt-3 rounded-xl border border-green-700/30 bg-black/40 p-3">
                            <div className="text-[10px] font-bold text-green-300 mb-2">Map Route Colour Legend</div>
                            <div className="space-y-1 text-[10px]">
                                {[
                                    { color: '#39ff14', label: 'Green — Clear weather, reliable road' },
                                    { color: '#facc15', label: 'Yellow — Moderate risk (weather or road)' },
                                    { color: '#ef4444', label: 'Red — High risk, poor road or flooding' },
                                    { color: '#1a88ff', label: 'Blue — Safe water route' },
                                    { color: '#00ffff', label: 'Bright Cyan — Waterway UNSAFE (flood risk >60%)' },
                                ].map(({ color, label }) => (
                                    <div key={color} className="flex items-center gap-2 text-green-300">
                                        <span className="inline-block w-5 h-1 rounded" style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="overflow-y-auto" style={{ maxHeight: '62vh' }}>
                        <div className="grid grid-cols-2 gap-1.5">
                            {countyList.map(county => {
                                const t = Number(county.temperature)
                                const tempColor = t > 33 ? '#ef4444' : t > 28 ? '#facc15' : '#39ff14'
                                const floodIcon = county.floodRisk > 65 ? '🌊' : county.floodRisk > 50 ? '⚠️' : null
                                return (
                                    <button
                                        key={county.id}
                                        onClick={() => onSelectCounty?.(county.id)}
                                        className="text-left rounded-lg border border-green-500/30 bg-[#040f06]/70 p-2 hover:border-green-400 hover:bg-[#071208] transition-all"
                                    >
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="text-[10px] font-semibold text-green-200 truncate max-w-[80%]">{county.name}</span>
                                            {floodIcon && <span className="text-[10px]">{floodIcon}</span>}
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px]">
                                            <span style={{ color: tempColor }} className="font-bold">{t.toFixed(1)}°C</span>
                                            <span className="text-green-600">NDVI {Number(county.vegetation).toFixed(2)}</span>
                                        </div>
                                        <div className="text-[8px] text-green-700 mt-0.5 truncate">{county.region} · AQI {Number(county.airQuality).toFixed(0)}</div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
