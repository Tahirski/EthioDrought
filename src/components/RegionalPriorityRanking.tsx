"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { SAMPLE_PRIORITY_RANKINGS } from "@/data/alertsData";
import { RegionalInvestigationPriority } from "@/types/alerts";
import { 
  AlertCircle, 
  ArrowUpDown, 
  ChevronRight, 
  Filter, 
  MapPin, 
  ShieldAlert, 
  Activity,
  Layers,
  Search,
  ExternalLink
} from "lucide-react";

interface RegionalPriorityRankingProps {
  isAmharic?: boolean;
}

export const RegionalPriorityRanking: React.FC<RegionalPriorityRankingProps> = ({ isAmharic = false }) => {
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"rank" | "persistence" | "composite">("rank");

  const filteredRankings = useMemo(() => {
    let list = [...SAMPLE_PRIORITY_RANKINGS];

    if (filterLevel !== "all") {
      list = list.filter((r) => r.priorityLevel === filterLevel);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.regionName.toLowerCase().includes(q) ||
          r.regionNameAm.includes(q) ||
          r.reasonForRanking.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === "persistence") return b.persistenceMonths - a.persistenceMonths;
      if (sortBy === "composite") return a.compositeScore - b.compositeScore; // more negative first
      return a.rank - b.rank;
    });

    return list;
  }, [filterLevel, searchTerm, sortBy]);

  return (
    <div className="nasa-panel p-6 sm:p-8 rounded-3xl border border-accent-secondary/35 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-panel-border/30">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-accent-cyan uppercase mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>{isAmharic ? "የክልላዊ ምርመራ ቅድሚያ ደረጃ" : "REGIONAL INVESTIGATION PRIORITY"}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
            {isAmharic ? "ተጨማሪ የሳተላይት ምርመራ የሚሹ የኢትዮጵያ አካባቢዎች" : "Locations Deserving Further Investigation"}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            {isAmharic
              ? "በበርካታ የሳተላይት መለኪያዎች (ዝናብ፣ አፈር፣ ዕፅዋት) ላይ የታየውን ቀጣይነት ያለው ጫና በማመዛዘን የተዘጋጀ ሳይንሳዊ የቅድሚያ ቅደም ተከተል።"
              : "Ranking regions by multi-sensor stress convergence, anomaly persistence, and data coverage to guide in-depth environmental analysis."}
          </p>
        </div>

        {/* Disclaimer Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-panel-dark text-[10px] font-mono text-text-secondary border border-panel-border/40">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Scientific Ranking Only · Not Official Humanitarian Risk</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAmharic ? "አካባቢ ፈልግ..." : "Filter Ethiopian region..."}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-panel-dark/90 border border-panel-border/40 text-xs font-mono text-text-primary placeholder-text-subtle focus:outline-none focus:border-accent-cyan"
            />
          </div>

          <div className="flex items-center gap-1 bg-panel-dark/80 p-1 rounded-xl border border-panel-border/30 text-xs font-mono">
            <Filter className="w-3 h-3 text-accent-light ml-1" />
            <button
              onClick={() => setFilterLevel("all")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterLevel === "all" ? "bg-accent-cyan text-[#040507] font-bold" : "text-text-secondary"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterLevel("high_priority")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterLevel === "high_priority" ? "bg-red-500/20 text-red-300 font-bold border border-red-500/40" : "text-text-secondary"
              }`}
            >
              High
            </button>
            <button
              onClick={() => setFilterLevel("medium_priority")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterLevel === "medium_priority" ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40" : "text-text-secondary"
              }`}
            >
              Medium
            </button>
          </div>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-text-secondary">
          <ArrowUpDown className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-panel-dark border border-panel-border/40 rounded-xl px-2.5 py-1 text-xs font-mono text-accent-light focus:outline-none"
          >
            <option value="rank">Severity Rank</option>
            <option value="persistence">Persistence Duration</option>
            <option value="composite">Composite Anomaly Z</option>
          </select>
        </div>
      </div>

      {/* Rankings List */}
      <div className="space-y-3">
        {filteredRankings.map((r) => {
          const isHigh = r.priorityLevel === "high_priority";
          return (
            <div
              key={r.regionId}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isHigh
                  ? "bg-panel-dark/90 border-red-500/30 hover:border-red-500/60"
                  : "bg-panel-dark/60 border-panel-border/30 hover:border-accent-secondary/50"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Rank, Region, Badges */}
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-panel flex items-center justify-center font-mono font-bold text-sm text-accent-cyan shrink-0 border border-panel-border/40">
                    #{r.rank}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-text-primary">
                        {isAmharic ? r.regionNameAm : r.regionName}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          isHigh
                            ? "bg-red-500/20 text-red-300 border border-red-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {r.priorityLevel.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-mono text-text-subtle">
                        {r.observationPeriod}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary mt-1">
                      {isAmharic ? r.reasonForRankingAm : r.reasonForRanking}
                    </p>
                  </div>
                </div>

                {/* Right: Metrics Pills */}
                <div className="flex flex-wrap items-center gap-3 shrink-0 text-xs font-mono">
                  <div className="px-3 py-1.5 rounded-xl bg-panel-dark border border-panel-border/30">
                    <span className="text-text-subtle block text-[9px]">COMPOSITE Z</span>
                    <span className="font-bold text-accent-cyan">{r.compositeScore.toFixed(2)} σ</span>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-panel-dark border border-panel-border/30">
                    <span className="text-text-subtle block text-[9px]">STRESS DURATION</span>
                    <span className="font-bold text-amber-400">{r.persistenceMonths} mos</span>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-panel-dark border border-panel-border/30">
                    <span className="text-text-subtle block text-[9px]">DATA STATUS</span>
                    <span className="text-text-primary uppercase text-[10px]">{r.dataAvailability}</span>
                  </div>

                  <Link
                    href={`/explore?region=${r.regionId}`}
                    className="p-2 rounded-xl bg-panel hover:bg-accent-cyan hover:text-[#040507] text-accent-light transition-all border border-panel-border/40"
                    title="Examine in Geospatial Explorer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory Disclaimer */}
      <div className="mt-6 pt-4 border-t border-panel-border/20 text-[11px] text-text-subtle leading-relaxed flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-accent-light shrink-0 mt-0.5" />
        <span>
          <strong>Operational Boundaries:</strong> The Regional Investigation Priority ranking is an analytical screening tool driven by multi-sensor Earth observations. It is designed to prioritize remote sensing investigations and does not constitute an official government humanitarian declaration, famine warning, or financial allocation decision.
        </span>
      </div>
    </div>
  );
};
