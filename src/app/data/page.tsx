"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { translations } from "@/data/translations";
import { CsvUploadModal } from "@/components/CsvUploadModal";
import { ReportExportModal } from "@/components/ReportExportModal";
import { MonthlyRecord } from "@/data/monthlyObservations";
import {
  Database,
  FileUp,
  Download,
  ExternalLink,
  Table,
  FileText,
} from "lucide-react";

export default function DataRoute() {
  const {
    lang,
    selectedRegionId,
    currentRecord,
    rainZ,
    soilZ,
    vegZ,
    diagnosis,
    trendResult,
    setCustomRecords,
    setDatasetName,
  } = useApp();
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<"catalog" | "export">("catalog");
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const regionName =
    selectedRegionId === "borena"
      ? "Borena Zone, Oromia"
      : selectedRegionId === "somali"
      ? "Somali Region"
      : "Tigray Region";

  const handleDataLoaded = (records: MonthlyRecord[], name: string) => {
    setCustomRecords(records);
    setDatasetName(name);
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 lg:px-8 py-6 space-y-6 font-mono">
      {/* Page Header */}
      <div className="p-6 rounded-3xl nasa-panel-blue border border-accent-secondary/35 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-accent-cyan" />
              <span className="text-xs tracking-widest text-accent-light uppercase">
                SCIENTIFIC DATA MANAGEMENT
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-wide">
              Data Explorer &amp; Scientific Reports
            </h1>
            <p className="text-xs text-text-secondary mt-1 max-w-3xl leading-relaxed">
              Access NASA satellite dataset catalogs, upload custom CSV
              environmental data for validation, and export comprehensive
              scientific reports.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 bg-panel-dark/80 p-1.5 rounded-full border border-panel-border/40 w-fit">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-5 py-2 text-xs font-medium rounded-full transition-all duration-200 tracking-wider ${
            activeTab === "catalog"
              ? "nasa-active-pill font-semibold"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          }`}
        >
          <span className="flex items-center gap-2">
            <Table className="w-3.5 h-3.5" />
            NASA Data Catalog &amp; CSV Upload
          </span>
        </button>
        <button
          onClick={() => setActiveTab("export")}
          className={`px-5 py-2 text-xs font-medium rounded-full transition-all duration-200 tracking-wider ${
            activeTab === "export"
              ? "nasa-active-pill font-semibold"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            Scientific Report Export
          </span>
        </button>
      </div>

      {/* TAB A: NASA Dataset Catalog & CSV Upload */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* NASA Dataset Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* FLDAS */}
            <div className="p-5 rounded-3xl nasa-panel border border-panel-border/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-panel-border/30">
                  <span className="font-bold text-sky-400 text-sm">
                    NASA FLDAS Noah LSM
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/40">
                    0.1° (~10km)
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
                  Famine Land Data Assimilation System. Simulates root-zone soil
                  water storage (0-100cm) for drought early warning across
                  Africa.
                </p>
                <div className="space-y-1 text-[10px] text-text-subtle">
                  <div>Variable: Soil Moisture Content (m³/m³)</div>
                  <div>Temporal: Monthly (1982–Present)</div>
                  <div>Model: Noah Land Surface Model 3.6.1</div>
                </div>
              </div>
              <a
                href="https://ldas.gsfc.nasa.gov/fldas"
                target="_blank"
                rel="noreferrer"
                className="mt-4 text-accent-cyan hover:underline flex items-center gap-1 text-[10px]"
              >
                ldas.gsfc.nasa.gov/fldas
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* GPM IMERG */}
            <div className="p-5 rounded-3xl nasa-panel border border-panel-border/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-panel-border/30">
                  <span className="font-bold text-accent-cyan text-sm">
                    NASA GPM IMERG
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                    0.1° (~10km)
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
                  Global Precipitation Measurement Integrated Multi-satellitE
                  Retrievals. Final Run V07 monthly precipitation accumulation.
                </p>
                <div className="space-y-1 text-[10px] text-text-subtle">
                  <div>Variable: Precipitation (mm/month)</div>
                  <div>Temporal: Monthly (2000–Present)</div>
                  <div>Sensor: DPR &amp; Radiometer Constellation</div>
                </div>
              </div>
              <a
                href="https://gpm.nasa.gov/data"
                target="_blank"
                rel="noreferrer"
                className="mt-4 text-accent-cyan hover:underline flex items-center gap-1 text-[10px]"
              >
                gpm.nasa.gov/data
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* MODIS NDVI */}
            <div className="p-5 rounded-3xl nasa-panel border border-panel-border/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-panel-border/30">
                  <span className="font-bold text-emerald-400 text-sm">
                    NASA MODIS Terra/Aqua
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                    1km / 0.05°
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
                  MOD13A2 / MYD13A2 composites of Normalized Difference
                  Vegetation Index monitoring rangeland canopy greenness.
                </p>
                <div className="space-y-1 text-[10px] text-text-subtle">
                  <div>Variable: NDVI (dimensionless)</div>
                  <div>Temporal: 16-Day / Monthly (2000–Present)</div>
                  <div>Sensor: MODIS Spectroradiometer</div>
                </div>
              </div>
              <a
                href="https://modis.gsfc.nasa.gov/data/"
                target="_blank"
                rel="noreferrer"
                className="mt-4 text-accent-cyan hover:underline flex items-center gap-1 text-[10px]"
              >
                modis.gsfc.nasa.gov/data
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* CSV Upload Section */}
          <div className="p-6 rounded-3xl nasa-panel border border-panel-border/30">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-accent-cyan" />
                  Custom CSV Data Ingestion
                </h2>
                <p className="text-xs text-text-secondary mt-1 max-w-2xl leading-relaxed">
                  Upload your own environmental CSV dataset for validation and
                  analysis. The file must contain columns: year, month,
                  rainfallMm, soilMoistureM3M3, ndvi. Standardized anomalies
                  will be computed automatically.
                </p>
              </div>
              <button
                onClick={() => setIsCsvOpen(true)}
                className="px-5 py-2.5 rounded-full bg-accent-cyan text-[#040507] font-bold text-xs tracking-wider hover:bg-accent-cyan/90 transition-colors flex items-center gap-2"
              >
                <FileUp className="w-4 h-4" />
                Upload CSV File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: Scientific Report Export */}
      {activeTab === "export" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl nasa-panel-blue border border-accent-secondary/40 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Download className="w-5 h-5 text-accent-cyan" />
                  Generate Scientific Report
                </h2>
                <p className="text-xs text-text-secondary max-w-2xl leading-relaxed">
                  Export a comprehensive scientific drought assessment report
                  containing current satellite observations, standardized
                  anomalies, Drought Fingerprint diagnosis, Mann-Kendall trend
                  statistics, and dynamic scientific narrative.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-panel-dark/80 border border-panel-border/30">
                    <span className="text-[10px] text-text-subtle block">
                      Region
                    </span>
                    <span className="font-bold text-text-primary">
                      {regionName}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-panel-dark/80 border border-panel-border/30">
                    <span className="text-[10px] text-text-subtle block">
                      Observation
                    </span>
                    <span className="font-bold text-text-primary">
                      {currentRecord?.date || "2024-11"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-panel-dark/80 border border-panel-border/30">
                    <span className="text-[10px] text-text-subtle block">
                      Diagnosis
                    </span>
                    <span className="font-bold text-accent-cyan">
                      {diagnosis.title}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-panel-dark/80 border border-panel-border/30">
                    <span className="text-[10px] text-text-subtle block">
                      Formats
                    </span>
                    <span className="font-bold text-text-primary">
                      PDF / JSON
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsReportOpen(true)}
                className="px-5 py-2.5 rounded-full bg-accent-cyan text-[#040507] font-bold text-xs tracking-wider hover:bg-accent-cyan/90 transition-colors flex items-center gap-2 shrink-0"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Report Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl nasa-panel border border-panel-border/30">
              <h3 className="font-bold text-sm text-text-primary mb-2">
                Current Anomalies
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Rainfall Z</span>
                  <span
                    className={`font-bold ${
                      rainZ < -1 ? "text-red-400" : "text-accent-cyan"
                    }`}
                  >
                    {rainZ > 0 ? `+${rainZ}` : rainZ} σ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Soil Moisture Z</span>
                  <span
                    className={`font-bold ${
                      soilZ < -1 ? "text-red-400" : "text-sky-400"
                    }`}
                  >
                    {soilZ > 0 ? `+${soilZ}` : soilZ} σ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Vegetation Z</span>
                  <span
                    className={`font-bold ${
                      vegZ < -1 ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {vegZ > 0 ? `+${vegZ}` : vegZ} σ
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl nasa-panel border border-panel-border/30">
              <h3 className="font-bold text-sm text-text-primary mb-2">
                Trend Statistics
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">{"Sen's Slope"}</span>
                  <span className="font-bold text-text-primary">
                    {trendResult.sensSlope}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">P-Value</span>
                  <span className="font-bold text-accent-cyan">
                    {trendResult.pValue}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Significant</span>
                  <span
                    className={`font-bold ${
                      trendResult.significant
                        ? "text-emerald-400"
                        : "text-text-subtle"
                    }`}
                  >
                    {trendResult.significant ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl nasa-panel border border-panel-border/30">
              <h3 className="font-bold text-sm text-text-primary mb-2">
                Fingerprint Diagnosis
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Type</span>
                  <span className="font-bold text-accent-cyan">
                    {diagnosis.droughtType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Composite Index</span>
                  <span
                    className={`font-bold ${
                      diagnosis.exploratoryCompositeIndex < -1
                        ? "text-red-400"
                        : "text-text-primary"
                    }`}
                  >
                    {diagnosis.exploratoryCompositeIndex}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CsvUploadModal
        isOpen={isCsvOpen}
        onClose={() => setIsCsvOpen(false)}
        onDataLoaded={handleDataLoaded}
      />

      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        regionName={regionName}
        observationDate={currentRecord?.date || "2024-11"}
        rainfallZ={rainZ}
        soilZ={soilZ}
        vegZ={vegZ}
        diagnosis={diagnosis}
        trendResult={trendResult}
      />
    </div>
  );
}
