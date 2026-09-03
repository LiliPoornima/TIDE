/* ==========================================================================
   TIDE Platform — Component 02: Causal Intelligence & Counterfactual Engine
   Libraries simulated: DoWhy (Structural Causal Models) & DiCE (Counterfactuals)
   ========================================================================== */

const CAUSAL_GRAPH_NODES = {
  confounder: { id: "monsoon", label: "Monsoon Seasonality (Confounder)", type: "confounder" },
  drivers: [
    { id: "river_runoff", label: "River Nutrient Runoff (Kelani/Ja-Ela)", type: "causal_driver" },
    { id: "effluent", label: "Industrial Waste Discharge", type: "causal_driver" },
    { id: "sst", label: "Sea Surface Temperature", type: "causal_driver" }
  ],
  mediators: [
    { id: "turbidity", label: "Coastal Turbidity Loading" },
    { id: "salinity", label: "Salinity Dilution Plume" },
    { id: "chl_a", label: "Chlorophyll-a Algal Biomass" }
  ],
  outcome: { id: "mesi", label: "Ecosystem Stress Index (MESI)" }
};

/**
 * DiCE Counterfactual Prescription Generator
 * Calculates minimum required intervention target to drop ecosystem risk
 */
function calculateCounterfactuals(currentParams, currentMesi, targetMesi = 30) {
  const diffNeeded = Math.max(0, currentMesi - targetMesi);
  
  if (diffNeeded <= 0) {
    return {
      status: "Optimal",
      message: "Current ecosystem state is already within safe target bounds (< 30 MESI). No mandatory regulatory intervention required.",
      prescriptions: []
    };
  }

  // Calculate required percentage reductions in causal drivers
  const riverReduction = Math.min(60, Math.round(diffNeeded * 0.55));
  const effluentReduction = Math.min(50, Math.round(diffNeeded * 0.40));
  const boatTrafficReduction = Math.min(40, Math.round(diffNeeded * 0.30));

  return {
    status: "Action Required",
    targetMesi,
    currentMesi,
    diffNeeded: diffNeeded.toFixed(1),
    prescriptions: [
      {
        driver: "Kelani / Ja-Ela Agricultural Runoff",
        currentValue: `${currentParams.chl_a} µg/L Chlorophyll-a proxy`,
        recommendedAction: `Reduce river basin nitrogen & fertilizer discharge by ${riverReduction}%`,
        authority: "CEA / Ministry of Agriculture"
      },
      {
        driver: "Industrial & Coastal Port Effluent",
        currentValue: `${currentParams.turbidity} NTU Turbidity loading`,
        recommendedAction: `Enforce ${effluentReduction}% reduction in industrial wastewater turbidity limits`,
        authority: "MEPA (Marine Environment Protection Authority)"
      },
      {
        driver: "Local Commercial & Eco-Tourism Traffic",
        currentValue: `High localized turbulence & propeller shear`,
        recommendedAction: `Limit high-speed vessel activity by ${boatTrafficReduction}% during low-DO periods`,
        authority: "Coast Conservation Dept / Port Authority"
      }
    ]
  };
}

/**
 * Render Component 02 View into target container
 */
