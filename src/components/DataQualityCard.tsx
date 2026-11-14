"use client";

import React from "react";
import { DatasetQualityMetadata } from "@/types/alerts";
import { Database, CheckCircle2, AlertTriangle, AlertCircle, Clock, ShieldCheck, Tag } from "lucide-react";

interface DataQualityCardProps {
  dataset: DatasetQualityMetadata;
  isAmharic?: boolean;
}

export const DataQualityCard: React.FC<DataQualityCardProps> = ({ dataset, isAmharic = false }) => {
  const getCoverageBadge = (status: DatasetQualityMetadata["coverageStatus"]) => {
    switch (status) {
      case "Good data coverage":
        return {
          color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case "Partial data coverage":
        return {
          color: "bg-sky-500/15 text-sky-300 border-sky-500/30",
          icon: <Clock className="w-3.5 h-3.5 text-sky-400" />,
        };
      case "Limited data":
        return {
          color: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      default:
        return {
          color: "bg-red-500/15 text-red-300 border-red-500/30",
          icon: <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
        };
    }
  };

  const coverageBadge = getCoverageBadge(dataset.coverageStatus);

  return (
    <div className="nasa-panel p-5 sm:p-6 rounded-3xl border border-accent-secondary/35 shadow-xl flex flex-col justify-between hover:border-accent-cyan/50 transition-colors">
      <div>
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-panel-dark border border-panel-border/40 flex items-center justify-center text-accent-cyan">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-accent-light uppercase">
                {dataset.processingStatus}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-text-primary">
                {dataset.datasetName}
              </h4>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${coverageBadge.color} shrink-0`}
          >
            {coverageBadge.icon}
            <span>{dataset.coverageStatus}</span>
          </span>
        </div>

        {/* Sensor Source */}
        <p className="text-xs text-text-secondary leading-relaxed mt-1">
          {dataset.sensorSource}
        </p>

        {/* Specifications Matrix */}
        <div className="mt-4 space-y-2 text-xs font-mono pt-3 border-t border-panel-border/20">
          <div className="flex items-center justify-between text-text-secondary">
            <span>Variable Measured:</span>
            <span className="text-text-primary font-medium text-right">{dataset.variableMeasured}</span>
          </div>
          <div className="flex items-center justify-between text-text-secondary">
            <span>Spatial Resolution:</span>
            <span className="text-accent-cyan font-bold">{dataset.spatialResolution}</span>
          </div>
          <div className="flex items-center justify-between text-text-secondary">
            <span>Temporal Cadence:</span>
            <span className="text-text-primary">{dataset.temporalCadence}</span>
          </div>
          <div className="flex items-center justify-between text-text-secondary">
            <span>Archival Coverage:</span>
            <span className="text-accent-light">{dataset.availablePeriod}</span>
          </div>
          <div className="flex items-center justify-between text-text-secondary">
            <span>Missing Observations:</span>
            <span className="text-text-primary">{dataset.missingObservationsPct.toFixed(1)}% missing</span>
          </div>
        </div>

        {/* Quality Flags Chips */}
        <div className="mt-4 pt-3 border-t border-panel-border/20">
          <div className="text-[10px] font-mono text-text-subtle uppercase mb-2 flex items-center gap-1">
            <Tag className="w-3 h-3 text-accent-cyan" />
            <span>Operational Quality Flags</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {dataset.qualityFlags.map((flag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-panel-dark text-[10px] font-mono text-text-secondary border border-panel-border/30"
              >
                ✓ {flag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Limitations Bottom Note */}
      <div className="mt-5 pt-3 border-t border-panel-border/20 text-[11px] text-text-secondary leading-relaxed bg-panel-dark/50 p-2.5 rounded-xl border border-panel-border/10">
        <span className="font-bold text-text-primary block text-[10px] font-mono uppercase text-accent-light mb-0.5">
          Observational Limitations:
        </span>
        {dataset.knownLimitations}
      </div>
    </div>
  );
};
