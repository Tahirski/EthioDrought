"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useApp } from "@/context/AppContext";
import { translations } from "@/data/translations";
import { MapLayerType } from "@/components/LeafletMapInner";
import TimelinePlayback from "@/components/TimelinePlayback";
import { WoredaStation } from "@/data/ethiopiaGeo";
import {
  Compass,
  Layers,
  MapPin,
  Satellite,
  Fingerprint,
  CloudRain,
  Sprout,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  Info,
  X,
  Radio,
  Activity,
  Sparkles,
} from "lucide-react";

// Dynamically import LeafletMapInner with SSR disabled
const DynamicMap = dynamic(
  () => import("@/components/LeafletMapInner").then((mod) => ({ default: mod.LeafletMapInner })),
  { ssr: false, loading: () => <div className="w-full h-full bg-panel-dark animate-pulse" /> }
);

export default function ExplorePage() {
  const {
    lang,
    selectedRegionId,
    setSelectedRegionId,
    activeRecords,
    currentRecord,
    rainZ,
    soilZ,
    vegZ,
    diagnosis,
    timelineIndex,
    setTimelineIndex,
    jumpToEvent,
  } = useApp();

  const t = translations[lang];

  // Map state
  const [selectedMapLayer, setSelectedMapLayer] = useState<MapLayerType>("fingerprint");
  const [selectedWoreda, setSelectedWoreda] = useState<WoredaStation | null>(null);

  // Available observation layers
  const layers: {
    id: MapLayerType;
    label: string;
    amLabel: string;
    icon: React.ReactNode;
    tag: string;
  }[] = [
    {
      id: "fingerprint",
      label: "Fingerprint",
      amLabel: "ድርቅ አሻራ",
      icon: <Fingerprint className="w-3.5 h-3.5" />,
      tag: "MULTIVARIATE",
    },
    {
      id: "rainfall",
      label: "Rainfall",
      amLabel: "ዝናብ",
      icon: <CloudRain className="w-3.5 h-3.5" />,
      tag: "GPM IMERG",
    },
    {
      id: "soilMoisture",
      label: "Soil Moisture",
      amLabel: "አፈር እርጥበት",
      icon: <Layers className="w-3.5 h-3.5" />,
      tag: "FLDAS NOAH",
    },
    {
      id: "vegetation",
      label: "Vegetation",
      amLabel: "ዕፅዋት",
      icon: <Sprout className="w-3.5 h-3.5" />,
      tag: "MODIS NDVI",
    },
  ];

  return (
    <div className="h-[calc(100vh-52px)] flex flex-col p-2.5 lg:p-4 gap-2.5 lg:gap-3 bg-[#040507] overflow-y-auto lg:overflow-hidden">
      {/* Upper Exploration Grid: Left Map (~75%) + Right Inspection Panel (~25%) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2.5 lg:gap-3 min-h-0">
        {/* Left Map Visualization Section (~75% width) */}
        <div className="w-full lg:w-3/4 h-[440px] lg:h-full relative min-h-0 rounded-2xl overflow-hidden border border-panel-border/40 bg-panel-dark shadow-2xl">
          {/* Underlying Dynamic Map */}
          <DynamicMap
            selectedLayer={selectedMapLayer}
            selectedWoreda={selectedWoreda}
            onSelectWoreda={(w) => setSelectedWoreda(w)}
            selectedRegionId={selectedRegionId}
            onSelectRegion={(id) => {
              setSelectedRegionId(id);
              setSelectedWoreda(null);
            }}
            currentRainfallZ={rainZ}
            currentSoilZ={soilZ}
            currentVegZ={vegZ}
          />

          {/* Floating Layer Toggle Buttons (Top-Left of map) */}
          <div className="absolute top-3.5 left-3.5 z-20 flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[#162036]/90 backdrop-blur-md border border-[#41619F]/40 shadow-2xl pointer-events-auto">
            {layers.map((layer) => {
              const isActive = selectedMapLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => setSelectedMapLayer(layer.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs transition-all duration-200 ${
                    isActive
                      ? "bg-accent-blue text-white shadow-glow-blue border border-accent-cyan/80 font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-[#253352]/70 border border-transparent"
                  }`}
                  title={`${layer.label} (${layer.tag})`}
                >
                  <span className={isActive ? "text-accent-cyan" : "text-text-subtle"}>
                    {layer.icon}
                  </span>
                  <span>{lang === "am" ? layer.amLabel : layer.label}</span>
                </button>
              );
            })}
          </div>

          {/* Floating Status Badge (Top-Right of map) */}
          <div className="hidden sm:flex absolute top-3.5 right-3.5 z-20 items-center gap-2 px-3 py-1.5 rounded-xl bg-[#162036]/85 backdrop-blur-md border border-panel-border/40 text-[11px] font-mono text-accent-light shadow-xl pointer-events-none">
            <Radio className="w-3 h-3 text-accent-cyan animate-pulse" />
            <span className="uppercase tracking-wider">
              {currentRecord?.date || "2024-11"} | {selectedRegionId.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Right Inspection Panel (~25% width) */}
        <div className="w-full lg:w-1/4 h-full min-h-0 flex flex-col">
          <div className="nasa-panel-blue p-5 h-full flex flex-col justify-between overflow-y-auto space-y-4">
            {/* Top Content: Eyebrow, Region Dropdown & Telemetry Stats */}
            <div className="space-y-4">
              {/* Header */}
              <div className="border-b border-panel-border/30 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                  <span className="text-[10px] font-mono tracking-widest text-accent-cyan uppercase font-bold">
                    GEOSPATIAL COMMAND CENTER
                  </span>
                </div>
                <h2 className="text-base font-bold text-text-primary tracking-tight">
                  {lang === "am" ? "የሳተላይት መቆጣጠሪያ ማዕከል" : "Geospatial Observation Unit"}
                </h2>
                <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-text-secondary">
                  <span>{lang === "am" ? "የምልከታ ወቅት" : "Active Epoch"}:</span>
                  <span className="text-accent-light font-bold px-2 py-0.5 rounded bg-panel-dark border border-panel-border/40">
                    {currentRecord?.date || "2024-11"}
                  </span>
                </div>
              </div>

              {/* Region Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-text-secondary block">
                  {lang === "am" ? "የአካባቢ መረጣ" : "Region / Zone Focus"}
                </label>
                <div className="relative">
                  <select
                    value={selectedRegionId}
                    onChange={(e) => {
                      setSelectedRegionId(e.target.value);
                      setSelectedWoreda(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-panel-dark border border-panel-border/60 text-xs text-text-primary font-mono focus:outline-none focus:border-accent-cyan transition-colors cursor-pointer appearance-none"
                  >
                    <option value="borena">
                      {lang === "am" ? "ቦረና ዞን (ኦሮሚያ)" : "Borena Zone (Oromia)"}
                    </option>
                    <option value="somali">
                      {lang === "am" ? "ሶማሊ ክልል (ፋፈን)" : "Somali Region (Fafan)"}
                    </option>
                    <option value="tigray">
                      {lang === "am" ? "ትግራይ ክልል (ደጋማ)" : "Tigray Region (Central Highlands)"}
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-subtle">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Diagnosis Snapshot */}
              <div className="p-3 rounded-xl bg-panel-dark/80 border border-panel-border/40 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-text-subtle uppercase tracking-wider">
                    {lang === "am" ? "የድርቅ ሁኔታ" : "Diagnosis Status"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      diagnosis.severity === "extreme"
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : diagnosis.severity === "severe"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : diagnosis.severity === "moderate"
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    }`}
                  >
                    {diagnosis.severity}
                  </span>
                </div>
                <div className="text-xs font-bold text-text-primary">
                  {lang === "am" ? diagnosis.titleAmharic : diagnosis.title}
                </div>
                <div className="text-[11px] text-text-secondary leading-snug">
                  {lang === "am" ? diagnosis.summaryAmharic : diagnosis.summary}
                </div>
              </div>

              {/* Observation Telemetry Stats */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">
                  {lang === "am" ? "የሳተላይት መለኪያዎች" : "Observation Telemetry (Z-Scores)"}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {/* Rainfall Z */}
                  <div className="p-2.5 rounded-xl bg-panel-dark/60 border border-panel-border/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-accent-blue/30 border border-accent-blue/50 flex items-center justify-center text-accent-cyan">
                        <CloudRain className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-text-primary">
                          {lang === "am" ? "የዝናብ መጠን (GPM)" : "Rainfall Anomaly"}
                        </div>
                        <div className="text-[9px] font-mono text-text-subtle">GPM IMERG V06B</div>
                      </div>
                    </div>
                    <div
                      className={`font-mono text-sm font-bold ${
                        rainZ < -1.5 ? "text-red-400" : rainZ < -0.8 ? "text-amber-400" : "text-accent-cyan"
                      }`}
                    >
                      {rainZ > 0 ? `+${rainZ.toFixed(2)}` : rainZ.toFixed(2)}σ
                    </div>
                  </div>

                  {/* Soil Moisture Z */}
                  <div className="p-2.5 rounded-xl bg-panel-dark/60 border border-panel-border/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-text-primary">
                          {lang === "am" ? "የአፈር እርጥበት (FLDAS)" : "Soil Moisture"}
                        </div>
                        <div className="text-[9px] font-mono text-text-subtle">FLDAS Noah 0-100cm</div>
                      </div>
                    </div>
                    <div
                      className={`font-mono text-sm font-bold ${
                        soilZ < -1.5 ? "text-red-400" : soilZ < -0.8 ? "text-amber-400" : "text-sky-400"
                      }`}
                    >
                      {soilZ > 0 ? `+${soilZ.toFixed(2)}` : soilZ.toFixed(2)}σ
                    </div>
                  </div>

                  {/* Vegetation Z */}
                  <div className="p-2.5 rounded-xl bg-panel-dark/60 border border-panel-border/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Sprout className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-text-primary">
                          {lang === "am" ? "የዕፅዋት ሽፋን (MODIS)" : "Vegetation Health"}
                        </div>
                        <div className="text-[9px] font-mono text-text-subtle">MODIS MOD13A2 NDVI</div>
                      </div>
                    </div>
                    <div
                      className={`font-mono text-sm font-bold ${
                        vegZ < -1.5 ? "text-red-400" : vegZ < -0.8 ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {vegZ > 0 ? `+${vegZ.toFixed(2)}` : vegZ.toFixed(2)}σ
                    </div>
                  </div>
                </div>
              </div>

              {/* Woreda Ground Telemetry (Conditional) */}
              {selectedWoreda ? (
                <div className="p-3 rounded-xl bg-panel-dark border border-accent-secondary/40 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-accent-cyan font-mono text-xs font-bold">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{selectedWoreda.name}</span>
                    </div>
                    <button
                      onClick={() => setSelectedWoreda(null)}
                      className="text-text-subtle hover:text-white p-0.5 rounded transition-colors"
                      title="Clear woreda selection"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="bg-[#040507]/60 p-2 rounded-lg border border-panel-border/30">
                      <span className="text-text-subtle block">Elevation:</span>
                      <span className="text-text-primary font-bold">{selectedWoreda.elevationM} m</span>
                    </div>
                    <div className="bg-[#040507]/60 p-2 rounded-lg border border-panel-border/30">
                      <span className="text-text-subtle block">Status:</span>
                      <span
                        className={`font-bold capitalize ${
                          selectedWoreda.status === "critical"
                            ? "text-red-400"
                            : selectedWoreda.status === "stressed"
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {selectedWoreda.status}
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#040507]/60 p-2 rounded-lg border border-panel-border/30 text-[10px] font-mono">
                    <span className="text-text-subtle block">Coordinates:</span>
                    <span className="text-accent-light">
                      {selectedWoreda.coords[0].toFixed(2)}°N, {selectedWoreda.coords[1].toFixed(2)}°E
                    </span>
                  </div>
                  {selectedWoreda.pastoralSystem && (
                    <div className="text-[10px] text-text-subtle italic">
                      {selectedWoreda.pastoralSystem}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-panel-dark/40 border border-panel-border/20 text-[11px] text-text-subtle font-mono flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-accent-light shrink-0" />
                  <span>
                    {lang === "am"
                      ? "የወረዳ ጣቢያዎችን በካርታው ላይ በመጫን ዝርዝር መረጃ ይመልከቱ"
                      : "Click any woreda station pin on the map for ground-level telemetry."}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Navigation Links */}
            <div className="pt-3 border-t border-panel-border/30 space-y-2 shrink-0">
              <Link
                href="/fingerprint"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-accent-blue/80 hover:bg-accent-blue text-white text-xs font-mono font-medium transition-colors shadow-glow-blue group"
              >
                <span className="flex items-center gap-2">
                  <Fingerprint className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>{lang === "am" ? "የድርቅ አሻራን መርምር" : "View Fingerprint"}</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/trends"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-panel-dark hover:bg-panel-light/70 border border-panel-border/40 text-text-primary text-xs font-mono font-medium transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-accent-light" />
                  <span>{lang === "am" ? "የለውጥ አዝማሚያዎችን ተንትን" : "Analyze Trends"}</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Below the map (full width): TimelinePlayback */}
      <div className="w-full shrink-0">
        <TimelinePlayback
          currentIndex={timelineIndex}
          totalSteps={activeRecords.length}
          currentDateStr={currentRecord?.date || "2024-11"}
          onIndexChange={setTimelineIndex}
          onJumpToEvent={jumpToEvent}
        />
      </div>
    </div>
  );
}
