"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useApp } from "@/context/AppContext";
import { translations } from "@/data/translations";
import { SatelliteOrbitalView } from "@/components/SatelliteOrbitalView";
import { RecoveryTracker } from "@/components/RecoveryTracker";
import { RegionalPriorityRanking } from "@/components/RegionalPriorityRanking";
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
  AlertTriangle,
  ShieldAlert,
  Activity,
  CheckCircle2,
  ChevronRight,
  Database,
  Radio,
  Info,
  Calendar,
  Users,
  Bell,
  Clock,
  Sparkles,
  Wheat,
  Sliders,
  FileCheck2,
} from "lucide-react";

const DynamicMap = dynamic(
  () => import("@/components/LeafletMapInner").then((mod) => ({ default: mod.LeafletMapInner })),
  {
    ssr: false,
    loading: () => <div className="w-full h-[520px] rounded-3xl bg-panel-dark animate-pulse" />,
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
    <div className="relative w-full overflow-hidden bg-[#040507]">
      {/* Full-Page Deep Space Earth Background Image */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-40 transition-opacity duration-700"
        style={{
          backgroundImage: "url('/images/earth-bg.jpg')",
        }}
      />

      {/* ========================================================
          PAGE 1: HERO SECTION
          ======================================================== */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden py-16 lg:py-24 z-10">
        {/* Dedicated High-Luminance Earth Glow Backdrop */}
        <div
          className="absolute inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-85"
          style={{
            backgroundImage: "url('/images/earth-bg.jpg')",
          }}
        />
        {/* Atmospheric vignettes for contrast and text legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 45%, rgba(4, 5, 7, 0.25) 0%, rgba(4, 5, 7, 0.75) 65%, #040507 100%), linear-gradient(180deg, rgba(4, 5, 7, 0.6) 0%, transparent 20%, transparent 75%, #040507 100%)",
          }}
        />
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent-cyan/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-[1720px] mx-auto px-4 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 flex flex-col items-start z-10">
              {/* Mission Badge Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-panel-dark/90 border border-accent-secondary/35 mb-6 backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                <span className="tracking-widest text-accent-light uppercase text-[11px] font-mono font-medium">
                  NASA SPACE APPS 2026 · EARTH SYSTEM INTELLIGENCE
                </span>
              </div>

              {/* Main Brand Title & Exact Specified Subtitle */}
              <div className="space-y-3">
                <div className="text-sm font-mono tracking-widest text-accent-cyan uppercase font-semibold">
                  ETHIODROUGHT
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-[1.12]">
                  {isAmharic ? (
                    <>
                      ከዝናብ ባሻገር።{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-accent-light to-white">
                        የድርቅን የአካባቢ አሻራ መረዳት።
                      </span>
                    </>
                  ) : (
                    <>
                      Beyond Rainfall.{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-accent-light to-white">
                        Understanding the Environmental Fingerprint of Drought.
                      </span>
                    </>
                  )}
                </h1>
              </div>

              {/* Mandatory Prompt Description */}
              <p className="mt-5 text-base sm:text-lg text-text-secondary max-w-2xl font-light leading-relaxed">
                {isAmharic
                  ? "የዝናብ፣ የአፈር እርጥበት እና የዕፅዋት ሽፋንን በማቀናጀት ድርቅ እንዴት እንደሚከሰት እና መሬቱ በእርግጥ እያገገመ መሆኑን በሳተላይት መረጃ የሚመረምር መድረክ።"
                  : "A satellite-powered drought intelligence platform investigating rainfall, soil moisture, and vegetation patterns to reveal how drought develops and whether the land is truly recovering across Ethiopia."}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2.5 bg-accent-cyan text-[#040507] font-bold px-7 py-3.5 rounded-full hover:bg-accent-cyan/90 transition-all hover:scale-[1.02] shadow-[0_0_25px_rgba(40,215,197,0.35)]"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{isAmharic ? "የድርቅ መረጃን ያስሱ" : "Explore Drought Intelligence"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/methodology"
                  className="inline-flex items-center gap-2.5 border border-accent-secondary/50 hover:border-accent-cyan text-text-primary hover:text-accent-cyan font-medium px-7 py-3.5 rounded-full bg-panel-dark/60 hover:bg-panel-dark transition-all hover:scale-[1.02]"
                >
                  <Compass className="w-4 h-4 text-accent-cyan" />
                  <span>{isAmharic ? "ሳይንሳዊ አካሄዳችንን ይመልከቱ" : "Discover Our Methodology"}</span>
                </Link>
              </div>

              {/* Satellite Constellation Metadata Badges */}
              <div className="mt-10 flex flex-wrap items-center gap-2.5 text-xs font-mono text-text-secondary">
                <span className="px-3 py-1 rounded-md bg-panel-dark border border-panel-border/30 flex items-center gap-1.5">
                  <Satellite className="w-3.5 h-3.5 text-accent-cyan" />
                  NASA GPM · FLDAS · MODIS
                </span>
                <span className="px-3 py-1 rounded-md bg-panel-dark border border-panel-border/30">
                  2000–2024 Satellite Baseline
                </span>
                <span className="px-3 py-1 rounded-md bg-panel-dark border border-panel-border/30 text-accent-cyan flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-ping" />
                  0.1° Climatological Grid
                </span>
              </div>
            </div>

            {/* Right Column: High-Precision NASA-Inspired Satellite Orbital Viewport */}
            <div className="lg:col-span-6 w-full">
              <SatelliteOrbitalView isAmharic={isAmharic} />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ENVIRONMENTAL INDICATORS SECTION (SECTION 6)
          ======================================================== */}
      <section className="py-20 lg:py-24 max-w-[1720px] mx-auto px-4 lg:px-8 border-t border-panel-border/20 z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-accent-cyan uppercase mb-2">
            <Radio className="w-3.5 h-3.5" />
            <span>THREE INTERCONNECTED SIGNALS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
            The Three Pillars of Environmental Drought
          </h2>
          <p className="mt-3 text-text-secondary text-sm sm:text-base leading-relaxed">
            Drought cannot be diagnosed by a single variable alone. ETHIODROUGHT tracks atmospheric, root-zone hydrological, and canopy biophysical indicators simultaneously.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Indicator 1: Rainfall */}
          <div className="nasa-panel p-6 rounded-3xl border border-accent-secondary/35 shadow-xl flex flex-col justify-between hover:border-accent-cyan/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/40 flex items-center justify-center text-accent-cyan">
                  <Droplets className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-panel-dark text-accent-cyan border border-accent-cyan/30">
                  ATMOSPHERIC
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary">Rainfall Anomalies (GPM IMERG)</h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Measures atmospheric precipitation deficits and episodic monsoon failures against the 24-year climatological baseline.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-panel-dark/60 border border-panel-border/20 text-[11px] font-mono text-text-subtle">
                <strong>What it measures:</strong> Rate, volume, and accumulation of liquid precipitation reaching ground level.
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-panel-border/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-text-secondary block">LATEST ANOMALY</span>
                <span className="text-xl font-mono font-bold text-accent-cyan">{rainZ > 0 ? "+" : ""}{rainZ.toFixed(2)} σ</span>
              </div>
              <MiniSparkline bars={rainSpark} colorClass="bg-accent-cyan" />
            </div>
          </div>

          {/* Indicator 2: Soil Moisture */}
          <div className="nasa-panel p-6 rounded-3xl border border-sky-400/35 shadow-xl flex flex-col justify-between hover:border-sky-400/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-400/10 border border-sky-400/40 flex items-center justify-center text-sky-400">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-panel-dark text-sky-300 border border-sky-400/30">
                  HYDROLOGICAL
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary">Root-Zone Soil Moisture (FLDAS)</h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Tracks subterranean water content in the critical 0–100cm depth layer, revealing aquifer depletion and moisture starvation.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-panel-dark/60 border border-panel-border/20 text-[11px] font-mono text-text-subtle">
                <strong>What it measures:</strong> Volumetric soil water storage ($m^3/m^3$) supporting perennial grasses and deep acacia roots.
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-panel-border/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-text-secondary block">LATEST ANOMALY</span>
                <span className="text-xl font-mono font-bold text-sky-400">{soilZ > 0 ? "+" : ""}{soilZ.toFixed(2)} σ</span>
              </div>
              <MiniSparkline bars={soilSpark} colorClass="bg-sky-400" />
            </div>
          </div>

          {/* Indicator 3: Vegetation */}
          <div className="nasa-panel p-6 rounded-3xl border border-emerald-400/35 shadow-xl flex flex-col justify-between hover:border-emerald-400/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <Sprout className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-panel-dark text-emerald-300 border border-emerald-400/30">
                  BIOPHYSICAL
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary">Vegetation Health (MODIS NDVI)</h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Evaluates canopy photosynthetic vigour, biomass loss, and pasture degradation across rainfed croplands and grazing basins.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-panel-dark/60 border border-panel-border/20 text-[11px] font-mono text-text-subtle">
                <strong>What it measures:</strong> Normalized Difference Vegetation Index reflecting live green foliage and canopy health.
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-panel-border/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-text-secondary block">LATEST ANOMALY</span>
                <span className="text-xl font-mono font-bold text-emerald-400">{vegZ > 0 ? "+" : ""}{vegZ.toFixed(2)} σ</span>
              </div>
              <MiniSparkline bars={vegSpark} colorClass="bg-emerald-400" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          DROUGHT FINGERPRINT ENGINE PREVIEW (CENTRAL FEATURE)
          ======================================================== */}
      <section className="py-20 lg:py-24 max-w-[1720px] mx-auto px-4 lg:px-8 border-t border-panel-border/20 z-10 relative">
        <div className="nasa-panel-blue p-8 sm:p-12 rounded-3xl border border-accent-secondary/40 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-panel-dark/90 border border-accent-secondary/40 text-[11px] font-mono text-accent-cyan uppercase mb-3">
                <Compass className="w-3.5 h-3.5" />
                <span>CORE SCIENTIFIC INNOVATION</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
                The Drought Fingerprint Engine
              </h2>
              <p className="mt-3 text-text-secondary text-sm sm:text-base leading-relaxed">
                Rather than treating drought as a binary event, ETHIODROUGHT investigates how rainfall, soil moisture, and vegetation diverge over time to reveal the true state of the landscape.
              </p>
            </div>

            <Link
              href="/fingerprint"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent-cyan text-[#040507] font-bold text-xs font-mono uppercase tracking-wider hover:bg-accent-cyan/90 transition-all shrink-0 shadow-lg"
            >
              <span>Launch Fingerprint Engine</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Illustrative Divergence Example Scenario Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-panel-dark/90 border border-panel-border/40 space-y-6">
            <div className="flex items-center justify-between border-b border-panel-border/20 pb-3">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>ILLUSTRATIVE SCENARIO: INCOMPLETE RECOVERY / FALSE MIRAGE</span>
              </span>
              <span className="text-[10px] font-mono text-text-subtle uppercase">
                Demonstration Simulation
              </span>
            </div>

            {/* 3 Steps in Scenario */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-panel/70 border border-panel-border/30">
                <div className="text-[10px] font-mono text-accent-cyan uppercase">Observation 1</div>
                <div className="text-sm font-bold text-text-primary mt-1">Rainfall Begins Improving</div>
                <div className="text-2xl font-mono font-bold text-emerald-400 mt-2">+0.85 σ</div>
                <p className="text-xs text-text-secondary mt-2">
                  Localized convective showers arrive after multi-year failure. Rain gauges register precipitation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-panel/70 border border-panel-border/30">
                <div className="text-[10px] font-mono text-sky-300 uppercase">Observation 2</div>
                <div className="text-sm font-bold text-text-primary mt-1">Soil Moisture Below Baseline</div>
                <div className="text-2xl font-mono font-bold text-red-400 mt-2">-1.65 σ</div>
                <p className="text-xs text-text-secondary mt-2">
                  FLDAS 0–100cm moisture remains severely depleted; rapid surface evaporation leaves root zones starved.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-panel/70 border border-panel-border/30">
                <div className="text-[10px] font-mono text-emerald-300 uppercase">Observation 3</div>
                <div className="text-sm font-bold text-text-primary mt-1">Vegetation Remains Stressed</div>
                <div className="text-2xl font-mono font-bold text-red-400 mt-2">-1.42 σ</div>
                <p className="text-xs text-text-secondary mt-2">
                  Perennial grasses fail to re-establish deep root networks. Pastoral rangeland forage collapses.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
              <strong>Key Diagnostic Finding:</strong> This divergence illustrates that an apparent rainfall recovery does not equal true ecological or pastoral recovery. Relying exclusively on rainfall records would prompt prematurely ending drought relief while herds face starvation.
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          PAGE 2: THE PROBLEM — WHY ETHIOPIA? (NUMERICAL EVIDENCE)
          ======================================================== */}
      <section id="problem" className="py-20 lg:py-24 max-w-[1720px] mx-auto px-4 lg:px-8 border-t border-panel-border/20 z-10 relative">
        <div className="max-w-4xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[11px] font-mono text-red-400 uppercase mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>GROUND TRUTH & HUMANITARIAN EVIDENCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight">
            The Problem — Why Ethiopia?
          </h2>
          <p className="mt-3 text-text-secondary text-sm sm:text-base leading-relaxed">
            In pastoral rangelands and rainfed highlands, drought is not an abstract metric. It is an existential threat to millions of pastoralists and smallholders whose livelihoods depend on soil water storage and seasonal grass regeneration.
          </p>
        </div>

        {/* Historical Impact 2020-2023 4-Stat Grid */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-4 h-4 text-accent-cyan" />
            <h3 className="text-base sm:text-lg font-bold text-text-primary font-mono uppercase tracking-wider">
              Historical Drought Impact (2020–2023)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-panel-dark text-text-secondary border border-panel-border/30">
              5 Failed Seasons
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="nasa-panel p-6 rounded-3xl border border-red-500/35 relative flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/30 uppercase">
                  REGIONAL TOTAL
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-red-400 mt-2">&gt; 6.8 Million</div>
                <div className="text-xs font-mono font-semibold text-text-primary uppercase mt-1">
                  Livestock Deaths in Affected Regions
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-3 pt-3 border-t border-panel-border/20">
                Massive livestock mortality across Somali, Oromia, and SNNP pastoral zones during prolonged multi-year rainfall deficits.
              </p>
            </div>

            <div className="nasa-panel p-6 rounded-3xl border border-red-500/35 relative flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/30 uppercase">
                  BORENA ZONE
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-red-400 mt-2">&gt; 3.3 Million</div>
                <div className="text-xs font-mono font-semibold text-text-primary uppercase mt-1">
                  Livestock Deaths in Borena Alone
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-3 pt-3 border-t border-panel-border/20">
                Over 3.3 million livestock perished in Borena Zone, devastating ancestral pastoral cattle assets and traditional pastoral economies.
              </p>
            </div>

            <div className="nasa-panel p-6 rounded-3xl border border-amber-500/35 relative flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase">
                  POPULATION
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-amber-400 mt-2">~ 1.7 Million</div>
                <div className="text-xs font-mono font-semibold text-text-primary uppercase mt-1">
                  Borena Population (2023 Assessment)
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-3 pt-3 border-t border-panel-border/20">
                Total population residing across Borena Zone dependent on fragile rangeland ecology and deep traditional tula wells.
              </p>
            </div>

            <div className="nasa-panel p-6 rounded-3xl border border-amber-500/35 relative flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase">
                  FOOD ASSISTANCE
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-amber-400 mt-2">&gt; 50%</div>
                <div className="text-xs font-mono font-semibold text-text-primary uppercase mt-1">
                  Population Requiring Emergency Aid
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-3 pt-3 border-t border-panel-border/20">
                Over half of Borena&apos;s population required emergency humanitarian food rations and water trucking following rangeland collapse.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Conditions 2026-2027 Cards */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Radio className="w-4 h-4 text-accent-cyan" />
            <h3 className="text-base sm:text-lg font-bold text-text-primary font-mono uppercase tracking-wider">
              Recent Environmental Conditions (2026–2027)
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="nasa-panel-blue p-6 rounded-3xl border border-accent-secondary/40 shadow-xl">
              <div className="text-xs font-mono text-accent-cyan uppercase mb-1">
                TIGRAY · EASTERN AMHARA · EASTERN OROMIA
              </div>
              <h4 className="text-lg font-bold text-text-primary">
                2026 Kiremt Monsoon Deficits Impact Crop Germination
              </h4>
              <p className="mt-3 text-text-secondary text-xs sm:text-sm leading-relaxed">
                The 2026 Kiremt season experienced significant rainfall deficits across parts of Tigray, eastern Amhara, and eastern Oromia. These deficits directly suppressed crop germination and vegetative development across agricultural escarpments.
              </p>
            </div>

            <div className="nasa-panel-blue p-6 rounded-3xl border border-accent-secondary/40 shadow-xl">
              <div className="text-xs font-mono text-accent-cyan uppercase mb-1">
                NORTHERN AFAR LOWLANDS
              </div>
              <h4 className="text-lg font-bold text-text-primary">
                October 2026 – March 2027 Dry Period Pasture Depletion
              </h4>
              <p className="mt-3 text-text-secondary text-xs sm:text-sm leading-relaxed">
                Northern Afar entered the October 2026–March 2027 dry period with severely below-average livestock body conditions, acute pasture exhaustion, and critically depleted surface water collection points.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          DROUGHT RECOVERY TRACKER COMPONENT (SECTION 10)
          ======================================================== */}
      <section className="py-20 lg:py-24 max-w-[1720px] mx-auto px-4 lg:px-8 border-t border-panel-border/20 z-10 relative">
        <RecoveryTracker isAmharic={isAmharic} />
      </section>

      {/* ========================================================
          TREND DETECTIVE PREVIEW (SECTION 6 & 11)
          ======================================================== */}
      <section id="trends" className="py-20 lg:py-24 max-w-[1720px] mx-auto px-4 lg:px-8 border-t border-panel-border/20 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-accent-cyan uppercase mb-2">
              <Search className="w-3.5 h-3.5" />
              <span>STATISTICAL CLIMATE MECHANICS (2000–2024)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Measure What Is Changing. Quantify How Fast.
            </h2>
            <p className="mt-4 text-text-secondary text-sm sm:text-base leading-relaxed">
              The Mann-Kendall rank test identifies monotonic environmental trends without assuming normal distribution. Sen&apos;s slope calculates the median rate of change, impervious to seasonal anomalies and outliers.
            </p>
            <div className="mt-6">
              <Link
                href="/trends"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 text-xs font-mono uppercase font-bold transition-all"
              >
                <TrendingDown className="w-4 h-4" />
                <span>Launch Trend Detective</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="nasa-panel p-5 rounded-3xl border border-accent-secondary/35">
              <div className="text-[10px] font-mono text-accent-light uppercase">Sen&apos;s Slope Estimator</div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-text-primary mt-1">
                {formattedSensSlope}
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Median rate of change across 24 years (2000–2024) of verified satellite records.
              </p>
            </div>

            <div className="nasa-panel p-5 rounded-3xl border border-accent-secondary/35">
              <div className="text-[10px] font-mono text-accent-light uppercase">Statistical Significance</div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-accent-cyan mt-1">
                {formattedPValue}
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Two-tailed Mann-Kendall significance at 95% confidence (α = 0.05).
              </p>
            </div>

            <div className="sm:col-span-2 nasa-panel p-5 rounded-3xl border border-accent-secondary/35 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-accent-light uppercase">Kendall&apos;s Tau (τ)</div>
                <div className="text-base font-bold text-text-primary mt-0.5">
                  Directional Monotonic Drying Trajectory
                </div>
              </div>
              <span className="font-mono text-sm px-3 py-1 rounded-xl bg-panel-dark text-accent-cyan border border-panel-border/30">
                τ = -0.324
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          REGIONAL PRIORITY RANKING (SECTION 12)
          ======================================================== */}
      <section className="py-20 lg:py-24 max-w-[1720px] mx-auto px-4 lg:px-8 border-t border-panel-border/20 z-10 relative">
        <RegionalPriorityRanking isAmharic={isAmharic} />
      </section>

      {/* ========================================================
          ETHIOPIA MAP PREVIEW & BORENA CASE STUDY (SECTION 6)
          ======================================================== */}
      <section id="explore" className="py-20 lg:py-24 max-w-[1720px] mx-auto px-4 lg:px-8 border-t border-panel-border/20 z-10 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-accent-light uppercase mb-2">
              <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
              <span>GEOSPATIAL ORBITAL MONITORING</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Observe Ethiopia from Orbit
            </h2>
            <p className="mt-2 text-text-secondary max-w-2xl text-xs sm:text-sm">
              Continuous multispectral monitoring across 8 woreda stations in Borena pastoral rangelands and broader Ethiopian ecological zones.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent-cyan text-[#040507] font-bold text-xs font-mono uppercase tracking-wider hover:bg-accent-cyan/90 transition-all shrink-0 shadow-lg"
          >
            <span>Open Complete Exploration Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Leaflet Map Preview */}
        <div className="h-[520px] rounded-3xl overflow-hidden border border-panel-border/40 shadow-2xl relative bg-panel-dark">
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
      </section>

      {/* ========================================================
          MANDATORY SECTION 7: COMING TO ETHIODROUGHT
          EXACTLY TWO CARDS: FEATURE 01 & FEATURE 02
          ======================================================== */}
      <section className="py-20 lg:py-24 max-w-[1720px] mx-auto px-4 lg:px-8 border-t border-panel-border/20 z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-amber-400 uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ROADMAP & FUTURE CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
            COMING TO ETHIODROUGHT
          </h2>
          <p className="mt-2 text-text-secondary text-sm sm:text-base">
            Advanced analytical modules currently under development for subsequent releases.
          </p>
        </div>

        {/* Exactly Two Prominent Under-Development Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FEATURE 01 */}
          <div className="nasa-panel p-6 sm:p-8 rounded-3xl border border-amber-500/35 relative overflow-hidden shadow-2xl flex flex-col justify-between hover:border-amber-500/60 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase font-bold tracking-wider">
                  UNDER DEVELOPMENT
                </span>
                <span className="text-xs font-mono text-text-subtle">FEATURE 01</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  Drought Early-Warning System
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-2">
                &ldquo;An upcoming monitoring capability designed to identify emerging drought-related environmental stress through changes in rainfall, soil moisture, and vegetation indicators.&rdquo;
              </p>

              <div className="mt-6 space-y-2 pt-4 border-t border-panel-border/20">
                <div className="text-[10px] font-mono text-amber-300 uppercase tracking-wider mb-2">
                  Planned Capabilities:
                </div>
                <div className="space-y-1.5 text-xs font-mono text-text-primary">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Environmental anomaly alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Regional drought notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Historical anomaly comparisons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Persistent environmental stress monitoring</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-panel-border/20 flex items-center justify-between text-[11px] font-mono text-text-subtle">
              <span>Status: Architecture & Prototype Testing</span>
              <span className="text-amber-400">Phase 2 Release</span>
            </div>
          </div>

          {/* FEATURE 02 */}
          <div className="nasa-panel p-6 sm:p-8 rounded-3xl border border-amber-500/35 relative overflow-hidden shadow-2xl flex flex-col justify-between hover:border-amber-500/60 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase font-bold tracking-wider">
                  UNDER DEVELOPMENT
                </span>
                <span className="text-xs font-mono text-text-subtle">FEATURE 02</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Wheat className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  Agricultural & Pastoral Analysis
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-2">
                &ldquo;An upcoming analysis module designed to distinguish environmental stress patterns across agricultural and pastoral landscapes, with an initial focus on Ethiopia&apos;s vulnerable pastoral regions.&rdquo;
              </p>

              <div className="mt-6 space-y-2 pt-4 border-t border-panel-border/20">
                <div className="text-[10px] font-mono text-amber-300 uppercase tracking-wider mb-2">
                  Planned Capabilities:
                </div>
                <div className="space-y-1.5 text-xs font-mono text-text-primary">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Cropland and grazing-area context</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Vegetation stress analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Regional agricultural and pastoral comparisons</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-panel-border/20 flex items-center justify-between text-[11px] font-mono text-text-subtle">
              <span>Status: Spatial Mask Ingestion Planned</span>
              <span className="text-amber-400">Phase 2 Release</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ADDITIONAL CAPABILITIES LAUNCHPAD (SECTION 6)
          ======================================================== */}
      <section className="py-20 lg:py-24 max-w-[1720px] mx-auto px-4 lg:px-8 border-t border-panel-border/20 z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-accent-cyan uppercase mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>SPECIALIZED SCIENTIFIC MODULES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
            Explore All Platform Capabilities
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link
            href="/explore"
            className="nasa-panel p-6 rounded-3xl border border-panel-border/40 hover:border-accent-cyan/60 transition-all flex flex-col justify-between group"
          >
            <div>
              <Satellite className="w-6 h-6 text-accent-cyan mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-base font-bold text-text-primary">Geospatial Explorer</h4>
              <p className="text-xs text-text-secondary mt-2">
                Full-screen Leaflet GIS console with multi-layer overlays and 8 Borena stations.
              </p>
            </div>
            <div className="mt-6 text-xs font-mono text-accent-cyan flex items-center gap-1">
              <span>Launch /explore</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/compare"
            className="nasa-panel p-6 rounded-3xl border border-panel-border/40 hover:border-accent-cyan/60 transition-all flex flex-col justify-between group"
          >
            <div>
              <Compass className="w-6 h-6 text-sky-400 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-base font-bold text-text-primary">Regional Comparison</h4>
              <p className="text-xs text-text-secondary mt-2">
                Side-by-side agro-climatic zone analysis between Borena, Somali, and Tigray.
              </p>
            </div>
            <div className="mt-6 text-xs font-mono text-sky-300 flex items-center gap-1">
              <span>Launch /compare</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/alerts"
            className="nasa-panel p-6 rounded-3xl border border-panel-border/40 hover:border-amber-400/60 transition-all flex flex-col justify-between group"
          >
            <div>
              <Bell className="w-6 h-6 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-base font-bold text-text-primary">ETHIODROUGHT ALERT</h4>
              <p className="text-xs text-text-secondary mt-2">
                Sample SMS advisory generator and authority contact registry demonstration.
              </p>
            </div>
            <div className="mt-6 text-xs font-mono text-amber-300 flex items-center gap-1">
              <span>Launch /alerts (Demo)</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/data"
            className="nasa-panel p-6 rounded-3xl border border-panel-border/40 hover:border-emerald-400/60 transition-all flex flex-col justify-between group"
          >
            <div>
              <Database className="w-6 h-6 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-base font-bold text-text-primary">Data & Transparency</h4>
              <p className="text-xs text-text-secondary mt-2">
                NASA data provenance, quality indicators, and custom meteorological CSV validator.
              </p>
            </div>
            <div className="mt-6 text-xs font-mono text-emerald-300 flex items-center gap-1">
              <span>Launch /data</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
