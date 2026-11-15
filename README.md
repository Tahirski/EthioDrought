# ETHIODROUGHT — Beyond Rainfall
### NASA Space Apps Challenge 2026 • "Be An Earth System Trend Detective!"

> **Main Tagline:** "Beyond Rainfall. Understanding the Signals of Drought."  
> **Secondary Description:** "A transparent framework for investigating drought evidence in Ethiopia."

---

## 🛰️ 1. Project Overview

**ETHIODROUGHT** is a competition web application designed to investigate drought across Ethiopia, with an in-depth case study on **Borena Zone, Oromia Region**.

> **Data integrity notice:** A live NASA POWER / MERRA-2 point series is available for Borena, and supplied gridded files support static 72-zone spatial summaries. The built-in 2000–2024 analysis series remain synthetic UI demonstrations. The Predictor contains an experimental national-box rainfall-only GPR using a user-supplied Giovanni export; its units are unverified and its 2025-06 forecast is historical. None of these should be used for operational drought decisions or alerts.

The planned scientific analysis combines three distinct indicators when verified observations become available:

1. **Precipitation Anomalies:** NASA GPM IMERG (product and version not yet configured)
2. **Soil Moisture Anomalies:** NASA FLDAS or a separately harmonized alternative
3. **Vegetation Anomalies:** NASA MODIS MOD13A2 with quality screening

CHIRPS v3 is listed as a candidate rainfall comparison, not as an integrated feed. Giovanni and KNMI are exploration tools; AppEEARS is an extraction service for supported products; GES DISC hydrology time-series resources require product-specific evaluation; NOAA CDO station availability in Borena is unverified. See the source registry in the app or `GET /api/v1/references`.

The **Drought Fingerprint Engine** is a prototype for evaluating agreement and divergence between these signals. It does not infer groundwater depletion, crop losses, or livestock impacts from vegetation data alone.
- **Meteorological Drought Onset:** Atmospheric deficit buffered by antecedent ground moisture.
- **Root-Zone Soil Moisture Desiccation:** Hidden subsurface drying prior to canopy collapse.
- **Canopy Agricultural Stress:** Pasture exhaustion and browning.
- **Compound Agricultural Drought:** Simultaneous crisis across rainfall, soil, and vegetation.
- **Ephemeral Green-up Mirage / False Recovery:** Surface weed greening masking deep aquifer depletion.

The experimental Predictor is available at `/predict`. It forecasts one monthly step of the national bounding-box rainfall series only; it is not a zone forecast and does not predict soil moisture. See `docs/backend.md` for data provenance, validation metrics, and limitations.

---

## 🎨 2. Visual Design & Architecture

Adapted directly from high-end satellite monitoring command center concepts (NASA Earthdata, Bloomberg analytics):
- **Primary Background:** `#040507` (Deep midnight black/navy)
- **Panels:** `#253352` (Translucent slate glass with subtle illumination and rounded corners)
- **Primary Text:** `#FBFCFD` | **Secondary Text:** `#999CA0` | **Subtle:** `#595C61`
- **Accents:** Cyan `#28D7C5`, Light Blue `#A8BFDC`, Accent Blue `#41619F`, Satellite Greens
- **Visual Composition:**
  - **Top Navigation:** Understated bar with glowing pill tab selector and English/Amharic (አማርኛ) toggle.
  - **Investigation map:** Region selection and evidence-layer controls, with no drought-colored polygons or fabricated station markers while verified observations are unavailable.
  - **Data readiness panels:** Candidate source roles, limitations, and missing observation/retrieval metadata are explicit.

---

## 🔬 3. Scientific Methodology

### Standardized Monthly Anomaly ($Z$-Score)
The backend implements calendar-month baselines (configurable; defaults to 2000–2020). These methods are not currently applied to verified satellite observations:
$$Z_{y,m} = \frac{X_{y,m} - \mu_m}{\sigma_m}$$
where $\mu_m$ is the multi-year monthly mean for month $m \in \{1..12\}$, and $\sigma_m$ is the monthly standard deviation.

### Mann-Kendall Non-Parametric Trend Test
Evaluates monotonic upward/downward trends without assuming normal distribution:
$$S = \sum_{i=1}^{n-1} \sum_{j=i+1}^n \operatorname{sgn}(x_j - x_i)$$
Variance $\operatorname{Var}(S)$ accounts for tied groups, generating a standardized test statistic $Z_{MK}$ and exact two-tailed $p$-value.

### Theil-Sen Slope Estimator
Robust non-parametric estimator of the rate of change:
$$Q_k = \frac{x_j - x_i}{j - i} \quad \implies \quad Q_{\text{Sen}} = \operatorname{median}(Q_k)$$

---

## 🚀 4. Quick Start & Local Running

### Prerequisites
- Node.js 20.9+ recommended (tested on Node v24)
- npm 10+

### Frontend and backend launch

The frontend and `/api/v1` backend are served by the same Next.js application; they are not separate processes.

```bash
npm ci
npm run dev
```