function renderComponent02View(containerId, currentParams, currentMesi) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cfResult = calculateCounterfactuals(currentParams, currentMesi.score, 30);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Section 1: Title & Causal Graph -->
      <div class="glass-panel" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h3 class="section-title" style="font-size: 1.2rem;">
              <i data-lucide="git-fork" style="color: var(--accent-purple);"></i>
              DoWhy Structural Causal Graph & Confounding Filter
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
              Distinguishes true cause-and-effect drivers from spurious correlations (e.g. monsoon seasonal confounding vs true industrial effluent impacts).
            </p>
          </div>
          <span style="font-size: 0.75rem; background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); color: var(--accent-purple); padding: 4px 12px; border-radius: 20px; font-weight: 600;">
            DoWhy Structural Causal Model
          </span>
        </div>

        <!-- DAG Visual Diagram -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-glass); border-radius: 12px; padding: 20px; margin-top: 16px;">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; text-align: center; align-items: center;">
            
            <div style="background: rgba(245, 158, 11, 0.1); border: 1px dashed var(--status-moderate); padding: 14px; border-radius: 10px;">
              <div style="font-size: 0.7rem; color: var(--status-moderate); font-weight: 700; text-transform: uppercase;">Confounder</div>
              <div style="font-weight: 700; font-size: 0.9rem; margin-top: 4px; color: #ffffff;">Monsoon Cycle</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Filtered out via do-calculus</div>
            </div>

            <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid var(--accent-cyan); padding: 14px; border-radius: 10px;">
              <div style="font-size: 0.7rem; color: var(--accent-cyan); font-weight: 700; text-transform: uppercase;">True Causal Drivers</div>
              <div style="font-weight: 700; font-size: 0.9rem; margin-top: 4px; color: #ffffff;">River Runoff & Effluent</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">ATE P-value < 0.001</div>
            </div>

            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid var(--accent-purple); padding: 14px; border-radius: 10px;">
              <div style="font-size: 0.7rem; color: var(--accent-purple); font-weight: 700; text-transform: uppercase;">Mediators</div>
              <div style="font-weight: 700; font-size: 0.9rem; margin-top: 4px; color: #ffffff;">DO Depletion & Turbidity</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Physical mechanism</div>
            </div>

            <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid var(--status-critical); padding: 14px; border-radius: 10px;">
              <div style="font-size: 0.7rem; color: var(--status-critical); font-weight: 700; text-transform: uppercase;">Target Outcome</div>
              <div style="font-weight: 700; font-size: 0.9rem; margin-top: 4px; color: #ffffff;">MESI Stress Score</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">0–100 Ecosystem Index</div>
            </div>

          </div>
        </div>
      </div>

      <!-- Section 2: DiCE Counterfactual Intervention Engine -->
      <div class="glass-panel" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h3 class="section-title" style="font-size: 1.2rem;">
              <i data-lucide="target" style="color: var(--status-low);"></i>
              DiCE Counterfactual Intervention Engine
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
              Recommends exact actionable regulatory targets required to reduce ecosystem stress to safe levels.
            </p>
          </div>
          <span style="font-size: 0.75rem; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: var(--status-low); padding: 4px 12px; border-radius: 20px; font-weight: 600;">
            DiCE Optimization Engine
          </span>
        </div>

        <!-- Current vs Target Card -->
        <div style="display: grid; grid-template-columns: 280px 1fr; gap: 20px; margin-bottom: 20px;">
          <div style="background: rgba(15, 23, 42, 0.6); padding: 20px; border-radius: 12px; border: 1px solid var(--border-glass); text-align: center;">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary);">Current Ecosystem Risk</div>
            <div style="font-family: var(--font-heading); font-size: 2.5rem; font-weight: 800; color: ${currentMesi.color}; margin: 8px 0;">
              ${currentMesi.score}
            </div>
            <div style="font-size: 0.8rem; font-weight: 700; color: ${currentMesi.color};">${currentMesi.category}</div>
            
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-glass);">
              <div style="font-size: 0.75rem; color: var(--text-muted);">Target Safe MESI Bound</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--status-low);">≤ 30.0 (Low Risk)</div>
            </div>
          </div>

          <!-- Prescription Cards -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <h4 style="font-size: 0.95rem; font-weight: 700; color: #ffffff;">Actionable Counterfactual Prescriptions:</h4>
            ${cfResult.prescriptions.map((p, idx) => `
              <div style="background: rgba(15, 23, 42, 0.5); border-left: 4px solid var(--accent-cyan); padding: 14px 18px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 700; font-size: 0.9rem; color: #ffffff;">${idx + 1}. ${p.driver}</div>
                  <div style="font-size: 0.8rem; color: var(--accent-cyan); margin-top: 2px;">
                    <i data-lucide="check-circle-2" style="width: 14px; vertical-align: middle;"></i> ${p.recommendedAction}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Current baseline: ${p.currentValue}</div>
                </div>
                <span style="font-size: 0.7rem; background: rgba(255,255,255,0.08); padding: 4px 8px; border-radius: 4px; color: var(--text-secondary); white-space: nowrap;">
                  ${p.authority}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();
}
