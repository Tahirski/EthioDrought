"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { GeoRegion, WoredaStation } from "@/data/ethiopiaGeo";
import { MapLayerType } from "./LeafletMapInner";
import { 
  Compass, 
  Layers, 
  MapPin, 
  Satellite, 
  Radio, 
  Activity, 
  Sparkles, 
  Search, 
  Sliders, 
  X,
  Maximize2,
  ChevronRight
} from "lucide-react";

// Dynamic import with ssr: false for Leaflet
const LeafletMapInner = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[520px] flex flex-col items-center justify-center bg-panel-dark/90 rounded-3xl border border-panel-border/30">
      <div className="w-12 h-12 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin mb-4" />
      <span className="text-xs font-mono tracking-widest text-text-secondary uppercase">
        Initializing NASA Earth Observation Grid...
      </span>
    </div>
  ),
});

interface HeroMapProps {
  selectedLayer: MapLayerType;
  onLayerChange: (layer: MapLayerType) => void;
  selectedWoreda: WoredaStation | null;
  onSelectWoreda: (woreda: WoredaStation) => void;
  selectedRegionId: string;
  onSelectRegion: (regionId: string) => void;
  rainfallZ: number;
  soilZ: number;
  vegZ: number;
  onExploreClick: () => void;
  onSearchQuery: (query: string) => void;
}