Open the frontend at [http://localhost:3000](http://localhost:3000). The API is available at `/api/v1` on the same host. For production, run:

```bash
npm run build
npm start
```

## Backend API

The versioned API uses the existing Next.js server. It includes a scientific-method module, dataset registry, JSON report contract, sample-only SMS workflow, and an opt-in SMTP email workflow for reviewed sample notifications. It does **not** include external NASA ingestion, a database, PDF rendering, or verified environmental alerts. See [docs/backend.md](./docs/backend.md) for routes, request/response shapes, configuration, quality rules, and tests.

For frontend/backend development and production launch commands, see the [launch guide](./docs/launch.md).

---

## 📂 5. Project Folder Structure

```
ethiodrought/
├── package.json               # Dependencies (Next.js 15, React 18, Leaflet, Recharts, Tailwind)
├── tailwind.config.js         # NASA UI command center color palette & glow effects
├── tsconfig.json              # TypeScript configuration
├── next.config.mjs            # Next.js configuration
├── scripts/
│   └── test_stats.js          # Unit verification script for Mann-Kendall & Sen's slope
├── src/
│   ├── app/
│   │   ├── globals.css        # Glassmorphism, Leaflet dark tiles, radar sweep animations
│   │   ├── layout.tsx         # Root layout with Leaflet CSS and ClientLayout wrapper
│   │   ├── page.tsx           # Homepage: 8-section cinematic storytelling overview
│   │   ├── explore/
│   │   │   └── page.tsx       # Route: /explore — Full-screen geospatial map & command center
│   │   ├── fingerprint/
│   │   │   └── page.tsx       # Route: /fingerprint — Drought Fingerprint Engine
│   │   ├── trends/
│   │   │   └── page.tsx       # Route: /trends — Earth System Trend Detective
│   │   ├── compare/
│   │   │   └── page.tsx       # Route: /compare — Regional agro-climatic comparison
│   │   ├── data/
│   │   │   └── page.tsx       # Route: /data — NASA data catalog, CSV ingestion & report export
│   │   └── methodology/
│   │       └── page.tsx       # Route: /methodology — Mathematical equations & sensor citations
│   ├── components/
│   │   ├── Navbar.tsx         # Route-based pill navigation, language toggle, Space Apps badge
│   │   ├── Footer.tsx         # Scientific provenance footer
│   │   ├── ClientLayout.tsx   # Client wrapper providing AppContext, Navbar, and Footer
│   │   ├── HeroMap.tsx        # Dynamic Leaflet wrapper with radar dial and controls
│   │   ├── LeafletMapInner.tsx# Core Leaflet map with boundaries, woredas & vector fallbacks
│   │   ├── InsightsPanel.tsx  # Real-time scientific telemetry & diagnosis panel
│   │   ├── BottomPanels.tsx   # 4 analytical panels (history, indicators, contrast, sources)
│   │   ├── TimelinePlayback.tsx# 24-year historical scrubber with drought event benchmark jumps
│   │   ├── CsvUploadModal.tsx # Drag-and-drop CSV validator with schema preview
│   │   ├── ReportExportModal.tsx # Scientific report generator (PDF & JSON)
│   │   └── pages/
│   │       ├── FingerprintPage.tsx    # Dedicated Drought Fingerprint Engine view
│   │       ├── TrendDetectivePage.tsx# Trend Detective with Sen's slope & Mann-Kendall
│   │       ├── ComparisonPage.tsx    # Agro-climatic zone comparison view
│   │       ├── MethodologyPage.tsx   # Mathematical formulas & remote sensing limitations
│   │       └── AboutPage.tsx         # "Why Ethiopia?" & NASA Space Apps context
│   ├── context/
│   │   └── AppContext.tsx     # Centralized React context for bilingual state, records, anomalies
│   ├── data/
│   │   ├── ethiopiaGeo.ts     # Frontend display geometry; not verified for scientific API use
│   │   ├── monthlyObservations.ts # Synthetic monthly demonstration series (2000-2024)
│   │   └── translations.ts    # Complete English / Amharic (አማርኛ) dictionary
│   └── lib/
│       ├── stats.ts           # Mann-Kendall, Sen's slope, Standardized Anomaly, Normal CDF
│       ├── droughtEngine.ts   # Decoupling classification, compound drought, lag detection
│       └── aiExplainer.ts     # Dynamic scientific narrative hypothesis synthesis
```

---

## 📊 6. Ingesting Custom Climate Data (CSV Schema)

The existing **CSV Ingestion** modal performs client-side preview/validation only; it does not persist data or update backend calculations. The protected backend CSV API is separate, uses its documented schema, and quarantines unverified uploads from analysis. See the [CSV upload contract](./docs/backend.md#csv-upload-contract).

```csv
date,rainfall_mm,soil_moisture,ndvi
2024-01,14.5,0.162,0.342
2024-02,22.1,0.155,0.315
2024-03,45.0,0.170,0.330
...
```

The built-in validator inspects column headers, date formats (`YYYY-MM`), and physical boundaries before triggering immediate recalculation.

---

## 🏆 7. NASA Space Apps Challenge Alignment

- **Challenge:** "Be An Earth System Trend Detective!"
- **Target:** Pastoral rangelands of Southern Ethiopia (Borena Zone) & Greater Horn of Africa.
- **Innovation:** Multi-variable decoupling detection (differentiating meteorological rainfall deficits from root-zone soil desiccation and canopy browning).
- **Impact:** Empowers pastoralists and early warning agencies with actionable environmental intelligence.
