/* ==========================================================================
   TIDE Platform v3.2 — Main Application Router & Data Ingestion Controller
   ========================================================================== */

// ── App State ──
let S = {
  comp: 'c1', // 'c1': Water Quality & MESI, 'c2': Causal Action Engine, 'c3': Bleaching Risk, 'c4': Drift Tracker
  site: 'colombo_port',
  monsoon: 'sw_monsoon',
  param: 'sst',
  whatIf: false,
  overrides: null,
  mtMode: true,
  telemetry: null,
  customTelemetry: null, // User-uploaded custom dataset
  mesi: null,
  alerts: []
};

let chartInst = null;

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupHeaderControls();
  setupSliders();
  setupModals();
  setupDataIngestion();
  refreshAll();
  lucide.createIcons();
});

// ── Navigation (Clean Domain Names) ──
function setupNav() {
  document.querySelectorAll('.nav-btn[data-comp]').forEach(btn => {
    btn.addEventListener('click', () => {
      S.comp = btn.dataset.comp;
      document.querySelectorAll('.nav-btn[data-comp]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view_' + S.comp).classList.add('active');
      refreshAll();
    });
  });
}

// ── Header Controls ──
function setupHeaderControls() {
  document.getElementById('siteSelect').addEventListener('change', e => {
    S.site = e.target.value;
    S.whatIf = false; S.overrides = null; S.customTelemetry = null;
    hideWhatIfBadge();
    refreshAll();
  });

  document.getElementById('monsoonSelect').addEventListener('change', e => {
    S.monsoon = e.target.value;
    S.whatIf = false; S.overrides = null;
    hideWhatIfBadge();
    refreshAll();
  });

  document.querySelectorAll('.htab[data-h]').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.htab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      refreshAll();
    });
  });

  const mtBtn = document.getElementById('toggleMTBtn');
  if (mtBtn) {
    mtBtn.addEventListener('click', () => {
      S.mtMode = !S.mtMode;
      mtBtn.classList.toggle('active', S.mtMode);
      mtBtn.innerHTML = S.mtMode
        ? '<i data-lucide="layers"></i> Multi-Task Mode Active'
        : '<i data-lucide="split"></i> Single-Task Baseline';
      lucide.createIcons();
      if (S.telemetry) buildChart(S.telemetry, S.param);
    });
  }

  const resetBtn = document.getElementById('resetSimBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      S.whatIf = false; S.overrides = null; S.customTelemetry = null;
      hideWhatIfBadge();
      refreshAll();
    });
  }

  const exportBtn = document.getElementById('exportReportBtn');
  if (exportBtn) exportBtn.addEventListener('click', exportReport);
}

// ── What-If Sliders ──
function setupSliders() {
  const keys = ['sst', 'do', 'salinity', 'turbidity', 'ph', 'chl_a'];
  keys.forEach(k => {
    const sl = document.getElementById('sl_' + k);
    if (!sl) return;
    sl.addEventListener('input', () => {
      S.whatIf = true;
      if (!S.overrides) {
        const li = S.telemetry.timestamps.length - 1;
        S.overrides = getLatestParams(li);
      }
      S.overrides[k] = parseFloat(sl.value);
      document.getElementById('val_' + k).innerText = sl.value;
      document.getElementById('whatIfBadge').style.display = 'inline-flex';
      refreshAll();
    });
  });
}

// ── Modals & Data Ingestion Setup ──
function setupModals() {
  // MESI Formula Modal
  const fBtn = document.getElementById('viewFormulaBtn');
  const fModal = document.getElementById('formulaModal');
  const fClose = document.getElementById('closeModalBtn');
  if (fBtn && fModal) {
    fBtn.addEventListener('click', () => fModal.classList.add('open'));
  }
  if (fClose && fModal) {
    fClose.addEventListener('click', () => fModal.classList.remove('open'));
  }

  // Data Ingestion Modal
  const dModal = document.getElementById('dataIngestModal');
  const dBtn = document.getElementById('ingestDataBtn');
  const sBtn = document.getElementById('sidebarDataBtn');
  const dClose = document.getElementById('closeIngestModalBtn');

  if (dBtn && dModal) dBtn.addEventListener('click', () => dModal.classList.add('open'));
  if (sBtn && dModal) sBtn.addEventListener('click', () => dModal.classList.add('open'));
  if (dClose && dModal) dClose.addEventListener('click', () => dModal.classList.remove('open'));

  // Close modals on backdrop click
  window.addEventListener('click', e => {
    if (fModal && e.target === fModal) fModal.classList.remove('open');
    if (dModal && e.target === dModal) dModal.classList.remove('open');
  });
}

