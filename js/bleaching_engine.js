/* ==========================================================================
   TIDE Platform — Component 03: Confidence-Aware Coral Bleaching Risk Forecasting
   Medium-Horizon (30-90 Day Lead Time) + Temperature Scaling Calibrated CIs
   ========================================================================== */

const BLEACHING_REEF_SITES = {
  hikkaduwa_reef: {
    name: "Hikkaduwa Marine Sanctuary",
    type: "Fringing Coral Reef",
    depth: "2 – 6 meters",
    risk30d: 42.5,
    risk60d: 68.0,
    risk90d: 78.5,
    ci95: [68.0, 89.0],
    primaryDriver: "SST Anomaly (+1.8°C above baseline)",
    shapAttributions: [
      { feature: "Sea Surface Temp Anomaly", importance: "+45%" },
      { feature: "Degree Heating Weeks (DHW)", importance: "+28%" },
      { feature: "Tourism & Anchor Shear", importance: "+15%" },
      { feature: "Salinity Dilution", importance: "+12%" }
    ],
    explanation: "The forecast is elevated because ocean heat accumulation and warm-water anomalies are pushing the reef past its bleaching threshold. Elevated SST and DHW dominate the model’s decision, while local stressors add additional pressure but are secondary drivers."
  },
  gulf_of_mannar: {
    name: "Gulf of Mannar & Palk Bay Reefs",
    type: "Shallow Coastal Reef Flat",
    depth: "1 – 4 meters",
    risk30d: 55.0,
    risk60d: 82.0,
    risk90d: 91.5,
    ci95: [84.0, 96.5],
    primaryDriver: "Restricted Circulation & Solar Irradiance",
    shapAttributions: [
      { feature: "Thermal Accumulation (DHW)", importance: "+52%" },
      { feature: "SST Peak Anomaly", importance: "+30%" },
      { feature: "Shallow Solar Penetration", importance: "+12%" },
      { feature: "Turbidity Shielding", importance: "-6%" }
    ],
    explanation: "This reef is the most at risk because sustained thermal accumulation and shallow water exposure are intensifying stress. The model attributes most of the output to prolonged heat and peak temperature anomalies, which is why the risk rises sharply over the next 30–90 days."
  },
  pigeon_island: {
    name: "Pigeon Island National Park",
    type: "High-Biodiversity Offshore Reef",
    depth: "5 – 18 meters",
    risk30d: 18.0,
    risk60d: 32.5,
    risk90d: 45.0,
    ci95: [35.0, 55.0],
    primaryDriver: "East India Coastal Current (EICC) Cooling",
    shapAttributions: [
      { feature: "Current Upwelling Cooling", importance: "-38%" },
      { feature: "SST Regional Anomaly", importance: "+34%" },
      { feature: "DHW Accumulation", importance: "+20%" },
      { feature: "Water Depth Buffer", importance: "-8%" }
    ],
    explanation: "The output remains comparatively lower because cooling from current upwelling offsets thermal stress. Although SST and DHW still contribute, the model shows that the reef’s depth and local circulation reduce heat burden enough to keep bleaching risk below the high-risk threshold."
  }
};

// Lightweight runtime trace for debugging
try { console.debug('bleaching_engine.js: loaded BLEACHING_REEF_SITES', Object.keys(BLEACHING_REEF_SITES)); } catch (e) { }

/**
 * Render Component 03 View
 */
