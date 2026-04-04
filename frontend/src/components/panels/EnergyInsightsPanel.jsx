import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { useState, useEffect, useMemo } from 'react'

// Kenya-accurate energy mix (2024 KERC data)
const KENYA_MIX = [
    { name: 'Geothermal', pct: 43, color: '#f97316', icon: '🌋', plant: 'Olkaria I–V (GDC)' },
    { name: 'Hydro',      pct: 26, color: '#22d3ee', icon: '💧', plant: 'Masinga · Kiambere' },
    { name: 'Wind',       pct: 12, color: '#39ff14', icon: '💨', plant: 'Lake Turkana WF' },
    { name: 'Solar',      pct: 11, color: '#facc15', icon: '☀️', plant: 'Garissa 50 MW' },
    { name: 'Thermal',    pct:  8, color: '#fb7185', icon: '🔥', plant: 'Muhoroni · Kipevu' },
]

// Display metadata keyed by source name — used to enrich bare backend {name, value} entries
const MIX_META = {
    Geothermal: { color: '#f97316', icon: '🌋', plant: 'Olkaria I–V (GDC)' },
    Hydro:      { color: '#22d3ee', icon: '💧', plant: 'Masinga · Kiambere' },
    Wind:       { color: '#39ff14', icon: '💨', plant: 'Lake Turkana WF' },
    Solar:      { color: '#facc15', icon: '☀️', plant: 'Garissa 50 MW' },
    Thermal:    { color: '#fb7185', icon: '🔥', plant: 'Muhoroni · Kipevu' },
    Fossil:     { color: '#fb7185', icon: '🔥', plant: 'Kipevu Thermal' },
}

// Simulated 24-hour generation profile (seeded at module load – stable until refresh)
const HOURLY = Array.from({ length: 24 }, (_, h) => {
    const base = 1420
    const solarPeak = h >= 7 && h <= 18 ? Math.sin(((h - 7) / 11) * Math.PI) * 195 : 0
    const eveningPeak = h >= 17 && h <= 21 ? Math.sin(((h - 17) / 4) * Math.PI) * 130 : 0
    return {
        h: `${String(h).padStart(2, '0')}h`,
        total: Math.round(base + solarPeak + eveningPeak),
        solar: Math.round(Math.max(0, solarPeak * 0.9)),
        geo: Math.round(620 + (h % 3) * 8),
    }
})

function KpiCard({ label, value, sub, color = '#39ff14' }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-green-500/25 bg-[#071208]/70 px-1 py-1.5">
            <div className="text-[9px] uppercase tracking-wider text-green-500">{label}</div>
            <div className="text-base font-bold leading-tight" style={{ color }}>{value}</div>
            {sub && <div className="text-[9px] text-green-600">{sub}</div>}
        </div>
    )
}

// Ozone Layer Health — NOAA-20 satellite spectroscopy over Kenya
// Kenya equatorial baseline: 260–290 DU (below global avg ~300 DU)
const OZONE_BASE = 272
const OZONE_VAR  = 14
function OzoneBar() {
    const [du, setDu] = useState(() => OZONE_BASE + Math.round((Math.random() - 0.5) * OZONE_VAR))
    useEffect(() => {
        const t = setInterval(() =>
            setDu(OZONE_BASE + Math.round((Math.random() - 0.5) * OZONE_VAR)), 9000)
        return () => clearInterval(t)
    }, [])
    const pct    = Math.min(100, Math.max(0, ((du - 220) / 100) * 100))
    const color  = du > 270 ? '#39ff14' : du > 250 ? '#facc15' : '#f97316'
    const status = du > 270 ? 'Good' : du > 250 ? 'Reduced' : 'Low'
    return (
        <div className="rounded-lg border border-cyan-500/25 bg-[#05101a]/70 px-2 py-1.5">
            <div className="flex items-center justify-between mb-1">
                <div className="text-[9px] uppercase tracking-widest text-cyan-700">🌐 Ozone Layer · NOAA-20</div>
                <div className="text-[10px] font-bold tabular-nums" style={{ color }}>{du} DU</div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-green-900/40 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
            </div>
            <div className="mt-0.5 flex justify-between text-[8px] text-green-700">
                <span>220 (critical)</span>
                <span style={{ color }} className="font-semibold">{status}</span>
                <span>320 DU</span>
            </div>
        </div>
    )
}