// ── Interactive Data Ingestion & CSV Upload ──
function setupDataIngestion() {
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('csvFileInput');
  const downloadBtn = document.getElementById('downloadSampleBtn');
  const statusMsg = document.getElementById('uploadStatusMessage');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', e => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--accent-cyan)';
      dropzone.style.background = 'rgba(6,182,212,0.1)';
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = 'rgba(56,189,248,0.3)';
      dropzone.style.background = 'rgba(6,182,212,0.03)';
    });

    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.style.borderColor = 'rgba(56,189,248,0.3)';
      dropzone.style.background = 'rgba(6,182,212,0.03)';
      if (e.dataTransfer.files.length > 0) {
        parseCSVFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', e => {
      if (e.target.files.length > 0) {
        parseCSVFile(e.target.files[0]);
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadSampleCSV);
  }
}

function parseCSVFile(file) {
  const statusMsg = document.getElementById('uploadStatusMessage');
  const reader = new FileReader();

  reader.onload = e => {
    try {
      const text = e.target.result;
      const lines = text.trim().split('\n');
      if (lines.length < 2) throw new Error('File must contain a header row and at least one data row.');

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const required = ['sst', 'do', 'salinity', 'turbidity', 'ph', 'chl_a'];
      const missing = required.filter(r => !headers.includes(r));

      if (missing.length > 0) {
        throw new Error(`Missing columns: ${missing.join(', ')}. Required: timestamp, sst, do, salinity, turbidity, ph, chl_a`);
      }

      const indices = {};
      headers.forEach((h, i) => indices[h] = i);

      const parsedTelemetry = {
        timestamps: [],
        historyIndex: 0,
        sst: [], do: [], salinity: [], turbidity: [], ph: [], chl_a: [],
        uncertainty: { sst: [], do: [], salinity: [], turbidity: [], ph: [], chl_a: [] }
      };

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length < headers.length) continue;

        const ts = indices['timestamp'] !== undefined ? parts[indices['timestamp']] : `Row ${i}`;
        parsedTelemetry.timestamps.push(ts);
        parsedTelemetry.sst.push(parseFloat(parts[indices['sst']]));
        parsedTelemetry.do.push(parseFloat(parts[indices['do']]));
        parsedTelemetry.salinity.push(parseFloat(parts[indices['salinity']]));
        parsedTelemetry.turbidity.push(parseFloat(parts[indices['turbidity']]));
        parsedTelemetry.ph.push(parseFloat(parts[indices['ph']]));
        parsedTelemetry.chl_a.push(parseFloat(parts[indices['chl_a']]));

        // Auto calculate default uncertainty bounds
        parsedTelemetry.uncertainty.sst.push(0.3);
        parsedTelemetry.uncertainty.do.push(0.35);
        parsedTelemetry.uncertainty.salinity.push(0.4);
        parsedTelemetry.uncertainty.turbidity.push(1.2);
        parsedTelemetry.uncertainty.ph.push(0.05);
        parsedTelemetry.uncertainty.chl_a.push(0.8);
      }

      parsedTelemetry.historyIndex = Math.max(0, parsedTelemetry.timestamps.length - 4);

      S.customTelemetry = parsedTelemetry;
      S.whatIf = false;
      S.overrides = null;

      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'rgba(16,185,129,0.15)';
        statusMsg.style.border = '1px solid rgba(16,185,129,0.3)';
        statusMsg.style.color = 'var(--status-low)';
        statusMsg.innerHTML = `✓ Successfully imported <strong>${parsedTelemetry.timestamps.length} telemetry records</strong>! Platform updated in real-time.`;
      }

      refreshAll();

      // Close modal after 1.5 seconds
      setTimeout(() => {
        const dModal = document.getElementById('dataIngestModal');
        if (dModal) dModal.classList.remove('open');
      }, 1600);

    } catch (err) {
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'rgba(244,63,94,0.15)';
        statusMsg.style.border = '1px solid rgba(244,63,94,0.3)';
        statusMsg.style.color = 'var(--status-critical)';
        statusMsg.innerText = 'Error parsing CSV: ' + err.message;
      }
    }
  };

  reader.readAsText(file);
}