function renderComponent03View(containerId, activeSiteId = 'hikkaduwa_reef') {
  try { console.debug('renderComponent03View()', containerId, activeSiteId); } catch (e) {}
  const container = document.getElementById(containerId);
  if (!container) return;

  const reef = BLEACHING_REEF_SITES[activeSiteId] || BLEACHING_REEF_SITES.hikkaduwa_reef;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Header: Bleaching Forecaster -->
      <div class="glass-panel" style="padding: 18px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-weight:800;font-size:1rem;">TIDE Platform | Confidence-Aware Bleaching Forecaster</div>
            <div style="font-size:0.82rem;color:var(--text-secondary);margin-top:6px;">Component 03 — Coral Bleaching Risk (Gulf of Mannar, Palk Bay, SW Coast)</div>
          </div>

          <div style="display:flex;gap:8px;align-items:center;">
            <select id="reefSelect" style="background:transparent;border:1px solid var(--border-glass);padding:6px 10px;border-radius:8px;color:var(--text-primary);">
              <option value="gulf_of_mannar">Gulf of Mannar Reef Zone A</option>
              <option value="pigeon_island">Palk Bay</option>
              <option value="hikkaduwa_reef">SW Coastal Reefs (Hikkaduwa)</option>
            </select>
            <div class="htab" data-h="30" style="padding:6px 10px;border-radius:8px;border:1px solid var(--border-glass);cursor:pointer;">30-Day</div>
            <div class="htab" data-h="60" style="padding:6px 10px;border-radius:8px;border:1px solid var(--border-glass);cursor:pointer;">60-Day</div>
            <div class="htab" data-h="90" style="padding:6px 10px;border-radius:8px;border:1px solid var(--border-glass);cursor:pointer;">90-Day</div>
            <button id="ingestBleachBtn" class="glass-btn">Ingest NOAA/CMEMS Data</button>
            <button id="runCalBtn" class="glass-btn">Run Calibration</button>
            <button id="exportBleachBtn" class="glass-btn">Export Risk Brief</button>
          </div>
        </div>

        <div class="horizon-cards" style="margin-top:16px;">
          <div class="h-card" style="border:1px solid rgba(244,63,94,0.12); background: linear-gradient(180deg, rgba(244,63,94,0.04), rgba(15,23,42,0.6));">
            <div class="h-card-lbl">Calibrated Bleaching Probability</div>
            <div id="bleachProbVal" class="h-card-val" style="color: var(--status-critical); font-size:2.4rem;">${reef.risk90d.toFixed(1)}%</div>
            <div id="bleachProbCI" class="h-card-sub" style="font-size:0.78rem; color:var(--text-secondary);">90% Confidence Interval: ${reef.ci95[0]}% – ${reef.ci95[1]}%</div>
            <div style="margin-top:10px; padding:6px 10px; border-radius:8px; display:inline-block; background: rgba(244,63,94,0.08); color:var(--status-critical); font-weight:700;">Status: High Risk</div>
          </div>

          <div class="h-card">
            <div class="h-card-lbl">Current Thermal Accumulation</div>
            <div id="thermalAccumVal" class="h-card-val" style="color:#ffffff;">7.2 °C-weeks</div>
            <div class="h-card-sub" style="color:var(--text-secondary);">+1.4 DHW vs. historical average</div>
          </div>

          <div class="h-card" style="border:1px solid rgba(6,182,212,0.12);">
            <div class="h-card-lbl">Model Calibration Status</div>
            <div id="calStatusVal" class="h-card-val" style="color:var(--accent-cyan);">ECE: 0.024</div>
            <div class="h-card-sub" style="color:var(--text-secondary);">Temperature Scaled (T = 1.42)</div>
          </div>
        </div>
      </div>

      <!-- Main Chart Panel: Forecast -->
      <div class="panel" style="padding:18px;">
        <div class="chart-header">
          <div>
            <div class="section-title">30–90 Day Multi-Horizon Bleaching Probability & Confidence Band</div>
            <div class="section-sub">Smoothed forecast of thermal accumulation (DHW) with calibrated uncertainty and bleaching threshold.</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="glass-btn">30-Day</button>
            <button class="glass-btn">60-Day</button>
            <button class="glass-btn">90-Day</button>
          </div>
        </div>
        <div class="chart-wrap" style="height:220px;margin-top:12px;">
          <canvas id="bleachForecastChart"></canvas>
        </div>
      </div>

      <!-- Section 2: SHAP Thermal Drivers & Calibration Details -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        
        <!-- SHAP Driver Attribution -->
        <div class="glass-panel" style="padding: 24px;">
          <h4 style="font-size: 1rem; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
            SHAP Thermal Driver Discovery (${reef.name})
          </h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${reef.shapAttributions.map(item => `
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; background: rgba(15, 23, 42, 0.5); padding: 10px 14px; border-radius: 6px;">
                <span style="color: var(--text-primary);">${item.feature}</span>
                <span style="font-weight: 700; color: ${item.importance.startsWith('+') ? 'var(--status-critical)' : 'var(--accent-cyan)'}">
                  ${item.importance}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Temperature Scaling Calibration Card -->
        <div class="glass-panel" style="padding: 24px;">
          <h4 style="font-size: 1rem; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
            Temperature Scaling Calibration Method
          </h4>
          <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.6;">
            Deep learning neural networks are typically overconfident. By applying post-hoc temperature scaling ($T = 1.42$), the output logits are adjusted so that predicted risk probabilities strictly match true empirical outcome frequencies.
          </p>
          <div style="margin-top: 16px; padding: 12px; background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 8px; font-size: 0.75rem; color: var(--accent-cyan);">
            <strong>Expected Calibration Error (ECE):</strong> Reduced from 14.2% (Raw DL) to 1.8% (Calibrated Platform Output).
          </div>
        </div>

      </div>

      <div class="glass-panel" style="padding: 20px;">
        <h4 style="font-size: 1rem; font-weight: 700; color: #ffffff; margin: 0 0 10px 0;">
          Why the model gives this output
        </h4>
        <p style="margin: 0; color: var(--text-secondary); font-size: 0.82rem; line-height: 1.7;">
          ${reef.explanation}
        </p>
        <div style="margin-top: 12px; padding: 10px 12px; border-left: 3px solid var(--accent-cyan); background: rgba(6, 182, 212, 0.05); border-radius: 8px; color: var(--text-primary); font-size: 0.8rem;">
          <strong>SHAP interpretation:</strong> the model is most strongly driven by the features that increase coral stress and thermal accumulation, while cooling or protective conditions reduce the risk estimate when present.
        </div>
      </div>
      
      <!-- Calibration & SHAP Charts -->
      <div class="panel" style="padding:18px; display:flex; flex-direction:column; gap:16px;">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:18px;">
          <div style="padding:8px; background: rgba(15,23,42,0.6); border-radius:8px;">
            <div style="font-weight:700; margin-bottom:8px;">Probability Calibration (Temperature Scaling)</div>
            <canvas id="calibrationChart" style="height:240px;"></canvas>
          </div>

          <div style="padding:8px; background: rgba(15,23,42,0.6); border-radius:8px;">
            <div style="font-weight:700; margin-bottom:8px;">Local SHAP Environmental Driver Attribution</div>
            <canvas id="shapBarChart" style="height:240px;"></canvas>
          </div>
        </div>
      </div>

      <!-- Bottom: Module Workflow Inspector -->
      <div class="panel" style="padding:18px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
          <div>
            <div class="section-title">Module Workflow: Deep Temporal Forecaster + Uncertainty Calibration Layer</div>
            <div class="section-sub">Visual flow of data ingestion through forecasting, calibration and attribution layers.</div>
          </div>
        </div>
        <div style="display:flex;gap:14px;align-items:center;margin-top:18px;flex-wrap:wrap;">
          <div class="arch-step" style="flex:1; text-align:center;"><div class="arch-badge">Ingest</div><div class="arch-name">NOAA / CMEMS Data Pipeline</div></div>
          <div style="width:30px; text-align:center; color:var(--text-secondary);">→</div>
          <div class="arch-step" style="flex:1; text-align:center;"><div class="arch-badge">Model</div><div class="arch-name">Temporal Sequence Model (LSTM/TCN)</div></div>
          <div style="width:30px; text-align:center; color:var(--text-secondary);">→</div>
          <div class="arch-step" style="flex:1; text-align:center;"><div class="arch-badge">Calibrate</div><div class="arch-name">Temperature Scaling Layer</div></div>
          <div style="width:30px; text-align:center; color:var(--text-secondary);">→</div>
          <div class="arch-step" style="flex:1; text-align:center;"><div class="arch-badge">Explain</div><div class="arch-name">SHAP Driver Engine</div></div>
          <div style="width:30px; text-align:center; color:var(--text-secondary);">→</div>
          <div class="arch-step" style="flex:1; text-align:center;"><div class="arch-badge">Output</div><div class="arch-name">Calibrated Decision Output</div></div>
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();

  // Component interactivity: reef selector + horizon tabs + actions
  try {
    console.debug('renderComponent03View: wiring UI controls');
    const reefSel = document.getElementById('reefSelect');
    const htabs = Array.from(container.querySelectorAll('.htab'));
    let selectedHorizon = 90;

    if (reefSel) {
      reefSel.value = activeSiteId in BLEACHING_REEF_SITES ? activeSiteId : 'gulf_of_mannar';
      const updateMetrics = (r) => {
        const pEl = document.getElementById('bleachProbVal');
        const ciEl = document.getElementById('bleachProbCI');
        const tEl = document.getElementById('thermalAccumVal');
        const cEl = document.getElementById('calStatusVal');
        if (pEl) pEl.innerText = `${r.risk90d.toFixed(1)}%`;
        if (ciEl) ciEl.innerText = `90% Confidence Interval: ${r.ci95[0]}% – ${r.ci95[1]}%`;
        if (tEl) tEl.innerText = `7.2 °C-weeks`;
        if (cEl) cEl.innerText = `ECE: 0.024`;
      };

      reefSel.addEventListener('change', (e) => {
        const key = e.target.value;
        const newReef = BLEACHING_REEF_SITES[key] || BLEACHING_REEF_SITES.gulf_of_mannar;
        updateMetrics(newReef);
        // re-render charts for selected reef
        _renderBleachCharts(newReef, selectedHorizon);
      });
    }

    htabs.forEach(ht => {
      ht.addEventListener('click', (e) => {
        htabs.forEach(h => h.classList.remove('active'));
        ht.classList.add('active');
        selectedHorizon = parseInt(ht.dataset.h || '90', 10);
        _renderBleachCharts(reef, selectedHorizon);
      });
    });

    // default active tab
    const def = container.querySelector('.htab[data-h="90"]'); if (def) def.classList.add('active');

    const ingestBtn = document.getElementById('ingestBleachBtn');
    if (ingestBtn) ingestBtn.addEventListener('click', () => alert('Ingest NOAA/CMEMS Data (prototype)'));
    const runCalBtn = document.getElementById('runCalBtn');
    if (runCalBtn) runCalBtn.addEventListener('click', () => alert('Run Calibration (prototype)'));
    const exportBtn = document.getElementById('exportBleachBtn');
    if (exportBtn) exportBtn.addEventListener('click', () => alert('Export Risk Brief (prototype)'));

    // initial render and update metrics
    try { if (typeof updateMetrics === 'function') updateMetrics(reef); } catch(e){ console.error('updateMetrics error', e); }
    try { _renderBleachCharts(reef, selectedHorizon); } catch(e){ console.error('_renderBleachCharts initial call error', e); }
  } catch (e) { /* ignore UI wiring errors in prototype */ }
}

// Chart instances for this component
let bleachChartInst = null, calibChartInst = null, shapChartInst = null;

function _destroyBleachCharts() {
  if (bleachChartInst) { try { bleachChartInst.destroy(); } catch (e) {} bleachChartInst = null; }
  if (calibChartInst) { try { calibChartInst.destroy(); } catch (e) {} calibChartInst = null; }
  if (shapChartInst) { try { shapChartInst.destroy(); } catch (e) {} shapChartInst = null; }
}

function _renderBleachCharts(reef, horizonDays = 90) {
  try {
    console.debug('_renderBleachCharts()', reef && reef.name, 'horizonDays=', horizonDays);
    // destroy previous
    _destroyBleachCharts();

    // Forecast chart (DHW proxy)
    const ctx = document.getElementById('bleachForecastChart');
    if (ctx) {
      // make canvas fixed-size and non-responsive to avoid auto-resizing/animation
      const canvasEl = ctx;
      canvasEl.style.width = '100%'; canvasEl.style.height = '220px';
      // set high-DPI pixel size for crisp rendering
      const DPR = window.devicePixelRatio || 1;
      canvasEl.width = Math.floor(canvasEl.clientWidth * DPR);
      canvasEl.height = Math.floor(220 * DPR);
      var ctx2d = canvasEl.getContext('2d');
    // build synthetic series: 30 historical + up to 90 forecast days (3-month)
    const histLen = 30, maxFore = 90; const total = histLen + maxFore;
    const labels = [];
    const hist = [];
    // prepare forecast arrays for 3 horizons — full-length so indices align with labels
    const horizons = [30, 60, 90];
    const foreSeries = horizons.map(() => Array(total).fill(null));
    const upper90 = Array(total).fill(null), lower90 = Array(total).fill(null);

    for (let i = -histLen; i < maxFore; i++) {
      labels.push(i < 0 ? `D${i}` : `+${i}d`);
      if (i < 0) {
        const v = 3.5 + Math.max(0, Math.sin(i / 6) * 1.2) + (Math.random() - 0.5) * 0.5;
        hist.push(Number(v.toFixed(2)));
      } else {
        // forecast baseline: scales toward DHW influenced by reef risk90d
        const t = i / Math.max(1, maxFore - 1);
        const base = 3.8 + (reef.risk90d / 100) * 8.0 * t;
        const v = base + (Math.random() - 0.5) * 0.6;
        hist.push(null);
        // write forecast values at offset index so they align with labels (histLen + i)
        const outIdx = histLen + i;
        horizons.forEach((H, idx) => {
          if (i < H) foreSeries[idx][outIdx] = Number(v.toFixed(2));
        });
        // 90-day CI band
        upper90[outIdx] = Number((v + 1.6).toFixed(2));
        lower90[outIdx] = Number(Math.max(0, v - 1.6).toFixed(2));
      }
    }

    // datasets: historical + 3 horizon forecasts + 90% CI (shaded)
    // Order CI datasets so the upper band fills to the lower band (upper placed after lower and uses fill:'-1')
    const datasets = [
      { label: 'Historical DHW', data: hist, borderColor: '#94a3b8', borderWidth: 1.6, pointRadius: 2, fill: false, tension: 0.35 },
      { label: 'Forecast (30d)', data: foreSeries[0], borderColor: '#f97316', borderWidth: 2, borderDash: [6,4], pointRadius: 2, fill: false, tension: 0.4 },
      { label: 'Forecast (60d)', data: foreSeries[1], borderColor: '#f59e0b', borderWidth: 2, borderDash: [6,4], pointRadius: 2, fill: false, tension: 0.42 },
      { label: 'Forecast (90d)', data: foreSeries[2], borderColor: '#06b6d4', borderWidth: 2.6, pointRadius: 3, fill: false, tension: 0.45 },
      { label: '90% CI Lower', data: lower90, borderColor: 'transparent', backgroundColor: 'transparent', pointRadius: 0, fill: false },
      { label: '90% CI Upper', data: upper90, borderColor: 'transparent', backgroundColor: '#06b6d4aa', pointRadius: 0, fill: '-1' }
    ];

    bleachChartInst = new Chart(ctx2d, {
      type: 'line', data: { labels, datasets },
      options: {
        responsive: false, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8' } },
          tooltip: { backgroundColor: '#0f172a', titleColor: '#06b6d4', bodyColor: '#fff' }
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.02)' } },
          y: { min: 0, max: 12, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.02)' } }
        },
        elements: { point: { hoverRadius: 5 } },
        animation: false,
        transitions: {},
        interaction: { mode: 'nearest', intersect: false }
      }
    });

    // add critical threshold annotation line (requires plugin; fallback draw)
    // draw a dashed horizontal line at DHW=8.0 using plugin beforeDraw
    Chart.register({ id: 'bleachThresholdLine', beforeDraw: chart => {
      const yVal = 8.0;
      const yScale = chart.scales.y; const xScale = chart.scales.x;
      const ctx2 = chart.ctx; ctx2.save();
      const y = yScale.getPixelForValue(yVal);
      ctx2.strokeStyle = 'rgba(244,63,94,0.9)'; ctx2.setLineDash([6,6]); ctx2.lineWidth = 1.5;
      ctx2.beginPath(); ctx2.moveTo(xScale.left, y); ctx2.lineTo(xScale.right, y); ctx2.stroke();
      ctx2.setLineDash([]);
        // label
      ctx2.fillStyle = 'rgba(244,63,94,0.9)'; ctx2.font = '12px sans-serif'; ctx2.fillText('Bleaching Threshold (DHW = 8.0)', xScale.left + 8, y - 8);
      ctx2.restore();
    }});
    }

  } catch (err) {
    console.error('Error in _renderBleachCharts:', err);
  }
  const cctx = document.getElementById('calibrationChart');
  if (cctx) {
    const canvasC = cctx; canvasC.style.width = '100%'; canvasC.style.height = '160px';
    const DPRc = window.devicePixelRatio || 1; canvasC.width = Math.floor(canvasC.clientWidth * DPRc); canvasC.height = Math.floor(160 * DPRc);
    var cctx2d = canvasC.getContext('2d');
    // reliability points (deterministic example)
    const probs = [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0];
    // show typical overconfidence: uncalibrated predictions are higher than true
    const uncal = [0,0.12,0.25,0.35,0.48,0.62,0.71,0.83,0.89,0.95,1.0];
    const scaled = probs.map((p,i) => Math.min(1, (uncal[i] + p) / 2));

    calibChartInst = new Chart(cctx2d, {
      type: 'line', data: { labels: probs.map(p => (p*100).toFixed(0) + '%'), datasets: [
        { label: 'Perfect (y=x)', data: probs, borderColor: '#64748b', borderWidth: 1.5, pointRadius: 0, tension: 0.1 },
        { label: 'Uncalibrated', data: uncal, borderColor: '#f43f5e', borderWidth: 2, pointRadius: 4, fill: false, tension: 0.3 },
        { label: 'Temperature-Scaled (T=1.42)', data: scaled, borderColor: '#06b6d4', borderWidth: 2, pointRadius: 4, fill: false, tension: 0.3 }
      ] },
      options: { responsive: false, maintainAspectRatio: false, animation: false, scales: { y: { min: 0, max: 1, ticks: { callback: v => (v*100).toFixed(0) + '%' } }, x: { ticks: { color: '#94a3b8' } } }, plugins: { legend: { labels: { color: '#94a3b8' } } } }
    });
  }

  // SHAP horizontal bar
  const sctx = document.getElementById('shapBarChart');
  if (sctx) {
    const canvasS = sctx; canvasS.style.width = '100%'; canvasS.style.height = '160px';
    const DPRs = window.devicePixelRatio || 1; canvasS.width = Math.floor(canvasS.clientWidth * DPRs); canvasS.height = Math.floor(160 * DPRs);
    var sctx2d = canvasS.getContext('2d');
    const labels = ['Sea Surface Temp Anomaly (SSTA)', 'Degree Heating Weeks (DHW)', 'Light Attenuation (K490 / PAR)', 'Chlorophyll-a Concentration'];
    const values = [0.38, 0.27, 0.12, -0.05];
    const colors = values.map(v => v > 0 ? (v > 0.3 ? '#f43f5e' : '#f59e0b') : '#06b6d4');

    shapChartInst = new Chart(sctx2d, {
      type: 'bar', data: { labels, datasets: [{ data: values, backgroundColor: colors, borderRadius: 6 }] },
      options: { indexAxis: 'y', responsive: false, maintainAspectRatio: false, animation: false, scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8', callback: v => v >= 0 ? '+' + v : v } } }, plugins: { legend: { display: false } } }
    });
  }
}

// Hook into render to draw charts after DOM insertion
const _origRender = renderComponent03View;
renderComponent03View = function(containerId, activeSiteId) {
  try {
    console.debug('renderComponent03View (override) calling original');
    _origRender(containerId, activeSiteId);
    const reef = BLEACHING_REEF_SITES[activeSiteId] || BLEACHING_REEF_SITES.hikkaduwa_reef;
    setTimeout(() => {
      try { _renderBleachCharts(reef); } catch (e) { console.error('deferred _renderBleachCharts error', e); }
    }, 80);
  } catch (e) { console.error('renderComponent03View override error', e); }
};

// Auto-render the bleaching view on load for easier testing (won't override nav behavior)
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('view_c3');
  if (el && el.innerHTML.trim().length === 0) {
    try { console.debug('Auto-rendering view_c3 for debug'); renderComponent03View('view_c3', 'gulf_of_mannar'); } catch (e) { console.error('Auto-render failed', e); }
  }
});
