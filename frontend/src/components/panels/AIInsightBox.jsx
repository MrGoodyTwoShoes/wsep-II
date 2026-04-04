import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NATIONAL_INSIGHTS = [
    { icon: '🌡', tag: 'CLIMATE', text: 'Kenya avg. temp has risen 2.1°C since 1960. Northern counties warming fastest at +0.4°C/decade.' },
    { icon: '☀️', tag: 'ENERGY',  text: 'Renewable share hit 88% in Q1 2024. Geothermal remains backbone at 43% of national grid output.' },
    { icon: '🐂', tag: 'AGRI',    text: 'ASAL counties lose est. 1.2M livestock/yr to drought. Strategic feed reserves reduced losses 18%.' },
    { icon: '🚌', tag: 'MOBILITY',text: 'Nairobi EV bus fleet (BasiGo) has logged 2.1M km, displacing ~420 tonnes CO₂ since inception.' },
    { icon: '💧', tag: 'WATER',   text: 'Lake Turkana dropped 1.4m in 2023 due to Omo River damming upstream — 300,000 fishers affected.' },
    { icon: '🛰', tag: 'SATELLITE',text: 'Taifa-1 NDVI data shows 7.3% vegetation loss in Turkana basin YoY (2022→2023).' },
]

function countyInsights(county) {
    if (!county) return []
    const aqRisk = county.airQuality > 100 ? 'high' : county.airQuality > 60 ? 'moderate' : 'low'
    return [
        {
            icon: '📍', tag: 'COUNTY',
            text: `${county.name}: Temp ${county.temperature?.toFixed(1)}°C · NDVI ${(county.vegetation ?? 0).toFixed(2)} · AQI ${county.airQuality ?? 'N/A'} (${aqRisk})`,
        },
        {
            icon: '🌧', tag: 'RISK',
            text: `Flood risk ${county.floodRisk ?? 0}% · Drought ${county.droughtRisk ?? 0}% · Heatwave ${county.heatwaveRisk ?? 0}% — combined index ${Math.round(((county.floodRisk ?? 0) + (county.droughtRisk ?? 0) + (county.heatwaveRisk ?? 0)) / 3)}`,
        },
        {
            icon: '🤖', tag: 'AI ACTION',
            text: `Suggested: ${county.droughtRisk > 50 ? 'Deploy drought-resistant seed varieties & expand micro-irrigation.' : county.floodRisk > 50 ? 'Pre-position emergency pumps & reroute transport via elevated roads.' : 'Conditions within normal range — maintain early-warning monitoring.'}`,
        },
    ]
}

export default function AIInsightBox({ selectedCountyData }) {
    const allInsights = [...countyInsights(selectedCountyData), ...NATIONAL_INSIGHTS]
    const [idx, setIdx] = useState(0)

    useEffect(() => {
        setIdx(0)
        const t = setInterval(() => setIdx(i => (i + 1) % allInsights.length), 4500)
        return () => clearInterval(t)
    }, [selectedCountyData, allInsights.length])

    const current = allInsights[idx]

    return (
        <div className="flex h-full items-center gap-3 overflow-hidden rounded-xl border border-yellow-500/35 bg-[#0a1500]/80 px-3 py-2 shadow-lg">
            {/* Icon + tag */}
            <div className="flex flex-shrink-0 flex-col items-center gap-0.5">
                <span className="text-xl leading-none">{current.icon}</span>
                <span className="rounded bg-yellow-500/20 px-1 text-[8px] font-bold tracking-widest text-yellow-400">{current.tag}</span>
            </div>

            {/* Rotating insight text */}
            <div className="min-w-0 flex-1">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={idx}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.3 }}
                        className="text-xs leading-relaxed text-green-100"
                    >
                        {current.text}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Dot pagination */}
            <div className="flex flex-shrink-0 flex-col gap-0.5">
                {allInsights.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIdx(i)}
                        className={`h-1.5 w-1.5 rounded-full transition-colors ${i === idx ? 'bg-yellow-400' : 'bg-green-800'}`}
                    />
                ))}
            </div>
        </div>
    )
}