export const HeroMap: React.FC<HeroMapProps> = ({
  selectedLayer,
  onLayerChange,
  selectedWoreda,
  onSelectWoreda,
  selectedRegionId,
  onSelectRegion,
  rainfallZ,
  soilZ,
  vegZ,
  onExploreClick,
  onSearchQuery,
}) => {
  const [techCardVisible, setTechCardVisible] = useState(true);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const layerOptions: { id: MapLayerType; label: string; tag: string }[] = [
    { id: "fingerprint", label: "Drought Fingerprint", tag: "MULTIVARIATE" },
    { id: "rainfall", label: "Rainfall Anomaly", tag: "GPM IMERG" },
    { id: "soil", label: "Soil Moisture", tag: "FLDAS NOAH" },
    { id: "ndvi", label: "Vegetation Health", tag: "MODIS NDVI" },
  ];

  const quickSearchQueries = [
    "Borena Zone: 2020-2023 5-season drought analysis",
    "Somali Region (Fafan) comparison",
    "Why does NDVI lag 45 days behind rainfall?",
    "Show root-zone moisture deficit in Moyale woreda",
    "Tigray Highlands Kiremt seasonal anomalies",
  ];

  return (
    <div className="relative w-full h-[580px] lg:h-[680px] rounded-3xl overflow-hidden border border-panel-border/40 bg-[#040507] shadow-2xl">
      {/* 1. Underlying Interactive Leaflet Map */}
      <LeafletMapInner
        selectedLayer={selectedLayer}
        selectedWoreda={selectedWoreda}
        onSelectWoreda={onSelectWoreda}
        selectedRegionId={selectedRegionId}
        onSelectRegion={onSelectRegion}
        currentRainfallZ={rainfallZ}
        currentSoilZ={soilZ}
        currentVegZ={vegZ}
      />

      {/* Subtle vignette and scanline overlay to match the NASA cinematic reference */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#040507]/90 via-transparent to-[#040507]/40 z-10" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(4,5,7,0.7)_100%)] z-10" />

      {/* 2. Floating Location Badge (Top-Left of Map) */}
      <div className="absolute top-5 left-5 z-20 flex flex-col pointer-events-auto">
        <div className="px-4 py-2.5 rounded-2xl nasa-panel border border-accent-secondary/30 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-accent-light uppercase">
              STUDY TARGET AREA
            </span>
          </div>
          <h2 className="text-xl font-bold font-mono tracking-wider text-text-primary">
            BORANA ZONE
          </h2>
          <div className="text-xs font-mono text-accent-light tracking-wide">
            OROMIA REGION, ETHIOPIA
          </div>
          <div className="mt-1 pt-1 border-t border-white/10 flex items-center gap-2 text-[9px] font-mono text-text-subtle">
            <span className="text-status-moderate font-bold">● LATEST: NOV 2024</span>
            <span>|</span>
            <span>NASA FLDAS • GPM • MODIS</span>
          </div>
        </div>

        {/* Layer Switcher Pills right below location */}
        <div className="mt-3 flex flex-wrap gap-1.5 p-1 rounded-2xl bg-panel-dark/80 backdrop-blur-md border border-panel-border/30 max-w-sm">
          {layerOptions.map((layer) => (
            <button
              key={layer.id}
              onClick={() => onLayerChange(layer.id)}
              className={`px-2.5 py-1 text-[10px] font-mono rounded-xl transition-all ${
                selectedLayer === layer.id
                  ? "bg-accent-blue/80 text-text-primary border border-accent-cyan shadow-glow-cyan"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              }`}
            >
              <span>{layer.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Floating Technical Card in Upper-Right (Modeled after "Code NOARD" card in reference) */}
      {techCardVisible && (
        <div className="absolute top-5 right-5 z-20 w-64 p-4 rounded-3xl nasa-panel border border-accent-secondary/40 backdrop-blur-2xl shadow-panel">
          <div className="flex items-start justify-between pb-2 mb-3 border-b border-panel-border/30">
            <div>
              <div className="text-[9px] font-mono tracking-widest text-text-subtle uppercase">
                TARGET IDENTIFIER
              </div>
              <div className="text-base font-bold font-mono text-text-primary tracking-wide">
                ETH-BOR-04
              </div>
            </div>
            <button
              onClick={() => setTechCardVisible(false)}
              className="text-text-subtle hover:text-text-primary p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-text-subtle block">Rainfall Anom</span>
              <span className="text-sm font-bold text-red-400">
                {rainfallZ > 0 ? `+${rainfallZ}` : rainfallZ} σ
              </span>
            </div>
            <div>
              <span className="text-[10px] text-text-subtle block">Soil Moisture</span>
              <span className="text-sm font-bold text-red-400">
                {soilZ > 0 ? `+${soilZ}` : soilZ} σ
              </span>
            </div>
            <div>
              <span className="text-[10px] text-text-subtle block">NDVI Veg</span>
              <span className="text-sm font-bold text-amber-400">
                {vegZ > 0 ? `+${vegZ}` : vegZ} σ
              </span>
            </div>
            <div>
              <span className="text-[10px] text-text-subtle block">Drought Type</span>
              <span className="text-xs font-semibold text-accent-light">
                Agro-Pastoral
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-panel-border/30">
            <div className="flex items-center justify-between text-[10px] font-mono text-text-subtle mb-1">
              <span>Agreement Signal</span>
              <span className="text-status-severe font-bold">MULTIVARIATE STRESS</span>
            </div>
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-status-severe to-status-moderate w-[84%]" />
            </div>
          </div>
        </div>
      )}

      {/* 4. Circular Radar / Sensor Dial Widget (Lower-Right of Map, exactly like the reference!) */}
      <div className="absolute bottom-20 right-5 z-20 hidden md:flex flex-col items-center p-3 rounded-3xl nasa-panel border border-accent-secondary/30 backdrop-blur-xl">
        <div className="relative w-24 h-24 rounded-full border border-accent-secondary/40 flex items-center justify-center bg-black/40 overflow-hidden">
          {/* Circular grid rings */}
          <div className="absolute w-16 h-16 rounded-full border border-dashed border-accent-secondary/30" />
          <div className="absolute w-8 h-8 rounded-full border border-accent-cyan/30" />
          {/* Crosshairs */}
          <div className="absolute w-full h-[1px] bg-accent-secondary/20" />
          <div className="absolute h-full w-[1px] bg-accent-secondary/20" />
          {/* Rotating radar sweep hand */}
          <div className="absolute inset-0 radar-hand">
            <div className="w-1/2 h-1/2 bg-gradient-to-bl from-accent-cyan/40 via-accent-cyan/10 to-transparent origin-bottom-right" />
          </div>
          {/* Center blip */}
          <div className="w-2 h-2 rounded-full bg-accent-cyan shadow-glow-cyan z-10" />
          {/* Simulated target blip in Borena */}
          <div className="absolute top-6 right-7 w-1.5 h-1.5 rounded-full bg-status-severe animate-ping" />
        </div>
        <span className="mt-2 text-[9px] font-mono tracking-widest text-text-secondary uppercase">
          SAT-PASS: ACTIVE
        </span>
      </div>

      {/* 5. Center Floating Action Pill: [ EXPLORE SIGNALS ] */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <button
          onClick={onExploreClick}
          className="flex items-center gap-2 px-6 py-2 rounded-full bg-panel-dark/90 hover:bg-accent-blue border border-accent-cyan/60 hover:border-accent-cyan text-text-primary text-xs font-mono uppercase tracking-widest transition-all duration-300 shadow-glow-cyan group"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-cyan group-hover:rotate-12 transition-transform" />
          <span>EXPLORE SIGNALS</span>
          <ChevronRight className="w-3.5 h-3.5 text-accent-light" />
        </button>
      </div>

      {/* 6. Floating Search & Command Bar (Across bottom of the map, modeled after reference!) */}
      <div className="absolute bottom-4 left-5 right-5 lg:left-12 lg:right-12 z-20 pointer-events-auto">
        <div className="relative">
          <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-panel-dark/90 backdrop-blur-2xl border border-panel-border/50 shadow-2xl focus-within:border-accent-cyan transition-colors">
            <div className="p-1 rounded-full bg-accent-blue/30 text-accent-cyan">
              <Sparkles className="w-4 h-4" />
            </div>

            <input
              type="text"
              value={searchInputValue}
              onChange={(e) => {
                setSearchInputValue(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="Search an Ethiopian region or ask about environmental trends..."
              className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-secondary focus:outline-none font-mono"
            />

            <button
              onClick={() => {
                if (searchInputValue.trim()) {
                  onSearchQuery(searchInputValue.trim());
                  setShowSearchDropdown(false);
                }
              }}
              className="px-3 py-1 text-xs font-mono rounded-full bg-accent-blue hover:bg-accent-blue/80 text-text-primary transition-colors flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              <span>Query</span>
            </button>
          </div>

          {/* Search suggestions dropdown */}
          {showSearchDropdown && (
            <div className="absolute bottom-full mb-2 left-0 right-0 p-3 rounded-2xl bg-panel-blue border border-panel-border shadow-2xl text-xs z-30">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-panel-border/30 text-[10px] font-mono text-text-subtle uppercase">
                <span>Suggested Scientific Investigations</span>
                <button
                  onClick={() => setShowSearchDropdown(false)}
                  className="hover:text-text-primary"
                >
                  Close
                </button>
              </div>
              <div className="space-y-1.5">
                {quickSearchQueries.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchInputValue(query);
                      onSearchQuery(query);
                      setShowSearchDropdown(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-accent-cyan font-mono text-[11px] transition-colors flex items-center justify-between"
                  >
                    <span>{query}</span>
                    <ChevronRight className="w-3 h-3 opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
