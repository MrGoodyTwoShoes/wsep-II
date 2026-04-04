const countyNames = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta', 'Garissa', 'Wajir', 'Mandera', 'Marsabit',
  'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga',
  "Murang'a", 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans-Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo',
  'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia',
  'Siaya', 'Kisumu', 'Homabay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi'
]

// ── Cash crop + transport route data (all 47 counties) ─────────────────────
// routeQuality: 'good' | 'medium' | 'poor'
// transportType: 'road' | 'water' | 'rail'
// route: [[lat, lng], ...] waypoints from farm to destination
// Route color is weather-dependent (see getRouteStyle in GeoSpatialMap):
//   road  good   + low flood  → 🟢 green glow
//   road  good   + med flood  → 🟡 yellow glow
//   road  any    + high flood → 🔴 red glow
//   water safe               → 🔵 blue glow
//   water + high flood       → 💙 bright cyan (unsafe)
export const cashCropData = {
  'Nairobi':        { crop: 'Horticulture / Flowers', icon: '🌹', destination: 'JKIA Export Terminal', transportType: 'road', routeQuality: 'good',   route: [[-1.2921,36.8219],[-1.3192,36.9275]] },
  'Kiambu':         { crop: 'Tea & Coffee',            icon: '☕', destination: 'Thika Factories → Mombasa Port', transportType: 'road', routeQuality: 'good',   route: [[-1.0253,36.8099],[-1.0333,37.0833],[-1.2921,36.8219],[-4.0435,39.6652]] },
  'Kajiado':        { crop: 'Livestock / Horticulture',icon: '🐄', destination: 'Nairobi Livestock Market', transportType: 'road', routeQuality: 'medium', route: [[-2.0469,36.7796],[-1.5,36.9],[-1.2921,36.8219]] },
  'Machakos':       { crop: 'Maize & Mango',           icon: '🥭', destination: 'Nairobi Markets',           transportType: 'road', routeQuality: 'medium', route: [[-1.5171,37.2652],[-1.3,37.0],[-1.2921,36.8219]] },
  'Mombasa':        { crop: 'Coconut & Tourism',       icon: '🥥', destination: 'Mombasa Port (export)',     transportType: 'water', routeQuality: 'good',  route: [[-4.0435,39.6652],[-4.06,39.68]] },
  'Kwale':          { crop: 'Coconut & Cotton',        icon: '🌴', destination: 'Mombasa Port via B8',        transportType: 'road', routeQuality: 'medium', route: [[-4.6578,39.4169],[-4.2,39.52],[-4.0435,39.6652]] },
  'Kilifi':         { crop: 'Coconut & Cashew Nuts',   icon: '🥜', destination: 'Mombasa Port',               transportType: 'road', routeQuality: 'good',   route: [[-3.6298,39.5469],[-3.9,39.6],[-4.0435,39.6652]] },
  'Tana River':     { crop: 'Cotton & Irrigated Rice', icon: '🌾', destination: 'Malindi → Mombasa',          transportType: 'road', routeQuality: 'poor',   route: [[-2.8001,40.3006],[-3.2175,40.1169],[-4.0435,39.6652]] },
  'Lamu':           { crop: 'Coconut & Mangrove Fish', icon: '🐟', destination: 'Mombasa Port (dhow route)',  transportType: 'water', routeQuality: 'good',  route: [[-2.2825,40.9031],[-3.0,40.5],[-4.0435,39.6652]] },
  'Taita-Taveta':   { crop: 'Sisal & Horticulture',   icon: '🌿', destination: 'Mombasa Port via A23',       transportType: 'road', routeQuality: 'medium', route: [[-3.4031,38.4669],[-3.8,38.9],[-4.0435,39.6652]] },
  'Garissa':        { crop: 'Livestock (Cattle)',      icon: '🐂', destination: 'Nairobi Livestock Market',   transportType: 'road', routeQuality: 'poor',   route: [[0.4534,39.6469],[-0.3,38.5],[-1.2921,36.8219]] },
  'Wajir':          { crop: 'Livestock (Camels)',      icon: '🐪', destination: 'Garissa → Nairobi',          transportType: 'road', routeQuality: 'poor',   route: [[1.74,40.0554],[0.4534,39.6469],[-1.2921,36.8219]] },
  'Mandera':        { crop: 'Livestock (Camels)',      icon: '🐪', destination: 'Garissa transit hub',        transportType: 'road', routeQuality: 'poor',   route: [[3.9375,41.8606],[1.74,40.0554],[0.4534,39.6469]] },
  'Marsabit':       { crop: 'Livestock & Sorghum',     icon: '🌽', destination: 'Isiolo → Nairobi via A2',   transportType: 'road', routeQuality: 'poor',   route: [[2.7169,37.6652],[0.3517,37.5873],[-1.2921,36.8219]] },
  'Isiolo':         { crop: 'Livestock & Dry Cereals', icon: '🐄', destination: 'Nairobi via A2',             transportType: 'road', routeQuality: 'medium', route: [[0.3517,37.5873],[-0.5,37.4],[-1.2921,36.8219]] },
  'Meru':           { crop: 'Tea & Miraa (Khat)',      icon: '🍃', destination: 'Nairobi (flight/road)',      transportType: 'road', routeQuality: 'good',   route: [[0.0315,37.666],[-0.5348,37.4621],[-1.2921,36.8219]] },
  'Tharaka-Nithi':  { crop: 'Miraa & Mango',          icon: '🥭', destination: 'Meru → Nairobi',             transportType: 'road', routeQuality: 'medium', route: [[-0.4889,37.8997],[0.0315,37.666],[-1.2921,36.8219]] },
  'Embu':           { crop: 'Tea & Coffee',            icon: '☕', destination: 'Thika Factories → Mombasa', transportType: 'road', routeQuality: 'good',   route: [[-0.5348,37.4621],[-1.0333,37.0833],[-1.2921,36.8219]] },
  'Kitui':          { crop: 'Mango & Cotton',          icon: '🥭', destination: 'Nairobi via A109',           transportType: 'road', routeQuality: 'poor',   route: [[-1.3143,38.367],[-1.3,37.5],[-1.2921,36.8219]] },
  'Nyandarua':      { crop: 'Pyrethrum & Potatoes',    icon: '🥔', destination: 'Nairobi Markets',            transportType: 'road', routeQuality: 'medium', route: [[-0.4292,36.3671],[-0.7,36.5],[-1.2921,36.8219]] },
  'Nyeri':          { crop: 'Tea & Coffee',            icon: '☕', destination: 'Thika Factories → Mombasa', transportType: 'road', routeQuality: 'good',   route: [[-0.4167,36.9497],[-1.0333,37.0833],[-1.2921,36.8219]] },
  'Kirinyaga':      { crop: 'Tea & Coffee',            icon: '☕', destination: 'Thika Factories → Nairobi', transportType: 'road', routeQuality: 'good',   route: [[-0.6367,37.2717],[-1.0333,37.0833],[-1.2921,36.8219]] },
  "Murang'a":       { crop: 'Tea & Coffee',            icon: '☕', destination: 'Thika Factories',            transportType: 'road', routeQuality: 'good',   route: [[-0.6762,36.7073],[-1.0333,37.0833]] },
  'Turkana':        { crop: 'Fish & Livestock',        icon: '🐟', destination: 'Nairobi via A1/Lodwar',     transportType: 'road', routeQuality: 'poor',   route: [[2.3184,35.3395],[0.5144,35.2698],[-1.2921,36.8219]] },
  'West Pokot':     { crop: 'Livestock & Sorghum',     icon: '🐄', destination: 'Eldoret Markets',            transportType: 'road', routeQuality: 'poor',   route: [[1.405,35.2927],[0.5144,35.2698]] },
  'Samburu':        { crop: 'Livestock (Cattle)',      icon: '🐄', destination: 'Isiolo Transit Hub',         transportType: 'road', routeQuality: 'poor',   route: [[1.105,37.1808],[0.3517,37.5873]] },
  'Trans-Nzoia':    { crop: 'Maize (Breadbasket)',     icon: '🌽', destination: 'Eldoret Grain Silo → Nairobi', transportType: 'road', routeQuality: 'good', route: [[0.8194,34.9027],[0.5144,35.2698],[-1.2921,36.8219]] },
  'Uasin Gishu':    { crop: 'Wheat & Maize',           icon: '🌾', destination: 'Eldoret → Nairobi via A104', transportType: 'road', routeQuality: 'good',   route: [[0.9117,35.2981],[0.5144,35.2698],[-0.3031,36.0726],[-1.2921,36.8219]] },
  'Elgeyo-Marakwet':{ crop: 'Tea & Maize',             icon: '🍃', destination: 'Eldoret Processing',         transportType: 'road', routeQuality: 'medium', route: [[0.5383,35.3192],[0.5144,35.2698]] },
  'Nandi':          { crop: 'Tea',                     icon: '🍃', destination: 'Kericho → Nairobi/Mombasa', transportType: 'road', routeQuality: 'good',   route: [[0.3964,34.9568],[-0.3667,34.9336],[-0.3031,36.0726],[-1.2921,36.8219]] },
  'Baringo':        { crop: 'Maize & Millet',          icon: '🌽', destination: 'Nakuru → Nairobi',           transportType: 'road', routeQuality: 'medium', route: [[0.6289,35.7806],[-0.3031,36.0726],[-1.2921,36.8219]] },
  'Laikipia':       { crop: 'Wheat & Livestock',       icon: '🌾', destination: 'Nakuru → Nairobi',           transportType: 'road', routeQuality: 'medium', route: [[-0.05,36.7184],[-0.3031,36.0726],[-1.2921,36.8219]] },
  'Nakuru':         { crop: 'Wheat & Pyrethrum',       icon: '🌾', destination: 'Nairobi via A104',           transportType: 'road', routeQuality: 'good',   route: [[-0.3031,36.0726],[-0.7,36.4],[-1.2921,36.8219]] },
  'Narok':          { crop: 'Wheat & Maize',           icon: '🌾', destination: 'Nairobi via B3',             transportType: 'road', routeQuality: 'medium', route: [[-1.0829,35.4264],[-1.2,36.1],[-1.2921,36.8219]] },
  'Kericho':        { crop: 'Tea',                     icon: '🍃', destination: 'Mombasa Port via Nairobi',   transportType: 'road', routeQuality: 'good',   route: [[-0.3667,34.9336],[-0.3031,36.0726],[-1.2921,36.8219],[-4.0435,39.6652]] },
  'Bomet':          { crop: 'Tea',                     icon: '🍃', destination: 'Kericho Factory',            transportType: 'road', routeQuality: 'good',   route: [[-0.7878,34.8],[-0.3667,34.9336],[-0.3031,36.0726],[-1.2921,36.8219]] },
  'Kakamega':       { crop: 'Sugarcane & Tea',         icon: '🎋', destination: 'Mumias Sugar Factory',       transportType: 'road', routeQuality: 'good',   route: [[0.2833,34.7517],[0.3333,34.4833]] },
  'Vihiga':         { crop: 'Tea',                     icon: '🍃', destination: 'Kisumu → Nairobi',           transportType: 'road', routeQuality: 'good',   route: [[0.1064,34.7337],[-0.1022,34.7641],[-1.2921,36.8219]] },
  'Bungoma':        { crop: 'Sugarcane & Maize',       icon: '🎋', destination: 'Mumias Sugar Factory',       transportType: 'road', routeQuality: 'medium', route: [[0.5717,34.5681],[0.3333,34.4833]] },
  'Busia':          { crop: 'Sugarcane',               icon: '🎋', destination: 'Mumias Sugar Factory',       transportType: 'road', routeQuality: 'medium', route: [[0.4744,34.1121],[0.3333,34.4833]] },
  'Siaya':          { crop: 'Sugarcane & Fish',        icon: '🐟', destination: 'Kisumu Port (Lake Victoria)', transportType: 'water', routeQuality: 'good', route: [[0.1778,34.2822],[-0.1022,34.7641]] },
  'Kisumu':         { crop: 'Fish (Tilapia & Nile Perch)', icon: '🐟', destination: 'Nairobi (road + reefer)', transportType: 'road', routeQuality: 'good', route: [[-0.1022,34.7641],[-0.6833,35.5],[-1.2921,36.8219]] },
  'Homabay':        { crop: 'Fish (Lake Victoria)',    icon: '🐟', destination: 'Kisumu Fish Landing Site',   transportType: 'water', routeQuality: 'good',  route: [[-0.5207,34.4758],[-0.1022,34.7641]] },
  'Migori':         { crop: 'Fish & Artisanal Gold',   icon: '⛏', destination: 'Kisumu → Nairobi',           transportType: 'road', routeQuality: 'medium', route: [[-1.0597,34.4731],[-0.1022,34.7641],[-1.2921,36.8219]] },
  'Kisii':          { crop: 'Tea & Coffee',            icon: '☕', destination: 'Kisumu → Nairobi via A1',    transportType: 'road', routeQuality: 'good',   route: [[-0.6833,34.7767],[-0.1022,34.7641],[-1.2921,36.8219]] },
  'Nyamira':        { crop: 'Tea',                     icon: '🍃', destination: 'Kisii → Kisumu factories',  transportType: 'road', routeQuality: 'good',   route: [[-0.5647,34.9333],[-0.6833,34.7767],[-0.1022,34.7641]] },
  'Makueni':        { crop: 'Mango & Semi-arid Crops', icon: '🥭', destination: 'Nairobi via A109',           transportType: 'road', routeQuality: 'medium', route: [[-2.7241,37.7469],[-1.5171,37.2652],[-1.2921,36.8219]] },
}