function downloadSampleCSV() {
  const csvContent = `timestamp,sst,do,salinity,turbidity,ph,chl_a
2026-08-20,28.8,5.8,33.5,6.2,8.12,2.4
2026-08-21,28.9,5.6,33.2,7.0,8.10,2.8
2026-08-22,29.1,5.2,32.8,8.5,8.08,3.5
2026-08-23,29.4,4.9,32.0,11.2,8.05,4.8
2026-08-24,29.8,4.5,31.4,14.0,8.00,6.2
2026-08-25,30.2,4.1,30.5,18.5,7.95,8.9
2026-08-26,30.5,3.6,29.8,22.0,7.90,12.4
2026-08-27 (Forecast t+24h),30.8,3.2,28.5,25.0,7.85,14.5
2026-08-28 (Forecast t+48h),31.1,2.8,27.0,28.2,7.80,16.2
2026-08-29 (Forecast t+72h),31.4,2.2,25.8,32.0,7.75,18.0`;

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tide_sample_ocean_telemetry.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function hideWhatIfBadge() {
  const b = document.getElementById('whatIfBadge');
  if (b) b.style.display = 'none';
}

// ── Main Refresh ──
function refreshAll() {
  // Use custom telemetry if uploaded, otherwise generate synthetic series
  S.telemetry = S.customTelemetry || generateTelemetryData(S.site, S.monsoon);
  const li = S.telemetry.timestamps.length - 1;
  const params = S.whatIf && S.overrides ? { ...S.overrides } : getLatestParams(li);

  S.mesi = calculateMESI(params);
  S.alerts = classifyEarlyWarnings(params, S.mesi);

  updateSiteBanner();

  if (S.comp === 'c1') renderC1(params, li);
  else if (S.comp === 'c2') renderC2(params);

  lucide.createIcons();
}

function getLatestParams(li) {
  const t = S.telemetry;
  return { sst: t.sst[li], do: t.do[li], salinity: t.salinity[li], turbidity: t.turbidity[li], ph: t.ph[li], chl_a: t.chl_a[li] };
}

// ── View 1: Water Quality & Stress Forecasting ──
function renderC1(params, li) {
  renderGauge(S.mesi);
  renderAlerts(S.alerts);
  renderParams(params, li);
  buildChart(S.telemetry, S.param);
  if (!S.whatIf) syncSliders(params);
}

// ── MESI Gauge ──
function renderGauge(mesi) {
  const canvas = document.getElementById('mesiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2, cy = canvas.height / 2, r = 75;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const start = 0.75 * Math.PI, end = 2.25 * Math.PI;

  // Track
  ctx.beginPath(); ctx.arc(cx, cy, r, start, end);
  ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineCap = 'round'; ctx.stroke();

  // Score arc
  const cur = start + (mesi.score / 100) * (end - start);
  ctx.beginPath(); ctx.arc(cx, cy, r, start, cur);
  ctx.lineWidth = 12; ctx.strokeStyle = mesi.color; ctx.lineCap = 'round';
  ctx.shadowColor = mesi.color; ctx.shadowBlur = 14;
  ctx.stroke(); ctx.shadowBlur = 0;

  const el = document.getElementById('mesiVal');
  if (el) { el.innerText = mesi.score.toFixed(1); el.style.color = mesi.color; }

  const pill = document.getElementById('mesiPill');
  if (pill) {
    pill.innerText = mesi.category;
    pill.style.background = mesi.color + '22';
    pill.style.border = '1px solid ' + mesi.color + '66';
    pill.style.color = mesi.color;
  }
}

// ── Alerts ──
function renderAlerts(alerts) {
  const el = document.getElementById('alertList');
  if (!el) return;
  el.innerHTML = '';
  alerts.forEach(a => {
    const d = document.createElement('div');
    d.className = 'alert-item ' + a.severity;
    d.innerHTML = `
      <div>
        <div class="alert-title-row">
          <i data-lucide="${a.icon}"></i>
          <span>${a.title}</span>
          <span class="alert-tag">${a.horizon}</span>
        </div>
        <div class="alert-desc">${a.description}</div>
      </div>
      <button class="action-btn" onclick="alert('${esc(a.action)}')">Action Plan</button>`;
    el.appendChild(d);
  });
  lucide.createIcons();
}

// ── Parameter Grid ──
function renderParams(params, li) {
  const el = document.getElementById('paramGrid');
  if (!el) return;
  el.innerHTML = '';

  const defs = [
    { k: 'sst', n: 'Sea Surface Temp', u: '°C' },
    { k: 'do', n: 'Dissolved Oxygen', u: 'mg/L' },
    { k: 'salinity', n: 'Salinity', u: 'PSU' },
    { k: 'turbidity', n: 'Turbidity', u: 'NTU' },
    { k: 'ph', n: 'pH Level', u: '' },
    { k: 'chl_a', n: 'Chlorophyll-a', u: 'µg/L' }
  ];

  defs.forEach(p => {
    const prev = S.telemetry[p.k][li - 1] || params[p.k];
    const diff = Number((params[p.k] - prev).toFixed(2));
    const cls = diff > 0 ? 'delta-up' : diff < 0 ? 'delta-dn' : 'delta-st';
    const arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '━';
    const subIdx = S.mesi.subIndices[p.k];
    const isActive = S.param === p.k;

    const card = document.createElement('div');
    card.className = 'panel param-card';
    if (isActive) { card.style.borderColor = 'var(--accent-cyan)'; card.style.boxShadow = '0 0 14px rgba(6,182,212,0.2)'; }
    card.innerHTML = `
      <div class="param-hdr">
        <span>${p.n}</span>
        <span style="color:var(--accent-cyan);">Sub-Idx: ${subIdx}</span>
      </div>
      <div class="param-val-row">
        <span class="param-val">${params[p.k]}</span>
        <span class="param-unit">${p.u}</span>
      </div>
      <div class="param-delta ${cls}">${arrow} ${Math.abs(diff)} vs yesterday</div>`;
    card.addEventListener('click', () => {
      S.param = p.k;
      renderParams(params, li);
      buildChart(S.telemetry, S.param);
    });
    el.appendChild(card);
  });
}

// ── Chart ──
const PARAM_CFG = {
  sst:      { label: 'SST (°C)', color: '#f43f5e', min: 24, max: 34, unit: '°C' },
  do:       { label: 'DO (mg/L)', color: '#06b6d4', min: 0, max: 9, unit: 'mg/L' },
  salinity: { label: 'Salinity (PSU)', color: '#3b82f6', min: 15, max: 40, unit: 'PSU' },
  turbidity:{ label: 'Turbidity (NTU)', color: '#f59e0b', min: 0, max: 50, unit: 'NTU' },
  ph:       { label: 'pH', color: '#8b5cf6', min: 6.5, max: 9, unit: '' },
  chl_a:    { label: 'Chl-a (µg/L)', color: '#10b981', min: 0, max: 20, unit: 'µg/L' }
};

function buildChart(tel, paramKey) {
  const canvas = document.getElementById('mainChart');
  if (!canvas) return;
  const cfg = PARAM_CFG[paramKey] || PARAM_CFG.sst;
  const hi = tel.historyIndex;
  const raw = tel[paramKey];
  const unc = tel.uncertainty[paramKey];

  const hist = [], fore = [], upper = [], lower = [], baseline = [];
  for (let i = 0; i < raw.length; i++) {
    const isFore = i > hi;
    hist.push(isFore ? null : raw[i]);
    fore.push(i < hi ? null : raw[i]);
    upper.push(isFore ? Number((raw[i] + unc[i]).toFixed(2)) : null);
    lower.push(isFore ? Number((Math.max(0, raw[i] - unc[i])).toFixed(2)) : null);
    if (!S.mtMode) {
      const drift = isFore ? (i - hi) * (paramKey === 'do' ? -0.4 : 0.5) : 0;
      baseline.push(isFore ? Number((raw[i] + drift).toFixed(2)) : null);
    } else { baseline.push(null); }
  }

  const datasets = [
    { label: 'Historical Telemetry', data: hist, borderColor: cfg.color, borderWidth: 2.5, pointRadius: 3, fill: false, tension: 0.35, pointBackgroundColor: cfg.color },
    { label: '72h Shared-Encoder Forecast', data: fore, borderColor: cfg.color, borderWidth: 2.5, borderDash: [6,5], pointRadius: 5, pointBorderColor: cfg.color, pointBackgroundColor: '#fff', fill: false, tension: 0.35 },
    { label: 'Upper 95% CI', data: upper, borderColor: 'transparent', backgroundColor: cfg.color + '18', pointRadius: 0, fill: '+1', tension: 0.35 },
    { label: 'Lower 95% CI', data: lower, borderColor: 'transparent', backgroundColor: 'transparent', pointRadius: 0, fill: false, tension: 0.35 }
  ];

  if (!S.mtMode) datasets.push({ label: 'Single-Task Baseline (no shared encoder)', data: baseline, borderColor: '#64748b', borderWidth: 1.5, borderDash: [3,3], pointRadius: 2, fill: false, tension: 0.4 });

  if (chartInst) { chartInst.destroy(); chartInst = null; }

  chartInst = new Chart(canvas, {
    type: 'line',
    data: { labels: tel.timestamps, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true, position: 'top',
          labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, usePointStyle: true,
            filter: item => !item.text.includes('Lower') }
        },
        tooltip: {
          backgroundColor: '#0f172a', titleColor: '#38bdf8', bodyColor: '#f8fafc',
          borderColor: 'rgba(56,189,248,0.3)', borderWidth: 1, padding: 10,
          callbacks: { label: ctx => ctx.raw !== null ? `${ctx.dataset.label}: ${ctx.raw} ${cfg.unit}` : null }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 10 } } },
        y: { min: cfg.min, max: cfg.max, grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#64748b', font: { size: 10 }, callback: v => `${v}${cfg.unit}` } }
      }
    }
  });
}

