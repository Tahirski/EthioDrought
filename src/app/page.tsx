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

export default function HomePage() {
  const {
    lang,
    selectedRegionId,
    setSelectedRegionId,
  } = useApp();

  const isAmharic = lang === "am";
  const t = translations[lang];

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
                  GPM / CHIRPS: NOT INGESTED
                </span>
                <span className="px-3 py-1 rounded-md bg-panel-dark border border-panel-border/30">
                  FLDAS / SMAP: NOT INGESTED
                </span>
                <span className="px-3 py-1 rounded-md bg-panel-dark border border-panel-border/30 text-accent-cyan flex items-center gap-1.5">
                  MODIS: NOT INGESTED
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
            Drought should not be diagnosed from rainfall alone. These are the planned evidence streams; none is currently available as verified observations in this app.
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
              <h3 className="text-lg font-bold text-text-primary">Rainfall Anomalies</h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                GPM IMERG and CHIRPS v3 are candidate rainfall sources. Compare matching seasonal periods only after product and baseline selection.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-panel-dark/60 border border-panel-border/20 text-[11px] font-mono text-text-subtle">
                <strong>Current integration:</strong> Not ingested. No anomaly or observation date is available.
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-panel-border/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-text-secondary block">ASSESSMENT</span>
                <span className="text-sm font-mono font-bold text-amber-200">INSUFFICIENT DATA</span>
              </div>
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
              <h3 className="text-lg font-bold text-text-primary">Soil Moisture</h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                FLDAS and SMAP are candidate sources with different measurement/model characteristics. They must not be combined without documented harmonization.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-panel-dark/60 border border-panel-border/20 text-[11px] font-mono text-text-subtle">
                <strong>Current integration:</strong> Not ingested. Variable, depth, and observation period are unselected.
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-panel-border/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-text-secondary block">ASSESSMENT</span>
                <span className="text-sm font-mono font-bold text-amber-200">INSUFFICIENT DATA</span>
              </div>
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
              <h3 className="text-lg font-bold text-text-primary">Vegetation Condition</h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                MODIS MOD13A2 is a candidate NDVI source. Quality flags, scale factor, and seasonal baseline must be applied before interpretation.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-panel-dark/60 border border-panel-border/20 text-[11px] font-mono text-text-subtle">
                <strong>Current integration:</strong> Not ingested. No quality-screened vegetation values are available.
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-panel-border/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-text-secondary block">ASSESSMENT</span>
                <span className="text-sm font-mono font-bold text-amber-200">INSUFFICIENT DATA</span>
              </div>
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

      <section id="problem" className="py-20 lg:py-24 max-w-[1720px] mx-auto px-4 lg:px-8 border-t border-panel-border/20 z-10 relative">
        <div className="max-w-4xl p-6 rounded-3xl nasa-panel border border-amber-500/35">
          <div className="flex items-center gap-2 text-amber-200 font-mono text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            Regional context requires cited sources
          </div>
          <h2 className="mt-3 text-3xl font-bold text-text-primary">Why drought evidence needs context</h2>
          <p className="mt-3 text-sm text-text-secondary leading-relaxed">
            Rainfall, soil moisture, and vegetation describe different parts of the drought process. Humanitarian impact, population, and current-condition figures are not shown here until they can be linked to verifiable sources and dates. The map currently has no verified environmental observations.
          </p>
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
              <span>STATISTICAL METHODS — RESULTS UNAVAILABLE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Measure What Is Changing. Quantify How Fast.
            </h2>
            <p className="mt-4 text-text-secondary text-sm sm:text-base leading-relaxed">
              Mann–Kendall and Sen&apos;s slope can summarize a validated time series. No verified observation series is currently available, so this page does not report a trend.
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
                Not computed
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Requires an observation series with known provenance and coverage.
              </p>
            </div>

            <div className="nasa-panel p-5 rounded-3xl border border-accent-secondary/35">
              <div className="text-[10px] font-mono text-accent-light uppercase">Statistical Significance</div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-accent-cyan mt-1">
                Not computed
              </div>
              <p className="text-xs text-text-secondary mt-2">
                No statistical significance result is available without validated inputs.
              </p>
            </div>

            <div className="sm:col-span-2 nasa-panel p-5 rounded-3xl border border-accent-secondary/35 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-accent-light uppercase">Kendall&apos;s Tau (τ)</div>
                <div className="text-base font-bold text-text-primary mt-0.5">
                  Trend direction unavailable
                </div>
              </div>
              <span className="font-mono text-sm px-3 py-1 rounded-xl bg-panel-dark text-accent-cyan border border-panel-border/30">
                τ = —
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
              <span>DROUGHT INVESTIGATION MAP</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Observe Ethiopia from Orbit
            </h2>
            <p className="mt-2 text-text-secondary max-w-2xl text-xs sm:text-sm">
              Select a region to investigate. Borena’s 2020 administrative boundary is loaded; no verified environmental observations are available.
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
            selectedRegionId={selectedRegionId}
            onSelectRegion={setSelectedRegionId}
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
                Region selection and evidence-layer controls, with explicit insufficient-data status. No station pins or observation overlays are shown.
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