// EV adoption historical and projected yearly breakdown
export const evAdoptionByYear = [
  { year: '2019', total: 420,  motorcycles: 340,  cars: 55,   buses: 10,  commercial: 15,  charging_stations: 12  },
  { year: '2020', total: 680,  motorcycles: 550,  cars: 80,   buses: 18,  commercial: 32,  charging_stations: 21  },
  { year: '2021', total: 980,  motorcycles: 790,  cars: 112,  buses: 28,  commercial: 50,  charging_stations: 34  },
  { year: '2022', total: 1378, motorcycles: 1100, cars: 160,  buses: 53,  commercial: 65,  charging_stations: 51  },
  { year: '2023', total: 8200, motorcycles: 6800, cars: 940,  buses: 210, commercial: 250, charging_stations: 67  },
  { year: '2024', total: 22000,motorcycles: 18500,cars: 2100, buses: 580, commercial: 820, charging_stations: 140 },
  { year: '2025', total: 39324,motorcycles: 33000,cars: 3500, buses: 1200,commercial: 1624,charging_stations: 210 },
  { year: '2030*',total: 95000,motorcycles: 75000,cars: 12000,buses: 4000,commercial: 4000,charging_stations: 10000},
]

const countyCoordinates = {
  'Mombasa': [39.6652, -4.0435],
  'Kwale': [39.4169, -4.6578],
  'Kilifi': [39.5469, -3.6298],
  'Tana River': [40.3006, -2.8001],
  'Lamu': [40.9031, -2.2825],
  'Taita-Taveta': [38.4669, -3.4031],
  'Garissa': [39.6469, 0.4534],
  'Wajir': [40.0554, 1.7400],
  'Mandera': [41.8606, 3.9375],
  'Marsabit': [37.6652, 2.7169],
  'Isiolo': [37.5873, 0.3517],
  'Meru': [37.6660, 0.0315],
  'Tharaka-Nithi': [37.8997, -0.4889],
  'Embu': [37.4621, -0.5348],
  'Kitui': [38.3670, -1.3143],
  'Machakos': [37.2652, -1.5171],
  'Makueni': [37.7469, -2.7241],
  'Nyandarua': [36.3671, -0.4292],
  'Nyeri': [36.9497, -0.4167],
  'Kirinyaga': [37.2717, -0.6367],
  "Murang'a": [36.7073, -0.6762],
  'Kiambu': [36.8099, -1.0253],
  'Turkana': [35.3395, 2.3184],
  'West Pokot': [35.2927, 1.4050],
  'Samburu': [37.1808, 1.1050],
  'Trans-Nzoia': [34.9027, 0.8194],
  'Uasin Gishu': [35.2981, 0.9117],
  'Elgeyo-Marakwet': [35.3192, 0.5383],
  'Nandi': [34.9568, 0.3964],
  'Baringo': [35.7806, 0.6289],
  'Laikipia': [36.7184, -0.0500],
  'Nakuru': [36.0726, -0.3031],
  'Narok': [35.4264, -1.0829],
  'Kajiado': [36.7796, -2.0469],
  'Kericho': [34.9336, -0.3667],
  'Bomet': [34.8000, -0.7878],
  'Kakamega': [34.7517, 0.2833],
  'Vihiga': [34.7337, 0.1064],
  'Bungoma': [34.5681, 0.5717],
  'Busia': [34.1121, 0.4744],
  'Siaya': [34.2822, 0.1778],
  'Kisumu': [34.7641, -0.1022],
  'Homabay': [34.4758, -0.5207],
  'Migori': [34.4731, -1.0597],
  'Kisii': [34.7767, -0.6833],
  'Nyamira': [34.9333, -0.5647],
  'Nairobi': [36.8219, -1.2921]
}

