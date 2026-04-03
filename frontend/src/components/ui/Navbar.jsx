import { motion } from 'framer-motion'

const layerInfo = [
  { key: 'climate', label: 'Climate' },
  { key: 'transport', label: 'Transport' },
  { key: 'agriculture', label: 'Agriculture' }
]

export default function Navbar({ countyList, selectedCounty, onSelectCounty, layerState, onSetLayer }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed left-0 right-0 top-0 z-50 border-b border-green-600/40 bg-black/70 px-4 py-3 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-widest text-green-400">WSEP 2.0</h1>
          <p className="text-xs text-green-300">Climate + Mobility Intelligence Platform (Kenya)</p>
        </div>
        <div className="flex flex-1 items-center justify-center gap-3">
          <select
            aria-label="Select county"
            className="rounded-lg border border-green-400/50 bg-black/80 px-3 py-2 text-green-100 outline-none focus:border-neon-400"
            value={selectedCounty ?? ''}
            onChange={(e) => onSelectCounty(Number(e.target.value) || null)}
          >
            <option value="">All Counties</option>
            {countyList.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="flex gap-2">
            {layerInfo.map(item => (
              <label key={item.key} className="flex cursor-pointer items-center gap-1 text-sm text-green-300">
                <input
                  type="checkbox"
                  checked={layerState[item.key]}
                  onChange={() => onSetLayer(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className="h-4 w-4 accent-green-400"
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
