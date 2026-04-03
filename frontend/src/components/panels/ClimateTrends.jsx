import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function ClimateTrends({ trends }) {
    return (
        <div>
            <div className="mb-3 text-lg font-bold text-green-200">Climate Trends</div>
            <ResponsiveContainer width="100%" height={170}>
                <LineChart data={trends} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#092108" />
                    <XAxis dataKey="time" stroke="#8cff68" />
                    <YAxis stroke="#8cff68" />
                    <Tooltip contentStyle={{ backgroundColor: '#071208', borderColor: '#39ff14' }} />
                    <Line type="monotone" dataKey="temperature" name="Temp" stroke="#39ff14" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="rainfall" name="Rainfall" stroke="#22d3ee" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="co2" name="CO2" stroke="#facc15" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
