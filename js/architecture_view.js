/* ==========================================================================
   TIDE Platform - Component 1: Neural Architecture Inspector
   Shared Temporal Encoder & Homoscedastic Loss Balancing Visualizer
   ========================================================================== */

const ARCHITECTURE_METADATA = {
  encoder: {
    name: "Shared Temporal Encoder",
    type: "Bi-LSTM / Temporal Transformer",
    inputDim: "14 Days × 6 Parameters + Monsoon Embedding",
    latentDim: "64-Dimensional Latent Synergy Representation",
    description: "Compresses coupled oceanographic time-series into a shared latent space, forcing the neural network to learn cross-parameter physical & chemical dependencies."
  },
  lossBalancing: {
    name: "Homoscedastic Loss Balancing",
    formula: "L_total = ∑ (1 / 2σ_i²) L_i + ln(σ_i)",
    description: "Dynamically learns noise variances (σ_i) during training to prevent high-scale tasks (Salinity 35 PSU) from overwhelming low-scale tasks (Chlorophyll 1.5 µg/L).",
    learnedSigmas: {
      sst: 0.42,
      do: 0.38,
      salinity: 1.25,
      turbidity: 2.10,
      ph: 0.12,
      chl_a: 0.85
    }
  }
};

/**
 * Render Homoscedastic Loss Weight Inspector in the UI
 */
function renderArchitectureInspector(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const sigmas = ARCHITECTURE_METADATA.lossBalancing.learnedSigmas;

  container.innerHTML = `
    <div class="arch-pipeline">
      <!-- Step 1: Input -->
      <div class="arch-step">
        <span class="arch-step-badge">Phase 1: Multi-Variate Input</span>
        <h4 class="arch-step-title">14-Day Telemetry Window</h4>
        <p class="arch-step-desc">Synchronized hourly ocean buoy readings & Sentinel-3/MODIS satellite proxies.</p>
        <div class="arch-tags">
          <span class="arch-tag">SST, DO, Salinity</span>
          <span class="arch-tag">Turbidity, pH, Chl-a</span>
          <span class="arch-tag">Monsoon Vector</span>
        </div>
      </div>

      <!-- Step 2: Shared Encoder -->
      <div class="arch-step" style="border-color: var(--accent-purple); background: rgba(139, 92, 246, 0.08);">
        <span class="arch-step-badge" style="color: var(--accent-purple);">Phase 2: Core Shared Encoder</span>
        <h4 class="arch-step-title">Bi-LSTM / Transformer</h4>
        <p class="arch-step-desc">64-Dim Latent Representation. Extracts coupled physical/chemical cross-dependencies.</p>
        <div class="arch-tags">
          <span class="arch-tag" style="color: var(--accent-purple);">Shared Latent Space</span>
          <span class="arch-tag">GradNorm / Homoscedastic</span>
        </div>
      </div>

      <!-- Step 3: Decoders -->
      <div class="arch-step">
        <span class="arch-step-badge">Phase 3: Multi-Task Decoders</span>
        <h4 class="arch-step-title">6 Parameter Heads</h4>
        <p class="arch-step-desc">Task-specific MLP heads outputting 72-hour future forecasts (t+24h, t+48h, t+72h).</p>
        <div class="arch-tags">
          <span class="arch-tag">Homoscedastic Loss</span>
          <span class="arch-tag">Uncertainty Calibrated</span>
        </div>
      </div>

      <!-- Step 4: MESI & Classifier -->
      <div class="arch-step" style="border-color: var(--accent-cyan); background: rgba(6, 182, 212, 0.08);">
        <span class="arch-step-badge">Phase 4: Synthesis & Alerts</span>
        <h4 class="arch-step-title">MESI Engine & Classifier</h4>
        <p class="arch-step-desc">Computes 0-100 Ecosystem Stress Index & triggers 72-hr Hypoxia / HAB / Bleaching alerts.</p>
        <div class="arch-tags">
          <span class="arch-tag" style="color: var(--accent-cyan);">NARA Ecological Rules</span>
          <span class="arch-tag">MEPA Action Generator</span>
        </div>
      </div>
    </div>

    <!-- Loss Balancing Card -->
    <div style="margin-top: 20px; padding: 16px; background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-glass); border-radius: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: #ffffff;">Homoscedastic Uncertainty Loss Weights (σ_i)</h4>
        <code style="font-size: 0.75rem; color: var(--accent-cyan); background: rgba(6, 182, 212, 0.1); padding: 4px 8px; border-radius: 4px;">
          ${ARCHITECTURE_METADATA.lossBalancing.formula}
        </code>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
        <div style="background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; font-size: 0.8rem;">
          <span style="color: var(--text-secondary);">SST Noise (σ₁):</span> <strong style="color: var(--accent-cyan);">${sigmas.sst}</strong>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; font-size: 0.8rem;">
          <span style="color: var(--text-secondary);">DO Noise (σ₂):</span> <strong style="color: var(--accent-cyan);">${sigmas.do}</strong>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; font-size: 0.8rem;">
          <span style="color: var(--text-secondary);">Salinity Noise (σ₃):</span> <strong style="color: var(--accent-cyan);">${sigmas.salinity}</strong>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; font-size: 0.8rem;">
          <span style="color: var(--text-secondary);">Turbidity Noise (σ₄):</span> <strong style="color: var(--accent-cyan);">${sigmas.turbidity}</strong>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; font-size: 0.8rem;">
          <span style="color: var(--text-secondary);">pH Noise (σ₅):</span> <strong style="color: var(--accent-cyan);">${sigmas.ph}</strong>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; font-size: 0.8rem;">
          <span style="color: var(--text-secondary);">Chl-a Noise (σ₆):</span> <strong style="color: var(--accent-cyan);">${sigmas.chl_a}</strong>
        </div>
      </div>
    </div>
  `;
}
