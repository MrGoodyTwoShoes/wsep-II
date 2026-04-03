import { motion } from 'framer-motion'
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts'

export default function CountyDetailPanel({ data, regions = [], onClose, inline = false }) {
    const hasCounty = Boolean(data)
    const riskData = hasCounty ? [
        { name: 'Flood', value: data.floodRisk, fill: '#3b82f6' },
        { name: 'Drought', value: data.droughtRisk, fill: '#f59e0b' },
        { name: 'Heatwave', value: data.heatwaveRisk, fill: '#ef4444' }
    ] : []

    const title = hasCounty ? `${data.name} County Overview` : 'Regional Climate Today / 2030'

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={inline ? 'relative mb-4 flex w-full flex-col rounded-2xl border border-green-400/70 bg-[#011307]/95 p-4 shadow-neon' : 'fixed right-4 top-20 z-50 h-[calc(100vh-100px)] w-[400px] max-w-[420px] overflow-y-auto rounded-2xl border border-green-400/70 bg-[#011307]/95 p-5 shadow-neon'}
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-green-100">{title}</h3>
                        <p className="text-xs text-green-300">
                            {hasCounty ? 'Detailed local metrics and risk summary.' : 'Regional climate averages today and 2030 projection.'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-md border border-green-500/50 px-2 py-1 text-xs text-green-100 hover:bg-green-500/20"
                    >
                        Close
                    </button>
                </div>

                {hasCounty ? (
                    <>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="rounded-xl border border-green-500/40 p-3">
                                <div className="flex items-center justify-between text-xs uppercase text-green-300">
                                    <span>Temp</span>
                                    <span className="text-[10px] text-green-400">(∘C)</span>
                                </div>
                                <div className="text-2xl font-semibold text-green-100 break-words">{Number(data.temperature).toLocaleString('en-US', { maximumFractionDigits: 4 })}°C</div>
                                <div className="mt-1 text-[10px] text-green-300">Temp = base + (local variance * 0.23)</div>
                            </div>
                            <div className="rounded-xl border border-green-500/40 p-3">
                                <div className="flex items-center justify-between text-xs uppercase text-green-300">
                                    <span>Vegetation</span>
                                    <span className="text-[10px] text-green-400">(NDVI)</span>
                                </div>
                                <div className="text-2xl font-semibold text-green-100 break-words">{Number(data.vegetation).toLocaleString('en-US', { maximumFractionDigits: 4 })}</div>
                                <div className="mt-1 text-[10px] text-green-300">Vegetation index = satellite_NDVI_mean</div>
                            </div>
                            <div className="rounded-xl border border-green-500/40 p-3">
                                <div className="flex items-center justify-between text-xs uppercase text-green-300">
                                    <span>Air Quality</span>
                                    <span className="text-[10px] text-green-400">(AQI)</span>
                                </div>
                                <div className="text-2xl font-semibold text-green-100 break-words">{Number(data.airQuality).toLocaleString('en-US', { maximumFractionDigits: 4 })}</div>
                                <div className="mt-1 text-[10px] text-green-300">AQI = (PM2.5*0.5 + NO₂*0.3 + O₃*0.2)</div>
                            </div>
                        </div>

                        <div className="mt-6 h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart cx="50%" cy="50%" innerRadius="15%" outerRadius="100%" data={riskData} startAngle={90} endAngle={-270}>
                                    <RadialBar
                                        minAngle={15}
                                        isAnimationActive={true}
                                        animationDuration={900}
                                        animationBegin={100}
                                        label={{ position: 'insideStart', fill: '#24c02a' }}
                                        background
                                        clockWise
                                        dataKey="value"
                                    />
                                    <Legend iconSize={8} layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ color: '#9beaaa' }} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-2 text-xs text-green-200">
                            Risk trends indicate top pressure point: {hasCounty && riskData.length ? riskData.slice().sort((a, b) => b.value - a.value)[0].name : 'N/A'}
                        </div>
                    </>
                ) : (
                    <div className="space-y-3">
                        {regions.map(region => (
                            <div key={region.region} className="rounded-xl border border-green-500/40 p-3">
                                <h4 className="text-sm font-semibold text-green-100">{region.region}</h4>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-green-200">
                                    <div><strong>Counties</strong>: {region.counters}</div>
                                    <div><strong>Temp now</strong>: {region.today.temperature}°C</div>
                                    <div><strong>Veg now</strong>: {region.today.vegetation}</div>
                                    <div><strong>AQI now</strong>: {region.today.airQuality}</div>
                                    <div><strong>Risk</strong>: F{region.today.floodRisk} / D{region.today.droughtRisk} / H{region.today.heatwaveRisk}</div>
                                    <div><strong>2030 Temp</strong>: {region.proj2030.temperature}°C</div>
                                    <div><strong>2030 Veg</strong>: {region.proj2030.vegetation}</div>
                                    <div><strong>2030 AQI</strong>: {region.proj2030.airQuality}</div>
                                    <div><strong>2030 Risk</strong>: F{region.proj2030.floodRisk} / D{region.proj2030.droughtRisk} / H{region.proj2030.heatwaveRisk}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
