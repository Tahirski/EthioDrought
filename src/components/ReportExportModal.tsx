"use client";

import React, { useRef } from "react";
import { X, Download, Printer, CheckCircle, FileText, Share2 } from "lucide-react";
import { FingerprintDiagnosis } from "@/lib/droughtEngine";
import { MannKendallResult } from "@/lib/stats";

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  regionName: string;
  observationDate: string;
  rainfallZ: number;
  soilZ: number;
  vegZ: number;
  diagnosis: FingerprintDiagnosis;
  trendResult: MannKendallResult;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  regionName,
  observationDate,
  rainfallZ,
  soilZ,
  vegZ,
  diagnosis,
  trendResult,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = {
      title: "ETHIODROUGHT Scientific Environmental Intelligence Report",
      project: "NASA Space Apps Challenge 2026 - Be An Earth System Trend Detective",
      timestamp: new Date().toISOString(),
      geographicTarget: regionName,
      observationPeriod: observationDate,
      anomalies: {
        rainfallZ,
        soilMoistureZ: soilZ,
        vegetationHealthZ: vegZ,
      },
      diagnosis: {
        phase: diagnosis.phase,
        status: diagnosis.title,
        droughtType: diagnosis.droughtType,
        scientificSummary: diagnosis.scientificExplanation,
        rangelandImpact: diagnosis.agriculturalImplication,
        compositeIndex: diagnosis.exploratoryCompositeIndex,
      },
      trendAnalysis: {
        methodology: "Mann-Kendall Non-Parametric Test & Theil-Sen Slope Estimator",
        sensSlope: trendResult.sensSlope,
        mannKendallScore: trendResult.S,
        standardizedZ: trendResult.zScore,
        twoTailedPValue: trendResult.pValue,
        statisticalSignificance: trendResult.significant,
      },
      satelliteProvenance: {
        rainfall: "NASA GPM IMERG Final Run V06B (0.1°)",
        soilMoisture: "NASA FLDAS Noah Land Surface Model 0-100cm (0.1°)",
        vegetationHealth: "NASA MODIS MOD13A2 / MYD13A2 NDVI (1km)",
      },
      limitations: [
        "Satellite observations measure canopy greenness and microwave dielectric properties, not ground livestock counts.",
        "NDVI lag of 30-60 days behind rainfall deficits must be considered when interpreting drought propagation.",
      ],
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ETHIODROUGHT_Report_${regionName.replace(/\s+/g, "_")}_${observationDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl nasa-panel-blue border border-accent-secondary/40 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-panel-border/30">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-cyan" />
            <h2 className="text-base font-bold text-text-primary tracking-wide">
              Official Environmental Intelligence Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-text-subtle hover:text-text-primary hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Document Body */}
        <div ref={reportRef} className="p-6 rounded-2xl bg-black/60 border border-panel-border/30 text-xs space-y-4 text-text-primary">
          <div className="flex justify-between items-start border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] tracking-widest text-accent-light uppercase">
                ETHIODROUGHT — BEYOND RAINFALL
              </span>
              <h1 className="text-lg font-bold text-text-primary mt-0.5">
                Regional Environmental & Drought Intelligence Report
              </h1>
              <span className="text-[10px] text-text-subtle">
                NASA Space Apps Challenge 2026 • Earth System Trend Detective
              </span>
            </div>
            <div className="text-right text-[10px] font-mono text-text-subtle">
              <div>Date Generated: {new Date().toLocaleDateString()}</div>
              <div className="text-emerald-400 font-bold">VERIFIED ARCHIVE</div>
            </div>
          </div>

          {/* Section 1: Target Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-panel-dark border border-panel-border/20">
              <span className="text-text-subtle text-[9px] block">Target Zone</span>
              <span className="font-bold text-text-primary">{regionName}</span>
            </div>
            <div className="p-2 rounded-xl bg-panel-dark border border-panel-border/20">
              <span className="text-text-subtle text-[9px] block">Observation Date</span>
              <span className="font-bold text-accent-cyan">{observationDate}</span>
            </div>
            <div className="p-2 rounded-xl bg-panel-dark border border-panel-border/20">
              <span className="text-text-subtle text-[9px] block">Baseline Period</span>
              <span className="font-bold text-text-primary">2000–2020 (μ, σ)</span>
            </div>
            <div className="p-2 rounded-xl bg-panel-dark border border-panel-border/20">
              <span className="text-text-subtle text-[9px] block">Diagnostic Verdict</span>
              <span className="font-bold text-red-400">{diagnosis.title}</span>
            </div>
          </div>

          {/* Section 2: Standardized Anomalies */}
          <div className="space-y-1.5">
            <span className="font-bold text-[11px] text-accent-cyan uppercase tracking-wider">
              1. Multi-Indicator Standardized Anomalies (Z = [X - μ] / σ)
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2.5 rounded-xl bg-panel-dark/60 border border-panel-border/20">
                <span className="text-text-secondary block text-[10px]">Rainfall (GPM)</span>
                <span className="text-sm font-bold text-red-400">{rainfallZ > 0 ? `+${rainfallZ}` : rainfallZ} σ</span>
              </div>
              <div className="p-2.5 rounded-xl bg-panel-dark/60 border border-panel-border/20">
                <span className="text-text-secondary block text-[10px]">Soil Moisture (FLDAS)</span>
                <span className="text-sm font-bold text-red-400">{soilZ > 0 ? `+${soilZ}` : soilZ} σ</span>
              </div>
              <div className="p-2.5 rounded-xl bg-panel-dark/60 border border-panel-border/20">
                <span className="text-text-secondary block text-[10px]">Canopy NDVI (MODIS)</span>
                <span className="text-sm font-bold text-amber-400">{vegZ > 0 ? `+${vegZ}` : vegZ} σ</span>
              </div>
            </div>
          </div>

          {/* Section 3: Diagnostic Synthesis */}
          <div className="p-3.5 rounded-xl bg-panel-dark/60 border border-panel-border/20 space-y-1.5 leading-relaxed">
            <span className="font-bold text-[11px] text-accent-light uppercase block">
              2. Drought Fingerprint Decoupling Synthesis
            </span>
            <p className="text-[11px] text-text-secondary">{diagnosis.scientificExplanation}</p>
            <p className="text-[11px] text-text-primary pt-1">
              <strong>Agricultural & Pastoral Consequence:</strong> {diagnosis.agriculturalImplication}
            </p>
          </div>

          {/* Section 4: Trend Detective Results */}
          <div className="space-y-1.5">
            <span className="font-bold text-[11px] text-accent-cyan uppercase tracking-wider">
              3. 24-Year Trend Detective (Mann-Kendall & Sen's Slope)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="p-2 rounded-lg bg-panel-dark/40 border border-panel-border/20">
                <span className="text-text-subtle block">Sen's Slope (Q)</span>
                <span className="font-bold text-text-primary">{trendResult.sensSlope} /yr</span>
              </div>
              <div className="p-2 rounded-lg bg-panel-dark/40 border border-panel-border/20">
                <span className="text-text-subtle block">Mann-Kendall Score</span>
                <span className="font-bold text-text-primary">S = {trendResult.S}</span>
              </div>
              <div className="p-2 rounded-lg bg-panel-dark/40 border border-panel-border/20">
                <span className="text-text-subtle block">Standardized Z</span>
                <span className="font-bold text-text-primary">Z = {trendResult.zScore}</span>
              </div>
              <div className="p-2 rounded-lg bg-panel-dark/40 border border-panel-border/20">
                <span className="text-text-subtle block">P-Value</span>
                <span className="font-bold text-accent-cyan">p = {trendResult.pValue}</span>
              </div>
            </div>
          </div>

          {/* Section 5: Data Provenance & Caveats */}
          <div className="border-t border-white/10 pt-2 text-[10px] text-text-subtle space-y-1">
            <div>
              <strong>Data Provenance:</strong> NASA FLDAS Noah LSM (0.1°), NASA GPM IMERG (0.1°), NASA MODIS MOD13A2 (1km).
            </div>
            <div>
              <strong>Caveat:</strong> Satellite remote sensing measures surface electromagnetic reflectance and simulated soil hydrological dynamics. This report is intended for scientific research and early warning coordination.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 text-xs">
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-panel-dark hover:bg-panel border border-panel-border/40 text-text-primary transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Download JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-accent-blue hover:bg-accent-blue/80 text-white font-bold transition-all shadow-glow-blue"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
