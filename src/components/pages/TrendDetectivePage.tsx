"use client";

import React, { useState, useMemo } from "react";
import { translations, Language } from "@/data/translations";
import { MonthlyRecord, REGIONS_DATA } from "@/data/monthlyObservations";
import { calculateMannKendall, MannKendallResult } from "@/lib/stats";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine,
  CartesianGrid 
} from "recharts";
import { 
  Search, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Sliders, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Calculator,
  Compass
} from "lucide-react";

interface TrendDetectivePageProps {
  lang: Language;
}

export const TrendDetectivePage: React.FC<TrendDetectivePageProps> = ({ lang }) => {
  const t = translations[lang];

  // Filters state
  const [selectedRegionKey, setSelectedRegionKey] = useState<string>("borena");
  const [selectedVar, setSelectedVar] = useState<"rainfallMm" | "soilMoistureM3M3" | "ndvi" | "composite">("ndvi");
  const [periodPreset, setPeriodPreset] = useState<"full" | "recent" | "droughtEpoch">("full");
  const [aggregation, setAggregation] = useState<"monthly" | "annual">("annual");

  const regionData = REGIONS_DATA[selectedRegionKey] || REGIONS_DATA.borena;

  // Filter records by period
  const filteredRecords = useMemo(() => {
    let recs = [...regionData.records];
    if (periodPreset === "recent") {
      recs = recs.filter((r) => r.year >= 2010);
    } else if (periodPreset === "droughtEpoch") {
      recs = recs.filter((r) => r.year >= 2015 && r.year <= 2023);
    }
    return recs;
  }, [regionData, periodPreset]);

  // Extract values based on aggregation and variable
  const { chartData, mkResult, varName, unitLabel } = useMemo(() => {
    let name = "Vegetation Health (NDVI)";
    let unit = "";
    if (selectedVar === "rainfallMm") {
      name = "Precipitation Accumulation";
      unit = "mm";
    } else if (selectedVar === "soilMoistureM3M3") {
      name = "Root-Zone Soil Moisture";
      unit = "m³/m³";
    } else if (selectedVar === "composite") {
      name = "Standardized Anomaly (Z)";
      unit = "σ";
    }

    if (aggregation === "annual") {
      // Group by year
      const byYear = new Map<number, { sum: number; count: number }>();
      filteredRecords.forEach((r) => {
        let val = 0;
        if (selectedVar === "rainfallMm") val = r.rainfallMm;
        else if (selectedVar === "soilMoistureM3M3") val = r.soilMoistureM3M3;
        else if (selectedVar === "ndvi") val = r.ndvi;
        else val = ((r.rainfallZ ?? 0) + (r.soilMoistureZ ?? 0) + (r.ndviZ ?? 0)) / 3;

        const curr = byYear.get(r.year) || { sum: 0, count: 0 };
        byYear.set(r.year, { sum: curr.sum + val, count: curr.count + 1 });
      });

      const years = Array.from(byYear.keys()).sort((a, b) => a - b);
      const rawVals: number[] = [];
      const data = years.map((y, idx) => {
        const item = byYear.get(y)!;
        const meanVal = selectedVar === "rainfallMm" ? item.sum : item.sum / item.count;
        const rounded = Number(meanVal.toFixed(selectedVar === "rainfallMm" ? 1 : 4));
        rawVals.push(rounded);
        return {
          timeLabel: `${y}`,
          observed: rounded,
          index: idx,
        };
      });

      const mk = calculateMannKendall(rawVals);

      // Add Sen's slope trend line
      const dataWithTrend = data.map((d) => ({
        ...d,
        trendline: Number((mk.intercept + mk.sensSlope * d.index).toFixed(4)),
      }));

      return { chartData: dataWithTrend, mkResult: mk, varName: name, unitLabel: unit };
    } else {
      // Monthly values
      const rawVals: number[] = [];
      const data = filteredRecords.map((r, idx) => {
        let val = 0;
        if (selectedVar === "rainfallMm") val = r.rainfallMm;
        else if (selectedVar === "soilMoistureM3M3") val = r.soilMoistureM3M3;
        else if (selectedVar === "ndvi") val = r.ndvi;
        else val = ((r.rainfallZ ?? 0) + (r.soilMoistureZ ?? 0) + (r.ndviZ ?? 0)) / 3;

        const rounded = Number(val.toFixed(selectedVar === "rainfallMm" ? 1 : 4));
        rawVals.push(rounded);
        return {
          timeLabel: r.date,
          observed: rounded,
          index: idx,
        };
      });

      const mk = calculateMannKendall(rawVals);

      const dataWithTrend = data.map((d) => ({
        ...d,
        trendline: Number((mk.intercept + mk.sensSlope * d.index).toFixed(4)),
      }));

      return { chartData: dataWithTrend, mkResult: mk, varName: name, unitLabel: unit };
    }
  }, [filteredRecords, selectedVar, aggregation]);

  // Dynamically constructed scientific deduction sentence
  const isAmharic = lang === "am";

  const dynamicSynthesisText = useMemo(() => {
    if (isAmharic) {
      const periodStr =
        periodPreset === "full"
          ? "ከ2000 እስከ 2024 (የ24 ዓመታት ማህደር)"
          : periodPreset === "recent"
          ? "ከ2010 እስከ 2024 (የቅርብ ጊዜ ለውጦች)"
          : "ከ2015 እስከ 2023 (የኤል ኒኞ እና የድርቅ ወቅት)";
      const dir =
        mkResult.trend === "decreasing"
          ? "የመቀነስና የመድረቅ አዝማሚያ"
          : mkResult.trend === "increasing"
          ? "የማደግና የመጨመር አዝማሚያ"
          : "ግልጽ የሆነ ቀጣይነት ያለው ለውጥ የሌለበት ሁኔታ";
      const sigText = mkResult.significant
        ? `አዝማሚያው በስታትስቲክስ የተረጋገጠ እና ሳይንሳዊ አስተማማኝነት ያለው ነው (p = ${mkResult.pValue}፣ Mann-Kendall ነጥብ S = ${mkResult.S}፣ የተቀናጀ Z = ${mkResult.zScore}፣ α = 0.05)።`
        : `የታየው አዝማሚያ በ95% የመተማመኛ ደረጃ ላይ ስታትስቲካዊ አስተማማኝነት የለውም (p = ${mkResult.pValue}፣ S = ${mkResult.S})።`;
      const vName =
        selectedVar === "rainfallMm"
          ? "የዝናብ ክምችት"
          : selectedVar === "soilMoistureM3M3"
          ? "ጥልቅ የአፈር እርጥበት"
          : selectedVar === "composite"
          ? "የተቀናጀ የድርቅ ልዩነት"
          : "የዕፅዋት ሽፋን (NDVI)";
      const rName =
        selectedRegionKey === "borena"
          ? "በቦረና ዞን (ኦሮሚያ)"
          : selectedRegionKey === "somali"
          ? "በሶማሊ ክልል (ፋፈን)"
          : "በትግራይ ክልል (መካከለኛ)";
      return `${rName} ውስጥ የ${vName} ምልከታዎች በ${periodStr} ጊዜ ውስጥ ${dir} ያሳያሉ። የተገመተው የለውጥ ፍጥነት (Sen's slope)፡ ${mkResult.sensSlope > 0 ? "+" : ""}${mkResult.sensSlope} ${unitLabel}/${aggregation === "annual" ? "በዓመት" : "በወር"} ነው። ${sigText}`;
    }

    const periodStr =
      periodPreset === "full"
        ? "2000–2024"
        : periodPreset === "recent"
        ? "2010–2024"
        : "2015–2023 (Drought Epoch)";
    const dir =
      mkResult.trend === "decreasing"
        ? "a declining trend"
        : mkResult.trend === "increasing"
        ? "an increasing upward trend"
        : "no monotonic trend";
    const sigText = mkResult.significant
      ? `The trend is statistically significant (p = ${mkResult.pValue}, Mann-Kendall score S = ${mkResult.S}, standardized Z = ${mkResult.zScore}, α = 0.05).`
      : `The observed trajectory lacks statistical significance at the 95% confidence level (p = ${mkResult.pValue}, S = ${mkResult.S}).`;

    return `${varName} observations in ${regionData.regionName} demonstrate ${dir} across the ${periodStr} observation period. Estimated rate of change (Sen's slope): ${mkResult.sensSlope > 0 ? "+" : ""}${mkResult.sensSlope} ${unitLabel}/${aggregation === "annual" ? "year" : "month"}. ${sigText}`;
  }, [isAmharic, varName, regionData.regionName, periodPreset, mkResult, unitLabel, aggregation, selectedVar, selectedRegionKey]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2 font-mono">
      {/* Page Header */}
      <div className="p-6 rounded-3xl nasa-panel-blue border border-accent-secondary/35 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-4 h-4 text-accent-cyan" />
              <span className="text-xs tracking-widest text-accent-light uppercase">
                {isAmharic ? "የናሳ ስፔስ አፕስ ውድድር — የምድር ስነ-ምህዳር ለውጥ መርማሪ!" : "NASA SPACE APPS CHALLENGE — BE AN EARTH SYSTEM TREND DETECTIVE!"}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-wide">
              {t.trendDetective.title}
            </h1>
            <p className="text-xs text-text-secondary mt-1 max-w-3xl leading-relaxed">
              {t.trendDetective.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-panel-dark/80 border border-panel-border/30 text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isAmharic ? "ትክክለኛ የሳተላይት ስሌት" : "REAL DATA CALCULATION"}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Variable, Region, Period, Aggregation */}
      <div className="p-4 rounded-2xl nasa-panel border border-panel-border/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Variable */}
        <div>
          <label className="text-[10px] text-text-subtle uppercase block mb-1">
            {t.trendDetective.variableSelect}
          </label>
          <select
            value={selectedVar}
            onChange={(e) => setSelectedVar(e.target.value as any)}
            className="w-full p-2 rounded-xl bg-panel-dark border border-panel-border/40 text-text-primary font-mono focus:border-accent-cyan focus:outline-none"
          >
            <option value="ndvi">{isAmharic ? "የዕፅዋት ሽፋን (MODIS NDVI)" : "Vegetation Health (MODIS NDVI)"}</option>
            <option value="soilMoistureM3M3">{isAmharic ? "የአፈር እርጥበት (FLDAS Noah 0-100cm)" : "Soil Moisture (FLDAS Noah 0-100cm)"}</option>
            <option value="rainfallMm">{isAmharic ? "የዝናብ መጠን (GPM IMERG mm)" : "Precipitation (GPM IMERG mm)"}</option>
            <option value="composite">{isAmharic ? "የተቀናጀ ልዩነት (Z-score)" : "Compound Anomaly (Z-score)"}</option>
          </select>
        </div>

        {/* Region */}
        <div>
          <label className="text-[10px] text-text-subtle uppercase block mb-1">
            {t.trendDetective.regionSelect}
          </label>
          <select
            value={selectedRegionKey}
            onChange={(e) => setSelectedRegionKey(e.target.value)}
            className="w-full p-2 rounded-xl bg-panel-dark border border-panel-border/40 text-text-primary font-mono focus:border-accent-cyan focus:outline-none"
          >
            <option value="borena">{isAmharic ? "ቦረና ዞን፣ ኦሮሚያ (አርብቶ አደር)" : "Borena Zone, Oromia (Pastoral)"}</option>
            <option value="somali">{isAmharic ? "ሶማሊ ክልል፣ ፋፈን (ቆላማ ደረቅ)" : "Somali Region, Fafan (Lowland Arid)"}</option>
            <option value="tigray">{isAmharic ? "ትግራይ ክልል፣ መካከለኛ (ደጋማ)" : "Tigray Region, Central (Highland)"}</option>
          </select>
        </div>

        {/* Period */}
        <div>
          <label className="text-[10px] text-text-subtle uppercase block mb-1">
            {t.trendDetective.periodSelect}
          </label>
          <select
            value={periodPreset}
            onChange={(e) => setPeriodPreset(e.target.value as any)}
            className="w-full p-2 rounded-xl bg-panel-dark border border-panel-border/40 text-text-primary font-mono focus:border-accent-cyan focus:outline-none"
          >
            <option value="full">{isAmharic ? "2000–2024 (ሙሉ የ24 ዓመት ማህደር)" : "2000–2024 (Full 24-Year Archive)"}</option>
            <option value="recent">{isAmharic ? "2010–2024 (የቅርብ ጊዜ ለውጦች)" : "2010–2024 (Recent Shifts)"}</option>
            <option value="droughtEpoch">{isAmharic ? "2015–2023 (የኤል ኒኞ እና የድርቅ ወቅት)" : "2015–2023 (El Niño & Drought Epoch)"}</option>
          </select>
        </div>

        {/* Aggregation */}
        <div>
          <label className="text-[10px] text-text-subtle uppercase block mb-1">
            {t.trendDetective.aggregation}
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-panel-dark border border-panel-border/40">
            <button
              onClick={() => setAggregation("annual")}
              className={`py-1 text-center rounded-lg transition-all ${
                aggregation === "annual" ? "bg-accent-blue text-white font-bold" : "text-text-secondary"
              }`}
            >
              {isAmharic ? "ዓመታዊ አማካይ" : "Annual Mean"}
            </button>
            <button
              onClick={() => setAggregation("monthly")}
              className={`py-1 text-center rounded-lg transition-all ${
                aggregation === "monthly" ? "bg-accent-blue text-white font-bold" : "text-text-secondary"
              }`}
            >
              {isAmharic ? "ወርሃዊ" : "Monthly"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Trend Time-Series Chart */}
      <div className="p-6 rounded-3xl nasa-panel border border-panel-border/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-panel-border/30 gap-2">
          <div>
            <h2 className="text-base font-bold text-text-primary tracking-wide">
              {varName} — {isAmharic ? "ታሪካዊ የለውጥ ሂደትና የቴይል-ሴን ሬግሬሽን" : "Historical Trajectory & Theil-Sen Regression"}
            </h2>
            <span className="text-[11px] text-text-secondary">
              {isAmharic ? "የተመዘገቡ የመረጃ ነጥቦች ከ Sen's slope አማካይ መስመር ጋር" : "Observed data points with non-parametric Sen's slope line overlay"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-accent-cyan font-bold">
              <span className="w-3 h-0.5 bg-accent-cyan" /> {isAmharic ? "የተመዘገቡ ዋጋዎች" : "Observed Values"}
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-3 h-0.5 bg-amber-400 border-dashed" /> {isAmharic ? "የለውጥ ፍጥነት" : "Sen's Slope"}
            </span>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#162036" />
              <XAxis dataKey="timeLabel" tick={{ fill: "#999CA0", fontSize: 10 }} interval={aggregation === "monthly" ? 24 : 2} />
              <YAxis tick={{ fill: "#999CA0", fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(22, 33, 56, 0.95)",
                  borderColor: "rgba(115, 151, 189, 0.4)",
                  borderRadius: "1rem",
                  fontSize: "11px",
                  fontFamily: "monospace",
                }}
              />
              <Line
                type="monotone"
                dataKey="observed"
                stroke="#28D7C5"
                strokeWidth={2}
                dot={{ r: aggregation === "annual" ? 3 : 1, fill: "#28D7C5" }}
                name={isAmharic ? "የተመዘገበ" : "Observed"}
              />
              <Line
                type="linear"
                dataKey="trendline"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                name={isAmharic ? "የለውጥ መስመር" : "Sen's Slope"}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistical Results & Hypothesis Verdict */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sen's Slope */}
        <div className="p-4 rounded-2xl nasa-panel border border-panel-border/30">
          <span className="text-[10px] text-text-subtle uppercase block mb-1">
            {isAmharic ? "የለውጥ ፍጥነት (Sen's Slope)" : "Estimated Rate (Sen's Slope)"}
          </span>
          <div className="text-xl font-bold font-mono text-text-primary">
            {mkResult.sensSlope > 0 ? `+${mkResult.sensSlope}` : mkResult.sensSlope}
          </div>
          <span className="text-[10px] text-text-secondary mt-1 block">
            {unitLabel} {isAmharic ? (aggregation === "annual" ? "በዓመት" : "በወር") : `per ${aggregation === "annual" ? "year" : "month"}`}
          </span>
        </div>

        {/* Mann-Kendall S */}
        <div className="p-4 rounded-2xl nasa-panel border border-panel-border/30">
          <span className="text-[10px] text-text-subtle uppercase block mb-1">
            {isAmharic ? "የ Mann-Kendall ነጥብ (S)" : "Mann-Kendall Score (S)"}
          </span>
          <div className="text-xl font-bold font-mono text-text-primary">
            {mkResult.S}
          </div>
          <span className="text-[10px] text-text-secondary mt-1 block">
            Var(S): {mkResult.varS} • Z: {mkResult.zScore}
          </span>
        </div>

        {/* P-Value */}
        <div className="p-4 rounded-2xl nasa-panel border border-panel-border/30">
          <span className="text-[10px] text-text-subtle uppercase block mb-1">
            {isAmharic ? "የ p-እሴት ውጤት" : "Statistical P-Value"}
          </span>
          <div className="text-xl font-bold font-mono text-accent-cyan">
            p = {mkResult.pValue}
          </div>
          <span className="text-[10px] text-text-secondary mt-1 block">
            {isAmharic ? "ባለ ሁለት ጫፍ ስሌት (CDF)" : "Two-tailed normal CDF"}
          </span>
        </div>

        {/* Significance */}
        <div className="p-4 rounded-2xl nasa-panel border border-panel-border/30">
          <span className="text-[10px] text-text-subtle uppercase block mb-1">
            {isAmharic ? "ሳይንሳዊ አስተማማኝነት (α = 0.05)" : "Significance (α = 0.05)"}
          </span>
          <div className={`text-base font-bold font-mono ${mkResult.significant ? 'text-emerald-400' : 'text-text-secondary'}`}>
            {mkResult.significant
              ? (isAmharic ? "አስተማማኝ አዝማሚያ" : "Statistically Significant")
              : (isAmharic ? "አስተማማኝ ያልሆነ" : "Not Significant")}
          </div>
          <span className="text-[10px] text-text-secondary mt-1 block">
            {mkResult.significanceLevel}
          </span>
        </div>
      </div>

      {/* Dynamic Narrative Hypothesis Result */}
      <div className="p-5 rounded-3xl nasa-panel-blue border border-accent-secondary/40 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-accent-cyan text-xs font-bold uppercase tracking-wider">
          <Calculator className="w-4 h-4" />
          <span>{isAmharic ? "የተቀናጀ ሳይንሳዊ የአዝማሚያ ድምዳሜ" : "Dynamic Scientific Hypothesis Synthesis"}</span>
        </div>
        <p className="text-sm text-text-primary leading-relaxed">
          &ldquo;{dynamicSynthesisText}&rdquo;
        </p>
      </div>

      {/* Methodological Explanations & Statistical Limitations */}
      <div className="p-5 rounded-3xl nasa-panel border border-panel-border/30 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-text-subtle uppercase font-bold text-[10px]">
          <Info className="w-3.5 h-3.5" />
          <span>{isAmharic ? "ስነ-ዘዴያዊ ማብራሪያና ስታትስቲካዊ ጥንካሬ" : "Methodological Explanation & Statistical Rigor"}</span>
        </div>
        <p className="text-text-secondary leading-relaxed text-[11px]">
          {isAmharic ? (
            <>
              የ <strong>Mann-Kendall ስሌት</strong> በጊዜ ሂደት ወጥ የሆነ የጭማሪ ወይም የቅናሽ አዝማሚያ መኖሩን ለመለካት የሚያገለግል የማይዛባ ስታትስቲካዊ ፈተና ነው። ከቀጥተኛ የመስመር ስሌት (OLS) በተለየ መልኩ፣ መረጃው መደበኛ ስርጭትን እንዲከተል አይፈልግም፤ እንዲሁም አልፎ አልፎ ለሚከሰቱ ያልተለመዱ የአየር ሁኔታዎች ተጋላጭ አይደለም። የ <strong>Sen&apos;s slope</strong> ስሌት የለውጡን አማካይ ፍጥነት ያሰላል፡ Q = median((x_j - x_i) / (j - i))። ዓመታዊ አማካይን መጠቀም ወቅታዊ መዋዠቆችን ያስወግዳል።
            </>
          ) : (
            <>
              The <strong>Mann-Kendall test</strong> is a non-parametric test that assesses whether a monotonic upward or downward trend exists over time. Unlike ordinary least squares (OLS) regression, Mann-Kendall does not assume normally distributed data and is immune to extreme non-climatic outliers. <strong>Sen&apos;s slope</strong> determines the median of all pairwise slopes: Q = median((x_j - x_i) / (j - i)), making it resilient against localized missing values or sensor noise. Annual aggregation eliminates seasonal autocorrelation bias.
            </>
          )}
        </p>
      </div>
    </div>
  );
};