// ── View 2: Causal Action Engine Render ──
function renderC2(params) {
  const mesiEl = document.getElementById('diceMesiVal');
  const catEl = document.getElementById('diceCategoryVal');
  if (mesiEl) { mesiEl.innerText = S.mesi.score.toFixed(1); mesiEl.style.color = S.mesi.color; }
  if (catEl) { catEl.innerText = S.mesi.category; catEl.style.color = S.mesi.color; }

  const diff = Math.max(0, S.mesi.score - 30);
  const el = document.getElementById('prescriptionList');
  if (!el) return;

  if (diff <= 0) {
    el.innerHTML = '<div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);padding:12px;border-radius:8px;font-size:0.82rem;color:var(--status-low);">✓ Ecosystem state is already within safe bounds (MESI &lt; 30). No regulatory intervention required at this time.</div>';
    return;
  }

  const r1 = Math.min(60, Math.round(diff * 0.55));
  const r2 = Math.min(50, Math.round(diff * 0.40));
  const r3 = Math.min(40, Math.round(diff * 0.28));

  const prescriptions = [
    { driver: 'Kelani / Ja-Ela Agricultural Runoff', action: `Reduce river basin nitrogen & fertiliser discharge by ${r1}%`, base: `Current Chl-a proxy: ${params.chl_a} µg/L`, auth: 'CEA / Ministry of Agriculture' },
    { driver: 'Industrial & Port Effluent Discharge', action: `Enforce ${r2}% reduction in wastewater turbidity load`, base: `Current Turbidity: ${params.turbidity} NTU`, auth: 'MEPA — Marine Environment Protection Authority' },
    { driver: 'Eco-Tourism & Commercial Marine Traffic', action: `Restrict high-speed vessel activity by ${r3}% during low-DO windows`, base: `DO threshold: ${params.do} mg/L (below 4.0 mg/L triggers restriction)`, auth: 'Coast Conservation Dept / Port Authority' }
  ];

  el.innerHTML = prescriptions.map(p => `
    <div class="prescription-card">
      <div>
        <div class="presc-driver">${p.driver}</div>
        <div class="presc-action"><i data-lucide="check-circle-2" style="width:13px;flex-shrink:0;"></i> ${p.action}</div>
        <div class="presc-base">${p.base}</div>
      </div>
      <span class="presc-auth">${p.auth}</span>
    </div>`).join('');

  lucide.createIcons();
}

