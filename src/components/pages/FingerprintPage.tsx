"use client";

import React, { useState } from "react";
import { translations, Language } from "@/data/translations";
import { MonthlyRecord, BORENA_CLIMATOLOGY } from "@/data/monthlyObservations";
import { evaluateDroughtFingerprint, DroughtPhase } from "@/lib/droughtEngine";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine,
  Cell 
} from "recharts";
import { 
  Droplets, 
  Wind, 
  Sprout, 
  Sliders, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Zap,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { RecoveryTracker } from "@/components/RecoveryTracker";

interface FingerprintPageProps {
  lang: Language;
  currentRecord: MonthlyRecord;
  records: MonthlyRecord[];
}

export const FingerprintPage: React.FC<FingerprintPageProps> = ({
  lang,
  currentRecord,
  records,
}) => {
  const t = translations[lang];
  const [threshold, setThreshold] = useState<number>(-1.0);

  const rainZ = currentRecord.rainfallZ ?? 0;
  const soilZ = currentRecord.soilMoistureZ ?? 0;
  const vegZ = currentRecord.ndviZ ?? 0;

  const diagnosis = evaluateDroughtFingerprint(rainZ, soilZ, vegZ, threshold);

  const mIdx = currentRecord.month - 1;
  const rainBaseline = BORENA_CLIMATOLOGY.rainfallMean[mIdx];
  const rainStd = BORENA_CLIMATOLOGY.rainfallStd[mIdx];
  const soilBaseline = BORENA_CLIMATOLOGY.soilMean[mIdx];
  const soilStd = BORENA_CLIMATOLOGY.soilStd[mIdx];
  const ndviBaseline = BORENA_CLIMATOLOGY.ndviMean[mIdx];
  const ndviStd = BORENA_CLIMATOLOGY.ndviStd[mIdx];

  // 36-month rolling window for charts
  const rollingData = records.slice(-36).map((r) => ({
    date: r.date,
    rainZ: r.rainfallZ ?? 0,
    soilZ: r.soilMoistureZ ?? 0,
    vegZ: r.ndviZ ?? 0,
    rainfallMm: r.rainfallMm,
    soilMoisture: r.soilMoistureM3M3,
    ndvi: r.ndvi,
  }));

  const isAmharic = lang === "am";

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2 font-mono">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl nasa-panel-blue border border-accent-secondary/35 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan animate-pulse" />
              <span className="text-xs tracking-widest text-accent-light uppercase">
                {isAmharic ? "የናሳ ስፔስ አፕስ ዋና የፈጠራ ውጤት" : "NASA SPACE APPS CORE INNOVATION"}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-wide">
              {t.nav.fingerprint}
            </h1>
            <p className="text-xs text-text-secondary mt-1 max-w-3xl leading-relaxed">
              {isAmharic
                ? "በቦረና ዞን፣ ኢትዮጵያ ውስጥ በዝናብ (የአየር ንብረት)፣ በአፈር እርጥበት (የውሃ ሃብት) እና በዕፅዋት ሽፋን (የግብርና) ልዩነቶች መካከል ያለውን መስተጋብርና የመዘግየት ልዩነት መመርመር።"
                : "Investigating the agreement and lag differences between rainfall (meteorological), soil moisture (hydrological), and vegetation health (agricultural) anomalies in Borena Zone, Ethiopia."}
            </p>
          </div>

          {/* Configurable Anomaly Threshold Slider */}
          <div className="p-3 rounded-2xl bg-panel-dark/90 border border-panel-border/40 min-w-[240px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-text-secondary flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-accent-cyan" />
                {isAmharic ? "የጉድለት ወሰን (τ):" : "Deficit Threshold (τ):"}
              </span>
              <span className="font-bold text-accent-cyan">{threshold.toFixed(1)} σ</span>
            </div>
            <input
              type="range"
              min={-2.0}
              max={-0.5}
              step={0.1}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
            />
            <div className="flex justify-between text-[9px] text-text-subtle mt-1">
              <span>{isAmharic ? "-2.0σ (ከፍተኛ)" : "-2.0σ (Extreme)"}</span>
              <span>{isAmharic ? "-1.0σ (መደበኛ)" : "-1.0σ (Standard)"}</span>
              <span>{isAmharic ? "-0.5σ (ቀላል)" : "-0.5σ (Mild)"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Independent Indicator Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* INDICATOR 1: RAINFALL ANOMALY */}
        <div className="p-5 rounded-3xl nasa-panel border border-panel-border/30 hover:border-accent-cyan/50 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-panel-border/30 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-accent-cyan/10 text-accent-cyan">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">
                    {isAmharic ? "1. የዝናብ መጠን ልዩነት" : "1. Rainfall Anomaly"}
                  </h3>
                  <span className="text-[10px] text-text-subtle">NASA GPM IMERG / FLDAS</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rainZ <= threshold ? 'bg-red-950/80 text-red-400 border border-red-500/40' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'}`}>
                {isAmharic ? (rainZ <= threshold ? 'ጉድለት' : 'መረጋጋት') : (rainZ <= threshold ? 'DEFICIT' : 'STABLE')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-2.5 rounded-xl bg-black/40 border border-panel-border/20">
                <span className="text-[10px] text-text-subtle block">
                  {isAmharic ? "የተመዘገበ ዝናብ" : "Observed Rain"}
                </span>
                <span className="text-base font-bold text-text-primary">{currentRecord.rainfallMm} mm</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-panel-border/20">
                <span className="text-[10px] text-text-subtle block">
                  {isAmharic ? "የወር አማካይ (μ)" : "Monthly Mean (μ)"}
                </span>
                <span className="text-base font-bold text-text-secondary">{rainBaseline} mm</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-panel-border/20">
                <span className="text-[10px] text-text-subtle block">
                  {isAmharic ? "መደበኛ ልዩነት (σ)" : "Std Dev (σ)"}
                </span>
                <span className="text-xs font-bold text-text-secondary">±{rainStd} mm</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-panel-border/20">
                <span className="text-[10px] text-text-subtle block">
                  {isAmharic ? "የተስተካከለ Z" : "Standardized Z"}
                </span>
                <span className={`text-base font-bold ${rainZ < -1 ? 'text-red-400' : 'text-accent-cyan'}`}>
                  {rainZ > 0 ? `+${rainZ}` : rainZ} σ
                </span>
              </div>
            </div>

            {/* Time-Series Chart */}
            <div className="h-32 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rollingData}>
                  <ReferenceLine y={0} stroke="#595C61" />
                  <ReferenceLine y={threshold} stroke="#EF4444" strokeDasharray="2 2" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[-3, 2.5]} tick={{ fill: "#595C61", fontSize: 8 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#162036", borderColor: "#28D7C5", fontSize: "10px" }}
                  />
                  <Bar dataKey="rainZ" fill="#28D7C5">
                    {rollingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.rainZ < threshold ? '#EF4444' : '#28D7C5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="text-[10px] text-text-subtle pt-2 border-t border-panel-border/20">
            {isAmharic ? "የአየር ሁኔታ ምልክት፡ ፈጣን የከባቢ አየር የዝናብ ምላሽ።" : "Meteorological signal: Immediate atmospheric precipitation response."}
          </div>
        </div>

        {/* INDICATOR 2: SOIL MOISTURE ANOMALY */}
        <div className="p-5 rounded-3xl nasa-panel border border-panel-border/30 hover:border-sky-400/50 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-panel-border/30 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-400/10 text-sky-400">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">
                    {isAmharic ? "2. የአፈር እርጥበት" : "2. Soil Moisture"}
                  </h3>
                  <span className="text-[10px] text-text-subtle">NASA FLDAS Noah LSM (0-100cm)</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${soilZ <= threshold ? 'bg-red-950/80 text-red-400 border border-red-500/40' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'}`}>
                {isAmharic ? (soilZ <= threshold ? 'የተሟጠጠ' : 'በቂ') : (soilZ <= threshold ? 'DEPLETED' : 'ADEQUATE')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-2.5 rounded-xl bg-black/40 border border-panel-border/20">
                <span className="text-[10px] text-text-subtle block">
                  {isAmharic ? "የተመዘገበ እርጥበት" : "Observed Volumetric"}
                </span>
                <span className="text-base font-bold text-text-primary">{currentRecord.soilMoistureM3M3} m³/m³</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-panel-border/20">
                <span className="text-[10px] text-text-subtle block">
                  {isAmharic ? "የወር አማካይ (μ)" : "Monthly Mean (μ)"}
                </span>
                <span className="text-base font-bold text-text-secondary">{soilBaseline} m³/m³</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-panel-border/20">
                <span className="text-[10px] text-text-subtle block">
                  {isAmharic ? "መደበኛ ልዩነት (σ)" : "Std Dev (σ)"}
                </span>
                <span className="text-xs font-bold text-text-secondary">±{soilStd} m³/m³</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-panel-border/20">
                <span className="text-[10px] text-text-subtle block">
                  {isAmharic ? "የተስተካከለ Z" : "Standardized Z"}
                </span>
                <span className={`text-base font-bold ${soilZ < -1 ? 'text-red-400' : 'text-sky-400'}`}>
                  {soilZ > 0 ? `+${soilZ}` : soilZ} σ
                </span>
              </div>
            </div>

            {/* Time-Series Chart */}
            <div className="h-32 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rollingData}>
                  <ReferenceLine y={0} stroke="#595C61" />
                  <ReferenceLine y={threshold} stroke="#EF4444" strokeDasharray="2 2" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[-3, 2.5]} tick={{ fill: "#595C61", fontSize: 8 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#162036", borderColor: "#38BDF8", fontSize: "10px" }}
                  />
                  <Bar dataKey="soilZ" fill="#38BDF8">
                    {rollingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.soilZ < threshold ? '#EF4444' : '#38BDF8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="text-[10px] text-text-subtle pt-2 border-t border-panel-border/20">
            {isAmharic ? "የውሃ ሃብት ምልክት፡ ለእፅዋት የሚገኝ ጥልቅ የስር ውኃ ክምችት።" : "Hydrological signal: Plant-available root water storage."}
          </div>
        </div>

        {/* INDICATOR 3: VEGETATION HEALTH (MODIS NDVI) */}
        <div className="p-5 rounded-3xl nasa-panel border border-panel-border/30 hover:border-amber-400/50 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-panel-border/30 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
                  <Sprout className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">
                    {isAmharic ? "3. የዕፅዋት ጤና" : "3. Vegetation Health"}
                  </h3>
                  <span className="text-[10px] text-text-subtle">NASA MODIS MOD13A2 NDVI</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${vegZ <= threshold ? 'bg-red-950/80 text-red-400 border border-red-500/40' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'}`}>
                {isAmharic ? (vegZ <= threshold ? 'መድረቅ/መክሰም' : 'ለምለም') : (vegZ <= threshold ? 'BROWNING' : 'VIGOR')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-2.5 rounded-xl bg-black/40 border border-panel-border/20">
                <span className="text-[10px] text-text-subtle block">
                  {isAmharic ? "የተመዘገበ NDVI" : "Observed NDVI"}
                </span>
                <span className="text-base font-bold text-text-primary">{currentRecord.ndvi}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-panel-border/20">
                <span className="text-[10px] text-text-subtle block">
                  {isAmharic ? "የወር አማካይ (μ)" : "Monthly Mean (μ)"}
                </span>
                <span className="text-base font-bold text-text-secondary">{ndviBaseline}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-panel-border/20">
                <span className="text-[10px] text-text-subtle block">
                  {isAmharic ? "መደበኛ ልዩነት (σ)" : "Std Dev (σ)"}
                </span>
                <span className="text-xs font-bold text-text-secondary">±{ndviStd}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-panel-border/20">
                <span className="text-[10px] text-text-subtle block">
                  {isAmharic ? "የተስተካከለ Z" : "Standardized Z"}
                </span>
                <span className={`text-base font-bold ${vegZ < -1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {vegZ > 0 ? `+${vegZ}` : vegZ} σ
                </span>
              </div>
            </div>

            {/* Time-Series Chart */}
            <div className="h-32 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rollingData}>
                  <ReferenceLine y={0} stroke="#595C61" />
                  <ReferenceLine y={threshold} stroke="#EF4444" strokeDasharray="2 2" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[-3, 2.5]} tick={{ fill: "#595C61", fontSize: 8 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#162036", borderColor: "#F59E0B", fontSize: "10px" }}
                  />
                  <Bar dataKey="vegZ" fill="#F59E0B">
                    {rollingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.vegZ < threshold ? '#EF4444' : '#F59E0B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="text-[10px] text-text-subtle pt-2 border-t border-panel-border/20">
            {isAmharic ? "የግብርና ምልክት፡ የዕፅዋት የፎቶሲንተሲስ አቅም እና የግጦሽ ሳር ሁኔታ።" : "Agricultural signal: Canopy photosynthetic capacity & rangeland forage."}
          </div>
        </div>
      </div>

      {/* COMBINED INTERPRETATION PANEL */}
      <div className="p-6 rounded-3xl nasa-panel-blue border border-accent-secondary/40 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-accent-cyan" />
              <h2 className="text-lg font-bold text-text-primary tracking-wide">
                {isAmharic ? "የድርቅ አሻራ ትንተና እና የመስተጋብር ማትሪክስ" : "Drought Fingerprint Interpretation & Decoupling Matrix"}
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-panel-dark/80 border border-panel-border/40 space-y-2">
              <div className="flex items-center justify-between border-b border-panel-border/30 pb-2">
                <span className="text-sm font-bold text-accent-cyan">
                  {isAmharic ? diagnosis.titleAmharic : diagnosis.title}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-accent-blue/30 text-accent-light">
                  {diagnosis.droughtType}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {isAmharic ? (diagnosis.summaryAmharic || diagnosis.scientificExplanation) : diagnosis.scientificExplanation}
              </p>
              <div className="pt-2 text-xs text-text-primary flex items-start gap-2">
                <span className="font-bold text-accent-light">
                  {isAmharic ? "በግጦሽ ላይ ያለው ተጽእኖ፡" : "Rangeland Impact:"}
                </span>
                <span className="text-text-secondary">{diagnosis.agriculturalImplication}</span>
              </div>
            </div>
          </div>

          {/* Exploratory Composite Index Card */}
          <div className="w-full lg:w-80 p-4 rounded-2xl bg-panel-dark/80 border border-panel-border/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text-primary">
                {isAmharic ? "የአካባቢ ጫና አመልካች" : "Exploratory Stress Index"}
              </span>
              <span className="text-[9px] text-accent-light px-1.5 py-0.5 rounded bg-accent-blue/20">
                {isAmharic ? "የሙከራ" : "EXPERIMENTAL"}
              </span>
            </div>

            <div className="text-center py-2">
              <span className={`text-3xl font-bold ${diagnosis.exploratoryCompositeIndex < -1 ? 'text-red-400' : 'text-accent-cyan'}`}>
                {diagnosis.exploratoryCompositeIndex > 0 ? `+${diagnosis.exploratoryCompositeIndex}` : diagnosis.exploratoryCompositeIndex}
              </span>
              <span className="text-[10px] text-text-subtle block mt-1">
                {isAmharic ? "ቀመር፡ 0.35(Z_ዝናብ) + 0.35(Z_አፈር) + 0.30(Z_ዕፅዋት)" : "Formula: 0.35(Z_rain) + 0.35(Z_soil) + 0.30(Z_veg)"}
              </span>
            </div>

            <p className="text-[10px] text-text-subtle leading-normal border-t border-panel-border/20 pt-2">
              {isAmharic
                ? "⚠️ ማሳሰቢያ፡ ይህ ስሌት ለሳይንሳዊ ምርምር ብቻ የቀረበ ሲሆን ይፋዊውን የኢትዮጵያ አደጋ ስጋት ስራ አመራር ውሳኔዎችን አይተካም።"
                : "⚠️ Disclaimer: This exploratory score is for scientific investigation only and does not supersede official Ethiopian disaster risk management mandates."}
            </p>
          </div>
        </div>
      </div>

      {/* DROUGHT RECOVERY TRACKER INTEGRATION */}
      <RecoveryTracker isAmharic={isAmharic} />
    </div>
  );
};
