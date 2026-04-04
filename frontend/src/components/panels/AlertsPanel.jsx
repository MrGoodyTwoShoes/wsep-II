import { mockData } from '../data/mockData';
import { motion } from 'framer-motion';

export default function AlertsPanel() {
  const severityColors = {
    critical: 'bg-red-900/30 border-red-400',
    high: 'bg-orange-900/30 border-orange-400',
    moderate: 'bg-yellow-900/30 border-yellow-400',
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glow-border p-6 bg-black/40 col-span-3 row-span-2 hover-glow"
    >
      <h3 className="text-green-400 font-bold mb-4">🚨 Climate Alerts</h3>
      <div className="space-y-3">
        {mockData.alerts.map((alert, i) => (
          <motion.div
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`p-3 rounded border ${severityColors[alert.severity]} pulse-glow`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">{alert.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm text-white">{alert.type}</p>
                <p className="text-xs text-gray-400">{alert.region}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}