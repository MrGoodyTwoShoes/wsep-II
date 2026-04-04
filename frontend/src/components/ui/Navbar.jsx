import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const layerInfo = [
  { key: 'climate', label: 'Climate' },
  { key: 'transport', label: 'Transport' },
  { key: 'agriculture', label: 'Agriculture' }
]

// ── Weather-reactive rainforest soundscape ─────────────────────────────────
const LAYER_TARGETS = {
  forest: { forest: 0.25, rain: 0,    wind: 0.05, birds: 0.12, thunder: 0   },
  rain:   { forest: 0.06, rain: 0.35, wind: 0.06, birds: 0,    thunder: 0.8 },
  cloudy: { forest: 0.12, rain: 0,    wind: 0.30, birds: 0.04, thunder: 0   },
  sunny:  { forest: 0.08, rain: 0,    wind: 0.02, birds: 0.35, thunder: 0   },
}
const WEATHER_LABELS = {
  forest: { icon: '🌿', label: 'Rainforest' },
  rain:   { icon: '🌧️', label: 'Rainfall'   },
  sunny:  { icon: '☀️',  label: 'Sunlit'     },
  cloudy: { icon: '⛅',  label: 'Zephyr'     },
}
function getWeather(county) {
  if (!county) return 'forest'
  const { floodRisk, heatwaveRisk, droughtRisk } = county
  if (floodRisk > 55) return 'rain'
  if (heatwaveRisk > 55 && droughtRisk > 45) return 'sunny'
  return 'cloudy'
}

