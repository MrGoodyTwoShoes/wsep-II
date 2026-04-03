import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

function MetricCard({ label, value, unit, trend, formula }) {
  const [displayValue, setDisplayValue] = useState(0)
  const [showFormula, setShowFormula] = useState(false)

  useEffect(() => {
    const increment = (typeof value === 'number' ? value : 0) / 50 // animate over 50 steps
    const timer = setInterval(() => {
      setDisplayValue(prev => {
        const next = prev + increment
        if (next >= value) {
          clearInterval(timer)
          return value
        }
        return next
      })
    }, 20)
    return () => clearInterval(timer)
  }, [value])

  const renderValue = () => {
    if (typeof value === 'number') {
      return String(value.toLocaleString('en-US', { maximumFractionDigits: 4 }))
    }
    return String(value)
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="glow-border glow-pulse rounded-xl border border-green-500/40 bg-[#07120a]/70 p-4 shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wider text-green-300">{label}</div>
        <button
          aria-label={`Toggle ${label} math definition`}
          onClick={() => setShowFormula(prev => !prev)}
          className="text-xs text-green-200 hover:text-green-100"
        >
          {showFormula ? '🤓 hide' : '🧮 info'}
        </button>
      </div>
      <div className="mt-2 text-3xl font-extrabold text-green-100 break-words">
        {renderValue()} <span className="text-sm font-medium text-green-200 whitespace-nowrap">{unit}</span>
      </div>
      {trend && <div className="mt-1 text-sm text-green-200">{trend}</div>}
      {showFormula && (
        <div className="mt-2 rounded-lg border border-green-500/30 bg-black/60 p-2 text-xs text-green-200 break-words">
          <div className="font-semibold text-green-300">Formula</div>
          <p>{formula}</p>
        </div>
      )}
    </motion.div>
  )
}

export default function GlobalOverview({ metrics }) {
  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold text-green-200">Global Overview</h2>
        <div className="flex items-center gap-2 text-xs text-green-300">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
          Live
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Avg Temperature"
          value={metrics.temperature}
          unit="°C"
          trend="+1.2°C in 5yrs"
          formula="avg_temp = (Σ county_temperature_i / n_counties) + warming_trend_factor"
        />
        <MetricCard
          label="CO₂ Level"
          value={metrics.co2}
          unit="ppm"
          trend="+3.1ppm last month"
          formula="co2_level = baseline_co2 + emissions_rate * 0.05 + global_pollution_index"
        />
        <MetricCard
          label="Renewable Energy"
          value={metrics.renewableShare}
          unit="%"
          trend="+0.9% since last quarter"
          formula="renewable_share = (renewable_output / total_output) * 100"
        />
        <MetricCard
          label="Climate Risk Index"
          value={metrics.risk}
          unit=""
          trend="Moderate"
          formula="risk_index = 0.4*temp_anomaly + 0.3*(co2_level/600) + 0.3*(climate_event_score/100)"
        />
      </div>
    </div>
  )
}
