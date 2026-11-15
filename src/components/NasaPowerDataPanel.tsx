"use client";

import React, { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NasaPowerObservations } from "@/lib/backend/nasa-power";

function formatValue(value: number | null, digits = 2): string {
  return value === null ? "Unavailable" : value.toFixed(digits);
}

export function NasaPowerDataPanel() {
  const [observations, setObservations] = useState<NasaPowerObservations | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadObservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/observations/borena");
      if (!response.ok) throw new Error("NASA POWER data could not be retrieved.");
      const payload = await response.json() as NasaPowerObservations;
      setObservations(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "NASA POWER data could not be retrieved.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadObservations();
  }, []);

  const latest = observations?.records.at(-1);
  const chartData = observations?.records.slice(-24).map((record) => ({
    date: record.date,
    rainfallMm: record.rainfallMm,
    rootZoneWetness: record.rootZoneWetness,
  })) ?? [];

  return (
    <section className="p-5 sm:p-6 rounded-3xl nasa-panel border border-accent-cyan/35 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-accent-cyan uppercase">
            NASA POWER source browser · Borena representative point
          </div>
          <h2 className="text-lg font-bold text-text-primary mt-1">NASA POWER / MERRA-2 monthly data</h2>
          <p className="text-xs text-text-secondary mt-1 max-w-3xl">
            Retrieved live from NASA POWER, but historical rather than near-real-time: MERRA-2 monthly records currently end at the previous calendar year. This is a point series, not a zone-wide average or the GPM / FLDAS / MODIS products. Rainfall is derived from NASA POWER&apos;s mean daily precipitation rate; root-zone soil wetness is unitless reanalysis data.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadObservations()}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-panel-border/50 bg-panel-dark text-xs font-mono text-accent-light hover:border-accent-cyan disabled:opacity-50"
        >
          {loading ? "Fetching…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/30 text-xs text-amber-200">
          {error} Existing demonstration series elsewhere in the app are not replaced with live observations.
        </div>
      )}

      {loading && !observations && (
        <div role="status" className="text-xs text-text-secondary">Fetching monthly values from NASA POWER…</div>
      )}

      {observations && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-panel-dark/70 border border-panel-border/30">
              <div className="text-[10px] text-text-subtle">Latest month · precipitation</div>
              <div className="text-lg font-bold text-accent-cyan mt-1">{formatValue(latest?.rainfallMm ?? null)} mm/month</div>
              <div className="text-[10px] text-text-secondary">Anomaly: {latest?.rainfallZ === null || latest?.rainfallZ === undefined ? "unavailable" : `${latest.rainfallZ.toFixed(2)} σ`}</div>
            </div>
            <div className="p-3 rounded-xl bg-panel-dark/70 border border-panel-border/30">
              <div className="text-[10px] text-text-subtle">Latest month · root-zone wetness</div>
              <div className="text-lg font-bold text-sky-300 mt-1">{formatValue(latest?.rootZoneWetness ?? null, 3)}</div>
              <div className="text-[10px] text-text-secondary">Unitless · anomaly: {latest?.rootZoneWetnessZ === null || latest?.rootZoneWetnessZ === undefined ? "unavailable" : `${latest.rootZoneWetnessZ.toFixed(2)} σ`}</div>
            </div>
            <div className="p-3 rounded-xl bg-panel-dark/70 border border-panel-border/30">
              <div className="text-[10px] text-text-subtle">Coverage / baseline</div>
              <div className="text-sm font-bold text-text-primary mt-1">
                {observations.records[0]?.date ?? "Unavailable"} – {latest?.date ?? "Unavailable"}
              </div>
              <div className="text-[10px] text-text-secondary">Anomaly baseline: {observations.baselinePeriod.start} – {observations.baselinePeriod.end}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="h-56">
              <div className="text-[10px] text-text-secondary font-mono mb-2">Monthly precipitation · last 24 records (mm/month)</div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#344054" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: "#98A2B3", fontSize: 9 }} minTickGap={24} />
                  <YAxis tick={{ fill: "#98A2B3", fontSize: 9 }} width={42} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#475467", fontSize: 11 }} />
                  <Line type="monotone" dataKey="rainfallMm" name="Precipitation" stroke="#28D7C5" strokeWidth={2} dot={false} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="h-56">
              <div className="text-[10px] text-text-secondary font-mono mb-2">Root-zone soil wetness · last 24 records (unitless)</div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#344054" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: "#98A2B3", fontSize: 9 }} minTickGap={24} />
                  <YAxis tick={{ fill: "#98A2B3", fontSize: 9 }} width={42} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#475467", fontSize: 11 }} />
                  <Line type="monotone" dataKey="rootZoneWetness" name="Root-zone wetness" stroke="#38BDF8" strokeWidth={2} dot={false} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border-t border-panel-border/30 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px] text-text-subtle">
            <span>
              {observations.source.product} · {observations.records.length} monthly records · retrieved {new Date(observations.source.retrievedAt).toLocaleString()}
              <br />
              Point: {observations.source.coordinates.latitude.toFixed(4)}, {observations.source.coordinates.longitude.toFixed(4)} · {observations.source.coordinateMethod}
            </span>
            <a
              href="https://power.larc.nasa.gov/docs/services/api/temporal/monthly/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-light hover:text-accent-cyan underline"
            >
              NASA POWER API documentation
            </a>
          </div>
          <ul className="space-y-1 text-[10px] text-amber-200/90 list-disc list-inside">
            {observations.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
          </ul>
        </>
      )}
    </section>
  );
}
