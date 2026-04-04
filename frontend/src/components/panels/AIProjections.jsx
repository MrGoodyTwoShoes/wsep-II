import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'

const SCENARIOS = {
    bau: {
        label: 'Business As Usual',
        color: '#fb7185',
        multiplier: 1.0,
        desc: 'No new climate policy enacted',
    },
    policy: {
        label: 'Climate Policy',
        color: '#facc15',
        multiplier: 0.65,
        desc: 'NDC targets met, 80% renewable by 2030',
    },
    netzero: {
        label: 'Net Zero 2050',
        color: '#39ff14',
        multiplier: 0.3,
        desc: 'Full electrification + REDD+ forests',
    },
}

function buildTimeline(base, m) {
    return base.map(row => ({
        year: row.year,
        temperature: Number((row.temperature - (1 - m) * (row.temperature - 25.5)).toFixed(2)),
        risk: Math.round(row.risk * m),
    }))
}

export default function AIProjections({ projections }) {
    const [scenario, setScenario] = useState('bau')
    const sc = SCENARIOS[scenario]
    const timeline = buildTimeline(projections.timeline, sc.multiplier)

    const tempRise = Number((projections.temperatureRise * sc.multiplier).toFixed(1))
    const riskEsc  = Math.round(projections.riskEscalation * sc.multiplier)

    return (
        <div className="flex h-full flex-col gap-2 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-green-200">🔮 AI Projections · 2025–2040</h2>
                <div className="text-[10px] uppercase tracking-wide text-green-500">{sc.desc}</div>
            </div>

            {/* Scenario tabs */}
            <div className="flex gap-1.5">
                {Object.entries(SCENARIOS).map(([key, s]) => (
                    <button
                        key={key}
                        onClick={() => setScenario(key)}
                        className={`flex-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-all ${
                            scenario === key
                                ? 'border-current text-white shadow-sm'
                                : 'border-green-500/20 text-green-600 hover:border-green-500/50'
                        }`}
                        style={scenario === key ? { borderColor: s.color, color: s.color, backgroundColor: `${s.color}18` } : {}}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-green-500/30 bg-[#071208]/70 p-2.5">
                    <div className="text-[10px] uppercase tracking-wide text-green-400">Temp Rise (15 yr)</div>
                    <div className="text-2xl font-bold leading-tight" style={{ color: sc.color }}>+{tempRise}°C</div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-green-900/50">
                        <div
                            style={{ width: `${Math.min(100, (tempRise / 4) * 100)}%`, backgroundColor: sc.color }}
                            className="h-full rounded-full transition-all duration-700"
                        />
                    </div>
                </div>
                <div className="rounded-xl border border-green-500/30 bg-[#071208]/70 p-2.5">
                    <div className="text-[10px] uppercase tracking-wide text-green-400">Risk Escalation</div>
                    <div className="text-2xl font-bold leading-tight" style={{ color: sc.color }}>{riskEsc}%</div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-green-900/50">
                        <div
                            style={{ width: `${Math.min(100, riskEsc)}%`, backgroundColor: sc.color }}
                            className="h-full rounded-full transition-all duration-700"
                        />
                    </div>
                </div>
            </div>

            {/* Projection chart */}
            <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline} margin={{ top: 4, right: 6, left: -14, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#0a1f0a" vertical={false} />
                        <XAxis dataKey="year" stroke="#2a4a2a" tick={{ fontSize: 9, fill: '#5a8a5a' }} />
                        <YAxis stroke="#2a4a2a" tick={{ fontSize: 9, fill: '#5a8a5a' }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#071208', borderColor: '#39ff14', fontSize: 10, color: '#d6ffba' }}
                            formatter={(v, n) => [n === 'risk' ? `${v}%` : `${v}°C`, n === 'risk' ? 'Risk' : 'Temp']}
                        />
                        <ReferenceLine y={26} stroke="#39ff14" strokeDasharray="4 3" strokeOpacity={0.25} label={{ value: 'baseline', fill: '#3a6a3a', fontSize: 8 }} />
                        <Area type="monotone" dataKey="temperature" name="temperature" stroke={sc.color}   fill={sc.color}   fillOpacity={0.18} strokeWidth={2} dot={false} />
                        <Area type="monotone" dataKey="risk"        name="risk"        stroke="#22d3ee"    fill="#22d3ee"    fillOpacity={0.10} strokeWidth={1.5} dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
