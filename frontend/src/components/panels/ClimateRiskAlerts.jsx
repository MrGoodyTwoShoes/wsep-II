const levelClass = {
    high: 'bg-red-500/20 border-red-400/60 text-red-300 animate-pulse',
    medium: 'bg-yellow-500/15 border-yellow-300/50 text-yellow-200',
    low: 'bg-green-500/10 border-green-300/40 text-green-200'
}

export default function ClimateRiskAlerts({ alerts }) {
    return (
        <div>
            <h2 className="mb-3 text-lg font-bold text-green-200">Risk Alerts</h2>
            <div className="grid grid-cols-1 gap-2">
                {alerts.map(alert => (
                    <div
                        key={alert.id}
                        className={`rounded-lg border p-3 text-sm ${levelClass[alert.level] || levelClass.medium} glow-hover`}
                    >
                        <div className="font-semibold">{alert.title}</div>
                        <p className="text-xs text-green-100">{alert.message}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
