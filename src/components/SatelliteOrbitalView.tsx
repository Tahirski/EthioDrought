"use client";

import React, { useState } from "react";
import { Satellite, Radio, Compass, Eye, ShieldAlert, Sparkles, Layers } from "lucide-react";

interface SatelliteOrbitalViewProps {
  isAmharic?: boolean;
  onExploreClick?: () => void;
}

interface OrbitalTarget {
  id: string;
  name: string;
  nameAm: string;
  lat: string;
  lng: string;
  x: number; // SVG coordinate percent
  y: number;
  anomalyZ: string;
  status: "critical" | "warning" | "monitored";
  desc: string;
  descAm: string;
}

export const SatelliteOrbitalView: React.FC<SatelliteOrbitalViewProps> = ({
  isAmharic = false,
  onExploreClick,
}) => {
  const [activeTarget, setActiveTarget] = useState<string>("borena");
  const [sensorFilter, setSensorFilter] = useState<"all" | "gpm" | "fldas" | "modis">("all");

  const targets: OrbitalTarget[] = [
    {
      id: "borena",
      name: "Borena Pastoral Zone",
      nameAm: "ቦረና አርብቶ አደር ዞን",
      lat: "4.55° N",
      lng: "38.30° E",
      x: 48,
      y: 78,
      anomalyZ: "-2.14 σ",
      status: "critical",
      desc: "Severe root-zone moisture desiccation and pasture stress following historic multi-year deficit.",
      descAm: "ከታሪካዊ የዝናብ እጥረት በኋላ የተከሰተ ከፍተኛ የስር አፈር መድረቅ እና የሣር መጥፋት።",
    },
    {
      id: "tigray",
      name: "Tigray Region",
      nameAm: "ትግራይ ክልል",
      lat: "14.03° N",
      lng: "38.31° E",
      x: 46,
      y: 22,
      anomalyZ: "-1.45 σ",
      status: "warning",
      desc: "2026 Kiremt season precipitation deficit impacting crop germination.",
      descAm: "የ2026 ክረምት የዝናብ እጥረት በሰብል ማብቀል ላይ ጫና አሳድሯል።",
    },
    {
      id: "afar",
      name: "Northern Afar",
      nameAm: "ሰሜን አፋር",
      lat: "11.75° N",
      lng: "40.95° E",
      x: 62,
      y: 35,
      anomalyZ: "-1.62 σ",
      status: "warning",
      desc: "Entering dry period with below-average livestock conditions and pasture shortage.",
      descAm: "ዝቅተኛ የእንስሳት ጤና እና የሣር እጥረት ያለበት ደረቅ ወቅት መግቢያ።",
    },
    {
      id: "amhara",
      name: "Eastern Amhara",
      nameAm: "ምስራቅ አማራ",
      lat: "11.35° N",
      lng: "39.80° E",
      x: 54,
      y: 39,
      anomalyZ: "-1.30 σ",
      status: "warning",
      desc: "Moisture deficits affecting crop development across transitional escarpments.",
      descAm: "የእርጥበት እጥረት በሰብል እድገት ላይ ተፅዕኖ አሳድሯል።",
    },
    {
      id: "somali",
      name: "Somali (Fafan/Shabelle)",
      nameAm: "ሶማሌ ክልል",
      lat: "6.80° N",
      lng: "44.50° E",
      x: 80,
      y: 65,
      anomalyZ: "-1.18 σ",
      status: "monitored",
      desc: "Arid lowland rangelands; high sensitivity to delayed Deyr rains.",
      descAm: "ዝቅተኛ ቆላማ አካባቢ፤ ለደይር ዝናብ መዘግየት ከፍተኛ ተጋላጭነት።",
    },
  ];

  const current = targets.find((t) => t.id === activeTarget) || targets[0];

  return (
    <div className="relative w-full h-[520px] lg:h-[580px] rounded-3xl overflow-hidden border border-accent-secondary/35 bg-panel-dark/25 shadow-[0_0_50px_rgba(4,5,7,0.7)] backdrop-blur-md flex flex-col justify-between p-4 lg:p-6 select-none group">
      {/* Deep Space & Celestial Glow Backdrop with transparent glass blending */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(37, 51, 82, 0.25) 0%, rgba(13, 20, 36, 0.45) 60%, rgba(4, 5, 7, 0.75) 100%)",
        }}
      />

      {/* Grid Reticle Overlay (Earth System coordinates) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(115, 151, 189, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(115, 151, 189, 0.25) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Rotating Radar Sensor Sweep Animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Concentric Range Rings */}
        <div className="w-[280px] h-[280px] rounded-full border border-accent-cyan/15 animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute w-[440px] h-[440px] rounded-full border border-accent-secondary/20" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-accent-secondary/10 border-dashed" />

        {/* Orbit Path 1 (Inclined GPM Satellite Orbit ~65°) */}
        <div
          className="absolute w-[520px] h-[260px] rounded-full border border-accent-cyan/25 pointer-events-none"
          style={{ transform: "rotate(-32deg)" }}
        >
          {/* Orbiting Satellite Marker */}
          <div className="absolute -top-2 left-1/3 flex items-center gap-1.5 animate-pulse">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-cyan shadow-[0_0_12px_#28D7C5]" />
            <span className="text-[9px] font-mono font-bold text-accent-cyan tracking-wider bg-panel-dark/90 px-1.5 py-0.5 rounded border border-accent-cyan/30">
              GPM-CORE 407KM
            </span>
          </div>
        </div>

        {/* Orbit Path 2 (Polar Sun-Synchronous MODIS ~98°) */}
        <div
          className="absolute w-[560px] h-[300px] rounded-full border border-emerald-400/20 pointer-events-none"
          style={{ transform: "rotate(68deg)" }}
        >
          <div className="absolute -bottom-2 right-1/4 flex items-center gap-1.5 animate-pulse">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
            <span className="text-[9px] font-mono font-bold text-emerald-300 tracking-wider bg-panel-dark/90 px-1.5 py-0.5 rounded border border-emerald-400/30">
              TERRA/MODIS 705KM
            </span>
          </div>
        </div>

        {/* Sweeping Radar Scanner Line */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none origin-center"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(40, 215, 197, 0.18) 0deg, rgba(40, 215, 197, 0.03) 45deg, transparent 70deg)",
            animation: "spin 9s linear infinite",
          }}
        />
      </div>

      {/* TOP HUD: Constellation Telemetry & Mode Filter */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-panel-border/30">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-panel-dark border border-accent-cyan/50">
            <Radio className="w-4 h-4 text-accent-cyan animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-text-primary uppercase">
                {isAmharic ? "የሳተላይት ምህዋር ምልከታ" : "NASA ORBITAL TELEMETRY"}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-ping" />
                LIVE SYNC
              </span>
            </div>
            <p className="text-[10px] font-mono text-text-secondary">
              GPM IMERG · FLDAS NOAH · MODIS TERRA/AQUA
            </p>
          </div>
        </div>

        {/* Quick Sensor Filter Selector */}
        <div className="flex items-center gap-1 bg-panel-dark/80 p-1 rounded-full border border-panel-border/40 text-[10px] font-mono">
          <button
            onClick={() => setSensorFilter("all")}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              sensorFilter === "all"
                ? "bg-accent-cyan text-[#040507] font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setSensorFilter("gpm")}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              sensorFilter === "gpm"
                ? "bg-accent-cyan text-[#040507] font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            GPM
          </button>
          <button
            onClick={() => setSensorFilter("fldas")}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              sensorFilter === "fldas"
                ? "bg-sky-400 text-[#040507] font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            FLDAS
          </button>
          <button
            onClick={() => setSensorFilter("modis")}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              sensorFilter === "modis"
                ? "bg-emerald-400 text-[#040507] font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            MODIS
          </button>
        </div>
      </div>

      {/* CENTER: High-Fidelity Vector Map of Ethiopia & Station Markers */}
      <div className="relative flex-1 flex items-center justify-center min-h-[260px] my-2">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full max-h-[380px] drop-shadow-[0_0_25px_rgba(40,215,197,0.25)]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Holographic Ethiopia Fill Gradient */}
            <linearGradient id="ethioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#253352" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#162036" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0b1324" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="borenaGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#28D7C5" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#28D7C5" stopOpacity="0.08" />
            </linearGradient>

            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Calibrated Geographic Outline of Ethiopia */}
          <path
            d="M 44 14 
               L 52 14 
               L 60 22 
               L 68 28 
               L 72 32 
               L 79 38 
               L 86 52 
               L 92 64 
               L 88 74 
               L 80 82 
               L 68 84 
               L 58 88 
               L 48 88 
               L 42 82 
               L 36 76 
               L 32 68 
               L 26 60 
               L 24 50 
               L 28 42 
               L 34 32 
               L 38 22 
               Z"
            fill="url(#ethioGrad)"
            stroke="#7397BD"
            strokeWidth="0.8"
            strokeLinejoin="round"
            className="transition-all duration-500 hover:stroke-accent-cyan"
          />

          {/* Internal Agro-Ecological Boundary Lines */}
          <path
            d="M 38 22 Q 48 35 60 48"
            stroke="#7397BD"
            strokeWidth="0.4"
            strokeDasharray="1 1.5"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 60 48 Q 72 58 88 74"
            stroke="#7397BD"
            strokeWidth="0.4"
            strokeDasharray="1 1.5"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 36 76 Q 48 68 60 48"
            stroke="#7397BD"
            strokeWidth="0.4"
            strokeDasharray="1 1.5"
            fill="none"
            opacity="0.6"
          />

          {/* Borena Pastoral Zone Highlight Polygon */}
          <path
            d="M 42 74 
               L 56 74 
               L 58 88 
               L 48 88 
               L 42 82 
               Z"
            fill="url(#borenaGlow)"
            stroke="#28D7C5"
            strokeWidth="1.2"
            filter="url(#glowFilter)"
            className="animate-pulse cursor-pointer"
            onClick={() => setActiveTarget("borena")}
          />

          {/* Great Rift Valley Fault Axis Line */}
          <path
            d="M 66 26 L 46 80"
            stroke="#38BDF8"
            strokeWidth="0.5"
            strokeDasharray="1.5 1.5"
            opacity="0.5"
            fill="none"
          />

          {/* Latitude & Longitude Coordinate Markers */}
          <text x="18" y="16" fill="#595C61" fontSize="2.8" fontFamily="monospace">
            15°N
          </text>
          <text x="18" y="52" fill="#595C61" fontSize="2.8" fontFamily="monospace">
            10°N
          </text>
          <text x="18" y="86" fill="#595C61" fontSize="2.8" fontFamily="monospace">
            5°N
          </text>
          <text x="32" y="96" fill="#595C61" fontSize="2.8" fontFamily="monospace">
            35°E
          </text>
          <text x="58" y="96" fill="#595C61" fontSize="2.8" fontFamily="monospace">
            40°E
          </text>
          <text x="84" y="96" fill="#595C61" fontSize="2.8" fontFamily="monospace">
            45°E
          </text>

          {/* Interactive Target Observation Points */}
          {targets.map((t) => {
            const isSelected = t.id === activeTarget;
            const isBorena = t.id === "borena";

            return (
              <g
                key={t.id}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setActiveTarget(t.id)}
              >
                {/* Outer Radar Ping Ring */}
                {isSelected && (
                  <circle
                    cx={t.x}
                    cy={t.y}
                    r="4.5"
                    fill="none"
                    stroke={isBorena ? "#28D7C5" : "#38BDF8"}
                    strokeWidth="0.6"
                    className="animate-ping origin-center"
                  />
                )}

                {/* Target Anchor Ring */}
                <circle
                  cx={t.x}
                  cy={t.y}
                  r={isSelected ? "2.6" : "1.8"}
                  fill={isSelected ? (isBorena ? "#28D7C5" : "#38BDF8") : "#162036"}
                  stroke={isBorena ? "#28D7C5" : "#7397BD"}
                  strokeWidth="0.8"
                />

                {/* Center Core Dot */}
                <circle
                  cx={t.x}
                  cy={t.y}
                  r={isSelected ? "1.2" : "0.8"}
                  fill={isSelected ? "#040507" : "#FBFCFD"}
                />

                {/* Text Label on Map */}
                <text
                  x={t.x + (t.x > 70 ? -16 : 3.5)}
                  y={t.y + 1}
                  fill={isSelected ? "#FBFCFD" : "#999CA0"}
                  fontSize={isSelected ? "2.8" : "2.4"}
                  fontFamily="monospace"
                  fontWeight={isSelected ? "bold" : "normal"}
                  className="pointer-events-none select-none"
                >
                  {isAmharic ? t.nameAm.split(" ")[0] : t.name.split(" ")[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Target Floating Card (Overlay in Bottom Left) */}
        <div className="absolute bottom-2 left-2 right-2 sm:right-auto sm:max-w-xs nasa-panel p-3.5 rounded-2xl border border-accent-secondary/40 shadow-2xl backdrop-blur-xl z-20">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-text-primary">
                {isAmharic ? current.nameAm : current.name}
              </span>
            </div>
            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                current.status === "critical"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              }`}
            >
              {current.anomalyZ}
            </span>
          </div>

          <p className="text-[10px] text-text-secondary leading-relaxed line-clamp-2">
            {isAmharic ? current.descAm : current.desc}
          </p>

          <div className="mt-2 pt-2 border-t border-panel-border/30 flex items-center justify-between text-[9px] font-mono text-accent-light">
            <span>
              {current.lat} · {current.lng}
            </span>
            <span className="text-accent-cyan">NASA FLDAS / GPM GRID</span>
          </div>
        </div>
      </div>

      {/* BOTTOM HUD: Coordinates & Quick Target Selectors */}
      <div className="relative z-10 pt-3 border-t border-panel-border/30 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Compass className="w-3.5 h-3.5 text-accent-cyan" />
          <span>HORN OF AFRICA OBSERVATION GRID</span>
          <span className="text-text-subtle">| 0.1° FLDAS NOAH (~10KM)</span>
        </div>

        {/* Target Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {targets.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTarget(t.id)}
              className={`px-2 py-0.5 rounded-md transition-all ${
                t.id === activeTarget
                  ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 font-bold"
                  : "bg-panel-dark text-text-secondary hover:text-text-primary border border-panel-border/30"
              }`}
            >
              {isAmharic ? t.nameAm.split(" ")[0] : t.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
