export default function RoadStatusPanel({ roadStatus, selectedCounty }) {
    if (!selectedCounty) {
        return (
            <div className="rounded-xl border border-green-500/40 bg-[#061b10]/75 p-3 text-sm text-green-200">
                <div className="font-semibold text-green-300">Road Status</div>
                <div>Select a county to load road reliability details.</div>
            </div>
        )
    }

    if (!roadStatus) {
        return (
            <div className="rounded-xl border border-green-500/40 bg-[#061b10]/75 p-3 text-sm text-green-200">
                <div className="font-semibold text-green-300">Road Status</div>
                <div>Loading road reliability data...</div>
            </div>
        )
    }

    const { area, roadCount, roadQuality, driveTime, nextInspection, highways } = roadStatus

    return (
        <div className="rounded-xl border border-green-500/40 bg-[#061b10]/75 p-3 text-sm text-green-200">
            <div className="mb-2 flex items-center justify-between">
                <div className="font-semibold text-green-300">Road Status</div>
                <span className="text-xs text-green-400">{area}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border border-green-500/30 bg-[#021504]/90 p-2">Road Count: {roadCount}</div>
                <div className="rounded-md border border-green-500/30 bg-[#021504]/90 p-2">Quality: {roadQuality}%</div>
                <div className="rounded-md border border-green-500/30 bg-[#021504]/90 p-2">Drive-time: {driveTime}</div>
                <div className="rounded-md border border-green-500/30 bg-[#021504]/90 p-2">Next Inspection: {nextInspection}</div>
            </div>

            <div className="mt-3">
                <div className="font-semibold text-xs text-green-300 flex items-center gap-1">
                    Road Network (OpenStreetMap)
                    <span title="Data sourced from OpenStreetMap via Overpass API. Synthetic county model used when live data is unavailable." className="cursor-help text-green-500 text-[10px]">ℹ</span>
                </div>
                <div className="mt-1 max-h-36 overflow-y-auto space-y-1">
                    {highways.length > 0 ? highways.map((h, idx) => {
                        const rawName = h.name && h.name !== 'unknown' ? h.name : null
                        const displayName = rawName || `${(h.highway || 'road').replace(/_/g, ' ')} #${idx + 1}`
                        const qual = Number(h.quality_score)
                        const qualColor = qual >= 75 ? 'text-green-300' : qual >= 50 ? 'text-yellow-400' : 'text-red-400'
                        return (
                            <div key={`${h.id}-${idx}`} className="rounded-md border border-green-500/20 bg-[#02210f]/80 p-2 text-xs break-words">
                                <div className="font-bold text-green-100 capitalize">{displayName}</div>
                                <div className="flex gap-3 mt-0.5">
                                    <span>Type: <span className="text-green-200 capitalize">{(h.highway || '—').replace(/_/g, ' ')}</span></span>
                                    <span>Surface: <span className="text-green-200 capitalize">{h.surface || '—'}</span></span>
                                </div>
                                <div className="flex gap-3">
                                    <span>Condition: <span className="text-green-200 capitalize">{h.condition || '—'}</span></span>
                                    <span>Score: <span className={qualColor}>{qual}</span></span>
                                </div>
                            </div>
                        )
                    }) : <p className="text-xs text-green-300">Generating county road model…</p>}
                </div>
            </div>
        </div>
    )
}
