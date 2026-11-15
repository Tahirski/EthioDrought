"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useApp } from "@/context/AppContext";
import { CsvUploadModal } from "@/components/CsvUploadModal";
import { ReportExportModal } from "@/components/ReportExportModal";
import { MonthlyRecord } from "@/data/monthlyObservations";
import { DATASETS, DATA_SOURCE_REFERENCES } from "@/lib/backend/catalog";
import { NasaPowerDataPanel } from "@/components/NasaPowerDataPanel";
import {
  Database,
  FileUp,
  Download,
  ExternalLink,
  Table,
  FileText,
} from "lucide-react";

const ZoneDatasetOverlay = dynamic(
  () => import("@/components/ZoneDatasetOverlay").then((module) => ({ default: module.ZoneDatasetOverlay })),
  { ssr: false, loading: () => <div className="h-[480px] animate-pulse rounded-3xl bg-panel-dark" /> },
);

export default function DataRoute() {
  const {
    selectedRegionId,
    customRecords,
    datasetName,
    currentRecord,
    rainZ,
    soilZ,
    vegZ,
    diagnosis,
    trendResult,
    setCustomRecords,
    setDatasetName,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"catalog" | "export">("catalog");
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const regionName =
    selectedRegionId === "borena"
      ? "Borena Zone, Oromia"
      : selectedRegionId === "somali"
      ? "Somali Region"
      : "Tigray Region";
  const reportDataStatus = customRecords ? "user_uploaded_unverified" : "synthetic_demonstration";

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
              Data Sources &amp; Exploratory Reports
            </h1>
            <p className="text-xs text-text-secondary mt-1 max-w-3xl leading-relaxed">
              Browse live NASA POWER / MERRA-2 data for a representative point in Borena and spatial summaries of the supplied 72-zone grids. No verified zone-by-month rainfall or soil-moisture series is available for forecasting.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <NasaPowerDataPanel />
      <ZoneDatasetOverlay />

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
            Data sources &amp; CSV upload
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
            Exploratory Report Export
          </span>
        </button>
      </div>

      {/* TAB A: Source Registry & CSV Upload */}
      {activeTab === "catalog" && (
        <div className="space-y-8">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-text-primary uppercase tracking-wider">Dataset &amp; service registry</h2>
              <p className="mt-1 text-xs text-text-secondary">A registry entry is not evidence that a source has been queried, validated, or integrated.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {DATASETS.map((dataset) => (
                <article key={dataset.id} className="p-5 rounded-2xl nasa-panel border border-panel-border/40 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-text-primary">{dataset.name}</h3>
                      <p className="text-[10px] text-text-subtle mt-1">{dataset.provider} · {dataset.productIdentifier ?? "Product not selected"}</p>
                    </div>
                    <span className="shrink-0 px-2 py-1 rounded-full text-[9px] font-mono uppercase bg-amber-500/10 text-amber-200 border border-amber-500/30">
                      {dataset.integrationStatus.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">{dataset.variable}</p>
                  <dl className="grid grid-cols-2 gap-2 text-[10px]">
                    <div><dt className="text-text-subtle">Units</dt><dd className="text-text-primary">{dataset.units ?? "Not applicable / not selected"}</dd></div>
                    <div><dt className="text-text-subtle">Spatial</dt><dd className="text-text-primary">{dataset.spatialResolution ?? "Not applicable / not selected"}</dd></div>
                    <div><dt className="text-text-subtle">Temporal</dt><dd className="text-text-primary">{dataset.temporalResolution ?? "Not applicable / not selected"}</dd></div>
                    <div><dt className="text-text-subtle">Observation period</dt><dd className="text-text-primary">{dataset.observationPeriod ?? "Not verified"}</dd></div>
                  </dl>
                  <p className="text-[10px] text-text-secondary leading-relaxed">{dataset.processingStatus}</p>
                  {dataset.knownLimitations.map((limitation) => (
                    <p key={limitation} className="text-[10px] text-amber-200/90 leading-relaxed">Limit: {limitation}</p>
                  ))}
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-text-primary uppercase tracking-wider">Provided references by role</h2>
              <p className="mt-1 text-xs text-text-secondary">Exploration, extraction, methodology, and context resources are not production observation feeds.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {DATA_SOURCE_REFERENCES.map((reference) => (
                <article key={reference.id} className="p-4 rounded-2xl bg-panel-dark/70 border border-panel-border/30">
                  <div className="flex items-start justify-between gap-3">
                    <a href={reference.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-accent-light hover:text-accent-cyan inline-flex items-center gap-1">
                      {reference.title}<ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="shrink-0 text-[9px] font-mono uppercase text-text-subtle">{reference.role.replaceAll("_", " ")}</span>
                  </div>
                  <p className="mt-2 text-[11px] text-text-secondary leading-relaxed">{reference.useInEthiodrought}</p>
                  <p className="mt-1 text-[10px] text-amber-200/90 leading-relaxed">{reference.decision}</p>
                </article>
              ))}
            </div>
          </div>

          {/* CSV Upload Section */}
          <div className="p-6 rounded-3xl nasa-panel border border-panel-border/30">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-accent-cyan" />
                  Custom CSV Analysis (Browser Session)
                </h2>
                <p className="text-xs text-text-secondary mt-1 max-w-2xl leading-relaxed">
                  Upload a CSV for client-side structural validation and exploratory calculations. This modal does not persist data to the backend or independently verify the source, location, units, quality flags, or scientific suitability. Required columns: date (YYYY-MM), rainfall_mm, soil_moisture, ndvi.
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
                  Generate Exploratory Report
                </h2>
                <p className="text-xs text-text-secondary max-w-2xl leading-relaxed">
                  Export calculations from the current input series. The default series is synthetic demonstration data; uploaded CSV values are user-supplied and not independently verified. This is not an operational drought assessment.
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
                      Record date
                    </span>
                    <span className="font-bold text-text-primary">
                      {currentRecord?.date || "Unavailable"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-panel-dark/80 border border-panel-border/30">
                    <span className="text-[10px] text-text-subtle block">
                      Exploratory result
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
                Exploratory Input Values
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Rainfall (Z)</span>
                  <span
                    className={`font-bold ${
                      rainZ < -1 ? "text-red-400" : "text-accent-cyan"
                    }`}
                  >
                    {rainZ > 0 ? `+${rainZ}` : rainZ} σ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Soil moisture (Z)</span>
                  <span
                    className={`font-bold ${
                      soilZ < -1 ? "text-red-400" : "text-sky-400"
                    }`}
                  >
                    {soilZ > 0 ? `+${soilZ}` : soilZ} σ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Vegetation (Z)</span>
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
                Exploratory Fingerprint Output
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
        dataStatus={reportDataStatus}
        datasetName={datasetName}
      />
    </div>
  );
}