// ── Site Banner ──
function updateSiteBanner() {
  if (S.customTelemetry) {
    const el = document.getElementById('siteBannerText');
    if (el) {
      el.innerHTML = `<strong>Custom Telemetry Dataset Ingested</strong> — Active live user-uploaded buoy telemetry
        <span style="font-size:0.68rem;background:rgba(16,185,129,0.18);border:1px solid rgba(16,185,129,0.3);color:var(--status-low);padding:2px 7px;border-radius:4px;font-weight:700;margin-left:8px;">
          CSV Ingested (${S.telemetry.timestamps.length} records)
        </span>`;
    }
    return;
  }

  const site = SITE_DATABASE[S.site];
  if (!site) return;
  const prov = DATA_PROVIDERS[site.dataProvider];
  const el = document.getElementById('siteBannerText');
  if (el) {
    el.innerHTML = `<strong>${site.name}</strong> (${site.region}) — ${site.description}
      <span style="font-size:0.68rem;background:${prov.badgeBg};border:1px solid ${prov.badgeBorder};color:${prov.color};padding:2px 7px;border-radius:4px;font-weight:700;margin-left:8px;">
        ${prov.fullTitle} [${site.sensorNode}]
      </span>`;
  }
}

// ── Sliders sync ──
function syncSliders(params) {
  const keys = ['sst', 'do', 'salinity', 'turbidity', 'ph', 'chl_a'];
  keys.forEach(k => {
    const sl = document.getElementById('sl_' + k);
    const vl = document.getElementById('val_' + k);
    if (sl && params[k] !== undefined) { sl.value = params[k]; }
    if (vl && params[k] !== undefined) { vl.innerText = params[k]; }
  });
}

