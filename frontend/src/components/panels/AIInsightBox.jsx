import { motion } from 'framer-motion'

export default function AIInsightBox({ selectedCountyData }) {
    const insight = selectedCountyData
        ? `Transport emissions rising in ${selectedCountyData.name} (+${(Math.random() * 20 + 5).toFixed(1)}%). Suggested action: Increase EV adoption incentives.`
        : "Select a county to view AI insights."

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-yellow-500/40 bg-[#0a1a0a]/80 p-4 shadow-lg"
        >
            <div className="mb-2 text-sm font-bold text-yellow-300">🤖 AI Insight</div>
            <p className="text-xs text-green-100">{insight}</p>
        </motion.div>
    )
}