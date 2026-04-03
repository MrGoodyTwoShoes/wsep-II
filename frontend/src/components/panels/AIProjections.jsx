import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function AIProjections({ projections }) {
    return (
        <div>
            <h2 className="mb-3 text-lg font-bold text-green-200">AI Projections</h2>
            <div className="flex flex-wrap gap-2">
                <div className="w-full rounded-xl border border-green-500/40 p-3 text-sm">
                    <div className="text-green-200">Temperature rise (next 15yr)</div>
                    <div className="text-2xl font-bold text-green-100">{projections.temperatureRise}°C</div>
                    <div className="mt-1 h-2 w-full rounded-full bg-green-700/30">
                        <div style={{ width: `${Math.min(100, (projections.temperatureRise / 4) * 100)}%` }} className="h-full rounded-full bg-gradient-to-r from-lime-300 via-lime-400 to-green-500" />
                    </div>
                </div>
                <div className="w-full rounded-xl border border-green-500/40 p-3 text-sm">
                    <div className="text-green-200">Risk escalation</div>
                    <div className="text-2xl font-bold text-green-100">{projections.riskEscalation}%</div>
                    <div className="mt-1 h-2 w-full rounded-full bg-green-700/30">
                        <div style={{ width: `${Math.min(100, projections.riskEscalation)}%` }} className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-orange-300 to-red-400" />
                    </div>
                </div>
            </div>

            <div className="mt-3 h-36">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projections.timeline} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#0f2715" />
                        <XAxis dataKey="year" stroke="#8cff68" />
                        <YAxis stroke="#8cff68" />
                        <Tooltip contentStyle={{ backgroundColor: '#071208', borderColor: '#39ff14', color: '#d6ffba' }} />
                        <Area type="monotone" dataKey="temperature" name="Temperature" stroke="#39ff14" fill="#39ff14" fillOpacity={0.2} />
                        <Area type="monotone" dataKey="risk" name="Risk" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