// ── Export ──
function exportReport() {
  const site = SITE_DATABASE[S.site];
  const mon = MONSOON_MODIFIERS[S.monsoon];
  const prov = DATA_PROVIDERS[site.dataProvider];
  const t = S.telemetry;
  const li = t.timestamps.length - 1;

  const compNames = {
    c1: "WATER QUALITY & STRESS FORECASTING",
    c2: "CAUSAL ACTION & INTERVENTION ENGINE",
    c3: "BLEACHING RISK FORECASTER",
    c4: "THERMAL ADAPTATION TRACKER"
  };

  const txt = `
=================================================================
TIDE PLATFORM — MULTI-AGENCY OPERATIONAL BRIEF
Data Sources: NARA | Sri Lanka Navy Hydrographic | Ocean Univ (OCU)
=================================================================
Timestamp: ${new Date().toLocaleString()}
Location: ${site ? site.name : 'Custom Uploaded Dataset'} (${site ? site.region : 'Custom'})
Data Provider: ${site ? prov.fullTitle : 'Custom In-Situ Sensor / Buoy File'}
Sensor Node: ${site ? site.sensorNode : 'CUSTOM-UPLOAD-01'}
Monsoon Cycle: ${mon.name}
Active Module: ${compNames[S.comp]}
-----------------------------------------------------------------
MESI Score: ${S.mesi.score} / 100 — ${S.mesi.category}
Forecast Horizon: +72 Hours

FORECASTED PARAMETERS (t+72h):
  SST: ${t.sst[li]} °C
  DO: ${t.do[li]} mg/L
  Salinity: ${t.salinity[li]} PSU
  Turbidity: ${t.turbidity[li]} NTU
  pH: ${t.ph[li]}
  Chl-a: ${t.chl_a[li]} µg/L

ACTIVE ECOLOGICAL EARLY WARNINGS:
${S.alerts.map((a, i) => `${i + 1}. [${a.type.toUpperCase()}]\n   ${a.title}\n   Severity: ${a.severity.toUpperCase()}\n   Action: ${a.action}`).join('\n\n')}
=================================================================`;

  const blob = new Blob([txt], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TIDE_${S.site}_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function esc(s) { return s.replace(/'/g, "\\'"); }
