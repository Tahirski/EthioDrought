"use client";

import React from "react";
import { AlertTriangle, ArrowRight, Check, Database, Satellite } from "lucide-react";

interface SatelliteOrbitalViewProps {
  isAmharic?: boolean;
  onExploreClick?: () => void;
}

const sources = [
  { name: "Rainfall", candidates: "GPM IMERG · CHIRPS v3" },
  { name: "Soil moisture", candidates: "FLDAS · SMAP" },
  { name: "Vegetation", candidates: "MODIS MOD13A2" },
];

export const SatelliteOrbitalView: React.FC<SatelliteOrbitalViewProps> = ({
  isAmharic = false,
  onExploreClick,
}) => (
  <div className="relative w-full min-h-[420px] rounded-3xl overflow-hidden border border-accent-secondary/35 bg-panel-dark/70 shadow-2xl p-6 lg:p-8 flex flex-col justify-between">
    <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(40,215,197,0.2),transparent_65%)]" />
    <div className="relative z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-panel-dark border border-amber-400/40 flex items-center justify-center">
          <Satellite className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <div className="text-xs font-mono font-bold tracking-wider text-text-primary uppercase">
            {isAmharic ? "የመረጃ ዝግጁነት" : "Observation readiness"}
          </div>
          <div className="text-[10px] font-mono text-amber-200">NO LIVE FEEDS CONFIGURED</div>
        </div>
      </div>

      <div className="mt-7 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/35">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-100">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {isAmharic ? "ምልከታ አልተገኘም" : "No verified observations"}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          Candidate sources are listed for transparency. No observations, retrieval dates, or quality-screened regional grids are currently available to this app.
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {sources.map((source) => (
          <div key={source.name} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-panel-dark/70 border border-panel-border/30">
            <div className="flex items-center gap-2 text-xs text-text-primary">
              <Database className="w-3.5 h-3.5 text-accent-light" />
              {source.name}
            </div>
            <div className="text-right">
              <div className="text-[10px] text-text-secondary">{source.candidates}</div>
              <div className="text-[9px] font-mono text-amber-200 flex items-center justify-end gap-1">
                <Check className="w-3 h-3" /> CANDIDATES ONLY
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {onExploreClick && (
      <button
        onClick={onExploreClick}
        className="relative z-10 mt-6 w-fit flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-blue hover:bg-accent-blue/80 text-white text-xs font-mono transition-colors"
      >
        {isAmharic ? "የዝግጁነት ሁኔታን ይመልከቱ" : "Open investigation map"}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);