const baseline = { temperature: 24.5, vegetation: 0.55, airQuality: 60 }

const countyRegions = {
  'Nairobi': 'Nairobi Metro',
  'Kiambu': 'Nairobi Metro',
  'Kajiado': 'Nairobi Metro',
  'Machakos': 'Nairobi Metro',

  'Mombasa': 'Coast',
  'Kwale': 'Coast',
  'Kilifi': 'Coast',
  'Tana River': 'Coast',
  'Lamu': 'Coast',
  'Taita-Taveta': 'Coast',

  'Turkana': 'North',
  'West Pokot': 'North',
  'Samburu': 'North',
  'Marsabit': 'North',
  'Isiolo': 'North',
  'Wajir': 'North',
  'Mandera': 'North',

  'Meru': 'Central',
  'Tharaka-Nithi': 'Central',
  'Embu': 'Central',
  'Nyandarua': 'Central',
  'Nyeri': 'Central',
  'Kirinyaga': 'Central',
  "Murang'a": 'Central',

  'Kitui': 'Eastern',
  'Makueni': 'Eastern',

  'Nakuru': 'Rift',
  'Narok': 'Rift',
  'Baringo': 'Rift',
  'Laikipia': 'Rift',
  'Uasin Gishu': 'Rift',
  'Elgeyo-Marakwet': 'Rift',
  'Nandi': 'Rift',
  'Trans-Nzoia': 'Rift',

  'Kericho': 'Western',
  'Bomet': 'Western',
  'Kakamega': 'Western',
  'Vihiga': 'Western',
  'Bungoma': 'Western',
  'Busia': 'Western',
  'Siaya': 'Western',
  'Kisumu': 'Western',
  'Homabay': 'Western',
  'Migori': 'Western',
  'Kisii': 'Western',
  'Nyamira': 'Western'
}

