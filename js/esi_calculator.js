/* ==========================================================================
   TIDE Platform - Component 1: Marine Ecosystem Stress Index (MESI) Engine
   NARA-Calibrated Ecological Synthesis & 72-Hour Early Warning Classifier
   ========================================================================== */

const NARA_THRESHOLDS = {
  sst: { baseline: 28.0, criticalHigh: 31.5, weight: 0.25 },
  do: { baseline: 6.5, criticalLow: 2.0, weight: 0.25 },
  salinity: { baseline: 34.0, criticalLow: 22.0, weight: 0.15 },
  turbidity: { baseline: 5.0, criticalHigh: 35.0, weight: 0.15 },
  ph: { baseline: 8.1, minLimit: 7.2, maxLimit: 8.8, weight: 0.10 },
  chl_a: { baseline: 2.0, criticalHigh: 15.0, weight: 0.10 }
};

/**
 * Calculate Sub-Stress Index (0-100) for a single parameter
 */
function calculateSubIndex(paramName, value) {
  let score = 0;
  switch (paramName) {
    case 'sst':
      // SST stress increases rapidly above 29.5°C
      if (value <= 28.5) score = Math.max(0, (value - 26.0) * 10);
      else score = Math.min(100, 25 + (value - 28.5) * 25);
      break;

    case 'do':
      // DO stress increases as DO drops below 6.0 mg/L (Hypoxia threshold < 2.0)
      if (value >= 6.5) score = 0;
      else if (value >= 4.0) score = (6.5 - value) * 20;
      else score = Math.min(100, 50 + (4.0 - value) * 25);
      break;

    case 'salinity':
      // Optimal marine salinity 32-36 PSU; stress increases when diluted by river runoff
      if (value >= 32.0 && value <= 36.0) score = 0;
      else if (value < 32.0) score = Math.min(100, (32.0 - value) * 6.5);
      else score = Math.min(100, (value - 36.0) * 15);
      break;

    case 'turbidity':
      // Turbidity stress increases with particulate loading (> 10 NTU)
      if (value <= 5.0) score = 5;
      else score = Math.min(100, 5 + (value - 5.0) * 3.2);
      break;

    case 'ph':
      // Acidification or extreme alkalinity
      const phDev = Math.abs(value - 8.1);
      score = Math.min(100, phDev * 100);
      break;

    case 'chl_a':
      // Chlorophyll-a nutrient loading / bloom potential
      if (value <= 2.5) score = 0;
      else score = Math.min(100, (value - 2.5) * 7.5);
      break;

    default:
      score = 0;
  }

  return Number(score.toFixed(1));
}

/**
 * Calculate overall Composite MESI Score (0-100)
 */
function calculateMESI(params) {
  const subIndices = {
    sst: calculateSubIndex('sst', params.sst),
    do: calculateSubIndex('do', params.do),
    salinity: calculateSubIndex('salinity', params.salinity),
    turbidity: calculateSubIndex('turbidity', params.turbidity),
    ph: calculateSubIndex('ph', params.ph),
    chl_a: calculateSubIndex('chl_a', params.chl_a)
  };

  let mesi = (
    subIndices.sst * NARA_THRESHOLDS.sst.weight +
    subIndices.do * NARA_THRESHOLDS.do.weight +
    subIndices.salinity * NARA_THRESHOLDS.salinity.weight +
    subIndices.turbidity * NARA_THRESHOLDS.turbidity.weight +
    subIndices.ph * NARA_THRESHOLDS.ph.weight +
    subIndices.chl_a * NARA_THRESHOLDS.chl_a.weight
  );

  mesi = Math.min(100, Math.max(0, Number(mesi.toFixed(1))));

  let category = "Low / Stable";
  let color = "var(--status-low)";
  let pillClass = "low";

  if (mesi >= 76) {
    category = "Critical Hazard";
    color = "var(--status-critical)";
    pillClass = "critical";
  } else if (mesi >= 56) {
    category = "High Stress";
    color = "var(--status-high)";
    pillClass = "high";
  } else if (mesi >= 31) {
    category = "Moderate Stress";
    color = "var(--status-moderate)";
    pillClass = "moderate";
  }

  return {
    score: mesi,
    category,
    color,
    pillClass,
    subIndices
  };
}

