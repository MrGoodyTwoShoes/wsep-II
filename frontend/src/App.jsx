import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/ui/Navbar'
import GlobalOverview from './components/dashboard/GlobalOverview'
import GeoSpatialMap from './components/map/GeoSpatialMap'
import EnergyInsightsPanel from './components/panels/EnergyInsightsPanel'
import TransportEmissionsPanel from './components/panels/TransportEmissionsPanel'
import ClimateTrends from './components/panels/ClimateTrends'
import SatelliteInsights from './components/panels/SatelliteInsights'
import ClimateRiskAlerts from './components/panels/ClimateRiskAlerts'
import AIInsightBox from './components/panels/AIInsightBox'
import CountyDetailPanel from './components/panels/CountyDetailPanel'
import RoadStatusPanel from './components/panels/RoadStatusPanel'
import AIProjections from './components/panels/AIProjections'
import mockData from './data/mockData'

// Fallback / initial data — full mockData ensures map and charts render immediately
const defaultData = mockData

export default function App() {
    const [data, setData] = useState(defaultData)
    const [activeCounty, setActiveCounty] = useState(null)
    const [layerState, setLayerState] = useState({ climate: true, transport: true, agriculture: true })
    const [satellitesPayload, setSatellitesPayload] = useState(null)
    const [roadStatus, setRoadStatus] = useState(null)

    // Production (Render): frontend + backend on same origin → use relative URLs.
    // Local dev: fall back to local backend.
    const BACKEND_BASE = import.meta.env.PROD
        ? ''
        : (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000')

    // Fetch unified dashboard data from backend
    useEffect(() => {
        const getDashboard = async () => {
            const endpoints = [
                `${BACKEND_BASE}/dashboard`,
                'http://127.0.0.1:8002/dashboard',
                'http://127.0.0.1:8001/dashboard'
            ]

            for (const url of endpoints) {
                try {
                    const res = await fetch(url)
                    if (!res.ok) throw new Error(`bad status ${res.status} from ${url}`)
                    const json = await res.json()
                    setData(json)
                    setSatellitesPayload(json.satellites)
                    console.log('Dashboard data fetched', url)
                    return
                } catch (err) {
                    console.warn('dashboard fetch failed for', url, err.message)
                }
            }

            console.error('dashboard fetch failed for all endpoints')
        }

        getDashboard()
        const interval = setInterval(getDashboard, 5000)
        return () => clearInterval(interval)
    }, [])

    // Simulate live metric updates (temperature, CO2, etc.)
    useEffect(() => {
        const tick = setInterval(() => {
            setData(current => ({
                ...current,
                global: {
                    ...current.global,
                    temperature: Number((current.global.temperature + (Math.random() - 0.45) * 0.08).toFixed(2)),
                    co2: Number((current.global.co2 + (Math.random() - 0.4) * 0.25).toFixed(2)),
                    renewableShare: Number(Math.min(100, Math.max(15, current.global.renewableShare + (Math.random() - 0.5) * 0.4)).toFixed(1)),
                    risk: Number(Math.min(100, Math.max(1, current.global.risk + (Math.random() - 0.36) * 0.3)).toFixed(1))
                },
                trends: current.trends.map(row => ({
                    ...row,
                    temperature: Number((row.temperature + (Math.random() - 0.5) * 0.04).toFixed(2)),
                    rainfall: Number(Math.max(0, (row.rainfall + (Math.random() - 0.5) * 0.6).toFixed(1))),
                    co2: Number((row.co2 + (Math.random() - 0.4) * 0.1).toFixed(2))
                })),
                countyData: current.countyData.map(county => ({
                    ...county,
                    temperature: Number((county.temperature + (Math.random() - 0.5) * 0.08).toFixed(2)),
                    vegetation: Number(Math.max(0, Math.min(1, county.vegetation + (Math.random() - 0.5) * 0.01)).toFixed(3)),
                    airQuality: Number(Math.max(20, Math.min(300, county.airQuality + (Math.random() - 0.5) * 2)))
                }))
            }))
        }, 3500)

        return () => clearInterval(tick)
    }, [])

    const selectedCountyData = useMemo(() => {
        if (!activeCounty) return null
        return data.countyData.find(cdc => cdc.id === activeCounty)
    }, [activeCounty, data.countyData])

    const regionalClimate = useMemo(() => {
        const regions = {}
        data.countyData.forEach(c => {
            const current = regions[c.region] || { count: 0, temperature: 0, vegetation: 0, airQuality: 0, floodRisk: 0, droughtRisk: 0, heatwaveRisk: 0 }
            regions[c.region] = {
                count: current.count + 1,
                temperature: current.temperature + c.temperature,
                vegetation: current.vegetation + c.vegetation,
                airQuality: current.airQuality + c.airQuality,
                floodRisk: current.floodRisk + c.floodRisk,
                droughtRisk: current.droughtRisk + c.droughtRisk,
                heatwaveRisk: current.heatwaveRisk + c.heatwaveRisk
            }
        })

        return Object.entries(regions).map(([region, agg]) => {
            const avgTemp = Number((agg.temperature / agg.count).toFixed(2))
            const avgVeg = Number((agg.vegetation / agg.count).toFixed(3))
            const avgAQ = Number((agg.airQuality / agg.count).toFixed(1))
            const avgFlood = Number((agg.floodRisk / agg.count).toFixed(1))
            const avgDrought = Number((agg.droughtRisk / agg.count).toFixed(1))
            const avgHeat = Number((agg.heatwaveRisk / agg.count).toFixed(1))
            return {
                region,
                counters: agg.count,
                today: { temperature: avgTemp, vegetation: avgVeg, airQuality: avgAQ, floodRisk: avgFlood, droughtRisk: avgDrought, heatwaveRisk: avgHeat },
                proj2030: { temperature: Number((avgTemp + 1.6).toFixed(2)), vegetation: Number(Math.max(0, avgVeg - 0.047).toFixed(3)), airQuality: Number((avgAQ + 4.5).toFixed(1)), floodRisk: Number(Math.min(100, avgFlood + 14).toFixed(1)), droughtRisk: Number(Math.min(100, avgDrought + 12).toFixed(1)), heatwaveRisk: Number(Math.min(100, avgHeat + 15).toFixed(1)) }
            }
        }).sort((a, b) => a.region.localeCompare(b.region))
    }, [data.countyData])

    useEffect(() => {
        // Clear stale data immediately so the previous county's info never bleeds through
        setRoadStatus(null)

        if (!selectedCountyData) return

        const refreshRoadStatus = async () => {
            const endpoints = [
                `${BACKEND_BASE}/road-status?county=${encodeURIComponent(selectedCountyData.name)}`,
                `http://127.0.0.1:8002/road-status?county=${encodeURIComponent(selectedCountyData.name)}`,
                `http://127.0.0.1:8001/road-status?county=${encodeURIComponent(selectedCountyData.name)}`
            ]

            for (const url of endpoints) {
                try {
                    const res = await fetch(url)
                    if (!res.ok) throw new Error(`bad status ${res.status}`)
                    const json = await res.json()
                    setRoadStatus(json)
                    return
                } catch (err) {
                    console.warn('road status fetch failed', url, err.message)
                }
            }

            // All endpoints unreachable — set a placeholder so the panel shows something
            setRoadStatus({
                area: selectedCountyData.name,
                roadCount: 0,
                roadQuality: 0,
                driveTime: 'n/a',
                nextInspection: 'n/a',
                highways: []
            })
        }

        refreshRoadStatus()
    // Re-run only when the selected county ID changes, not on every 3.5s data tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCounty])

    return (
        <div className="min-h-screen bg-[#05070c] text-green-400">
            <Navbar
                countyList={data.countyData}
                selectedCounty={activeCounty}
                onSelectCounty={setActiveCounty}
                layerState={layerState}
                onSetLayer={setLayerState}
                selectedCountyData={selectedCountyData}
            />
            <div className="px-4 pb-8 pt-20">
                <GlobalOverview metrics={data.global} />
                <div className="mt-4 grid grid-cols-12 gap-4" style={{ gridTemplateRows: 'repeat(6, minmax(108px, 1fr))' }}>
                    <motion.div layout className="col-span-3 row-span-3 glow-border rounded-xl bg-[rgba(0,0,0,0.6)] p-4 glow-hover">
                        <EnergyInsightsPanel energy={data.energy} />
                    </motion.div>
                    <motion.div layout className="col-span-3 row-span-3 glow-border rounded-xl bg-[rgba(0,0,0,0.6)] p-4 glow-hover">
                        <CountyDetailPanel
                            data={selectedCountyData}
                            regions={regionalClimate}
                            countyList={data.countyData}
                            onSelectCounty={setActiveCounty}
                            onClose={() => setActiveCounty(null)}
                            inline
                        />

                        <div className="mt-3">
                            <RoadStatusPanel roadStatus={roadStatus} selectedCounty={selectedCountyData} />
                        </div>
                    </motion.div>
                    <motion.div layout className="col-span-3 row-span-2 glow-border rounded-xl bg-[rgba(0,0,0,0.6)] p-4 glow-hover">
                        <TransportEmissionsPanel transport={data.transport} />
                    </motion.div>
                    <motion.div layout className="col-span-3 row-span-2 glow-border rounded-xl bg-[rgba(0,0,0,0.6)] p-4 glow-hover">
                        <AIInsightBox selectedCountyData={selectedCountyData} />
                    </motion.div>
                    <motion.div layout className="col-span-6 row-span-4 glow-border rounded-xl bg-[rgba(0,0,0,0.7)] p-3 glow-hover">
                        <GeoSpatialMap
                            countiesGeo={data.countiesGeo}
                            countyData={data.countyData}
                            selectedCounty={activeCounty}
                            onSelectCounty={setActiveCounty}
                            layerState={layerState}
                            satelliteData={satellitesPayload?.satellites || []}
                        />
                    </motion.div>

                    <motion.div layout className="col-span-3 row-span-2 glow-border rounded-xl bg-[rgba(0,0,0,0.6)] p-4 glow-hover">
                        <ClimateTrends trends={data.trends} />
                    </motion.div>
                    <motion.div layout className="col-span-3 row-span-2 glow-border rounded-xl bg-[rgba(0,0,0,0.6)] p-4 glow-hover">
                        <SatelliteInsights list={data.satelliteInsights} />
                    </motion.div>
                    <motion.div layout className="col-span-3 row-span-2 glow-border rounded-xl bg-[rgba(0,0,0,0.6)] p-4 glow-hover">
                        <ClimateRiskAlerts alerts={data.riskAlerts} />
                    </motion.div>
                    <motion.div layout className="col-span-6 row-span-2 glow-border rounded-xl bg-[rgba(0,0,0,0.6)] p-4 glow-hover">
                        <AIProjections projections={data.projections} />
                    </motion.div>
                </div>
            </div>

        </div>
    )
}
