"use client";

import React, { useState } from "react";
import { BORENA_RECOVERY_TIMELINE } from "@/data/alertsData";
import { RecoveryStatus, RecoveryTimelinePoint } from "@/types/alerts";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Droplets, 
  Sprout, 
  Info, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  XCircle
} from "lucide-react";

interface RecoveryTrackerProps {
  isAmharic?: boolean;
}

export const RecoveryTracker: React.FC<RecoveryTrackerProps> = ({ isAmharic = false }) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(BORENA_RECOVERY_TIMELINE.length - 1);
  const currentPoint = BORENA_RECOVERY_TIMELINE[selectedIdx];

  const getStatusBadge = (status: RecoveryStatus) => {
    switch (status) {
      case "recovery_across_indicators":
        return {
          label: isAmharic ? "ሁለንተናዊ የአካባቢ ማገገም" : "Recovery Across Indicators",
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case "partial_recovery":
        return {
          label: isAmharic ? "ከፊል የአካባቢ ማገገም" : "Partial Environmental Recovery",
          color: "bg-sky-500/20 text-sky-300 border-sky-500/40",
          icon: <Clock className="w-3.5 h-3.5 text-sky-400" />,
        };
      case "incomplete_recovery":
        return {
          label: isAmharic ? "ያልተሟላ ማገገም (የላይኛ ዝናብ ብቻ)" : "Incomplete Recovery (False Mirage)",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      case "persistent_stress":
        return {
          label: isAmharic ? "ቀጣይነት ያለው የአካባቢ ድርቅ" : "Persistent Environmental Stress",
          color: "bg-red-500/20 text-red-300 border-red-500/40",
          icon: <XCircle className="w-3.5 h-3.5 text-red-400" />,
        };
      default:
        return {
          label: isAmharic ? "በቂ መረጃ የለም" : "Insufficient Data",
          color: "bg-gray-500/20 text-gray-300 border-gray-500/40",
          icon: <Info className="w-3.5 h-3.5 text-gray-400" />,
        };
    }
  };

  const badge = getStatusBadge(currentPoint.overallStatus);

  return (
    <div className="nasa-panel p-6 sm:p-8 rounded-3xl border border-accent-secondary/35 shadow-2xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-panel-border/30">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-accent-cyan uppercase mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isAmharic ? "የማገገም ሂደት መከታተያ" : "DROUGHT RECOVERY TRACKER"}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
            {isAmharic ? "የኢትዮጵያ ድርቅ ማገገም ምርመራ" : "Investigate Multi-Sensor Recovery Lag"}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            {isAmharic
              ? "ዝናብ ሲዘንብ የአፈር እርጥበትና የዕፅዋት ሽፋን አብረው ማገገማቸውን ይመርምሩ። የዝናብ መመለስ ብቻውን የተሟላ ማገገም አያረጋግጥም።"
              : "Investigating whether soil moisture and pasture canopy recover together after rainfall improves, differentiating false recoveries from substantive environmental rehabilitation."}
          </p>
        </div>

        {/* Current Point Status Pill */}
        <div className="flex flex-col sm:items-end">
          <span className="text-[10px] font-mono text-text-subtle uppercase mb-1">
            {isAmharic ? "የወቅቱ ማጠቃለያ ሁኔታ" : "DIAGNOSTIC STATUS"}
          </span>
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold border ${badge.color}`}>
            {badge.icon}
            <span>{badge.label}</span>
          </span>
        </div>
      </div>

      {/* Interactive Timeline Scrubber Strip */}
      <div className="py-6">
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-secondary">
          <span>{isAmharic ? "የጊዜ ሰሌዳ ምልከታ (ቦረና ዞን)" : "TIMELINE SCRUBBER (BORENA ZONE)"}</span>
          <span className="text-accent-cyan">{currentPoint.date}</span>
        </div>

        {/* Scrubber Buttons Strip */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {BORENA_RECOVERY_TIMELINE.map((p, idx) => {
            const isSelected = idx === selectedIdx;
            const pBadge = getStatusBadge(p.overallStatus);
            return (
              <button
                key={p.date}
                onClick={() => setSelectedIdx(idx)}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-panel border-accent-cyan shadow-[0_0_15px_rgba(40,215,197,0.3)] ring-1 ring-accent-cyan/50"
                    : "bg-panel-dark/80 border-panel-border/30 hover:border-accent-secondary/60 opacity-80 hover:opacity-100"
                }`}
              >
                <div className="text-[10px] sm:text-xs font-mono font-bold text-text-primary">
                  {p.date}
                </div>
                <div className="text-[9px] font-mono text-text-subtle truncate mt-1">
                  R:{p.rainfallZ >= 0 ? "+" : ""}{p.rainfallZ.toFixed(1)}σ
                </div>
                <div className="w-full h-1 rounded-full mt-2 bg-panel-dark overflow-hidden">
                  <div
                    className={`h-full ${
                      p.overallStatus === "recovery_across_indicators"
                        ? "bg-emerald-400"
                        : p.overallStatus === "partial_recovery"
                        ? "bg-sky-400"
                        : p.overallStatus === "incomplete_recovery"
                        ? "bg-amber-400"
                        : "bg-red-400"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Indicators Breakdown for Selected Milestone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
        {/* Rainfall */}
        <div className="p-4 rounded-2xl bg-panel-dark/90 border border-panel-border/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-accent-light flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-accent-cyan" />
              <span>GPM Precipitation</span>
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                currentPoint.rainfallZ >= 0
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {currentPoint.rainfallStatus.toUpperCase()}
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-text-primary">
            {currentPoint.rainfallZ >= 0 ? "+" : ""}
            {currentPoint.rainfallZ.toFixed(2)} σ
          </div>
          <p className="text-[11px] text-text-secondary mt-2">
            {currentPoint.rainfallZ >= 0
              ? "Precipitation above baseline; atmospheric moisture inflow restored."
              : "Precipitation below baseline; continuous meteorological deficit."}
          </p>
        </div>

        {/* Soil Moisture */}
        <div className="p-4 rounded-2xl bg-panel-dark/90 border border-panel-border/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-sky-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>FLDAS Soil (0–100cm)</span>
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                currentPoint.soilZ >= 0
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {currentPoint.soilStatus.toUpperCase()}
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-sky-400">
            {currentPoint.soilZ >= 0 ? "+" : ""}
            {currentPoint.soilZ.toFixed(2)} σ
          </div>
          <p className="text-[11px] text-text-secondary mt-2">
            {currentPoint.soilZ >= 0
              ? "Deep subterranean soil moisture reserves replenished."
              : "Root zone remains desiccated; surface rains failed to infiltrate deep subsoil."}
          </p>
        </div>

        {/* Vegetation */}
        <div className="p-4 rounded-2xl bg-panel-dark/90 border border-panel-border/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-emerald-300 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>MODIS Vegetation (NDVI)</span>
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                currentPoint.vegZ >= 0
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {currentPoint.vegetationStatus.toUpperCase()}
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400">
            {currentPoint.vegZ >= 0 ? "+" : ""}
            {currentPoint.vegZ.toFixed(2)} σ
          </div>
          <p className="text-[11px] text-text-secondary mt-2">
            {currentPoint.vegZ >= 0
              ? "Perennial grasses and pastoral rangeland canopy healthy."
              : "Vegetation greenness suppressed; biomass lagging behind atmospheric changes."}
          </p>
        </div>
      </div>

      {/* Observation Notes & Decoupling Interpretation */}
      <div className="mt-4 p-4 rounded-2xl bg-panel-dark/60 border border-panel-border/20 text-xs text-text-secondary leading-relaxed">
        <span className="font-bold text-text-primary block mb-1">
          {isAmharic ? "የሳይንሳዊ ምልከታ ማስታወሻ፡" : "Scientific Milestone Interpretation:"}
        </span>
        {currentPoint.notes}
      </div>

      {/* Mandatory Scientific Boundary Disclaimer */}
      <div className="mt-4 pt-4 border-t border-panel-border/20 flex items-start gap-2 text-[11px] text-text-subtle">
        <ShieldCheck className="w-4 h-4 text-accent-light shrink-0 mt-0.5" />
        <span>
          <strong>Scientific Notice:</strong> Environmental recovery tracked through satellite anomalies indicates physical Earth system states. It does not directly prove livestock herd recovery, pastoral household asset restitution, or agricultural food security.
        </span>
      </div>
    </div>
  );
};