/**
 * 72-Hour Multiclass Early Warning Classifier
 */
function classifyEarlyWarnings(params, mesiResult) {
  const alerts = [];

  // 1. Hypoxia Warning
  if (params.do < 2.0) {
    alerts.push({
      id: "hypoxia_critical",
      type: "Hypoxia Critical Alert",
      severity: "critical",
      icon: "alert-triangle",
      horizon: "t+24h to t+72h",
      title: "Severe Hypoxia Event (DO < 2.0 mg/L)",
      description: `Dissolved Oxygen forecasted at ${params.do} mg/L. High risk of localized marine life mortality and benthic fish kills.`,
      action: "MEPA Protocol: Deploy aeration buoys & issue coastal fishing advisory."
    });
  } else if (params.do < 3.5) {
    alerts.push({
      id: "hypoxia_warning",
      type: "Hypoxia Warning",
      severity: "high",
      icon: "alert-circle",
      horizon: "t+48h",
      title: "Moderate Hypoxia Warning (DO < 3.5 mg/L)",
      description: `Depleted Dissolved Oxygen (${params.do} mg/L) detected due to thermal loading and organic decomposition.`,
      action: "NARA Alert: Initiate intensive water sample testing."
    });
  }

  // 2. Harmful Algal Bloom (HAB) Alert
  if (params.chl_a > 12.0 && params.turbidity > 15.0) {
    alerts.push({
      id: "hab_alert",
      type: "Harmful Algal Bloom (HAB)",
      severity: "high",
      icon: "waves",
      horizon: "t+48h to t+72h",
      title: "High Risk HAB Outbreak Detected",
      description: `Chlorophyll-a (${params.chl_a} µg/L) and Turbidity (${params.turbidity} NTU) indicate active microalgal bloom propagation.`,
      action: "CEA/MEPA Advisory: Restrict shellfish harvesting & monitor toxin levels in lagoon outlet."
    });
  }

  // 3. Coral Bleaching Stress
  if (params.sst >= 30.5) {
    alerts.push({
      id: "bleaching_stress",
      type: "Coral Thermal Bleaching Stress",
      severity: params.sst >= 31.5 ? "critical" : "moderate",
      icon: "thermometer-sun",
      horizon: "t+72h",
      title: `Thermal Stress Spike (SST ${params.sst}°C)`,
      description: `Sea Surface Temp exceeds coral thermal threshold (${params.sst}°C vs 28.0°C baseline). Degree Heating Weeks (DHW) accumulating.`,
      action: "Coast Conservation Dept: Restrict glass-bottom boat anchors & shade high-value reef nurseries."
    });
  }

  // 4. Salinity Influx / Monsoon Runoff Stress
  if (params.salinity < 25.0) {
    alerts.push({
      id: "salinity_drop",
      type: "Estuarine Plume Dilution",
      severity: "moderate",
      icon: "cloud-rain",
      horizon: "t+24h",
      title: `Freshwater Runoff Plume (Salinity ${params.salinity} PSU)`,
      description: `Monsoonal river discharge causing severe coastal salinity dilution (${params.salinity} PSU).`,
      action: "Lagoon Management: Regulate river sluice gates."
    });
  }

  // Default normal status if no alerts
  if (alerts.length === 0) {
    alerts.push({
      id: "normal_status",
      type: "System Normal",
      severity: "low",
      icon: "check-circle",
      horizon: "t+72h Horizon Clear",
      title: "Coastal Water Quality Stable",
      description: "All 6 parameters are within safe baseline ecological ranges. No immediate ecological hazard detected.",
      action: "Standard Monitoring: Maintain 72-hour automated multi-task telemetry scan."
    });
  }

  return alerts;
}
