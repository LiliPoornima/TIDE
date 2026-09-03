/* ==========================================================================
   TIDE Platform — Multi-Agency Data & Coastal Telemetry Database
   Data Providers: NARA, Sri Lanka Navy (Hydrographic Service), Ocean University (OCU)
   ========================================================================== */

const DATA_PROVIDERS = {
  nara: {
    id: "nara",
    name: "NARA",
    fullTitle: "National Aquatic Resources Research and Development Agency",
    color: "#06b6d4",
    badgeBg: "rgba(6, 182, 212, 0.15)",
    badgeBorder: "rgba(6, 182, 212, 0.3)"
  },
  sl_navy: {
    id: "sl_navy",
    name: "SL Navy",
    fullTitle: "Sri Lanka Navy Hydrographic & Oceanographic Service",
    color: "#3b82f6",
    badgeBg: "rgba(59, 130, 246, 0.15)",
    badgeBorder: "rgba(59, 130, 246, 0.3)"
  },
  ocean_univ: {
    id: "ocean_univ",
    name: "Ocean Univ",
    fullTitle: "Ocean University of Sri Lanka (OCU Marine Research Division)",
    color: "#8b5cf6",
    badgeBg: "rgba(139, 92, 246, 0.15)",
    badgeBorder: "rgba(139, 92, 246, 0.3)"
  }
};

const SITE_DATABASE = {
  colombo_port: {
    id: "colombo_port",
    name: "Colombo Port & Kelani Estuary",
    region: "Western Province",
    lat: 6.9500,
    lng: 79.8400,
    description: "Commercial shipping hub & Kelani river outfall. Monsoonal agricultural & industrial effluent plume zone.",
    dataProvider: "nara",
    sensorNode: "NARA-BUOY-COL01 / SL-NAVY-W04",
    baseValues: { sst: 29.2, do: 4.8, salinity: 31.5, turbidity: 18.5, ph: 7.85, chl_a: 8.2 },
    vulnerabilities: ["Industrial Runoff", "High Turbidity", "Hypoxia Risk"]
  },
  negombo_lagoon: {
    id: "negombo_lagoon",
    name: "Negombo Lagoon Estuary",
    region: "Western Province",
    lat: 7.2083,
    lng: 79.8358,
    description: "Shallow micro-tidal estuary receiving nutrients from Ja-Ela. Monitored jointly by OCU and NARA.",
    dataProvider: "ocean_univ",
    sensorNode: "OCU-LAG-NODE02 / NARA-NEG-04",
    baseValues: { sst: 30.1, do: 3.9, salinity: 26.0, turbidity: 24.0, ph: 7.70, chl_a: 14.5 },
    vulnerabilities: ["Harmful Algal Blooms (HAB)", "Nutrient Surplus", "Estuarine Dilution"]
  },
  nilwella_bay: {
    id: "nilwella_bay",
    name: "Nilwella Fishery Bay",
    region: "Southern Province",
    lat: 5.9610,
    lng: 80.7020,
    description: "High-density fishery zone monitored by SL Navy Hydrographic Service. Prone to seasonal hypoxia.",
    dataProvider: "sl_navy",
    sensorNode: "SL-NAVY-HYDRO-S02",
    baseValues: { sst: 28.5, do: 3.2, salinity: 33.8, turbidity: 12.0, ph: 7.90, chl_a: 6.5 },
    vulnerabilities: ["Hypoxia Upwelling", "Artisanal Fishery Stress"]
  },
  hikkaduwa_reef: {
    id: "hikkaduwa_reef",
    name: "Hikkaduwa Marine Sanctuary",
    region: "Southern Province",
    lat: 6.1360,
    lng: 80.1010,
    description: "Fringing coral reef system facing acute thermal stress, boat turbidity, and tourism impact.",
    dataProvider: "nara",
    sensorNode: "NARA-REEF-HIK03 / OCU-CORAL-01",
    baseValues: { sst: 30.8, do: 5.6, salinity: 34.2, turbidity: 8.5, ph: 8.12, chl_a: 2.4 },
    vulnerabilities: ["Coral Bleaching", "Thermal Stress", "Tourism Anchoring"]
  },
  pigeon_island: {
    id: "pigeon_island",
    name: "Pigeon Island National Park",
    region: "Eastern Province",
    lat: 8.7200,
    lng: 81.2000,
    description: "High-biodiversity offshore reef system influenced by the East India Coastal Current (EICC).",
    dataProvider: "ocean_univ",
    sensorNode: "OCU-EAST-PIG05",
    baseValues: { sst: 28.9, do: 6.2, salinity: 34.8, turbidity: 4.2, ph: 8.20, chl_a: 1.8 },
    vulnerabilities: ["NE Monsoon Swell", "Seasonal SST Spikes"]
  },
  gulf_of_mannar: {
    id: "gulf_of_mannar",
    name: "Gulf of Mannar & Palk Bay",
    region: "Northern Province",
    lat: 9.1500,
    lng: 79.6000,
    description: "Shallow, semi-enclosed thermal trap with restricted water exchange monitored by SL Navy.",
    dataProvider: "sl_navy",
    sensorNode: "SL-NAVY-NORTH-M01",
    baseValues: { sst: 31.4, do: 4.5, salinity: 35.2, turbidity: 14.0, ph: 8.05, chl_a: 5.1 },
    vulnerabilities: ["Extreme Thermal Stress", "Restricted Circulation"]
  }
};

