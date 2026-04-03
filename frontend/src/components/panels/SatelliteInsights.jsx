const severityClass = {
    low: 'text-green-300',
    medium: 'text-yellow-300',
    high: 'text-red-400'
}

const icons = {
    low: '🌿',
    medium: '🌡️',
    high: '🔥'
}

export default function SatelliteInsights({ list }) {
    return (
        <div>
            <h2 className="mb-3 text-lg font-bold text-green-200">Satellite Insights</h2>
            <ul className="space-y-2">
                {list.map((item) => (
                    <li key={item.id} className="rounded-xl border border-green-500/40 bg-[#06100b]/80 p-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-xl">{icons[item.severity] || '🛰️'}</div>
                            <div>
                                <p className="text-sm text-green-100">{item.label}</p>
                                <p className={`text-xs ${severityClass[item.severity]}`}>Severity: {item.severity.toUpperCase()}</p>
                            </div>
                            <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-200">Score {item.score}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
