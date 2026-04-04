import { useState, useEffect } from 'react'

const severityClass = { low: 'text-green-300', medium: 'text-yellow-300', high: 'text-red-400' }
const icons = { low: '🌿', medium: '🌡️', high: '🔥' }

// 4 LEO satellite categories + Earth Obs video tab
const CATEGORIES = [
    { key: 'kenya',         label: '🇰🇪 Kenya',       color: '#39ff14', desc: 'Satellites built and operated by Kenya' },
    { key: 'african',       label: '🌍 African',       color: '#facc15', desc: 'Satellites from other African nations' },
    { key: 'international', label: '🌐 International', color: '#c084fc', desc: 'International missions covering Africa' },
    { key: 'climate',       label: '🌤 Climate Data',  color: '#67e8f9', desc: 'Dedicated climate & weather monitoring' },
    { key: 'earthobs',      label: '🎥 Earth Obs.',    color: '#f97316', desc: 'Real close-up LEO Earth observation footage' },
]

// Curated LEO Earth observation footage
// type 'youtube' → YouTube iframe (only IDs verified embeddable)
// type 'local'   → HTML5 <video> from /public/videos/ — place .mp4 files there for offline reliability
const EARTH_OBS_VIDEOS = [
    {
        type: 'youtube',
        id: 'FG0fTKAqZ5g',
        title: 'Earth from ISS — Time-lapse HD',
        source: 'NASA / ISS Expedition',
        note: 'Continuous LEO observation at 408 km altitude. Africa, Indian Ocean, and East African coastline visible.',
    },
    {
        type: 'local',
        src: '/videos/iss-earth-view.mp4',
        title: 'ISS HD Earth View — East Africa Pass',
        source: 'NASA HDEV / ISS (local file)',
        note: 'Real-time ISS downlink at 7.7 km/s. Same orbit as ISS tracked on Satellite tab.',
        downloadHint: 'Download any NASA ISS Earth video as iss-earth-view.mp4 and place in frontend/public/videos/',
        downloadUrl: 'https://images.nasa.gov',
    },
    {
        type: 'local',
        src: '/videos/sentinel-africa.mp4',
        title: 'East Africa — Sentinel-2 Multispectral',
        source: 'ESA Copernicus / Sentinel-2 (local file)',
        note: '786 km altitude multispectral pass. Same orbit as Sentinel-2A tracked on this dashboard.',
        downloadHint: 'Download an ESA Sentinel Africa clip as sentinel-africa.mp4 and place in frontend/public/videos/',
        downloadUrl: 'https://www.esa.int/ESA_Multimedia/Videos',
    },
]

