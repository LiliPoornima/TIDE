/* ==========================================================================
   TIDE Platform — Component 04: Drift-Aware Bleaching Threshold Detection & XAI Uncertainty
   ========================================================================== */

const DRIFT_REEF_DATA = {
  hikkaduwa_reef: {
    reefName: "Hikkaduwa Marine Sanctuary",
    historicalBleachingEvents: ["1998 (90% Bleached)", "2016 (55% Bleached)", "2020 (35% Bleached)"],
    status: "Drifting Threshold",
    statusColor: "var(--status-moderate)",
    baselineThermalLimit: "29.8°C",
    currentThermalLimit: "30.4°C (+0.6°C Shift)",
    uncertaintyLevel: "Moderate (σ = 0.42)",
    uncertaintyDrivers: [
      { factor: "Monsoonal Upwelling Fluctuation", impact: "+42% Variance" },
      { factor: "Thermal Acclimatization Speed", impact: "+35% Variance" },
      { factor: "Tourism Sedimentation Shielding", impact: "+23% Variance" }
    ]
  },
  pigeon_island: {
    reefName: "Pigeon Island National Park",
    historicalBleachingEvents: ["1998 (Moderate)", "2016 (Minor)", "2020 (Resilient)"],
    status: "Shifted Threshold (Adaptive Resilience)",
    statusColor: "var(--status-low)",
    baselineThermalLimit: "29.5°C",
    currentThermalLimit: "31.0°C (+1.5°C Shift)",
    uncertaintyLevel: "Low (σ = 0.18)",
    uncertaintyDrivers: [
      { factor: "East India Current Velocity Variance", impact: "+48% Variance" },
      { factor: "Deep Water Genetic Adaptations", impact: "+32% Variance" }
    ]
  },
  gulf_of_mannar: {
    reefName: "Gulf of Mannar & Palk Bay",
    historicalBleachingEvents: ["1998 (Severe)", "2016 (Severe)", "2020 (Severe)"],
    status: "Depleted Resilience / High Drift Risk",
    statusColor: "var(--status-critical)",
    baselineThermalLimit: "30.2°C",
    currentThermalLimit: "30.0°C (-0.2°C Degraded Limit)",
    uncertaintyLevel: "High (σ = 0.85)",
    uncertaintyDrivers: [
      { factor: "Extreme Heat Accumulation Non-linearity", impact: "+65% Variance" },
      { factor: "Algal Overgrowth Competition", impact: "+35% Variance" }
    ]
  }
};

/**
 * Render Component 04 View
 */
function renderComponent04View(containerId, activeSiteId = 'hikkaduwa_reef') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const data = DRIFT_REEF_DATA[activeSiteId] || DRIFT_REEF_DATA.hikkaduwa_reef;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Header -->
      <div class="glass-panel" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h3 class="section-title" style="font-size: 1.2rem;">
              <i data-lucide="activity" style="color: var(--status-low);"></i>
              Drift-Aware Coral Bleaching Threshold & Explainable Uncertainty (SHAP on Variance)
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
              Monitors whether historical coral bleaching thermal thresholds are shifting due to biological adaptation, and explains model uncertainty growth.
            </p>
          </div>
          <span style="font-size: 0.75rem; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: var(--status-low); padding: 4px 12px; border-radius: 20px; font-weight: 600;">
            Adaptive Baseline Tracker
          </span>
        </div>

        <!-- Status Summary Grid -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 20px;">
          <div style="background: rgba(15, 23, 42, 0.6); padding: 16px; border-radius: 10px; border: 1px solid var(--border-glass);">
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Thermal Adaptation Status</div>
            <div style="font-size: 1.15rem; font-weight: 700; color: ${data.statusColor}; margin-top: 6px;">
              ${data.status}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
              Historical Baseline: ${data.baselineThermalLimit} → Current Limit: ${data.currentThermalLimit}
            </div>
          </div>

          <div style="background: rgba(15, 23, 42, 0.6); padding: 16px; border-radius: 10px; border: 1px solid var(--border-glass);">
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Historical Major Bleaching Record</div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;">
              ${data.historicalBleachingEvents.map(e => `
                <span style="font-size: 0.7rem; background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 4px; color: #ffffff;">${e}</span>
              `).join('')}
            </div>
          </div>

          <div style="background: rgba(15, 23, 42, 0.6); padding: 16px; border-radius: 10px; border: 1px solid var(--border-glass);">
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Model Uncertainty Variance</div>
            <div style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; color: var(--accent-cyan); margin-top: 4px;">
              ${data.uncertaintyLevel}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Predictive variance metric</div>
          </div>
        </div>
      </div>

      <!-- Section 2: SHAP on Uncertainty Variance Card -->
      <div class="glass-panel" style="padding: 24px;">
        <h4 style="font-size: 1rem; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
          <i data-lucide="help-circle" style="color: var(--accent-purple); vertical-align: middle;"></i>
          SHAP on Model Uncertainty Variance (Why is the AI confused?)
        </h4>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 16px;">
          Applies SHAP feature attribution to the model's <em>prediction variance output</em> rather than its mean prediction. This highlights environmental factors causing model confusion, signaling emerging ecological tipping points.
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${data.uncertaintyDrivers.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.5); padding: 12px 16px; border-radius: 8px; border-left: 3px solid var(--accent-purple);">
              <span style="font-size: 0.85rem; color: #ffffff;">${item.factor}</span>
              <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-purple);">${item.impact}</span>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;

  lucide.createIcons();
}
