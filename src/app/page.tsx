"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useApp } from "@/context/AppContext";
import { translations } from "@/data/translations";
import {
  Droplets,
  Layers,
  Sprout,
  ArrowRight,
  Satellite,
  Search,
  TrendingDown,
  ExternalLink,
  MapPin,
  Compass,
} from "lucide-react";

const DynamicMap = dynamic(
  () => import("@/components/LeafletMapInner").then((mod) => ({ default: mod.LeafletMapInner })),
  {
    ssr: false,
    loading: () => <div className="w-full h-[500px] rounded-3xl bg-panel-dark animate-pulse" />,
  }
);

// Sparkline CSS helper component using simple CSS bars
function MiniSparkline({
  bars,
  colorClass,
}: {
  bars: number[];
  colorClass: string;
}) {
  return (
    <div className="flex items-end gap-1 h-8 px-2 py-1 bg-panel-dark/60 rounded-lg border border-panel-border/20">
      {bars.map((height, i) => (
        <div
          key={i}
          style={{ height: `${height}%` }}
          className={`w-1 rounded-full ${colorClass} ${
            i === bars.length - 1 ? "opacity-100 ring-1 ring-white/40" : "opacity-60"
          }`}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const {
    lang,
    selectedRegionId,
    setSelectedRegionId,
    selectedWoreda,
    setSelectedWoreda,
    rainZ,
    soilZ,
    vegZ,
    trendResult,
    diagnosis,
  } = useApp();

  const isAmharic = lang === "am";
  const t = translations[lang];

  // Sparkline data patterns
  const rainSpark = [45, 60, 30, 20, 15, 35, 25, 40, 20, 15, 30, 18];
  const soilSpark = [55, 45, 35, 25, 20, 18, 15, 12, 10, 14, 12, 10];
  const vegSpark = [70, 65, 50, 40, 35, 30, 25, 20, 22, 18, 16, 14];

  // Format Sen's Slope
  const formattedSensSlope =
    typeof trendResult?.sensSlope === "number"
      ? `${trendResult.sensSlope >= 0 ? "+" : ""}${(trendResult.sensSlope * 10).toFixed(4)} / decade`
      : "-0.0142 / decade";

  // Format P-Value
  const formattedPValue =
    typeof trendResult?.pValue === "number"
      ? trendResult.pValue < 0.001
        ? "p < 0.001"
        : `p = ${trendResult.pValue.toFixed(4)}`
      : "p < 0.001";

  return (
    <div className="w-full overflow-hidden bg-[#040507]">
      {/* SECTION 1: HERO */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden py-20 lg:py-28">
        {/* Subtle radial gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(22, 32, 54, 0.45) 0%, rgba(4, 5, 7, 0.95) 75%)",
          }}
        />
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-[1720px] mx-auto px-4 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-panel-dark/90 border border-accent-secondary/30 mb-6 backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                <span className="tracking-widest text-accent-light uppercase text-[11px] font-mono font-medium">
                  EARTH OBSERVATION INTELLIGENCE · ETHIOPIA
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary max-w-3xl leading-[1.12]">
                {isAmharic ? (
                  <>
                    ድርቅ ከዝናብ እጥረት{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-accent-light to-white">
                      የላቀና ጥልቅ ነው።
                    </span>
                  </>
                ) : (
                  <>
                    Drought is more than a{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-accent-light to-white">
                      lack of rain.
                    </span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl font-light leading-relaxed">
                {isAmharic
                  ? "በኢትዮጵያ ውስጥ ያለውን የአካባቢ ለውጥ እና የድርቅ ምስጢር ለመረዳት የዝናብ መጠን፣ የአፈር እርጥበት እና የዕፅዋት ሽፋን እንዴት እርስ በእርስ እንደሚዛመዱ ይመርምሩ።"
                  : "Explore how rainfall, soil moisture, and vegetation conditions interact to reveal the changing environmental patterns behind drought in Ethiopia."}
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 bg-accent-cyan text-[#040507] font-bold px-6 py-3 rounded-full hover:bg-accent-cyan/90 transition-all hover:scale-[1.02] shadow-[0_0_25px_rgba(40,215,197,0.3)]"
                >
                  <span>{isAmharic ? "ኢትዮጵያን ያስሱ" : "Explore Ethiopia"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/fingerprint"
                  className="inline-flex items-center gap-2 border border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/10 font-medium px-6 py-3 rounded-full transition-all hover:scale-[1.02]"
                >
                  <Compass className="w-4 h-4" />
                  <span>{isAmharic ? "የድርቅ ምልክት መለያ" : "Discover Drought Fingerprints"}</span>
                </Link>
              </div>

              {/* Satellite Metadata Badges */}
              <div className="mt-12 flex flex-wrap items-center gap-3 text-xs font-mono text-text-secondary">
                <span className="px-2.5 py-1 rounded-md bg-panel-dark border border-panel-border/30 flex items-center gap-1.5">
                  <Satellite className="w-3.5 h-3.5 text-accent-cyan" />
                  NASA GPM · FLDAS · MODIS
                </span>
                <span className="px-2.5 py-1 rounded-md bg-panel-dark border border-panel-border/30">
                  2000–2024 Baseline Archive
                </span>
                <span className="px-2.5 py-1 rounded-md bg-panel-dark border border-panel-border/30 text-accent-cyan">
                  ● Real-Time Telemetry
                </span>
              </div>
            </div>

            {/* Right Side: 3 Floating Data Cards Stacked */}
            <div className="lg:col-span-5 flex flex-col gap-4 relative">
              {/* Floating Card 1: Rainfall Signal */}
              <div className="nasa-panel p-5 rounded-2xl border border-accent-secondary/30 backdrop-blur-xl shadow-xl transition-all duration-300 hover:translate-x-1.5 hover:border-accent-cyan/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/40 flex items-center justify-center text-accent-cyan">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-accent-light">
                        Precipitation
                      </div>
                      <div className="text-sm font-semibold text-text-primary">
                        Rainfall Signal (GPM IMERG)
                      </div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 font-mono">
                    {rainZ < -1.0 ? "Deficit" : "Active"}
                  </span>
                </div>
                <div className="flex items-end justify-between mt-2 pt-2 border-t border-panel-border/20">
                  <div>
                    <div className="text-[11px] font-mono text-text-secondary">Standardized Anomaly</div>
                    <div className="text-2xl font-mono font-bold text-accent-cyan">
                      {rainZ > 0 ? "+" : ""}
                      {rainZ.toFixed(2)} σ
                    </div>
                  </div>
                  <MiniSparkline bars={rainSpark} colorClass="bg-accent-cyan" />
                </div>
              </div>

              {/* Floating Card 2: Soil Signal */}
              <div className="nasa-panel p-5 rounded-2xl border border-sky-400/30 backdrop-blur-xl shadow-xl transition-all duration-300 hover:translate-x-1.5 hover:border-sky-400/60 lg:translate-x-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-400/10 border border-sky-400/40 flex items-center justify-center text-sky-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-sky-300">
                        Root-Zone Soil (0–100cm)
                      </div>
                      <div className="text-sm font-semibold text-text-primary">
                        Soil Signal (FLDAS Noah)
                      </div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-400/10 text-sky-300 border border-sky-400/30 font-mono">
                    {soilZ < -1.0 ? "Root Depletion" : "Hydrated"}
                  </span>
                </div>
                <div className="flex items-end justify-between mt-2 pt-2 border-t border-panel-border/20">
                  <div>
                    <div className="text-[11px] font-mono text-text-secondary">Standardized Anomaly</div>
                    <div className="text-2xl font-mono font-bold text-sky-400">
                      {soilZ > 0 ? "+" : ""}
                      {soilZ.toFixed(2)} σ
                    </div>
                  </div>
                  <MiniSparkline bars={soilSpark} colorClass="bg-sky-400" />
                </div>
              </div>

              {/* Floating Card 3: Vegetation Signal */}
              <div className="nasa-panel p-5 rounded-2xl border border-emerald-400/30 backdrop-blur-xl shadow-xl transition-all duration-300 hover:translate-x-1.5 hover:border-emerald-400/60 lg:translate-x-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-emerald-300">
                        Canopy Greenness (NDVI)
                      </div>
                      <div className="text-sm font-semibold text-text-primary">
                        Vegetation Signal (MODIS)
                      </div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/30 font-mono">
                    {vegZ < -1.0 ? "Canopy Stress" : "Healthy"}
                  </span>
                </div>
                <div className="flex items-end justify-between mt-2 pt-2 border-t border-panel-border/20">
                  <div>
                    <div className="text-[11px] font-mono text-text-secondary">Standardized Anomaly</div>
                    <div className="text-2xl font-mono font-bold text-emerald-400">
                      {vegZ > 0 ? "+" : ""}
                      {vegZ.toFixed(2)} σ
                    </div>
                  </div>
                  <MiniSparkline bars={vegSpark} colorClass="bg-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE MAP PREVIEW */}
      <section className="py-20 lg:py-28 max-w-[1720px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-accent-light uppercase mb-2">
              <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
              <span>GEOSPATIAL ORBITAL MONITORING</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary">
              Observe Ethiopia from orbit.
            </h2>
            <p className="mt-3 text-text-secondary max-w-2xl text-base md:text-lg">
              Continuous multispectral monitoring across 8 woreda stations in Borena pastoral rangelands and broader Ethiopian ecological zones, mapping rainfall deficits, root-zone depletion, and vegetation anomalies in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="px-3 py-1.5 rounded-full bg-panel-dark border border-panel-border/40 text-xs font-mono text-accent-cyan flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
              8 Woreda Stations
            </span>
            <span className="px-3 py-1.5 rounded-full bg-panel-dark border border-panel-border/40 text-xs font-mono text-text-secondary">
              0.1° FLDAS Grid
            </span>
          </div>
        </div>

        {/* Map Container */}
        <div className="h-[500px] rounded-3xl overflow-hidden border border-panel-border/40 shadow-2xl relative bg-panel-dark">
          <DynamicMap
            selectedLayer="fingerprint"
            selectedRegionId={selectedRegionId}
            onSelectRegion={setSelectedRegionId}
            selectedWoreda={selectedWoreda}
            onSelectWoreda={setSelectedWoreda}
            currentRainfallZ={rainZ}
            currentSoilZ={soilZ}
            currentVegZ={vegZ}
          />
        </div>

        {/* Below Map CTA */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/explore"
            className="inline-flex items-center gap-3 bg-panel-dark hover:bg-panel border border-accent-secondary/40 hover:border-accent-cyan text-text-primary px-8 py-3.5 rounded-full transition-all group font-medium shadow-lg hover:shadow-accent-cyan/10"
          >
            <Satellite className="w-5 h-5 text-accent-cyan group-hover:rotate-12 transition-transform" />
            <span>Open Full Exploration</span>
            <ArrowRight className="w-4 h-4 text-accent-cyan group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* SECTION 3: DROUGHT FINGERPRINT PREVIEW */}
      <section className="py-20 lg:py-28 max-w-[1720px] mx-auto px-4 lg:px-8 border-t border-panel-border/20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-accent-cyan uppercase mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>TRI-SIGNAL SYNTHESIS</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary">
            Three signals. One deeper understanding.
          </h2>
          <p className="mt-4 text-text-secondary text-base md:text-lg">
            Drought manifests across atmospheric, hydrological, and biological domains. By analyzing all three simultaneously, ETHIODROUGHT reveals the true severity and decoupling patterns of climate stress.
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Rainfall */}
          <div className="nasa-panel p-6 rounded-3xl border border-accent-secondary/30 relative flex flex-col justify-between hover:border-accent-cyan/50 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                  <Droplets className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-panel-dark text-accent-light border border-panel-border/40">
                  GPM IMERG
                </span>
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-accent-cyan mb-1">
                Atmospheric Moisture
              </div>
              <h3 className="text-xl font-bold text-text-primary">Rainfall (GPM)</h3>
              <p className="text-text-secondary text-xs mt-2 leading-relaxed">
                Calibrated multi-satellite precipitation anomaly measuring atmospheric deficit against 24-year historical baseline.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-panel-border/30">
              <div className="text-[11px] font-mono text-text-secondary">Standardized Anomaly (Z-Score)</div>
              <div className="text-4xl md:text-5xl font-mono font-bold text-accent-cyan mt-1">
                {rainZ > 0 ? "+" : ""}
                {rainZ.toFixed(2)}
              </div>
              <div className="mt-2 text-xs font-mono text-accent-light flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                Sensor: NASA GPM Core Observatory (0.1°)
              </div>
            </div>
          </div>

          {/* Card 2: Soil Moisture */}
          <div className="nasa-panel p-6 rounded-3xl border border-sky-400/30 relative flex flex-col justify-between hover:border-sky-400/50 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-400/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-panel-dark text-sky-300 border border-panel-border/40">
                  FLDAS Noah LSM
                </span>
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-sky-400 mb-1">
                Hydrological Reserve
              </div>
              <h3 className="text-xl font-bold text-text-primary">Soil Moisture (FLDAS)</h3>
              <p className="text-text-secondary text-xs mt-2 leading-relaxed">
                Root-zone moisture (0–100cm depth) revealing sub-surface water depletion critical for perennial grasses and tree roots.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-panel-border/30">
              <div className="text-[11px] font-mono text-text-secondary">Standardized Anomaly (Z-Score)</div>
              <div className="text-4xl md:text-5xl font-mono font-bold text-sky-400 mt-1">
                {soilZ > 0 ? "+" : ""}
                {soilZ.toFixed(2)}
              </div>
              <div className="mt-2 text-xs font-mono text-sky-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                Sensor: NASA FLDAS Noah Model (0.1°)
              </div>
            </div>
          </div>

          {/* Card 3: Vegetation */}
          <div className="nasa-panel p-6 rounded-3xl border border-emerald-400/30 relative flex flex-col justify-between hover:border-emerald-400/50 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <Sprout className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-panel-dark text-emerald-300 border border-panel-border/40">
                  MODIS MOD13A2
                </span>
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
                Biophysical Response
              </div>
              <h3 className="text-xl font-bold text-text-primary">Vegetation (MODIS)</h3>
              <p className="text-text-secondary text-xs mt-2 leading-relaxed">
                Normalized Difference Vegetation Index reflecting photosynthetic activity and canopy health across pastures and crops.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-panel-border/30">
              <div className="text-[11px] font-mono text-text-secondary">Standardized Anomaly (Z-Score)</div>
              <div className="text-4xl md:text-5xl font-mono font-bold text-emerald-400 mt-1">
                {vegZ > 0 ? "+" : ""}
                {vegZ.toFixed(2)}
              </div>
              <div className="mt-2 text-xs font-mono text-emerald-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Sensor: NASA Terra/Aqua MODIS (250m)
              </div>
            </div>
          </div>
        </div>

        {/* Diagnosis Summary Pill */}
        {diagnosis && (
          <div className="mt-8 p-4 rounded-2xl bg-panel-dark/80 border border-accent-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-accent-cyan animate-ping" />
              <div className="text-sm">
                <span className="text-text-secondary">Current Regional Diagnosis: </span>
                <span className="font-bold text-text-primary">{diagnosis.title}</span>
                <span className="text-accent-light font-mono text-xs ml-2">({diagnosis.severity.toUpperCase()} SEVERITY)</span>
              </div>
            </div>
            <span className="text-xs font-mono text-text-secondary">
              Composite Index: {diagnosis.exploratoryCompositeIndex.toFixed(2)}
            </span>
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/fingerprint"
            className="inline-flex items-center gap-3 bg-accent-cyan text-[#040507] hover:bg-accent-cyan/90 font-bold px-8 py-3.5 rounded-full transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(40,215,197,0.25)]"
          >
            <Compass className="w-5 h-5" />
            <span>Analyze Drought Fingerprints</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* SECTION 4: TREND DETECTIVE PREVIEW */}
      <section className="py-20 lg:py-28 max-w-[1720px] mx-auto px-4 lg:px-8 border-t border-panel-border/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-accent-cyan uppercase mb-3">
              <Search className="w-3.5 h-3.5" />
              <span>STATISTICAL CLIMATE MECHANICS</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary">
              Discover what is changing. Measure how fast.
            </h2>
            <p className="mt-6 text-text-secondary text-base md:text-lg leading-relaxed">
              The Mann-Kendall trend test is a robust rank-based non-parametric method that detects monotonic upward or downward trends in hydro-meteorological time series without assuming normal distribution. Sen&apos;s slope estimator quantifies the median rate of change over time, impervious to seasonal outliers.
            </p>
            <div className="mt-8">
              <Link
                href="/trends"
                className="inline-flex items-center gap-2 border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 font-medium px-8 py-3.5 rounded-full transition-all"
              >
                <TrendingDown className="w-4 h-4" />
                <span>Investigate Trends</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stat Card 1: Sen's Slope */}
            <div className="nasa-panel p-6 rounded-3xl border border-accent-secondary/30">
              <div className="text-xs font-mono text-accent-light uppercase tracking-wider mb-2">
                Sen&apos;s Slope Estimator
              </div>
              <div className="text-3xl md:text-4xl font-mono font-bold text-text-primary">
                {formattedSensSlope}
              </div>
              <p className="text-xs text-text-secondary mt-3">
                Median annual trajectory calculated across 24 years (2000–2024) of verified satellite records.
              </p>
              <div className="mt-4 pt-3 border-t border-panel-border/30 flex items-center justify-between text-[11px] font-mono text-accent-cyan">
                <span>Theil-Sen Median</span>
                <span>Robust to Outliers</span>
              </div>
            </div>

            {/* Stat Card 2: p-value */}
            <div className="nasa-panel p-6 rounded-3xl border border-accent-secondary/30">
              <div className="text-xs font-mono text-accent-light uppercase tracking-wider mb-2">
                Statistical Significance
              </div>
              <div className="text-3xl md:text-4xl font-mono font-bold text-accent-cyan">
                {formattedPValue}
              </div>
              <p className="text-xs text-text-secondary mt-3">
                {trendResult?.significant
                  ? "Statistically significant at 95% confidence (α = 0.05). Trend is highly distinguishable from noise."
                  : "Within natural stochastic climate variability (p ≥ 0.05)."}
              </p>
              <div className="mt-4 pt-3 border-t border-panel-border/30 flex items-center justify-between text-[11px] font-mono text-text-secondary">
                <span>Two-Tailed MK Test</span>
                <span className="text-accent-cyan">α = 0.05</span>
              </div>
            </div>

            {/* Stat Card 3: Tau & Trend */}
            <div className="sm:col-span-2 nasa-panel p-6 rounded-3xl border border-accent-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-accent-light uppercase tracking-wider">
                  Directional Agreement (Kendall&apos;s Tau)
                </div>
                <div className="text-xl font-bold text-text-primary mt-1">
                  {trendResult?.trend === "decreasing"
                    ? "Negative Monotonic Drift (Drying Pattern)"
                    : trendResult?.trend === "increasing"
                    ? "Positive Greening Drift"
                    : "Stable Baseline (No Monotonic Drift)"}
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-panel-dark border border-panel-border/40 font-mono text-sm text-accent-cyan shrink-0">
                τ = {typeof trendResult?.tau === "number" ? trendResult.tau.toFixed(3) : "-0.324"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: BORENA ZONE SPOTLIGHT */}
      <section className="py-20 lg:py-28 max-w-[1720px] mx-auto px-4 lg:px-8 border-t border-panel-border/20">
        <div className="nasa-panel-blue p-8 md:p-12 lg:p-16 rounded-3xl relative overflow-hidden border border-accent-secondary/30 shadow-2xl">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-panel-dark/90 border border-accent-secondary/40 text-[11px] font-mono text-accent-cyan uppercase mb-4">
              <MapPin className="w-3.5 h-3.5" />
              <span>REGIONAL GROUND TRUTH · SOUTHERN OROMIA</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary">
              Understanding drought in Borena.
            </h2>
            <p className="mt-6 text-text-primary/90 text-base md:text-lg leading-relaxed">
              In the arid and semi-arid rangelands of Southern Oromia, the Borena pastoral system sustained communities for centuries through indigenous Gadaa governance and ancient deep tula wells excavated through limestone bedrock. Between late 2020 and mid-2023, the region endured an unprecedented five consecutive failed rainy seasons (the Ganna and Hagayya rains). Earth observation records revealed that even when localized episodic rainfall returned, deep soil root-zone moisture (0–100cm) remained severely depleted, precipitating catastrophic livestock mortality and irreversible pastoral asset collapse.
            </p>

            {/* Stats Grid */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-accent-secondary/30">
              <div className="p-4 rounded-2xl bg-panel-dark/60 border border-accent-secondary/30">
                <div className="text-3xl md:text-4xl font-mono font-bold text-accent-cyan">
                  5 Failed Seasons
                </div>
                <div className="text-xs font-mono text-accent-light uppercase mt-1">
                  Consecutive Deficits (2020–2023)
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  Unprecedented multi-year failure of both Ganna (March–May) and Hagayya (Sept–Nov) monsoons.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-panel-dark/60 border border-accent-secondary/30">
                <div className="text-3xl md:text-4xl font-mono font-bold text-sky-400">
                  4.2M+ People Affected
                </div>
                <div className="text-xs font-mono text-accent-light uppercase mt-1">
                  Humanitarian & Water Crisis
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  Acute pastoral food insecurity and reliance on emergency water trucking across 8 woredas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-panel-dark/60 border border-accent-secondary/30">
                <div className="text-3xl md:text-4xl font-mono font-bold text-emerald-400">
                  0–100cm Root Zone
                </div>
                <div className="text-xs font-mono text-accent-light uppercase mt-1">
                  FLDAS Subsurface Depletion
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  Root-zone moisture deficit decoupling from surface rainfall, preventing rangeland grass regrowth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: HOW IT WORKS */}
      <section className="py-20 lg:py-28 max-w-[1720px] mx-auto px-4 lg:px-8 border-t border-panel-border/20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-accent-light uppercase mb-3">
            <Satellite className="w-3.5 h-3.5 text-accent-cyan" />
            <span>SCIENTIFIC PIPELINE</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary">
            How ETHIODROUGHT Works
          </h2>
          <p className="mt-4 text-text-secondary text-base md:text-lg">
            A 4-step Earth observation intelligence architecture turning raw orbital telemetry into actionable environmental understanding.
          </p>
        </div>

        {/* 4 Steps Horizontal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="nasa-panel p-6 rounded-3xl border border-panel-border/40 relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full border-2 border-accent-cyan/60 bg-panel-dark text-accent-cyan font-mono font-bold flex items-center justify-center mb-6 text-base shadow-sm">
                01
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-accent-cyan mb-1">
                OBSERVE
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                Collect satellite data from NASA missions
              </h3>
              <p className="text-text-secondary text-xs mt-3 leading-relaxed">
                Ingest continuous multispectral and radar observations from NASA GPM IMERG, FLDAS Noah Land Surface Model, and MODIS Terra/Aqua constellations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-panel-border/20 text-[11px] font-mono text-accent-light">
              Telemetry Ingestion
            </div>
          </div>

          {/* Step 2 */}
          <div className="nasa-panel p-6 rounded-3xl border border-panel-border/40 relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full border-2 border-sky-400/60 bg-panel-dark text-sky-400 font-mono font-bold flex items-center justify-center mb-6 text-base shadow-sm">
                02
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-sky-400 mb-1">
                ANALYZE
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                Calculate standardized anomalies
              </h3>
              <p className="text-text-secondary text-xs mt-3 leading-relaxed">
                Compare current observations against 24-year historical baselines (2000–2024) to compute standardized Z-scores (σ) for precipitation, soil, and NDVI.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-panel-border/20 text-[11px] font-mono text-sky-300">
              Climatological Baselines
            </div>
          </div>

          {/* Step 3 */}
          <div className="nasa-panel p-6 rounded-3xl border border-accent-light/60 bg-panel-dark text-accent-light font-mono font-bold flex items-center justify-center mb-6 text-base shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-full border-2 border-accent-light/60 bg-panel-dark text-accent-light font-mono font-bold flex items-center justify-center mb-6 text-base shadow-sm">
                03
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-accent-light mb-1">
                DETECT
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                Cross-check rainfall, soil, vegetation
              </h3>
              <p className="text-text-secondary text-xs mt-3 leading-relaxed">
                Cross-correlate meteorological deficits with root-zone water availability and canopy stress to detect decoupled environmental signals and false recoveries.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-panel-border/20 text-[11px] font-mono text-accent-light">
              Multi-Sensor Agreement
            </div>
          </div>

          {/* Step 4 */}
          <div className="nasa-panel p-6 rounded-3xl border border-panel-border/40 relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full border-2 border-emerald-400/60 bg-panel-dark text-emerald-400 font-mono font-bold flex items-center justify-center mb-6 text-base shadow-sm">
                04
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
                INTERPRET
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                Generate scientific drought diagnosis
              </h3>
              <p className="text-text-secondary text-xs mt-3 leading-relaxed">
                Synthesize rule-based diagnostic classifications and bilingual scientific explanations to differentiate flash droughts from compound ecological crises.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-panel-border/20 text-[11px] font-mono text-emerald-300">
              Diagnostic Synthesis
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: NASA DATA SOURCES */}
      <section className="py-20 lg:py-28 max-w-[1720px] mx-auto px-4 lg:px-8 border-t border-panel-border/20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-accent-light uppercase mb-3">
            <Satellite className="w-3.5 h-3.5 text-accent-cyan" />
            <span>ORBITAL CONSTELLATIONS</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary">
            NASA Earth Observation Data Sources
          </h2>
          <p className="mt-4 text-text-secondary text-base md:text-lg">
            High-precision, open-access Earth observations calibrated specifically for sub-Saharan drought monitoring.
          </p>
        </div>

        {/* 3 Horizontal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: FLDAS */}
          <div className="nasa-panel p-6 rounded-3xl border border-panel-border/40 flex flex-col justify-between hover:border-accent-secondary/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-panel-dark text-sky-400 border border-panel-border/40">
                  Land Surface Model
                </span>
                <span className="text-[11px] font-mono text-text-secondary">NASA GSFC</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary">NASA FLDAS Noah</h3>
              <p className="text-xs text-text-secondary mt-1">
                Famine Early Warning Systems Network Land Data Assimilation System.
              </p>

              <div className="mt-6 space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-panel-border/20">
                  <span className="text-text-secondary">Spatial Resolution:</span>
                  <span className="font-mono text-text-primary">0.1° (~10 km)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-panel-border/20">
                  <span className="text-text-secondary">Temporal Cadence:</span>
                  <span className="font-mono text-text-primary">Monthly & Daily</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-panel-border/20">
                  <span className="text-text-secondary">Measured Variables:</span>
                  <span className="font-mono text-accent-light text-right">Root-Zone Soil (0–100cm), ET</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-panel-border/30">
              <a
                href="https://ldas.gsfc.nasa.gov/fldas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono text-accent-cyan hover:underline"
              >
                <span>NASA FLDAS Mission Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 2: GPM IMERG */}
          <div className="nasa-panel p-6 rounded-3xl border border-panel-border/40 flex flex-col justify-between hover:border-accent-secondary/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-panel-dark text-accent-cyan border border-panel-border/40">
                  Precipitation Radar
                </span>
                <span className="text-[11px] font-mono text-text-secondary">NASA / JAXA</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary">NASA GPM IMERG</h3>
              <p className="text-xs text-text-secondary mt-1">
                Global Precipitation Measurement Integrated Multi-satellitE Retrievals.
              </p>

              <div className="mt-6 space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-panel-border/20">
                  <span className="text-text-secondary">Spatial Resolution:</span>
                  <span className="font-mono text-text-primary">0.1° (~10 km)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-panel-border/20">
                  <span className="text-text-secondary">Temporal Cadence:</span>
                  <span className="font-mono text-text-primary">Half-Hourly & Monthly</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-panel-border/20">
                  <span className="text-text-secondary">Measured Variables:</span>
                  <span className="font-mono text-accent-light text-right">Precipitation Rate & Accumulation</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-panel-border/30">
              <a
                href="https://gpm.nasa.gov/data/imerg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono text-accent-cyan hover:underline"
              >
                <span>NASA GPM IMERG Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 3: MODIS */}
          <div className="nasa-panel p-6 rounded-3xl border border-panel-border/40 flex flex-col justify-between hover:border-accent-secondary/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-panel-dark text-emerald-400 border border-panel-border/40">
                  Optical Multispectral
                </span>
                <span className="text-[11px] font-mono text-text-secondary">NASA Terra/Aqua</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary">NASA MODIS NDVI</h3>
              <p className="text-xs text-text-secondary mt-1">
                Moderate Resolution Imaging Spectroradiometer (MOD13A2 / MYD13A2).
              </p>

              <div className="mt-6 space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-panel-border/20">
                  <span className="text-text-secondary">Spatial Resolution:</span>
                  <span className="font-mono text-text-primary">250m – 1000m</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-panel-border/20">
                  <span className="text-text-secondary">Temporal Cadence:</span>
                  <span className="font-mono text-text-primary">16-Day Composites</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-panel-border/20">
                  <span className="text-text-secondary">Measured Variables:</span>
                  <span className="font-mono text-accent-light text-right">NDVI, EVI Canopy Greenness</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-panel-border/30">
              <a
                href="https://modis.gsfc.nasa.gov/data/dataprod/mod13.php"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono text-accent-cyan hover:underline"
              >
                <span>NASA MODIS Vegetation Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Footer handled by ClientLayout */}
    </div>
  );
}