const countyData = countyNames.map((name, index) => ({
  id: index + 1,
  name,
  region: countyRegions[name] || 'Unknown',
  temperature: Number((baseline.temperature + (Math.random() - 0.5) * 3).toFixed(2)),
  vegetation: Number((baseline.vegetation + (Math.random() - 0.25) * 0.4).toFixed(3)),
  airQuality: Number((baseline.airQuality + (Math.random() - 0.5) * 20).toFixed(1)),
  floodRisk: Math.round(Math.random() * 100),
  droughtRisk: Math.round(Math.random() * 100),
  heatwaveRisk: Math.round(Math.random() * 100)
}))

const countiesGeo = {
  type: 'FeatureCollection',
  features: countyData.map((county, index) => ({
    type: 'Feature',
    properties: {
      id: county.id,
      name: county.name
    },
    geometry: {
      type: 'Point',
      coordinates: countyCoordinates[county.name] || [36.8219, -1.2921]
    }
  }))
}

const mockData = {
  global: {
    temperature: 26.4,
    co2: 426.1,
    renewableShare: 46.2,
    risk: 37.7
  },
  energy: [
    { name: 'Solar', value: 38 },
    { name: 'Wind', value: 22 },
    { name: 'Hydro', value: 28 },
    { name: 'Fossil', value: 12 }
  ],
  transport: {
    petrol: 42,
    diesel: 28,
    ev: 30,
    co2Reduction: 11,
    adoptionTrend: [
      { month: 'Jan', ev: 15 },
      { month: 'Feb', ev: 17 },
      { month: 'Mar', ev: 21 },
      { month: 'Apr', ev: 25 },
      { month: 'May', ev: 28 },
      { month: 'Jun', ev: 30 },
      { month: 'Jul', ev: 32 },
      { month: 'Aug', ev: 35 },
      { month: 'Sep', ev: 37 },
      { month: 'Oct', ev: 39 },
      { month: 'Nov', ev: 41 },
      { month: 'Dec', ev: 44 }
    ]
  },
  trends: [
    { time: '2018', temperature: 23.6, rainfall: 112, co2: 398 },
    { time: '2019', temperature: 24.0, rainfall: 105, co2: 404 },
    { time: '2020', temperature: 24.5, rainfall: 97,  co2: 412 },
    { time: '2021', temperature: 25.0, rainfall: 101, co2: 418 },
    { time: '2022', temperature: 25.8, rainfall: 94,  co2: 423 },
    { time: '2023', temperature: 26.4, rainfall: 102, co2: 426 },
    { time: '2024', temperature: 27.1, rainfall: 88,  co2: 422 },
    { time: '2025', temperature: 27.6, rainfall: 95,  co2: 427 },
    { time: '2026', temperature: 27.9, rainfall: 91,  co2: 430 }
  ],
  satelliteInsights: [
    { id: 1, label: 'Vegetation loss in Turkana', severity: 'high', score: 84 },
    { id: 2, label: 'Urban heat increase Nairobi', severity: 'medium', score: 61 },
    { id: 3, label: 'Coastal erosion Mombasa', severity: 'high', score: 78 },
    { id: 4, label: 'Wetland shrinkage Kisumu', severity: 'low', score: 32 }
  ],
  riskAlerts: [
    { id: 'flood', title: 'Flood', level: 'high', message: 'Western river basins alert: heavy rainfall expected.' },
    { id: 'drought', title: 'Drought', level: 'medium', message: 'Southeast counties under moisture deficit 22%.' },
    { id: 'heatwave', title: 'Heatwave', level: 'high', message: 'Nairobi and surrounding areas above 34°C for next 3 days.' }
  ],
  projections: {
    temperatureRise: 2.8,
    riskEscalation: 17,
    timeline: [
      { year: 2025, temperature: 26.1, risk: 40 },
      { year: 2030, temperature: 27.8, risk: 52 },
      { year: 2035, temperature: 28.9, risk: 63 },
      { year: 2040, temperature: 30.2, risk: 74 }
    ]
  },
  countyData,
  countiesGeo
}

export default mockData