function EarthObsTab() {
    const [active, setActive] = useState(0)
    const [playing, setPlaying] = useState(false)
    const [localErr, setLocalErr] = useState(false)
    const video = EARTH_OBS_VIDEOS[active]

    // Reset player whenever the clip changes
    useEffect(() => { setPlaying(false); setLocalErr(false) }, [active])

    const isYouTube = video.type === 'youtube'

    return (
        <div className="flex flex-col gap-2">
            {/* Clip selector */}
            <div className="flex flex-col gap-1">
                {EARTH_OBS_VIDEOS.map((v, i) => (
                    <button
                        key={v.type === 'youtube' ? v.id : v.src}
                        onClick={() => setActive(i)}
                        className={`rounded-lg border px-2 py-1.5 text-left text-[10px] transition-all ${
                            active === i
                                ? 'border-orange-400/70 bg-orange-500/10 text-orange-300'
                                : 'border-green-800/40 text-green-500 hover:border-green-600/50'
                        }`}
                    >
                        <span className="font-semibold">{v.title}</span>
                        <span className="ml-2 opacity-60">{v.source}</span>
                    </button>
                ))}
            </div>

            {/* Video embed */}
            <div className="relative w-full overflow-hidden rounded-xl border border-orange-400/30 bg-black"
                 style={{ aspectRatio: '16/9' }}>

                {/* ── YouTube clip ── */}
                {isYouTube && (playing ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full border-0"
                    />
                ) : (
                    <button
                        onClick={() => setPlaying(true)}
                        className="group absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 transition-all hover:bg-black/60"
                    >
                        <img
                            src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                            alt={video.title}
                            className="absolute inset-0 h-full w-full object-cover opacity-40 group-hover:opacity-55 transition-opacity"
                        />
                        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-orange-400 bg-orange-500/20 text-2xl text-orange-300 transition-all group-hover:scale-110 group-hover:bg-orange-500/40">
                            ▶
                        </div>
                        <span className="relative z-10 text-xs font-semibold text-orange-200 drop-shadow">{video.title}</span>
                    </button>
                ))}

                {/* ── Local HTML5 clip ── */}
                {!isYouTube && !localErr && (
                    <video
                        src={video.src}
                        controls
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={() => setLocalErr(true)}
                    />
                )}

                {/* ── Local file not found overlay ── */}
                {!isYouTube && localErr && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0a0500]/90 p-3 text-center">
                        <span className="text-2xl">📂</span>
                        <p className="text-[10px] font-semibold text-orange-300">Video file not loaded</p>
                        <p className="text-[9px] leading-relaxed text-green-500">{video.downloadHint}</p>
                        <a href={video.downloadUrl} target="_blank" rel="noopener noreferrer"
                           className="mt-1 rounded border border-orange-400/60 px-2 py-1 text-[9px] text-orange-400 hover:bg-orange-400/10 transition-all">
                            Download source ↗
                        </a>
                    </div>
                )}
            </div>

            {/* Context note */}
            <div className="rounded-lg border border-orange-400/20 bg-[#0a0a00]/60 px-2 py-1.5">
                <div className="mb-0.5 text-[9px] uppercase tracking-widest text-orange-500">What you're seeing</div>
                <p className="text-[10px] leading-relaxed text-green-300">{video.note}</p>
                <p className="mt-1 text-[9px] text-green-600">
                    LEO altitude ≈ 400–800 km · Orbital speed ~7.7 km/s · Period ~90–100 min
                </p>
            </div>
        </div>
    )
}

