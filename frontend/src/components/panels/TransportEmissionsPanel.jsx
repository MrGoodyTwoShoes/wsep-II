import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { evAdoptionByYear } from '../../data/mockData'

// ── CO₂ Emissions Formulae ────────────────────────────────────────────────
// Emissions per km:
//   Petrol : E_p = V_fuel × EF_petrol   where EF_petrol ≈ 2.31 kg CO₂/L
//   Diesel : E_d = V_fuel × EF_diesel   where EF_diesel ≈ 2.68 kg CO₂/L
//   EV     : E_e = kWh × EF_grid        where EF_grid   ≈ 0.23 kg CO₂/kWh (Kenya grid mix)
//
// Fleet average emission (kg CO₂ / 100 km):
//   E_fleet = share_petrol × E_p + share_diesel × E_d + share_ev × E_e
//
// CO₂ reduction vs all-petrol baseline:
//   ΔCO₂ (%) = (E_baseline − E_fleet) / E_baseline × 100

const FORMULAE = [
    'E_petrol = V_fuel × 2.31 kg CO₂/L',
    'E_diesel = V_fuel × 2.68 kg CO₂/L',
    'E_EV     = kWh × 0.23 kg CO₂/kWh (Kenya grid)',
    'E_fleet  = Σ(share_i × E_i)',
    'ΔCO₂(%) = (E_baseline − E_fleet) / E_baseline × 100',
]

const evNationStats = {
    totalEVs: 39324,
    year2022Count: 1378,
    passengerCars: 3500,
    buses: 1200,
    motorcycles: 33000,
    commercial: 1624,
    chargingStations2025: 210,
    chargingStations2023: 67,
    motorcyclesShare: 0.84,
    projected2030EVShare: 0.05,
    policyHighligts: [
        'Electric Mobility Policy (2026): zero-rated VAT & excise for e-motorcycles + Li-ion batteries',
        'Kenya Power off-peak e-mobility tariff (≈ Sh8/unit night rate)',
        'Sh6.1bn investment for 10,000 charging stations nationally by 2030',
        'Import duty reduced to 10% for EVs (down from 25%)',
    ],
    operators: [
        { name: 'BasiGo',  type: 'Buses',       desc: '53 e-buses on Nairobi routes; scaling to 1000 by 2026' },
        { name: 'Spiro',   type: 'Motorcycles',  desc: 'Largest e-boda fleet; battery-swap model in 5 counties' },
        { name: 'Roam',    type: 'Motorcycles',  desc: 'Kenya-made electric boda; local assembly in Nairobi' },
        { name: 'Nopea',   type: 'Ride-hailing', desc: 'EV cab service in Nairobi; 100% electric fleet' },
    ]
}

const FUEL_COLORS = { Petrol: '#fb923c', Diesel: '#facc15', EV: '#39ff14' }

