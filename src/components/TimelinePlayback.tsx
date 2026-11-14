"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, FastForward, Calendar, AlertCircle } from "lucide-react";

interface TimelinePlaybackProps {
  currentIndex: number;
  totalSteps: number;
  currentDateStr: string;
  onIndexChange: (idx: number | ((prev: number) => number)) => void;
  onJumpToEvent: (year: number, month: number) => void;
}

export const TimelinePlayback: React.FC<TimelinePlaybackProps> = ({
  currentIndex,
  totalSteps,
  currentDateStr,
  onIndexChange,
  onJumpToEvent,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1); // 1x, 2x, 4x

  // Key historical Horn of Africa / Borena climate events
  const droughtBenchmarks = [
    { label: "2011 Drought", year: 2011, month: 4, desc: "Horn of Africa Crisis" },
    { label: "2015 El Niño", year: 2015, month: 8, desc: "Nationwide Meteorological Deficit" },
    { label: "2022 Peak Crisis", year: 2022, month: 11, desc: "5-Season Failed Rains in Borena" },
    { label: "2024 Present", year: 2024, month: 11, desc: "Fragile Recovery & Residual Deficit" },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      const intervalMs = 1200 / speed;
      timer = setInterval(() => {
        onIndexChange((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, speed, totalSteps, onIndexChange]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="w-full p-3.5 rounded-2xl nasa-panel border border-panel-border/30 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs mt-3">
      {/* Left: Playback controls & date display */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button
          onClick={togglePlay}
          className="p-2 rounded-xl bg-accent-blue hover:bg-accent-blue/80 text-white shadow-glow-blue transition-all"
          title={isPlaying ? "Pause Playback" : "Play Timeline"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <button
          onClick={() => {
            setIsPlaying(false);
            onIndexChange(0);
          }}
          className="p-2 rounded-xl bg-panel-dark hover:bg-panel text-text-secondary hover:text-text-primary border border-panel-border/30"
          title="Reset to 2000"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : 1))}
          className="px-2 py-1.5 rounded-xl bg-panel-dark border border-panel-border/30 text-accent-light text-[10px] font-bold"
          title="Playback Speed"
        >
          {speed}x
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-panel-dark/80 border border-panel-border/30">
          <Calendar className="w-3.5 h-3.5 text-accent-cyan" />
          <span className="font-bold text-text-primary text-xs tracking-wider">
            {currentDateStr}
          </span>
        </div>
      </div>

      {/* Middle: Scrubber slider */}
      <div className="w-full flex-1 max-w-xl mx-2">
        <input
          type="range"
          min={0}
          max={totalSteps - 1}
          value={currentIndex}
          onChange={(e) => onIndexChange(Number(e.target.value))}
          className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
        />
        <div className="flex justify-between text-[9px] text-text-subtle mt-1 font-mono">
          <span>2000-01 (Baseline Start)</span>
          <span>2012</span>
          <span>2024-11 (Latest)</span>
        </div>
      </div>

      {/* Right: Quick Benchmark Jump Buttons */}
      <div className="hidden xl:flex items-center gap-1.5">
        {droughtBenchmarks.map((b, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsPlaying(false);
              onJumpToEvent(b.year, b.month);
            }}
            className="px-2 py-1 rounded-lg bg-panel-dark hover:bg-accent-blue/40 border border-panel-border/30 text-text-secondary hover:text-accent-cyan text-[10px] transition-colors"
            title={b.desc}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimelinePlayback;
