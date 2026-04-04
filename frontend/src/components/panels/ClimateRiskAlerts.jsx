import { useState } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

const levelMeta = {
    high:   { cls: 'bg-red-500/20 border-red-400/60 text-red-300',    dot: '#f87171', score: 80, pulse: 'animate-pulse' },
    medium: { cls: 'bg-yellow-500/15 border-yellow-300/50 text-yellow-200', dot: '#fcd34d', score: 50, pulse: '' },
    low:    { cls: 'bg-green-500/10 border-green-300/40 text-green-200',    dot: '#6ee7b7', score: 20, pulse: '' },
}

const ACTIONS = {
    flood:    ['Evacuate low-lying settlements', 'Alert road transport ops', 'Pre-position water pumps'],
    drought:  ['Activate water trucking routes', 'Issue livestock advisory', 'Suspend irrigation quotas'],
    heatwave: ['Open cooling centres in Nairobi', 'Restrict outdoor work 11am–3pm', 'Alert AMREF health teams'],
}

const PEAK_ETA = {
    flood:    '72 h window',
    drought:  '14-day deficit',
    heatwave: 'Next 3 days',
}

export default function ClimateRiskAlerts({ alerts }) {
    const [expanded, setExpanded] = useState(null)

    // Composite risk score (0–100) — weighted average of level scores
    const levelWeights = { high: 1.0, medium: 0.5, low: 0.1 }
    const composite = Math.round(
        alerts.reduce((sum, a) => sum + (levelMeta[a.level]?.score ?? 50) * (levelWeights[a.level] ?? 0.5), 0) /
        Math.max(1, alerts.length)
    )
    const gaugeColor = composite >= 65 ? '#f87171' : composite >= 40 ? '#fcd34d' : '#6ee7b7'
    const gaugeData  = [{ value: composite, fill: gaugeColor }]

    return (
        <div className="flex h-full flex-col gap-2 overflow-hidden">
            {/* Header + gauge */}
            <div className="flex items-center justify-between">
                <div className="text-base font-bold text-green-200">⚠️ Risk Alerts</div>
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <div className="text-[9px] uppercase tracking-wide text-green-500">Composite Score</div>
                        <div className="text-lg font-bold leading-tight" style={{ color: gaugeColor }}>{composite}</div>
                    </div>
                    <div className="h-10 w-10 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                                cx="50%" cy="100%"
                                innerRadius="60%" outerRadius="100%"
                                startAngle={180} endAngle={0}
                                data={gaugeData}
                            >
                                <RadialBar dataKey="value" background={{ fill: '#0a1f0a' }} cornerRadius={4} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Alert cards */}
            <div className="flex flex-col gap-1.5 overflow-auto">
                {alerts.map(alert => {
                    const meta = levelMeta[alert.level] || levelMeta.medium
                    const open = expanded === alert.id
                    return (
                        <div
                            key={alert.id}
                            className={`rounded-lg border p-2.5 text-sm ${meta.cls} ${meta.pulse} glow-hover cursor-pointer`}
                            onClick={() => setExpanded(open ? null : alert.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-semibold">
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
                                    {alert.title}
                                    <span className="ml-1 rounded border px-1 text-[9px] uppercase tracking-wide opacity-70
                                        border-current">{alert.level}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] opacity-60">
                                    <span>🕐 {PEAK_ETA[alert.id] ?? '–'}</span>
                                    <span>{open ? '▲' : '▼'}</span>
                                </div>
                            </div>
                            <p className="mt-0.5 text-xs opacity-80">{alert.message}</p>
                            {open && ACTIONS[alert.id] && (
                                <div className="mt-1.5 border-t border-current/20 pt-1.5">
                                    <div className="mb-0.5 text-[9px] uppercase tracking-wide opacity-60">Recommended Actions</div>
                                    <ul className="space-y-0.5">
                                        {ACTIONS[alert.id].map((a, i) => (
                                            <li key={i} className="flex items-start gap-1 text-[10px]">
                                                <span className="mt-0.5 text-[8px]">▸</span>{a}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