export default function TransportEmissionsPanel({ transport }) {
    const [showFormulae, setShowFormulae] = useState(false)
    const calculatedGrowth = evNationStats.year2022Count
        ? Number((evNationStats.totalEVs / evNationStats.year2022Count).toFixed(1))
        : 'N/A'

    const fleetPieData = [
        { name: 'Petrol', value: transport.petrol },
        { name: 'Diesel', value: transport.diesel },
        { name: 'EV',     value: transport.ev },
    ]

    // Computed fleet CO₂ (kg/100 km, relative)
    const e_petrol  = 8.0 * 2.31   // L/100km × EF
    const e_diesel  = 7.5 * 2.68
    const e_ev      = 20  * 0.23   // kWh/100km × EF_grid
    const e_fleet   = ((transport.petrol / 100) * e_petrol + (transport.diesel / 100) * e_diesel + (transport.ev / 100) * e_ev).toFixed(2)
    const e_baseline = e_petrol
    const co2_reduction_computed = ((e_baseline - Number(e_fleet)) / e_baseline * 100).toFixed(1)

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-green-200">Transport &amp; CO₂</div>
                <button
                    onClick={() => setShowFormulae(p => !p)}
                    className="text-[10px] border border-green-600/50 rounded px-2 py-0.5 text-green-400 hover:bg-green-500/10 transition"
                >
                    {showFormulae ? 'hide formulae' : '🧮 show formulae'}
                </button>
            </div>

            {showFormulae && (
                <div className="rounded-xl border border-green-600/30 bg-black/60 p-3 text-[9px] font-mono text-green-300 space-y-1">
                    {FORMULAE.map((f, i) => <div key={i}>{f}</div>)}
                    <div className="mt-1 text-yellow-300">
                        Computed E_fleet ≈ {e_fleet} kg CO₂/100 km
                    </div>
                    <div className="text-yellow-300">
                        CO₂ reduction vs all-petrol = {co2_reduction_computed}%
                    </div>
                </div>
            )}

            {/* Fleet share mini pie */}
            <div className="flex items-center gap-3">
                <ResponsiveContainer width={110} height={110}>
                    <PieChart>
                        <Pie data={fleetPieData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={50} paddingAngle={3}>
                            {fleetPieData.map(entry => (
                                <Cell key={entry.name} fill={FUEL_COLORS[entry.name]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1 text-xs">
                    {fleetPieData.map(d => (
                        <div key={d.name} className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full" style={{ background: FUEL_COLORS[d.name] }} />
                                {d.name}
                            </span>
                            <span className="text-green-100">{d.value}%</span>
                        </div>
                    ))}
                    <div className="mt-1 text-green-400 text-[10px]">CO₂ reduction: {transport.co2Reduction}% (reported) / {co2_reduction_computed}% (computed)</div>
                </div>
            </div>

            {/* EV fleet snapshot */}
            <div className="rounded-xl border border-green-500/40 bg-[#061b10]/80 p-3 text-xs text-green-100">
                <div className="mb-1 text-sm font-bold text-green-300">EV Fleet Snapshot (2025)</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    <div>Total EVs: <strong>{evNationStats.totalEVs.toLocaleString()}</strong></div>
                    <div>Growth since 2022: <strong>×{calculatedGrowth}</strong></div>
                    <div>Motorcycles: <strong>{evNationStats.motorcycles.toLocaleString()}</strong></div>
                    <div>Buses: <strong>{evNationStats.buses.toLocaleString()}</strong></div>
                    <div>Passenger cars: <strong>{evNationStats.passengerCars.toLocaleString()}</strong></div>
                    <div>Commercial: <strong>{evNationStats.commercial.toLocaleString()}</strong></div>
                    <div>Charging stations: <strong>{evNationStats.chargingStations2025}</strong></div>
                    <div>2022 baseline: <strong>{evNationStats.year2022Count}</strong></div>
                </div>
                <div className="mt-2 text-green-400 text-[10px]">2030 target: {(evNationStats.projected2030EVShare * 100).toFixed(1)}% of new registrations electric</div>
            </div>

            {/* EV by vehicle category (stacked bar) */}
            <div className="text-xs text-green-300 font-semibold">EV Registrations by Category (2019–2030)</div>
            <ResponsiveContainer width="100%" height={130}>
                <BarChart data={evAdoptionByYear} margin={{ top: 2, right: 4, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#183f13" />
                    <XAxis dataKey="year" stroke="#8cff68" tick={{ fontSize: 8 }} />
                    <YAxis stroke="#8cff68" tick={{ fontSize: 8 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#070f04', borderColor: '#39ff14', color: '#d6ffb5', fontSize: 10 }} />
                    <Bar dataKey="motorcycles" stackId="a" fill="#39ff14" name="Motorcycles" />
                    <Bar dataKey="cars"        stackId="a" fill="#22d3ee" name="Cars" />
                    <Bar dataKey="buses"       stackId="a" fill="#a78bfa" name="Buses" />
                    <Bar dataKey="commercial"  stackId="a" fill="#fb923c" name="Commercial" radius={[2,2,0,0]} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: '#9beaaa', paddingTop: 2 }} />
                </BarChart>
            </ResponsiveContainer>

            {/* Charging stations trend */}
            <div className="text-xs text-green-300 font-semibold">Charging Stations Network</div>
            <ResponsiveContainer width="100%" height={70}>
                <LineChart data={evAdoptionByYear.filter(d => d.charging_stations > 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#183f13" />
                    <XAxis dataKey="year" stroke="#8cff68" tick={{ fontSize: 8 }} />
                    <YAxis stroke="#8cff68" tick={{ fontSize: 8 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#070f04', borderColor: '#00ffff', color: '#a5f3fc', fontSize: 10 }} />
                    <Line type="monotone" dataKey="charging_stations" stroke="#00ffff" strokeWidth={2} dot={{ r: 2 }} name="Stations" />
                </LineChart>
            </ResponsiveContainer>

            {/* Key operators */}
            <div className="rounded-xl border border-green-500/40 bg-[#061b10]/80 p-3 text-xs">
                <div className="mb-1.5 text-xs font-bold text-green-300">Key EV Operators</div>
                <div className="space-y-1">
                    {evNationStats.operators.map(op => (
                        <div key={op.name} className="flex gap-2 items-start">
                            <span className="shrink-0 font-semibold text-green-200 w-14">{op.name}</span>
                            <span className="text-[10px] text-cyan-400 w-20 shrink-0">[{op.type}]</span>
                            <span className="text-[9px] text-green-500">{op.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Policy drivers */}
            <div className="rounded-xl border border-green-500/40 bg-[#061b10]/80 p-3 text-xs">
                <div className="text-green-300 font-semibold mb-1">Policy Drivers</div>
                <ul className="list-disc pl-4 text-[10px] text-green-400 space-y-0.5">
                    {evNationStats.policyHighligts.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
            </div>
        </div>
    )
}
