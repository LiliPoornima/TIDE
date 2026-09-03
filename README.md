# TIDE: Transparent Intelligence for Decision Support in Ecosystems

**Explainable AI Platform for Marine Ecosystem Forecasting and Decision Support in Sri Lankan Coastal Waters**

TIDE integrates coastal telemetry from **NARA** (National Aquatic Resources Research and Development Agency), the **Sri Lanka Navy (Hydrographic Service)**, and the **Ocean University of Sri Lanka (OCU)** to provide multi-task water quality forecasting, dynamic ecosystem stress indexing (MESI), and causal intervention planning.

---

## 🚀 How to Run Locally

Because TIDE is built with modern HTML5, CSS3, and JavaScript (with Chart.js and Lucide Icons loaded via CDN), **no compilation or npm installation is required**.

### Option 1: Using Python (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/LiliPoornima/TIDE.git
   cd TIDE
   ```

2. **Start a local HTTP server:**
   * **Python 3:**
     ```bash
     python -m http.server 8080
     ```
   * **Mac / Linux (if `python3` is the alias):**
     ```bash
     python3 -m http.server 8080
     ```

3. **Open in your browser:**
   ```
   http://localhost:8080
   ```

---

### Option 2: Using VS Code Live Server Extension

1. Open the cloned `TIDE` folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey) if you don't already have it.
3. Right-click [`index.html`](index.html) and select **"Open with Live Server"**.
4. The site will automatically open in your default browser at `http://127.0.0.1:5500`.

---

### Option 3: Using Node.js / `npx` (If Node is installed)

```bash
git clone https://github.com/LiliPoornima/TIDE.git
cd TIDE
npx serve .
```

---

### Option 4: Deploy Free on GitHub Pages (Public Web Link)

You can host this site live on GitHub for free:
1. Go to your GitHub repository: `https://github.com/LiliPoornima/TIDE`
2. Click **Settings** > **Pages** (in the left sidebar).
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**.
5. Within 1–2 minutes, GitHub will give you a public URL (e.g., `https://LiliPoornima.github.io/TIDE/`) that anyone can open on any device!

---

## 📁 Repository Structure

```
TIDE/
├── index.html               # Main single-page web application shell
├── css/
│   └── styles.css           # Glassmorphism ocean theme & layout styles
├── js/
│   ├── app.js               # Main router & data ingestion controller
│   ├── site_data.js         # Coastal locations (NARA, SL Navy, OCU stations)
│   ├── esi_calculator.js    # NARA MESI formulation & 72h alert classifier
│   ├── causal_engine.js     # DoWhy causal graph & DiCE counterfactuals
│   └── chart_builder.js     # Chart.js time-series & uncertainty band renderer
└── README.md                # Project setup & documentation
```

---

## 📊 Modules Overview

* **Water Quality & MESI Forecasting:** 14-day history + 72-hour forecast for 6 coupled parameters (SST, DO, Salinity, Turbidity, pH, Chlorophyll-a), MESI composite score (0–100), and multiclass early warnings (Hypoxia, HAB, Bleaching stress).
* **Causal Action Engine:** DoWhy Structural Causal Model filtering monsoon confounders and DiCE counterfactual optimization recommending exact % reductions in agricultural/industrial runoff.
* **Bleaching Risk Forecaster & Thermal Adaptation Tracker:** Roadmap modules for longitudinal satellite calibration and threshold drift.
