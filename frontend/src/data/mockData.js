const countyNames = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta', 'Garissa', 'Wajir', 'Mandera', 'Marsabit',
  'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga',
  "Murang'a", 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans-Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo',
  'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia',
  'Siaya', 'Kisumu', 'Homabay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi'
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
    { time: '2020', temperature: 24.5, rainfall: 97, co2: 412 },
    { time: '2021', temperature: 25.0, rainfall: 101, co2: 418 },
    { time: '2022', temperature: 25.8, rainfall: 94, co2: 423 },
    { time: '2023', temperature: 26.4, rainfall: 102, co2: 426 }
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
