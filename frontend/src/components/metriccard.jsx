import { motion } from 'framer-motion';

export default function MetricCard({ label, value, unit, change, trend }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glow-border p-6 hover-glow bg-black/40"
    >
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-green-400">{value}</p>
          <p className="text-gray-500 text-xs mt-1">{unit}</p>
        </div>
        <div className={`text-sm ${trend === 'up' ? 'text-red-400' : 'text-green-400'}`}>
          {change}
        </div>
      </div>
    </motion.div>
  );
}