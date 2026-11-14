"use client";

import React from "react";
import { translations, Language } from "@/data/translations";
import { MonthlyRecord } from "@/data/monthlyObservations";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine 
} from "recharts";
import { 
  ArrowUpRight, 
  Database, 
  ExternalLink, 
  Layers, 
  TrendingDown, 
  Droplets, 
  Sprout, 
  Wind,
  CheckCircle2
} from "lucide-react";

interface BottomPanelsProps {
  lang: Language;
  recentRecords: MonthlyRecord[];
  currentRainfallZ: number;
  currentSoilZ: number;
  currentVegZ: number;
  comparisonRegionName: string;
  comparisonRainZ: number;
  comparisonSoilZ: number;
  comparisonVegZ: number;
  onOpenHistory: () => void;
  onOpenIndicators: () => void;
  onOpenComparison: () => void;
  onOpenMethodology: () => void;
}

export const BottomPanels: React.FC<BottomPanelsProps> = ({
  lang,
  recentRecords,
  currentRainfallZ,
  currentSoilZ,
  currentVegZ,
  comparisonRegionName,
  comparisonRainZ,
  comparisonSoilZ,
  comparisonVegZ,
  onOpenHistory,
  onOpenIndicators,
  onOpenComparison,
  onOpenMethodology,
}) => {
  const t = translations[lang];

  // Prepare recent 24-month chart data
  const chartData = recentRecords.slice(-24).map((r) => ({
    date: r.date.substring(2), // "22-11"
    rainZ: r.rainfallZ ?? 0,
    soilZ: r.soilMoistureZ ?? 0,
    vegZ: r.ndviZ ?? 0,
  }));

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
      {/* PANEL A — ENVIRONMENTAL HISTORY (Compact Multi-Indicator Line Chart) */}
      <div className="p-4 rounded-3xl nasa-panel border border-panel-border/30 hover:border-accent-secondary/60 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-text-subtle uppercase">
              {t.panels.environmentalHistory}
            </div>
            <div className="text-sm font-bold font-mono text-text-primary flex items-center gap-2">
              <span>24-Month Anomaly</span>
              <span className="text-[10px] font-mono text-status-severe font-normal">(-1.87σ)</span>
            </div>
          </div>
          <button
            onClick={onOpenHistory}
            className="p-1 rounded-full bg-panel hover:bg-accent-blue text-accent-light hover:text-white transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compact sparkline */}
        <div className="w-full h-24 my-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <ReferenceLine y={0} stroke="#595C61" strokeDasharray="3 3" />
              <ReferenceLine y={-1} stroke="#EF4444" strokeDasharray="2 2" strokeOpacity={0.5} />
              <XAxis dataKey="date" tick={{ fill: "#595C61", fontSize: 9 }} interval={6} />
              <YAxis domain={[-3, 2]} tick={{ fill: "#595C61", fontSize: 8 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(22, 33, 56, 0.95)",
                  borderColor: "rgba(115, 151, 189, 0.3)",
                  borderRadius: "0.75rem",
                  fontSize: "10px",
                  fontFamily: "monospace",
                }}
              />
              <Line type="monotone" dataKey="rainZ" stroke="#28D7C5" strokeWidth={1.5} dot={false} name="Rain Z" />
              <Line type="monotone" dataKey="soilZ" stroke="#38BDF8" strokeWidth={1.5} dot={false} name="Soil Z" />
              <Line type="monotone" dataKey="vegZ" stroke="#F59E0B" strokeWidth={1.5} dot={false} name="Veg Z" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[9px] font-mono text-text-subtle pt-1 border-t border-panel-border/20">
          <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-accent-cyan" /> Rain</span>
          <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-sky-400" /> Soil</span>
          <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-amber-400" /> NDVI</span>
        </div>
      </div>

      {/* PANEL B — DROUGHT INDICATORS (Compact Breakdown & Gauges) */}
      <div className="p-4 rounded-3xl nasa-panel border border-panel-border/30 hover:border-accent-secondary/60 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-text-subtle uppercase">
              {t.panels.droughtIndicators}
            </div>
            <div className="text-sm font-bold font-mono text-text-primary">
              Status Breakdown
            </div>
          </div>
          <button
            onClick={onOpenIndicators}
            className="p-1 rounded-full bg-panel hover:bg-accent-blue text-accent-light hover:text-white transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Indicators with horizontal bars */}
        <div className="space-y-2 py-1 text-xs font-mono">
          <div>
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-text-secondary flex items-center gap-1">
                <Droplets className="w-3 h-3 text-accent-cyan" /> Rainfall Deficit
              </span>
              <span className="font-bold text-red-400">{currentRainfallZ}σ</span>
            </div>
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 w-[78%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-text-secondary flex items-center gap-1">
                <Wind className="w-3 h-3 text-sky-400" /> Root Soil Water
              </span>
              <span className="font-bold text-red-400">{currentSoilZ}σ</span>
            </div>
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
              <div className="h-full bg-red-600 w-[86%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-text-secondary flex items-center gap-1">
                <Sprout className="w-3 h-3 text-amber-400" /> Canopy Vigor (NDVI)
              </span>
              <span className="font-bold text-amber-400">{currentVegZ}σ</span>
            </div>
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-[68%]" />
            </div>
          </div>
        </div>

        <div className="text-[9px] font-mono text-text-subtle pt-1 border-t border-panel-border/20 flex justify-between">
          <span>Phase: Agricultural Drought</span>
          <span className="text-status-severe font-bold">● High Impact</span>
        </div>
      </div>

      {/* PANEL C — REGIONAL COMPARISON (Borena vs Somali/Fafan Contrast) */}
      <div className="p-4 rounded-3xl nasa-panel border border-panel-border/30 hover:border-accent-secondary/60 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-text-subtle uppercase">
              {t.panels.regionalComparison}
            </div>
            <div className="text-sm font-bold font-mono text-text-primary">
              Borena vs {comparisonRegionName}
            </div>
          </div>
          <button
            onClick={onOpenComparison}
            className="p-1 rounded-full bg-panel hover:bg-accent-blue text-accent-light hover:text-white transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Comparative mini table */}
        <div className="space-y-1.5 py-1 text-[11px] font-mono">
          <div className="grid grid-cols-3 text-[9px] text-text-subtle border-b border-panel-border/20 pb-0.5">
            <span>Indicator</span>
            <span className="text-center">Borena</span>
            <span className="text-right">{comparisonRegionName.split(" ")[0]}</span>
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="text-text-secondary text-[10px]">Rainfall (Z)</span>
            <span className="text-center font-bold text-red-400">{currentRainfallZ}σ</span>
            <span className="text-right font-bold text-amber-400">{comparisonRainZ}σ</span>
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="text-text-secondary text-[10px]">Soil Moist (Z)</span>
            <span className="text-center font-bold text-red-400">{currentSoilZ}σ</span>
            <span className="text-right font-bold text-red-400">{comparisonSoilZ}σ</span>
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="text-text-secondary text-[10px]">NDVI (Z)</span>
            <span className="text-center font-bold text-amber-400">{currentVegZ}σ</span>
            <span className="text-right font-bold text-amber-400">{comparisonVegZ}σ</span>
          </div>
        </div>

        <div className="text-[9px] font-mono text-text-subtle pt-1 border-t border-panel-border/20 flex justify-between">
          <span>Agro-climate: Bimodal vs Arid</span>
          <span className="text-accent-light font-bold">Contrast Delta: 0.42</span>
        </div>
      </div>

      {/* PANEL D — DATA SOURCES (NASA Provenance) */}
      <div className="p-4 rounded-3xl nasa-panel border border-panel-border/30 hover:border-accent-secondary/60 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-text-subtle uppercase">
              {t.panels.dataSources}
            </div>
            <div className="text-sm font-bold font-mono text-text-primary flex items-center gap-1.5">
              <span>NASA Satellite Fleet</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <button
            onClick={onOpenMethodology}
            className="p-1 rounded-full bg-panel hover:bg-accent-blue text-accent-light hover:text-white transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Dataset badges */}
        <div className="space-y-1.5 py-1 text-[10px] font-mono">
          <div className="p-1.5 rounded-xl bg-black/40 border border-panel-border/20 flex items-center justify-between">
            <div>
              <span className="text-text-primary font-bold">NASA FLDAS Noah</span>
              <span className="text-text-subtle block text-[9px]">0.1° Soil Moisture 0-100cm</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-blue/30 text-accent-light">1982-2024</span>
          </div>

          <div className="p-1.5 rounded-xl bg-black/40 border border-panel-border/20 flex items-center justify-between">
            <div>
              <span className="text-text-primary font-bold">NASA GPM IMERG</span>
              <span className="text-text-subtle block text-[9px]">0.1° Monthly Precipitation</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-blue/30 text-accent-light">2000-2024</span>
          </div>

          <div className="p-1.5 rounded-xl bg-black/40 border border-panel-border/20 flex items-center justify-between">
            <div>
              <span className="text-text-primary font-bold">NASA MODIS NDVI</span>
              <span className="text-text-subtle block text-[9px]">MOD13A2 / MYD13A2 1km</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-blue/30 text-accent-light">2000-2024</span>
          </div>
        </div>

        <div className="text-[9px] font-mono text-accent-cyan hover:underline pt-1 border-t border-panel-border/20 flex items-center justify-between cursor-pointer" onClick={onOpenMethodology}>
          <span className="flex items-center gap-1">Inspect Documentation <ExternalLink className="w-2.5 h-2.5" /></span>
          <span className="text-text-subtle">NASA GIOVANNI</span>
        </div>
      </div>
    </div>
  );
};
