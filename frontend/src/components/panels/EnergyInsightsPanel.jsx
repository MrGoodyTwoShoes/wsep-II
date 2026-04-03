import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'

const colors = ['#39ff14', '#22d3ee', '#facc15', '#fb7185']

export default function EnergyInsightsPanel({ energy }) {
    return (
        <div>
            <div className="mb-3 text-lg font-bold text-green-200">Energy Mix</div>
            <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                    <Pie data={energy} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                        {energy.map((entry, idx) => (
                            <Cell key={entry.name} fill={colors[idx % colors.length]} />
                        ))}
                    </Pie>
                    <Legend wrapperStyle={{ color: '#b7ffba', fontSize: 11 }} />
                </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-xs text-green-300">Live generation from Solar, Wind, Hydro, Fossil sources.</div>
        </div>
    )
}
