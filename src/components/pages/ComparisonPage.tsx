"use client";

import React, { useState, useMemo } from "react";
import { translations, Language } from "@/data/translations";
import { REGIONS_DATA, RegionTimeSeries } from "@/data/monthlyObservations";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine,
  CartesianGrid 
} from "recharts";
import { 
  GitCompare, 
  MapPin, 
  Droplets, 
  Wind, 
  Sprout, 
  CheckCircle2, 
  ArrowRight,
  Info
} from "lucide-react";

interface ComparisonPageProps {
  lang: Language;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ lang }) => {
  const t = translations[lang];

  const [region1Key, setRegion1Key] = useState<string>("borena");
  const [region2Key, setRegion2Key] = useState<string>("somali");

  const r1 = REGIONS_DATA[region1Key] || REGIONS_DATA.borena;
  const r2 = REGIONS_DATA[region2Key] || REGIONS_DATA.somali;

  // Align the records by date for the last 36 months
  const comparativeChartData = useMemo(() => {
    const r1Slice = r1.records.slice(-36);
    const r2Map = new Map(r2.records.map((r) => [r.date, r]));

    return r1Slice.map((rec1) => {
      const rec2 = r2Map.get(rec1.date);
      return {
        date: rec1.date,
        r1RainZ: rec1.rainfallZ ?? 0,
        r2RainZ: rec2?.rainfallZ ?? 0,
        r1SoilZ: rec1.soilMoistureZ ?? 0,
        r2SoilZ: rec2?.soilMoistureZ ?? 0,
        r1VegZ: rec1.ndviZ ?? 0,
        r2VegZ: rec2?.ndviZ ?? 0,
      };
    });
  }, [r1, r2]);

  // Compute average anomaly divergence
  const deltaStats = useMemo(() => {
    let rainDiff = 0;
    let soilDiff = 0;
    let vegDiff = 0;
    const len = comparativeChartData.length;

    comparativeChartData.forEach((d) => {
      rainDiff += Math.abs(d.r1RainZ - d.r2RainZ);
      soilDiff += Math.abs(d.r1SoilZ - d.r2SoilZ);
      vegDiff += Math.abs(d.r1VegZ - d.r2VegZ);
    });

    return {
      meanRainDivergence: Number((rainDiff / len).toFixed(2)),
      meanSoilDivergence: Number((soilDiff / len).toFixed(2)),
      meanVegDivergence: Number((vegDiff / len).toFixed(2)),
    };
  }, [comparativeChartData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2 font-mono">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl nasa-panel-blue border border-accent-secondary/35 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GitCompare className="w-4 h-4 text-accent-cyan" />
              <span className="text-xs tracking-widest text-accent-light uppercase">
                CROSS-REGIONAL AGRO-CLIMATIC CONTRAST
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-wide">
              {t.comparison.title}
            </h1>
            <p className="text-xs text-text-secondary mt-1 max-w-3xl leading-relaxed">
              Side-by-side comparative examination of drought dynamics between Ethiopian agro-ecological zones.
            </p>
          </div>

          {/* Region Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-panel-dark/90 border border-panel-border/40">
              <label className="text-[9px] text-text-subtle uppercase block mb-1">Target Zone 1</label>
              <select
                value={region1Key}
                onChange={(e) => setRegion1Key(e.target.value)}
                className="bg-transparent text-xs text-accent-cyan font-bold focus:outline-none"
              >
                <option value="borena">Borena Zone (Oromia)</option>
                <option value="somali">Somali Region (Fafan)</option>
                <option value="tigray">Tigray Region (Central)</option>
              </select>
            </div>

            <div className="p-2.5 rounded-2xl bg-panel-dark/90 border border-panel-border/40">
              <label className="text-[9px] text-text-subtle uppercase block mb-1">Comparison Zone 2</label>
              <select
                value={region2Key}
                onChange={(e) => setRegion2Key(e.target.value)}
                className="bg-transparent text-xs text-amber-400 font-bold focus:outline-none"
              >
                <option value="somali">Somali Region (Fafan)</option>
                <option value="borena">Borena Zone (Oromia)</option>
                <option value="tigray">Tigray Region (Central)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side Anomaly Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Rainfall Comparison */}
        <div className="p-5 rounded-3xl nasa-panel border border-panel-border/30">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-panel-border/30 text-xs">
            <span className="font-bold text-text-primary flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-accent-cyan" /> Rainfall Anomaly (Z)
            </span>
            <span className="text-[10px] text-text-subtle">GPM IMERG</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparativeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#162036" />
                <ReferenceLine y={0} stroke="#595C61" strokeDasharray="2 2" />
                <XAxis dataKey="date" tick={{ fill: "#595C61", fontSize: 8 }} interval={11} />
                <YAxis domain={[-3, 3]} tick={{ fill: "#595C61", fontSize: 8 }} />
                <Tooltip contentStyle={{ backgroundColor: "#162036", borderColor: "#41619F", fontSize: "10px" }} />
                <Line type="monotone" dataKey="r1RainZ" stroke="#28D7C5" strokeWidth={2} dot={false} name={r1.regionName} />
                <Line type="monotone" dataKey="r2RainZ" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="3 3" name={r2.regionName} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between text-[10px] text-text-secondary pt-2 border-t border-panel-border/20">
            <span className="text-accent-cyan font-bold">● {r1.regionName}</span>
            <span className="text-amber-400 font-bold">-- {r2.regionName}</span>
          </div>
        </div>

        {/* 2. Soil Moisture Comparison */}
        <div className="p-5 rounded-3xl nasa-panel border border-panel-border/30">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-panel-border/30 text-xs">
            <span className="font-bold text-text-primary flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-sky-400" /> Soil Moisture Anomaly (Z)
            </span>
            <span className="text-[10px] text-text-subtle">FLDAS Noah</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparativeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#162036" />
                <ReferenceLine y={0} stroke="#595C61" strokeDasharray="2 2" />
                <XAxis dataKey="date" tick={{ fill: "#595C61", fontSize: 8 }} interval={11} />
                <YAxis domain={[-3, 3]} tick={{ fill: "#595C61", fontSize: 8 }} />
                <Tooltip contentStyle={{ backgroundColor: "#162036", borderColor: "#41619F", fontSize: "10px" }} />
                <Line type="monotone" dataKey="r1SoilZ" stroke="#38BDF8" strokeWidth={2} dot={false} name={r1.regionName} />
                <Line type="monotone" dataKey="r2SoilZ" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="3 3" name={r2.regionName} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between text-[10px] text-text-secondary pt-2 border-t border-panel-border/20">
            <span className="text-sky-400 font-bold">● {r1.regionName}</span>
            <span className="text-amber-400 font-bold">-- {r2.regionName}</span>
          </div>
        </div>

        {/* 3. Vegetation Health Comparison */}
        <div className="p-5 rounded-3xl nasa-panel border border-panel-border/30">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-panel-border/30 text-xs">
            <span className="font-bold text-text-primary flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-400" /> Vegetation Health (NDVI Z)
            </span>
            <span className="text-[10px] text-text-subtle">MODIS NDVI</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparativeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#162036" />
                <ReferenceLine y={0} stroke="#595C61" strokeDasharray="2 2" />
                <XAxis dataKey="date" tick={{ fill: "#595C61", fontSize: 8 }} interval={11} />
                <YAxis domain={[-3, 3]} tick={{ fill: "#595C61", fontSize: 8 }} />
                <Tooltip contentStyle={{ backgroundColor: "#162036", borderColor: "#41619F", fontSize: "10px" }} />
                <Line type="monotone" dataKey="r1VegZ" stroke="#10B981" strokeWidth={2} dot={false} name={r1.regionName} />
                <Line type="monotone" dataKey="r2VegZ" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="3 3" name={r2.regionName} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between text-[10px] text-text-secondary pt-2 border-t border-panel-border/20">
            <span className="text-emerald-400 font-bold">● {r1.regionName}</span>
            <span className="text-amber-400 font-bold">-- {r2.regionName}</span>
          </div>
        </div>
      </div>

      {/* Comparative Synthesis Explanation */}
      <div className="p-6 rounded-3xl nasa-panel-blue border border-accent-secondary/40 shadow-2xl space-y-3">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-accent-cyan" />
          <span>Agro-Climatic Contrast Explanation</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-secondary leading-relaxed">
          <div className="p-4 rounded-2xl bg-panel-dark/80 border border-panel-border/30 space-y-2">
            <span className="font-bold text-accent-cyan block">{r1.regionName}</span>
            <p>
              Characterized by a <strong>bimodal precipitation regime</strong> governed by the Intertropical Convergence Zone (ITCZ): the primary <em>Genna</em> rains (March–May) and secondary <em>Deyr</em> rains (October–November). When consecutive bimodal seasons fail (as during 2020–2023), soil moisture storage completely collapses, preventing perennial grasses from germinating.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-panel-dark/80 border border-panel-border/30 space-y-2">
            <span className="font-bold text-amber-400 block">{r2.regionName}</span>
            <p>
              Displays different vulnerability timing. In the northern highlands (Tigray), agriculture relies on the <strong>unimodal Kiremt rains</strong> (July–August). In contrast, Somali/Fafan is hyper-arid with sparse vegetative response to flash rainfall events. Notice how anomalies between these two regions decouple during major El Niño events (e.g. 2015 El Niño devastated Tigray while Borena experienced different seasonal timing).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