export default function Navbar({ countyList, selectedCounty, onSelectCounty, layerState, onSetLayer, selectedCountyData }) {
  const audioCtxRef   = useRef(null)
  const masterRef     = useRef(null)
  const nodesRef      = useRef([])
  const forestGainRef = useRef(null)
  const rainGainRef   = useRef(null)
  const windGainRef   = useRef(null)
  const birdBusRef    = useRef(null)
  const schedulerRef        = useRef(null)
  const thunderBusRef       = useRef(null)
  const thunderSchedulerRef = useRef(null)
  const weatherRef          = useRef('forest')
  const [soundOn, setSoundOn] = useState(false)
  const [weather, setWeather] = useState('forest')

  // ── ISS Radio chatter — independent AudioContext ──────────────────────
  const radioCtxRef       = useRef(null)
  const radioMasterRef    = useRef(null)
  const radioNodesRef     = useRef([])
  const radioSchedulerRef = useRef(null)
  const [radioOn, setRadioOn] = useState(false)

  // ── Crossfade all layers to a new weather condition ─────────────────────
  function crossfadeTo(w) {
    const ctx = audioCtxRef.current
    if (!ctx || ctx.state === 'closed') return
    const now = ctx.currentTime
    const t   = now + 2.5
    const tg  = LAYER_TARGETS[w] || LAYER_TARGETS.forest
    ;[
      [forestGainRef,  tg.forest],
      [rainGainRef,    tg.rain],
      [windGainRef,    tg.wind],
      [birdBusRef,     tg.birds],
      [thunderBusRef,  tg.thunder],
    ].forEach(([ref, target]) => {
      if (!ref.current) return
      ref.current.gain.cancelScheduledValues(now)
      ref.current.gain.setValueAtTime(ref.current.gain.value, now)
      ref.current.gain.linearRampToValueAtTime(target, t)
    })
  }

  // ── React to county selection while sound is running ──────────────────
  useEffect(() => {
    const w = getWeather(selectedCountyData)
    setWeather(w)
    weatherRef.current = w
    crossfadeTo(w)
  }, [selectedCountyData])

  function startAmbient() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    audioCtxRef.current = ctx
    const t0 = ctx.currentTime
    const nodes = []

    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18; comp.ratio.value = 4
    comp.attack.value = 0.05;   comp.release.value = 0.8
    comp.connect(ctx.destination)

    const master = ctx.createGain()
    master.gain.setValueAtTime(0, t0)
    master.gain.linearRampToValueAtTime(0.75, t0 + 3)
    masterRef.current = master
    master.connect(comp)
    nodes.push(comp, master)

    // ── Rainforest reverb (3.5 s exponential-decay IR) ────────────────────
    const irLen = Math.floor(ctx.sampleRate * 3.5)
    const ir    = ctx.createBuffer(2, irLen, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch)
      for (let i = 0; i < irLen; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 1.6)
    }
    const reverb     = ctx.createConvolver(); reverb.buffer = ir
    const reverbSend = ctx.createGain();      reverbSend.gain.value = 0.35
    const reverbOut  = ctx.createGain();      reverbOut.gain.value  = 0.65
    master.connect(reverbSend); reverbSend.connect(reverb)
    reverb.connect(reverbOut);  reverbOut.connect(comp)
    nodes.push(reverb, reverbSend, reverbOut)

    // ── Noise buffer helper ───────────────────────────────────────────────
    function noiseBuf(secs) {
      const buf = ctx.createBuffer(2, Math.floor(ctx.sampleRate * secs), ctx.sampleRate)
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch)
        for (let i = 0; i < buf.length; i++) d[i] = Math.random() * 2 - 1
      }
      return buf
    }

    // ═══════════════════════════════════════════════════════════════════════
    // LAYER 1 — FOREST BASE  (insects + deep jungle drone + leaf rustle)
    // ═══════════════════════════════════════════════════════════════════════
    const forestGain = ctx.createGain()
    forestGainRef.current = forestGain
    forestGain.connect(master)
    nodes.push(forestGain)

    // Cicada / insect hiss: 3.8 – 7.2 kHz
    ;[[5500, 1.5, 0.11], [3800, 0.8, 0.07], [7200, 2.0, 0.05]].forEach(([fr, Q, g]) => {
      const ns = ctx.createBufferSource(); ns.buffer = noiseBuf(6); ns.loop = true
      const bf = ctx.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = fr; bf.Q.value = Q
      const ng = ctx.createGain();         ng.gain.value = g
      ns.connect(bf); bf.connect(ng); ng.connect(forestGain); ns.start()
      nodes.push(ns, bf, ng)
    })

    // Deep jungle drone: 180 – 280 Hz
    const droneNs = ctx.createBufferSource(); droneNs.buffer = noiseBuf(8); droneNs.loop = true
    const droneBF = ctx.createBiquadFilter(); droneBF.type = 'bandpass'; droneBF.frequency.value = 210; droneBF.Q.value = 0.35
    const droneGn = ctx.createGain();         droneGn.gain.value = 0.20
    droneNs.connect(droneBF); droneBF.connect(droneGn); droneGn.connect(forestGain); droneNs.start()
    nodes.push(droneNs, droneBF, droneGn)

    // Leaf rustle: 1.2 – 2.5 kHz
    const rustleNs = ctx.createBufferSource(); rustleNs.buffer = noiseBuf(5); rustleNs.loop = true
    const rustleBF = ctx.createBiquadFilter(); rustleBF.type = 'bandpass'; rustleBF.frequency.value = 1600; rustleBF.Q.value = 0.9
    const rustleGn = ctx.createGain();         rustleGn.gain.value = 0.07
    rustleNs.connect(rustleBF); rustleBF.connect(rustleGn); rustleGn.connect(forestGain); rustleNs.start()
    nodes.push(rustleNs, rustleBF, rustleGn)

    // ═══════════════════════════════════════════════════════════════════════
    // LAYER 2 — RAIN  (body noise + leaf patter + low thunder rumble)
    // ═══════════════════════════════════════════════════════════════════════
    const rainGain = ctx.createGain(); rainGain.gain.value = 0
    rainGainRef.current = rainGain
    rainGain.connect(master)
    nodes.push(rainGain)

    const rainNs   = ctx.createBufferSource(); rainNs.buffer = noiseBuf(10); rainNs.loop = true
    const rainLPF  = ctx.createBiquadFilter(); rainLPF.type = 'lowpass'; rainLPF.frequency.value = 900; rainLPF.Q.value = 0.5
    const rainNsGn = ctx.createGain();         rainNsGn.gain.value = 0.60
    rainNs.connect(rainLPF); rainLPF.connect(rainNsGn); rainNsGn.connect(rainGain); rainNs.start()
    nodes.push(rainNs, rainLPF, rainNsGn)

    const patterNs  = ctx.createBufferSource(); patterNs.buffer = noiseBuf(4); patterNs.loop = true
    const patterBPF = ctx.createBiquadFilter(); patterBPF.type = 'bandpass'; patterBPF.frequency.value = 3800; patterBPF.Q.value = 0.4
    const patterGn  = ctx.createGain();         patterGn.gain.value = 0.18
    patterNs.connect(patterBPF); patterBPF.connect(patterGn); patterGn.connect(rainGain); patterNs.start()
    nodes.push(patterNs, patterBPF, patterGn)

    const rumbleNs  = ctx.createBufferSource(); rumbleNs.buffer = noiseBuf(12); rumbleNs.loop = true
    const rumbleBPF = ctx.createBiquadFilter(); rumbleBPF.type = 'bandpass'; rumbleBPF.frequency.value = 55; rumbleBPF.Q.value = 0.22
    const rumbleGn  = ctx.createGain();         rumbleGn.gain.value = 0.22
    rumbleNs.connect(rumbleBPF); rumbleBPF.connect(rumbleGn); rumbleGn.connect(rainGain); rumbleNs.start()
    nodes.push(rumbleNs, rumbleBPF, rumbleGn)

    // ═══════════════════════════════════════════════════════════════════════
    // LAYER 3 — WIND / ZEPHYR  (gusting bandpass + high whistle + tremolo)
    // ═══════════════════════════════════════════════════════════════════════
    const windGain = ctx.createGain(); windGain.gain.value = 0.05
    windGainRef.current = windGain
    windGain.connect(master)
    nodes.push(windGain)

    const windNs   = ctx.createBufferSource(); windNs.buffer = noiseBuf(8); windNs.loop = true
    const windBPF  = ctx.createBiquadFilter(); windBPF.type = 'bandpass'; windBPF.frequency.value = 750; windBPF.Q.value = 0.38
    const windNsGn = ctx.createGain();         windNsGn.gain.value = 0.42
    windNs.connect(windBPF); windBPF.connect(windNsGn); windNsGn.connect(windGain); windNs.start()
    nodes.push(windNs, windBPF, windNsGn)

    // Slow-gust tremolo LFO (0.15 Hz, ±0.18 amplitude)
    const gustLFO   = ctx.createOscillator(); gustLFO.type = 'sine'; gustLFO.frequency.value = 0.15
    const gustDepth = ctx.createGain();       gustDepth.gain.value = 0.18
    gustLFO.connect(gustDepth); gustDepth.connect(windNsGn.gain); gustLFO.start()
    nodes.push(gustLFO, gustDepth)

    // High zephyr whistle: 2.4 kHz narrow band with slow pitch drift
    const whistleNs       = ctx.createBufferSource(); whistleNs.buffer = noiseBuf(4); whistleNs.loop = true
    const whistleBPF      = ctx.createBiquadFilter(); whistleBPF.type = 'bandpass'; whistleBPF.frequency.value = 2400; whistleBPF.Q.value = 3.0
    const whistleGn       = ctx.createGain();         whistleGn.gain.value = 0.09
    const whistleLFO      = ctx.createOscillator();   whistleLFO.type = 'sine'; whistleLFO.frequency.value = 0.08
    const whistleLFODepth = ctx.createGain();         whistleLFODepth.gain.value = 180
    whistleNs.connect(whistleBPF); whistleBPF.connect(whistleGn); whistleGn.connect(windGain); whistleNs.start()
    whistleLFO.connect(whistleLFODepth); whistleLFODepth.connect(whistleBPF.frequency); whistleLFO.start()
    nodes.push(whistleNs, whistleBPF, whistleGn, whistleLFO, whistleLFODepth)

    // ═══════════════════════════════════════════════════════════════════════
    // LAYER 4 — BIRDS  (Web Audio scheduler — tropical Kenyan bird calls)
    // ═══════════════════════════════════════════════════════════════════════
    const birdBus = ctx.createGain(); birdBus.gain.value = 0.12
    birdBusRef.current = birdBus
    birdBus.connect(master)
    nodes.push(birdBus)

    const BIRDS = [
      { lo: 1800, hi: 2800, ms: 90,  gain: 0.32 }, // Sunbird — short high trill
      { lo: 900,  hi: 1400, ms: 150, gain: 0.28 }, // Weaver  — melodic warble
      { lo: 380,  hi: 480,  ms: 200, gain: 0.30 }, // Hornbill — deep honk
      { lo: 1600, hi: 900,  ms: 220, gain: 0.25 }, // Robin   — descending whistle
      { lo: 1200, hi: 2000, ms: 70,  gain: 0.28 }, // Bulbul  — ascending burst
      { lo: 2200, hi: 2600, ms: 55,  gain: 0.22 }, // Kingfisher — piercing call
    ]

    function scheduleChirp(when) {
      const c = audioCtxRef.current
      if (!c || c.state === 'closed') return
      const bird  = BIRDS[Math.floor(Math.random() * BIRDS.length)]
      const pan   = (Math.random() * 2 - 1) * 0.85
      const dur   = bird.ms / 1000
      const notes = 1 + Math.floor(Math.random() * 3)
      for (let n = 0; n < notes; n++) {
        const ns     = when + n * (dur + 0.015)
        const shift  = 1 + n * 0.07
        const panner = c.createStereoPanner(); panner.pan.value = pan; panner.connect(birdBus)
        for (let h = 0; h < 2; h++) {
          const mul = h === 0 ? 1 : 2
          const osc = c.createOscillator()
          osc.type = h === 0 ? 'sine' : 'triangle'
          osc.frequency.setValueAtTime(bird.lo * shift * mul, ns)
          osc.frequency.exponentialRampToValueAtTime(bird.hi * shift * mul, ns + dur)
          const env = c.createGain()
          env.gain.setValueAtTime(0, ns)
          env.gain.linearRampToValueAtTime(bird.gain / (h + 1), ns + 0.008)
          env.gain.setValueAtTime(bird.gain / (h + 1) * 0.85, ns + dur * 0.65)
          env.gain.exponentialRampToValueAtTime(0.001, ns + dur)
          osc.connect(env); env.connect(panner)
          osc.start(ns); osc.stop(ns + dur + 0.01)
        }
      }
    }

    let nextChirp = t0 + 1.0
    function scheduleTick() {
      const c = audioCtxRef.current
      if (!c || c.state === 'closed') return
      while (nextChirp < c.currentTime + 0.6) {
        scheduleChirp(nextChirp)
        const w = weatherRef.current
        nextChirp += w === 'sunny' ? 0.6 + Math.random() * 1.4 : 5 + Math.random() * 10
      }
    }
    const birdTimer = setInterval(scheduleTick, 100)
    schedulerRef.current = birdTimer
    nodes.push({ stop: () => clearInterval(birdTimer) })

    // ═══════════════════════════════════════════════════════════════════════
    // LAYER 5 — THUNDER  (crack + deep boom + rolling rumble, rain-mode only)
    // ═══════════════════════════════════════════════════════════════════════
    const thunderBus = ctx.createGain(); thunderBus.gain.value = 0
    thunderBusRef.current = thunderBus
    thunderBus.connect(master)
    nodes.push(thunderBus)

    function scheduleThunder(when) {
      const c = audioCtxRef.current
      if (!c || c.state === 'closed') return
      // 1. Sharp crack: broadband noise → highpass 1.5 kHz, 40–80 ms attack+decay
      const crackDur = 0.04 + Math.random() * 0.04
      const crackNs  = c.createBufferSource(); crackNs.buffer = noiseBuf(1)
      const crackHPF = c.createBiquadFilter(); crackHPF.type = 'highpass'; crackHPF.frequency.value = 1500
      const crackGn  = c.createGain()
      crackGn.gain.setValueAtTime(0, when)
      crackGn.gain.linearRampToValueAtTime(0.90, when + 0.003)
      crackGn.gain.exponentialRampToValueAtTime(0.001, when + crackDur)
      crackNs.connect(crackHPF); crackHPF.connect(crackGn); crackGn.connect(thunderBus)
      crackNs.start(when); crackNs.stop(when + crackDur + 0.01)
      // 2. Deep thunder boom: noise → LPF 80 Hz, 1.0–2.5 s exponential decay
      const boomDur = 1.0 + Math.random() * 1.5
      const boomNs  = c.createBufferSource(); boomNs.buffer = noiseBuf(4)
      const boomLPF = c.createBiquadFilter(); boomLPF.type = 'lowpass'; boomLPF.frequency.value = 80; boomLPF.Q.value = 0.8
      const boomGn  = c.createGain()
      boomGn.gain.setValueAtTime(0, when)
      boomGn.gain.linearRampToValueAtTime(0.85, when + 0.015)
      boomGn.gain.exponentialRampToValueAtTime(0.001, when + boomDur)
      boomNs.connect(boomLPF); boomLPF.connect(boomGn); boomGn.connect(thunderBus)
      boomNs.start(when); boomNs.stop(when + boomDur + 0.05)
      // 3. Rolling rumble: BPF 250 Hz, 2–4 s tail
      const rollDur = 2.0 + Math.random() * 2.0
      const rollNs  = c.createBufferSource(); rollNs.buffer = noiseBuf(5)
      const rollBPF = c.createBiquadFilter(); rollBPF.type = 'bandpass'; rollBPF.frequency.value = 250; rollBPF.Q.value = 0.28
      const rollGn  = c.createGain()
      rollGn.gain.setValueAtTime(0, when + 0.01)
      rollGn.gain.linearRampToValueAtTime(0.42, when + 0.08)
      rollGn.gain.exponentialRampToValueAtTime(0.001, when + rollDur)
      rollNs.connect(rollBPF); rollBPF.connect(rollGn); rollGn.connect(thunderBus)
      rollNs.start(when); rollNs.stop(when + rollDur + 0.05)
    }

    let nextThunder = t0 + 4.0 + Math.random() * 12
    function thunderTick() {
      const c = audioCtxRef.current
      if (!c || c.state === 'closed') return
      if (weatherRef.current !== 'rain') {
        nextThunder = c.currentTime + 6 + Math.random() * 14  // stay dormant
        return
      }
      while (nextThunder < c.currentTime + 0.5) {
        scheduleThunder(nextThunder)
        nextThunder += 8 + Math.random() * 22  // 8–30 s between strikes
      }
    }
    const thunderTimer = setInterval(thunderTick, 150)
    thunderSchedulerRef.current = thunderTimer
    nodes.push({ stop: () => clearInterval(thunderTimer) })

    // ── Apply initial weather ─────────────────────────────────────────────
    const tg = LAYER_TARGETS[weatherRef.current] || LAYER_TARGETS.forest
    forestGain.gain.setValueAtTime(tg.forest,   t0 + 0.5)
    rainGain.gain.setValueAtTime(tg.rain,        t0 + 0.5)
    windGain.gain.setValueAtTime(tg.wind,        t0 + 0.5)
    birdBus.gain.setValueAtTime(tg.birds,        t0 + 0.5)
    thunderBus.gain.setValueAtTime(tg.thunder,   t0 + 0.5)

    nodesRef.current = nodes
    setSoundOn(true)
  }

  function stopAmbient() {
    clearInterval(schedulerRef.current)
    clearInterval(thunderSchedulerRef.current)
    schedulerRef.current = null
    thunderSchedulerRef.current = null
    if (masterRef.current && audioCtxRef.current) {
      masterRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 2)
      setTimeout(() => {
        nodesRef.current.forEach(n => { try { n.stop?.() } catch (_) {} })
        nodesRef.current = []
        audioCtxRef.current?.close()
        audioCtxRef.current = null
      }, 2200)
    }
    setSoundOn(false)
  }

  // ── ISS Radio: synthesised radio chatter (telephone BPF range) ────────
  // Static hiss + AM-modulated voice bursts + squelch tones + ACK beeps
  function startRadio() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    radioCtxRef.current = ctx
    const t0    = ctx.currentTime
    const rNodes = []

    // Signal chain: telBPF → radioMaster → comp → destination
    const radioComp = ctx.createDynamicsCompressor()
    radioComp.threshold.value = -12; radioComp.ratio.value = 8
    radioComp.attack.value = 0.001;  radioComp.release.value = 0.15
    radioComp.connect(ctx.destination)

    const radioMaster = ctx.createGain()
    radioMaster.gain.setValueAtTime(0, t0)
    radioMaster.gain.linearRampToValueAtTime(0.45, t0 + 1.5)
    radioMasterRef.current = radioMaster
    radioMaster.connect(radioComp)
    rNodes.push(radioMaster, radioComp)

    // Telephone bandpass: keeps audio in 400–3400 Hz voice range
    const telBPF = ctx.createBiquadFilter()
    telBPF.type = 'bandpass'; telBPF.frequency.value = 1400; telBPF.Q.value = 0.65
    telBPF.connect(radioMaster)
    rNodes.push(telBPF)

    // Mono noise buffer helper (radio is mono)
    function noiseBuf(secs) {
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * secs), ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < buf.length; i++) d[i] = Math.random() * 2 - 1
      return buf
    }

    // ── 1. Constant background static hiss ──────────────────────────────
    const staticNs  = ctx.createBufferSource(); staticNs.buffer = noiseBuf(8); staticNs.loop = true
    const staticBPF = ctx.createBiquadFilter(); staticBPF.type = 'bandpass'; staticBPF.frequency.value = 2200; staticBPF.Q.value = 0.45
    const staticGn  = ctx.createGain();         staticGn.gain.value = 0.18
    staticNs.connect(staticBPF); staticBPF.connect(staticGn); staticGn.connect(telBPF); staticNs.start()
    // 60 Hz AC hum — authentic radio imperfection
    const hum   = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 60
    const humGn = ctx.createGain();       humGn.gain.value = 0.012
    hum.connect(humGn); humGn.connect(telBPF); hum.start()
    rNodes.push(staticNs, staticBPF, staticGn, hum, humGn)

    // ── 2. Transmission scheduler ────────────────────────────────────────
    // Each call: squelch-open chirp → AM voice noise → squelch-close chirp
    // + optional ACK beeps.  Spaced 4–18 s apart.
    let nextTx = t0 + 2.0

    function scheduleTransmission(when) {
      const c = radioCtxRef.current
      if (!c || c.state === 'closed') return
      const voiceDur = 0.8 + Math.random() * 2.4

      // a. Squelch-open chirp (900 → 2400 Hz, 80 ms)
      const sqO   = c.createOscillator(); sqO.type = 'sine'
      sqO.frequency.setValueAtTime(900, when)
      sqO.frequency.linearRampToValueAtTime(2400, when + 0.08)
      const sqOGn = c.createGain()
      sqOGn.gain.setValueAtTime(0, when)
      sqOGn.gain.linearRampToValueAtTime(0.38, when + 0.01)
      sqOGn.gain.setValueAtTime(0.38, when + 0.065)
      sqOGn.gain.linearRampToValueAtTime(0, when + 0.085)
      sqO.connect(sqOGn); sqOGn.connect(telBPF)
      sqO.start(when); sqO.stop(when + 0.09)

      // b. Voice: bandpass noise + AM modulation (3–5 Hz syllable rate)
      const txStart  = when + 0.09
      const vNs      = c.createBufferSource(); vNs.buffer = noiseBuf(4); vNs.loop = true
      const vBPF     = c.createBiquadFilter(); vBPF.type = 'bandpass'; vBPF.frequency.value = 1800; vBPF.Q.value = 1.2
      const vEnv     = c.createGain();         vEnv.gain.value = 0.55
      const amOsc    = c.createOscillator();   amOsc.type = 'sine'; amOsc.frequency.value = 3.0 + Math.random() * 2.0
      const amDepth  = c.createGain();         amDepth.gain.value = 0.38
      vNs.connect(vBPF); vBPF.connect(vEnv); vEnv.connect(telBPF)
      amOsc.connect(amDepth); amDepth.connect(vEnv.gain)  // AM: modulates amplitude
      vEnv.gain.setValueAtTime(0.55, txStart)
      vEnv.gain.setValueAtTime(0.55, txStart + voiceDur - 0.12)
      vEnv.gain.linearRampToValueAtTime(0, txStart + voiceDur)
      vNs.start(txStart); amOsc.start(txStart)
      vNs.stop(txStart + voiceDur + 0.05); amOsc.stop(txStart + voiceDur + 0.05)

      // c. Squelch-close chirp (2400 → 700 Hz, 70 ms)
      const sqCAt = txStart + voiceDur
      const sqC   = c.createOscillator(); sqC.type = 'sine'
      sqC.frequency.setValueAtTime(2400, sqCAt)
      sqC.frequency.linearRampToValueAtTime(700, sqCAt + 0.07)
      const sqCGn = c.createGain()
      sqCGn.gain.setValueAtTime(0, sqCAt)
      sqCGn.gain.linearRampToValueAtTime(0.28, sqCAt + 0.01)
      sqCGn.gain.setValueAtTime(0.28, sqCAt + 0.055)
      sqCGn.gain.linearRampToValueAtTime(0, sqCAt + 0.075)
      sqC.connect(sqCGn); sqCGn.connect(telBPF)
      sqC.start(sqCAt); sqC.stop(sqCAt + 0.08)

      // d. ACK beep (40% chance, 1000 Hz, 150 ms)
      if (Math.random() < 0.40) {
        const bt  = sqCAt + 0.22 + Math.random() * 0.45
        const bOsc = c.createOscillator(); bOsc.type = 'sine'; bOsc.frequency.value = 1000
        const bGn  = c.createGain()
        bGn.gain.setValueAtTime(0, bt)
        bGn.gain.linearRampToValueAtTime(0.28, bt + 0.012)
        bGn.gain.setValueAtTime(0.28, bt + 0.13)
        bGn.gain.linearRampToValueAtTime(0, bt + 0.155)
        bOsc.connect(bGn); bGn.connect(telBPF)
        bOsc.start(bt); bOsc.stop(bt + 0.16)
      }

      // e. Double-beep reply (20% chance, 1200 Hz)
      if (Math.random() < 0.20) {
        ;[0.5, 0.72].forEach(off => {
          const bt  = sqCAt + off
          const rOsc = c.createOscillator(); rOsc.type = 'sine'; rOsc.frequency.value = 1200
          const rGn  = c.createGain()
          rGn.gain.setValueAtTime(0, bt)
          rGn.gain.linearRampToValueAtTime(0.22, bt + 0.01)
          rGn.gain.setValueAtTime(0.22, bt + 0.075)
          rGn.gain.linearRampToValueAtTime(0, bt + 0.095)
          rOsc.connect(rGn); rGn.connect(telBPF)
          rOsc.start(bt); rOsc.stop(bt + 0.10)
        })
      }

      rNodes.push(sqO, sqOGn, vNs, vBPF, vEnv, amOsc, amDepth, sqC, sqCGn)
    }

    function radioTick() {
      const c = radioCtxRef.current
      if (!c || c.state === 'closed') return
      while (nextTx < c.currentTime + 0.5) {
        scheduleTransmission(nextTx)
        nextTx += 4 + Math.random() * 14  // 4–18 s gaps between transmissions
      }
    }
    const radioTimer = setInterval(radioTick, 200)
    radioSchedulerRef.current = radioTimer
    rNodes.push({ stop: () => clearInterval(radioTimer) })

    radioNodesRef.current = rNodes
    setRadioOn(true)
  }

  function stopRadio() {
    clearInterval(radioSchedulerRef.current)
    radioSchedulerRef.current = null
    if (radioMasterRef.current && radioCtxRef.current) {
      radioMasterRef.current.gain.linearRampToValueAtTime(0, radioCtxRef.current.currentTime + 1.2)
      setTimeout(() => {
        radioNodesRef.current.forEach(n => { try { n.stop?.() } catch (_) {} })
        radioNodesRef.current = []
        radioCtxRef.current?.close()
        radioCtxRef.current = null
      }, 1400)
    }
    setRadioOn(false)
  }

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

        {/* Soundscape toggle */}
        <button
          onClick={soundOn ? stopAmbient : startAmbient}
          title={soundOn ? `${WEATHER_LABELS[weather]?.label} — click to disable` : 'Enable rainforest soundscape'}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
            soundOn
              ? 'border-cyan-400/70 bg-cyan-400/10 text-cyan-300 animate-pulse'
              : 'border-green-700/50 text-green-600 hover:border-green-500 hover:text-green-300'
          }`}
        >
          <span>{soundOn ? (WEATHER_LABELS[weather]?.icon ?? '🔊') : '🔇'}</span>
          <span className="hidden sm:inline">{soundOn ? (WEATHER_LABELS[weather]?.label ?? 'ON') : 'Soundscape'}</span>
        </button>

        {/* ISS Radio chatter toggle */}
        <button
          onClick={radioOn ? stopRadio : startRadio}
          title={radioOn ? 'ISS radio chatter ON — click to disable' : 'Enable ISS radio chatter'}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
            radioOn
              ? 'border-orange-400/70 bg-orange-400/10 text-orange-300 animate-pulse'
              : 'border-green-700/50 text-green-600 hover:border-orange-500 hover:text-orange-300'
          }`}
        >
          <span>📡</span>
          <span className="hidden sm:inline">{radioOn ? 'ISS Radio' : 'ISS Radio'}</span>
        </button>
      </div>
    </motion.div>
  )
}
