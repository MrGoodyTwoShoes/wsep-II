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
                <div className="font-semibold text-xs text-green-300">Sample highways (OSM)</div>
                <div className="mt-1 max-h-36 overflow-y-auto space-y-1">
                    {highways.length > 0 ? highways.map((h, idx) => (
                        <div key={`${h.id}-${idx}`} className="rounded-md border border-green-500/20 bg-[#02210f]/80 p-2 text-xs break-words">
                            <div className="font-bold text-green-100">{h.name || h.highway || 'Unnamed road'}</div>
                            <div>Type: {h.highway}</div>
                            <div>Surface: {h.surface}</div>
                            <div>Condition: {h.condition}</div>
                            <div>Quality: {h.quality_score}</div>
                        </div>
                    )) : <p className="text-xs text-green-300">No highways loaded yet.</p>}
                </div>
            </div>
        </div>
    )
}
