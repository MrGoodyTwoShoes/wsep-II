import { useState } from 'react'
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine
} from 'recharts'

const TABS = [
    {
        key: 'temperature',
        label: 'Temp',
        icon: '🌡',
        unit: '°C',
        color: '#39ff14',
        type: 'area',
        desc: 'Mean surface temperature (°C)',
        badColor: (delta) => delta > 0,
    },
    {
        key: 'rainfall',
        label: 'Rain',
        icon: '🌧',
        unit: 'mm',
        color: '#22d3ee',
        type: 'bar',
        desc: 'Annual rainfall (mm)',
        badColor: (delta) => delta < 0,
    },
    {
        key: 'co2',
        label: 'CO₂',
        icon: '☁',
        unit: 'ppm',
        color: '#facc15',
        type: 'area',
        desc: 'Atmospheric CO₂ (ppm)',
        badColor: (delta) => delta > 0,
    },
]

export default function ClimateTrends({ trends }) {
    const [active, setActive] = useState('temperature')
    if (!trends || trends.length < 2) return null

    const tab = TABS.find(t => t.key === active)
    const first = trends[0][active]
    const last  = trends[trends.length - 1][active]
    const delta = last - first
    const bad   = tab.badColor(delta)

    return (
        <div className="flex h-full flex-col gap-1.5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="text-base font-bold text-green-200">🌡 Climate Trends</div>
                <div className={`flex items-center gap-1 text-xs font-bold ${bad ? 'text-red-400' : 'text-green-400'}`}>
                    {delta > 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}{tab.unit}
                    <span className="text-[9px] font-normal text-green-600 ml-0.5">since 2018</span>
                </div>
            </div>

            {/* Metric tabs */}
            <div className="flex gap-1.5">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActive(t.key)}
                        className={`flex-1 flex items-center justify-center gap-1 rounded-lg border py-1 text-[10px] font-semibold transition-all ${
                            active === t.key
                                ? 'text-black border-transparent'
                                : 'border-green-700/40 text-green-600 hover:border-green-500/50 bg-transparent'
                        }`}
                        style={active === t.key ? { backgroundColor: t.color, borderColor: t.color } : {}}
                    >
                        <span>{t.icon}</span> {t.label}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    {tab.type === 'bar' ? (
                        <BarChart data={trends} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#0a1f0a" vertical={false} />
                            <XAxis dataKey="time" stroke="#2a4a2a" tick={{ fontSize: 9, fill: '#5a8a5a' }} />
                            <YAxis stroke="#2a4a2a" tick={{ fontSize: 9, fill: tab.color }} tickFormatter={v => `${v}`} domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#071208', borderColor: tab.color, fontSize: 10 }}
                                formatter={v => [`${v} ${tab.unit}`, tab.desc]}
                            />
                            <ReferenceLine y={trends[0][active]} stroke={tab.color} strokeDasharray="4 3" strokeOpacity={0.3} />
                            <Bar dataKey={active} fill={tab.color} fillOpacity={0.7} radius={[3, 3, 0, 0]} />
                        </BarChart>
                    ) : (
                        <AreaChart data={trends} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#0a1f0a" vertical={false} />
                            <XAxis dataKey="time" stroke="#2a4a2a" tick={{ fontSize: 9, fill: '#5a8a5a' }} />
                            <YAxis stroke="#2a4a2a" tick={{ fontSize: 9, fill: tab.color }} domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#071208', borderColor: tab.color, fontSize: 10 }}
                                formatter={v => [`${v} ${tab.unit}`, tab.desc]}
                            />
                            <ReferenceLine y={trends[0][active]} stroke={tab.color} strokeDasharray="4 3" strokeOpacity={0.3} />
                            <Area
                                type="monotone"
                                dataKey={active}
                                stroke={tab.color}
                                fill={tab.color}
                                fillOpacity={0.15}
                                strokeWidth={2}
                                dot={{ r: 3, fill: tab.color }}
                                activeDot={{ r: 5 }}
                            />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </div>

            {/* Footer note */}
            <div className="text-[9px] text-green-700 px-0.5">{tab.desc} · 2018–2026 · Kenya mean</div>
        </div>
    )
}