export default function SatelliteInsights({ list }) {
    const [liveSats, setLiveSats] = useState([])
    const [activeTab, setActiveTab] = useState('kenya')
    const [expanded, setExpanded]   = useState(null)

    useEffect(() => {
        const load = () =>
            fetch('http://127.0.0.1:8000/satellites/live')
                .then(r => r.json())
                .then(d => setLiveSats(d.satellites || []))
                .catch(() => {})
        load()
        const t = setInterval(load, 5000)
        return () => clearInterval(t)
    }, [])

    const tabSats = liveSats.filter(s => s.category === activeTab)
    const activeCatMeta = CATEGORIES.find(c => c.key === activeTab)

    return (
        <div className="flex flex-col gap-3 h-full overflow-y-auto">
            <h2 className="text-lg font-bold text-green-200 flex items-center gap-2">
                🛰 Satellite &amp; Climate Insights
                <span className="text-xs font-normal text-green-400 animate-pulse">● live</span>
                <span className="ml-auto text-xs text-green-500">{liveSats.length} LEO sats</span>
            </h2>

            {/* ── Category tabs (2 cols × 3 rows, last row spans both for Earth Obs) ── */}
            <div className="grid grid-cols-2 gap-1">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.key}
                        onClick={() => { setActiveTab(cat.key); setExpanded(null) }}
                        className={`rounded-lg px-2 py-1.5 text-xs font-semibold border transition-all text-left ${
                            cat.key === 'earthobs' ? 'col-span-2' : ''
                        } ${activeTab === cat.key
                            ? 'border-opacity-80 bg-black/60'
                            : 'border-green-800/40 bg-transparent hover:bg-green-900/20 text-green-400'
                        }`}
                        style={activeTab === cat.key ? { borderColor: cat.color, color: cat.color } : {}}
                    >
                        <span>{cat.label}</span>
                        {cat.key !== 'earthobs' && (
                            <span className="ml-1 text-[9px] opacity-60">
                                ({liveSats.filter(s => s.category === cat.key).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Earth Obs video tab ── */}
            {activeTab === 'earthobs' && <EarthObsTab />}

            {/* ── Tab description + satellite list (only for the 4 data tabs) ── */}
            {activeTab !== 'earthobs' && (<>
                {activeCatMeta && (
                    <div className="text-[10px] text-green-500 px-1">{activeCatMeta.desc}</div>
                )}

            {/* ── Satellite list for active tab ── */}
            {tabSats.length > 0 ? (
                <ul className="space-y-1.5">
                    {tabSats.map(sat => (
                        <li
                            key={sat.id}
                            className="rounded-lg border bg-[#060f08] p-2 cursor-pointer transition-all hover:bg-[#0c1f11]"
                            style={{ borderColor: expanded === sat.id ? activeCatMeta?.color + '80' : '#16471e' }}
                            onClick={() => setExpanded(expanded === sat.id ? null : sat.id)}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-semibold text-green-100">🛰 {sat.name}</span>
                                        <span
                                            className="text-[9px] px-1.5 py-0.5 rounded-full"
                                            style={{ background: activeCatMeta?.color + '22', color: activeCatMeta?.color }}
                                        >
                                            {sat.origin}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-green-400 mt-0.5">
                                        {sat.altitude_km} km · {sat.inclination_deg}° inc · T={sat.period_min} min
                                    </div>
                                    {sat.data_focus && (
                                        <div className="text-[9px] text-green-600 mt-0.5 truncate">📡 {sat.data_focus}</div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <span
                                        className={`text-[9px] px-1 py-0.5 rounded-full ${
                                            sat.over_kenya ? 'bg-yellow-400/20 text-yellow-300'
                                            : sat.over_africa ? 'bg-green-500/20 text-green-300'
                                            : 'bg-slate-700/40 text-slate-400'
                                        }`}
                                    >
                                        {sat.over_kenya ? 'Over Kenya' : sat.over_africa ? 'Africa' : 'Global'}
                                    </span>
                                    {sat.data_rate_kbps && (
                                        <span className="text-[9px] text-cyan-400">{sat.data_rate_kbps} kbps</span>
                                    )}
                                </div>
                            </div>

                            {expanded === sat.id && (
                                <div className="mt-2 rounded-md bg-black/60 border border-green-700/30 p-2 space-y-0.5">
                                    <div className="text-[9px] text-green-400 font-mono">
                                        <div>Deployed: {sat.deployed_year} · φ {sat.position?.lat}° λ {sat.position?.lng}°</div>
                                        {sat.formulae && <>
                                            <div className="mt-1 text-green-600">{sat.formulae.T_s}</div>
                                            <div className="text-green-600">{sat.formulae.n_deg_s}</div>
                                            <div className="text-green-600">{sat.formulae.J2_drift}</div>
                                            <div className="text-green-600">{sat.formulae.v_eq}</div>
                                        </>}
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-xs text-green-600 text-center py-4">
                    {liveSats.length === 0 ? 'Connecting to satellite feed…' : 'No satellites in this category currently visible.'}
                </div>
            )}

            {/* ── Climate observations (from prop list) ── */}
            {list && list.length > 0 && (
                <div className="rounded-xl border border-green-500/30 bg-[#03100a]/80 p-3 mt-1">
                    <div className="mb-1 text-xs font-bold text-green-300 uppercase tracking-wider">Climate Observations</div>
                    <ul className="space-y-1.5">
                        {list.map(item => (
                            <li key={item.id} className="rounded-lg border border-green-700/40 bg-[#060f08] p-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">{icons[item.severity] || '🛰️'}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-green-100 truncate">{item.label}</p>
                                        <p className={`text-[10px] ${severityClass[item.severity]}`}>
                                            {item.severity.toUpperCase()} · Score {item.score}/100
                                        </p>
                                    </div>
                                    <div className="w-14 h-1.5 rounded-full bg-green-900/60 overflow-hidden shrink-0">
                                        <div
                                            className={`h-full rounded-full ${item.severity === 'high' ? 'bg-red-400' : item.severity === 'medium' ? 'bg-yellow-300' : 'bg-green-400'}`}
                                            style={{ width: `${item.score}%` }}
                                        />
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            </>)}
        </div>
    )
}

