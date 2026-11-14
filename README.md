# ETHIODROUGHT — Beyond Rainfall
### NASA Space Apps Challenge 2026 • "Be An Earth System Trend Detective!"

> **Main Tagline:** "Beyond Rainfall. Understanding the Signals of Drought."  
> **Secondary Description:** "Turning NASA Earth observations into understandable environmental intelligence for Ethiopia."

---

## 🛰️ 1. Project Overview

**ETHIODROUGHT** is a competition web application designed to investigate agricultural and meteorological drought across Ethiopia, with an in-depth geographical case study on **Borena Zone, Oromia Region**.

Traditional drought monitoring often relies solely on rainfall gauges, failing to capture the complex subsurface and biological cascades that trigger famines. ETHIODROUGHT combines three independent NASA Earth observation indicators:

1. **Precipitation Anomalies:** NASA GPM IMERG Final Run / FLDAS (0.1° resolution)
2. **Root-Zone Soil Moisture Anomalies:** NASA FLDAS Noah Land Surface Model 0–100cm (0.1° resolution)
3. **Vegetation Health Anomalies:** NASA MODIS MOD13A2 / MYD13A2 NDVI (1km / 0.05° resolution)

Its central innovation is the **Drought Fingerprint Engine**, which evaluates the agreement, divergence, and temporal lag between these three signals to diagnose:
- **Meteorological Drought Onset:** Atmospheric deficit buffered by antecedent ground moisture.
- **Root-Zone Soil Moisture Desiccation:** Hidden subsurface drying prior to canopy collapse.
- **Canopy Agricultural Stress:** Pasture exhaustion and browning.
- **Compound Agricultural Drought:** Simultaneous crisis across rainfall, soil, and vegetation.
- **Ephemeral Green-up Mirage / False Recovery:** Surface weed greening masking deep aquifer depletion.

---

## 🎨 2. Visual Design & Architecture

Adapted directly from high-end satellite monitoring command center concepts (NASA Earthdata, Bloomberg analytics):
- **Primary Background:** `#040507` (Deep midnight black/navy)
- **Panels:** `#253352` (Translucent slate glass with subtle illumination and rounded corners)
- **Primary Text:** `#FBFCFD` | **Secondary Text:** `#999CA0` | **Subtle:** `#595C61`
- **Accents:** Cyan `#28D7C5`, Light Blue `#A8BFDC`, Accent Blue `#41619F`, Satellite Greens
- **Visual Composition:**
  - **Top Navigation:** Understated bar with glowing pill tab selector and English/Amharic (አማርኛ) toggle.
  - **Central Hero Geospatial View (~60% width):** Interactive Leaflet map of Ethiopia with Borena Zone highlight, woreda stations (Yabello, Moyale, Dillo, Teltele, Dire/Mega, Miyo, Wachile, Dubluk), rotating radar sensor sweep, floating location badge, and floating command query bar.
  - **Right-Side Insights Panel (~40% width):** Stacked real-time analytical cards (Drought Fingerprint, Environmental Trend, Regional Target, Scientific Explanation).
  - **Bottom Analytical Panels:** 4 compact cards (Environmental History 24-month chart, Drought Indicators breakdown, Regional Contrast, NASA Data Provenance).

---

## 🔬 3. Scientific Methodology

### Standardized Monthly Anomaly ($Z$-Score)
Calculated against calendar-month climatological baselines (2000–2020) to isolate true anomalies from natural seasonality:
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
- Node.js 18+ (tested on Node v24)
- npm 10+

### Installation & Execution
```bash
# Clone or navigate to the repository
cd ethiodrought

# Install dependencies
npm install

# Start development server
npm run dev
# The application will launch at http://localhost:3000

# Build production bundle
npm run build
npm start
```

---

## 📂 5. Project Folder Structure

```
ethiodrought/
├── package.json               # Dependencies (Next.js 14, React 18, Leaflet, Recharts, Tailwind)
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
│   │   ├── ethiopiaGeo.ts     # Verified boundary GeoJSON for Ethiopia & Borena woredas
│   │   ├── monthlyObservations.ts # 25-year monthly archives (2000-2024) for Borena, Somali, Tigray
│   │   └── translations.ts    # Complete English / Amharic (አማርኛ) dictionary
│   └── lib/
│       ├── stats.ts           # Mann-Kendall, Sen's slope, Standardized Anomaly, Normal CDF
│       ├── droughtEngine.ts   # Decoupling classification, compound drought, lag detection
│       └── aiExplainer.ts     # Dynamic scientific narrative hypothesis synthesis
```

---

## 📊 6. Ingesting Custom Climate Data (CSV Schema)

Users can drag-and-drop their own NASA Giovanni or meteorological records using the **CSV Ingestion** button. The file must follow this schema:

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