const MONSOON_MODIFIERS = {
  sw_monsoon: {
    name: "Southwest Monsoon (May – Sep)",
    desc: "Heavy rainfall on West/South coasts. High river runoff (Kelani/Kalu), dropped salinity, elevated turbidity.",
    multipliers: { sst: -0.4, do: -0.6, salinity: -3.5, turbidity: +8.5, ph: -0.15, chl_a: +4.2 }
  },
  ne_monsoon: {
    name: "Northeast Monsoon (Dec – Feb)",
    desc: "Heavy rainfall on East coast (Pigeon Island/Trincomalee). Strong currents, moderate runoff.",
    multipliers: { sst: -0.8, do: +0.4, salinity: -1.8, turbidity: +3.0, ph: +0.05, chl_a: +1.5 }
  },
  inter_monsoon: {
    name: "Inter-Monsoon (Calm / Peak Heat)",
    desc: "Calm seas, high solar irradiance, low winds. Spikes in SST and thermal accumulation.",
    multipliers: { sst: +1.4, do: -0.8, salinity: +0.8, turbidity: -2.0, ph: +0.10, chl_a: +3.0 }
  }
};

function generateTelemetryData(siteId, monsoonId) {
  const site = SITE_DATABASE[siteId] || SITE_DATABASE.colombo_port;
  const monsoon = MONSOON_MODIFIERS[monsoonId] || MONSOON_MODIFIERS.sw_monsoon;

  const base = {
    sst: site.baseValues.sst + monsoon.multipliers.sst,
    do: site.baseValues.do + monsoon.multipliers.do,
    salinity: site.baseValues.salinity + monsoon.multipliers.salinity,
    turbidity: site.baseValues.turbidity + monsoon.multipliers.turbidity,
    ph: site.baseValues.ph + monsoon.multipliers.ph,
    chl_a: site.baseValues.chl_a + monsoon.multipliers.chl_a
  };

  const timestamps = [];
  const historyDays = 14;
  const forecastHours = [24, 48, 72];

  const now = new Date();
  for (let i = historyDays; i >= 1; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    timestamps.push(`Day -${i} (${d.getMonth()+1}/${d.getDate()})`);
  }
  timestamps.push("Now (t=0)");
  forecastHours.forEach(h => timestamps.push(`+${h}h Forecast`));

  const series = {
    timestamps,
    historyIndex: historyDays,
    sst: [], do: [], salinity: [], turbidity: [], ph: [], chl_a: [],
    uncertainty: { sst: [], do: [], salinity: [], turbidity: [], ph: [], chl_a: [] }
  };

  const totalPoints = timestamps.length;
  for (let i = 0; i < totalPoints; i++) {
    const isForecast = i > historyDays;
    const noiseSST = Math.sin(i * 0.4) * 0.35 + (Math.random() - 0.5) * 0.15;
    const noiseDO = -Math.sin(i * 0.4) * 0.4 - (noiseSST * 0.3) + (Math.random() - 0.5) * 0.1;
    const noiseSal = Math.cos(i * 0.3) * 0.5;
    const noiseTur = Math.sin(i * 0.5) * 1.8;
    const noisePH = Math.cos(i * 0.2) * 0.05;
    const noiseChl = Math.sin(i * 0.6) * 0.8;

    const forecastTrend = isForecast ? (i - historyDays) * 0.12 : 0;

    series.sst.push(Number((base.sst + noiseSST + forecastTrend * 0.8).toFixed(2)));
    series.do.push(Number((Math.max(1.0, base.do + noiseDO - forecastTrend * 0.5)).toFixed(2)));
    series.salinity.push(Number((Math.max(15.0, base.salinity + noiseSal - forecastTrend * 0.2)).toFixed(2)));
    series.turbidity.push(Number((Math.max(0.5, base.turbidity + noiseTur + forecastTrend * 1.2)).toFixed(2)));
    series.ph.push(Number((Math.max(6.5, Math.min(9.0, base.ph + noisePH))).toFixed(2)));
    series.chl_a.push(Number((Math.max(0.1, base.chl_a + noiseChl + forecastTrend * 0.9)).toFixed(2)));

    const uncertFactor = isForecast ? (i - historyDays) * 0.15 : 0;
    series.uncertainty.sst.push(Number((0.1 + uncertFactor * 0.25).toFixed(2)));
    series.uncertainty.do.push(Number((0.15 + uncertFactor * 0.35).toFixed(2)));
    series.uncertainty.salinity.push(Number((0.2 + uncertFactor * 0.45).toFixed(2)));
    series.uncertainty.turbidity.push(Number((0.5 + uncertFactor * 1.2).toFixed(2)));
    series.uncertainty.ph.push(Number((0.02 + uncertFactor * 0.05).toFixed(2)));
    series.uncertainty.chl_a.push(Number((0.3 + uncertFactor * 0.8).toFixed(2)));
  }

  return series;
}