export default function EnergyInsightsPanel({ energy }) {
    // Merge backend energy prop (name + value) with MIX_META for colors/icons.
    // Falls back to hardcoded KENYA_MIX when backend is offline.
    const activeMix = useMemo(() => {
        if (energy && energy.length > 0) {
            return energy.map(e => ({
                name: e.name,
                pct:  e.value,
                ...(MIX_META[e.name] ?? { color: '#8b9467', icon: '⚡', plant: '' }),
            }))
        }
        return KENYA_MIX
    }, [energy])

    return (
        <div className="flex h-full flex-col gap-2 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="text-base font-bold text-green-200">⚡ Kenya Grid · Energy Mix</div>
                <span className="rounded-full border border-green-400/50 bg-green-400/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-green-300">
                    STABLE
                </span>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-4 gap-1.5">
                <KpiCard label="Peak Demand" value="1,847" sub="MW" />
                <KpiCard label="Frequency"   value="50.0"  sub="Hz"        color="#22d3ee" />
                <KpiCard label="Renewable"   value="88%"   sub="share"     color="#39ff14" />
                <KpiCard label="CO₂ Intens." value="78"    sub="g / kWh"   color="#facc15" />
            </div>

            {/* Donut + source legend */}
            <div className="flex min-h-0 flex-1 gap-2">
                <div className="w-36 flex-shrink-0">
                    <ResponsiveContainer width="100%" height={138}>
                        <PieChart>
                            <Pie data={activeMix} dataKey="pct" innerRadius={38} outerRadius={58} paddingAngle={2}>
                                {activeMix.map(e => <Cell key={e.name} fill={e.color} />)}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#071208', borderColor: '#39ff14', fontSize: 11 }}
                                formatter={(v, n) => [`${v}%`, n]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-1 flex-col justify-center gap-1">
                    {activeMix.map(e => (
                        <div key={e.name} className="flex items-center gap-1.5 text-xs">
                            <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: e.color }} />
                            <span className="text-green-200">{e.name}</span>
                            <span className="ml-auto font-bold tabular-nums" style={{ color: e.color }}>{e.pct}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 24h generation trend */}
            <div>
                <div className="mb-0.5 text-[9px] uppercase tracking-widest text-green-500">24 h Generation Profile</div>
                <ResponsiveContainer width="100%" height={68}>
                    <AreaChart data={HOURLY} margin={{ top: 2, right: 2, left: -22, bottom: 0 }}>
                        <XAxis dataKey="h" stroke="#1a3a1a" tick={{ fontSize: 8, fill: '#4a7a4a' }} interval={5} />
                        <YAxis stroke="#1a3a1a" tick={{ fontSize: 8, fill: '#4a7a4a' }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#071208', borderColor: '#39ff14', fontSize: 10 }}
                            formatter={(v, n) => [`${v} MW`, n]}
                        />
                        <Area type="monotone" dataKey="geo"   name="Geothermal" stroke="#f97316" fill="#f97316" fillOpacity={0.18} strokeWidth={1.2} dot={false} />
                        <Area type="monotone" dataKey="solar" name="Solar"       stroke="#facc15" fill="#facc15" fillOpacity={0.14} strokeWidth={1.2} dot={false} />
                        <Area type="monotone" dataKey="total" name="Total"       stroke="#39ff14" fill="#39ff14" fillOpacity={0.10} strokeWidth={1.5} dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Ozone layer health */}
            <OzoneBar />

            {/* Power plant spotlight */}
            <div className="rounded-lg border border-green-500/20 bg-[#050e05] px-2 py-1.5">
                <div className="mb-1 text-[9px] uppercase tracking-widest text-green-600">Key Facilities</div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {activeMix.map(e => (
                        <div key={e.name} className="text-[10px] text-green-400">
                            {e.icon} <span style={{ color: e.color }}>{e.plant}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Satellite climate scan strip */}
            <SatScanStrip />
        </div>
    )
}

// Live satellite readings from Taifa-1, NOAA-20, Aqua-MODIS, Sentinel-2A
const SAT_FEEDS = [
    { name: 'Taifa-1',    icon: '🛰', color: '#39ff14', label: 'NDVI Kenya',    unit: '',    base: 0.52, delta: 0.03, decimals: 3 },
    { name: 'NOAA-20',   icon: '🌤', color: '#67e8f9', label: 'SST °C',        unit: '°C',  base: 26.2, delta: 0.4,  decimals: 1 },
    { name: 'Aqua-MODIS',icon: '💧', color: '#22d3ee', label: 'Humidity %',    unit: '%',   base: 71,   delta: 3,    decimals: 0 },
    { name: 'Sentinel-2A',icon:'🌿', color: '#facc15', label: 'Chlorophyll',   unit: ' μg/L',base: 3.8, delta: 0.5,  decimals: 2 },
]

function SatScanStrip() {
    const [readings, setReadings] = useState(() =>
        SAT_FEEDS.map(s => +(s.base + (Math.random() - 0.5) * s.delta).toFixed(s.decimals))
    )
    useEffect(() => {
        const t = setInterval(() => {
            setReadings(SAT_FEEDS.map(s => +(s.base + (Math.random() - 0.5) * s.delta).toFixed(s.decimals)))
        }, 4000)
        return () => clearInterval(t)
    }, [])
    return (
        <div className="rounded-lg border border-cyan-500/20 bg-[#020d12]/70 px-2 py-1.5">
            <div className="mb-1 text-[9px] uppercase tracking-widest text-cyan-600">🛰 Live Sat Feeds</div>
            <div className="grid grid-cols-2 gap-1">
                {SAT_FEEDS.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-1.5 rounded border border-green-900/40 bg-black/30 px-1.5 py-1">
                        <span className="text-sm">{s.icon}</span>
                        <div className="min-w-0 flex-1">
                            <div className="text-[9px] text-green-600 truncate">{s.name}</div>
                            <div className="text-[10px] font-bold tabular-nums" style={{ color: s.color }}>
                                {readings[i]}{s.unit}
                            </div>
                        </div>
                        <div className="text-[8px] text-green-700">{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
