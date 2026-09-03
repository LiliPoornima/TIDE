/* ==========================================================================
   TIDE Platform - Component 1: Chart.js Visualizer
   Multi-Task Time Series, 72-Hour Horizon Forecasts, & Uncertainty Bands
   ========================================================================== */

let mainChartInstance = null;
let currentActiveParam = 'sst';
let isMultiTaskMode = true; // Toggle for Multi-Task vs Single-Task comparison

const PARAM_CONFIGS = {
  sst: { label: 'Sea Surface Temp (°C)', color: '#f43f5e', min: 24, max: 34, unit: '°C' },
  do: { label: 'Dissolved Oxygen (mg/L)', color: '#06b6d4', min: 0, max: 9, unit: 'mg/L' },
  salinity: { label: 'Salinity (PSU)', color: '#3b82f6', min: 15, max: 40, unit: 'PSU' },
  turbidity: { label: 'Turbidity (NTU)', color: '#f59e0b', min: 0, max: 50, unit: 'NTU' },
  ph: { label: 'pH Level', color: '#8b5cf6', min: 6.5, max: 9.0, unit: '' },
  chl_a: { label: 'Chlorophyll-a (µg/L)', color: '#10b981', min: 0, max: 20, unit: 'µg/L' }
};

/**
 * Initialize or update the main multi-task forecast chart
 */
function updateMainChart(telemetryData, activeParamKey = 'sst') {
  currentActiveParam = activeParamKey;
  const ctx = document.getElementById('mainForecastChart');
  if (!ctx) return;

  const config = PARAM_CONFIGS[activeParamKey] || PARAM_CONFIGS.sst;
  const historyLen = telemetryData.historyIndex;

  const labels = telemetryData.timestamps;
  const rawValues = telemetryData[activeParamKey];
  const uncertainty = telemetryData.uncertainty[activeParamKey];

  // Divide into History (past 14 days) and Forecast (next 72 hours)
  const historyData = [];
  const forecastData = [];
  const upperBand = [];
  const lowerBand = [];
  const singleTaskBaseline = []; // Simulated inferior single-task baseline model

  for (let i = 0; i < rawValues.length; i++) {
    const val = rawValues[i];
    const uncert = uncertainty[i];

    if (i <= historyLen) {
      historyData.push(val);
      forecastData.push(i === historyLen ? val : null); // Connect smooth line
      upperBand.push(null);
      lowerBand.push(null);
      singleTaskBaseline.push(null);
    } else {
      historyData.push(null);
      forecastData.push(val);

      // Single-task baseline exhibits higher variance & drift
      const baselineDrift = (i - historyLen) * (activeParamKey === 'do' ? -0.35 : 0.45);
      singleTaskBaseline.push(Number((val + baselineDrift).toFixed(2)));

      // Multi-Task Shared Encoder Uncertainty bounds
      upperBand.push(Number((val + uncert).toFixed(2)));
      lowerBand.push(Number((Math.max(0, val - uncert)).toFixed(2)));
    }
  }

  const datasets = [
    // 1. Historical Telemetry (Solid Line)
    {
      label: `Historical Telemetry (${config.unit})`,
      data: historyData,
      borderColor: config.color,
      borderWidth: 3,
      pointBackgroundColor: config.color,
      pointRadius: 4,
      fill: false,
      tension: 0.3
    },
    // 2. Multi-Task Shared Encoder 72-Hr Forecast (Dashed Line)
    {
      label: `72-Hr Shared-Encoder Forecast (${config.unit})`,
      data: forecastData,
      borderColor: config.color,
      borderWidth: 3,
      borderDash: [6, 6],
      pointBackgroundColor: '#ffffff',
      pointBorderColor: config.color,
      pointRadius: 6,
      pointHoverRadius: 8,
      fill: false,
      tension: 0.3
    },
    // 3. Upper Uncertainty Band
    {
      label: 'Upper Confidence Band (+95% CI)',
      data: upperBand,
      borderColor: 'transparent',
      backgroundColor: 'rgba(6, 182, 212, 0.12)',
      pointRadius: 0,
      fill: '+1', // Fill to lower band
      tension: 0.3
    },
    // 4. Lower Uncertainty Band
    {
      label: 'Lower Confidence Band (-95% CI)',
      data: lowerBand,
      borderColor: 'transparent',
      backgroundColor: 'transparent',
      pointRadius: 0,
      fill: false,
      tension: 0.3
    }
  ];

  // Optional: Single-task comparison baseline overlay
  if (!isMultiTaskMode) {
    datasets.push({
      label: 'Single-Task Baseline Model (Without Shared Encoder)',
      data: singleTaskBaseline,
      borderColor: '#94a3b8',
      borderWidth: 2,
      borderDash: [3, 3],
      pointRadius: 3,
      fill: false,
      tension: 0.4
    });
  }

  if (mainChartInstance) {
    mainChartInstance.destroy();
  }

  mainChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: { family: 'Inter', size: 12 },
            usePointStyle: true,
            filter: function(item) {
              // Hide lower band from legend clutter
              return !item.text.includes('Lower Confidence');
            }
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#38bdf8',
          bodyColor: '#f8fafc',
          borderColor: 'rgba(56, 189, 248, 0.3)',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              if (context.raw === null) return null;
              return `${context.dataset.label}: ${context.raw} ${config.unit}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#64748b',
            font: { family: 'Inter', size: 11 }
          }
        },
        y: {
          min: config.min,
          max: config.max,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#64748b',
            font: { family: 'Inter', size: 11 },
            callback: function(val) {
              return `${val} ${config.unit}`;
            }
          }
        }
      }
    }
  });
}

/**
 * Toggle between Multi-Task and Single-Task Baseline Mode
 */
function setMultiTaskComparisonMode(enabled, telemetryData) {
  isMultiTaskMode = enabled;
  updateMainChart(telemetryData, currentActiveParam);
}
