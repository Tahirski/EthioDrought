"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { Language } from "@/data/translations";
import { REGIONS_DATA, MonthlyRecord } from "@/data/monthlyObservations";
import { evaluateDroughtFingerprint, FingerprintDiagnosis } from "@/lib/droughtEngine";
import { calculateMannKendall, MannKendallResult } from "@/lib/stats";
import { generateScientificExplanation } from "@/lib/aiExplainer";

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  customRecords: MonthlyRecord[] | null;
  setCustomRecords: (records: MonthlyRecord[] | null) => void;
  datasetName: string;
  setDatasetName: (name: string) => void;
  activeRecords: MonthlyRecord[];
  timelineIndex: number;
  setTimelineIndex: React.Dispatch<React.SetStateAction<number>>;
  currentRecord: MonthlyRecord;
  rainZ: number;
  soilZ: number;
  vegZ: number;
  diagnosis: FingerprintDiagnosis;
  trendResult: MannKendallResult;
  scientificExplanation: { english: string; amharic: string };
  jumpToEvent: (year: number, month: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const [selectedRegionId, setSelectedRegionId] = useState<string>("borena");
  const [customRecords, setCustomRecords] = useState<MonthlyRecord[] | null>(null);
  const [datasetName, setDatasetName] = useState<string>("Demonstration Calibrated");

  const activeRecords = useMemo(() => {
    if (customRecords) return customRecords;
    return REGIONS_DATA[selectedRegionId]?.records || REGIONS_DATA.borena.records;
  }, [customRecords, selectedRegionId]);

  const [timelineIndex, setTimelineIndex] = useState<number>(activeRecords.length - 1);

  // Keep timeline index within bounds
  const safeIdx = Math.min(Math.max(0, timelineIndex), activeRecords.length - 1);
  const currentRecord = activeRecords[safeIdx] || activeRecords[activeRecords.length - 1];

  const rainZ = currentRecord?.rainfallZ ?? -1.82;
  const soilZ = currentRecord?.soilMoistureZ ?? -2.14;
  const vegZ = currentRecord?.ndviZ ?? -1.65;

  const diagnosis = useMemo(() => {
    return evaluateDroughtFingerprint(rainZ, soilZ, vegZ, -1.0);
  }, [rainZ, soilZ, vegZ]);

  const trendResult = useMemo(() => {
    const ndviVals = activeRecords.map((r) => r.ndvi);
    return calculateMannKendall(ndviVals);
  }, [activeRecords]);

  const scientificExplanation = useMemo(() => {
    const regionName = selectedRegionId === "borena" ? "Borena Zone" : selectedRegionId === "somali" ? "Somali Region" : "Tigray Region";
    return generateScientificExplanation({
      regionName,
      variableName: "Canopy Greenness (NDVI)",
      dateStr: currentRecord?.date || "2024-11",
      rainfallZ: rainZ,
      soilZ: soilZ,
      vegZ: vegZ,
      diagnosis,
      trendResult,
      periodLabel: customRecords ? "user-uploaded series (not independently verified)" : "synthetic demonstration series (not satellite observations)",
    });
  }, [selectedRegionId, currentRecord, rainZ, soilZ, vegZ, diagnosis, trendResult, customRecords]);

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "am" : "en"));
  };

  const jumpToEvent = (year: number, month: number) => {
    const idx = activeRecords.findIndex((r) => r.year === year && r.month === month);
    if (idx !== -1) {
      setTimelineIndex(idx);
    }
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        selectedRegionId,
        setSelectedRegionId,
        customRecords,
        setCustomRecords,
        datasetName,
        setDatasetName,
        activeRecords,
        timelineIndex: safeIdx,
        setTimelineIndex,
        currentRecord,
        rainZ,
        soilZ,
        vegZ,
        diagnosis,
        trendResult,
        scientificExplanation,
        jumpToEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
