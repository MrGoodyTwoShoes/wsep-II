import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const evNationStats = {
    totalEVs: 39324,
    year2022Count: 1378,
    passengerCars: 318,
    buses: 53,
    threeWheelers: 324,
    forklifts: 227,
    motorcyclesShare: 0.90,
    projected2030EVShare: 0.05,
    policyHighligts: [
        'National Electric Mobility Policy (Feb 2026): zero-rated VAT & excise for e-motorcycles/bicycles and lithium-ion batteries',
        'Kenya Power e-mobility discounted off-peak tariff (approx. Sh8/unit)',
        'Sh6.1bn investment for 10,000 charging stations across major towns/highways'
    ]
}

export default function TransportEmissionsPanel({ transport }) {
    const growthPercent = evNationStats.year2022Count ? Number(((evNationStats.totalEVs - evNationStats.year2022Count) / evNationStats.year2022Count * 100).toFixed(1)) : null
    const calculatedGrowth = evNationStats.year2022Count ? Number((evNationStats.totalEVs / evNationStats.year2022Count).toFixed(1)) : 'N/A'

    return (
        <div>
            <div className="mb-3 text-lg font-bold text-green-200">Transport Emissions & EV Adoption</div>
            <div className="mb-2 flex items-center justify-between text-sm text-green-100">
                <span>Petrol: {transport.petrol}%</span>
                <span>Diesel: {transport.diesel}%</span>
                <span>EV: {transport.ev}%</span>
            </div>
            <div className="mb-3 text-xs text-green-300">CO₂ reduction: {transport.co2Reduction}% versus baseline.</div>

            <ResponsiveContainer width="100%" height={140}>
                <LineChart data={transport.adoptionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#183f13" />
                    <XAxis dataKey="month" stroke="#8cff68" />
                    <YAxis stroke="#8cff68" />
                    <Tooltip contentStyle={{ backgroundColor: '#070f04', borderColor: '#39ff14', color: '#d6ffb5' }} />
                    <Line type="monotone" dataKey="ev" stroke="#39ff14" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 rounded-xl border border-green-500/40 bg-[#061b10]/80 p-3 text-xs text-green-100 break-words">
                <div className="mb-2 text-sm font-bold text-green-300">EV Fleet Snapshot (2026)</div>
                <ul className="space-y-1">
                    <li>Total registered EVs: <strong>{evNationStats.totalEVs.toLocaleString()}</strong></li>
                    <li>2022 baseline: <strong>{evNationStats.year2022Count.toLocaleString()}</strong></li>
                    <li>Implied growth: <strong>{calculatedGrowth}%</strong> (≈ 2,700% reported)</li>
                    <li>Motorcycles share: <strong>{(evNationStats.motorcyclesShare * 100).toFixed(0)}%</strong></li>
                    <li>Passenger cars: <strong>{evNationStats.passengerCars}</strong></li>
                    <li>Buses: <strong>{evNationStats.buses}</strong></li>
                    <li>Three-wheelers: <strong>{evNationStats.threeWheelers}</strong></li>
                    <li>Forklifts: <strong>{evNationStats.forklifts}</strong></li>
                    <li>2030 target: <strong>{(evNationStats.projected2030EVShare * 100).toFixed(1)}%</strong> of new registrations electric</li>
                </ul>

                <div className="mt-3 text-green-200">Growth formula (approx.):</div>
                <div className="text-xs text-green-300 break-words">growth (%) = ((current_ev - baseline_ev) / baseline_ev) * 100</div>

                <div className="mt-3 text-sm font-semibold text-green-300">Policy + infrastructure drivers</div>
                <ul className="mt-1 list-disc pl-5 text-green-300 space-y-1">
                    {evNationStats.policyHighligts.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
            </div>
        </div>
    )
}
