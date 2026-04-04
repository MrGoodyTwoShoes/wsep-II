import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [county, setCounty] = useState('Nairobi');

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full bg-black/80 backdrop-blur border-b border-green-400/20 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-400/20 rounded flex items-center justify-center border border-green-400">
            <span className="text-green-400 font-bold">🛰</span>
          </div>
          <h1 className="text-2xl font-bold text-green-400">WSEP 2.0</h1>
          <p className="text-gray-400 text-sm ml-4">Climate Intelligence Dashboard</p>
        </div>

        <div className="flex gap-6">
          <select 
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="bg-black border border-green-400 text-green-400 px-4 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs bg-green-400/10 border border-green-400 text-green-400 rounded hover:bg-green-400/20 transition">Climate</button>
            <button className="px-3 py-1 text-xs bg-green-400/10 border border-green-400 text-green-400 rounded hover:bg-green-400/20 transition">Transport</button>
            <button className="px-3 py-1 text-xs bg-green-400/10 border border-green-400 text-green-400 rounded hover:bg-green-400/20 transition">Agriculture</button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}