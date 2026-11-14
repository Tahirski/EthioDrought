"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { translations } from "@/data/translations";
import { Satellite, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  const { lang } = useApp();
  const t = translations[lang];

  return (
    <footer className="w-full border-t border-panel-border/20 bg-[#040507]">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-panel-dark border border-accent-cyan/40 shadow-[0_0_15px_rgba(40,215,197,0.3)] shrink-0">
                <img
                  src="/logo.jpg"
                  alt="ETHIODROUGHT Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-heading font-bold text-text-primary tracking-wider text-base">
                {t.appName}
              </span>
            </div>
            <p className="text-text-subtle text-[11px] leading-relaxed max-w-xs">
              {lang === "am"
                ? "በናሳ የሳተላይት መረጃዎች በመጠቀም በኢትዮጵያ ዙሪያ የድርቅና የአካባቢ ጫናን የሚመረምር የምድር ምልከታ መድረክ።"
                : "Earth Observation Intelligence platform investigating drought and environmental stress in Ethiopia using NASA satellite data."}
            </p>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-panel-dark/80 border border-accent-blue/30 w-fit">
              <Satellite className="w-3 h-3 text-accent-cyan" />
              <span className="text-[10px] font-mono text-accent-light">
                {lang === "am" ? "የናሳ ስፔስ አፕስ ውድድር 2026" : "NASA Space Apps Challenge 2026"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-text-secondary font-mono font-bold uppercase tracking-widest text-[10px]">
              {lang === "am" ? "መድረክ" : "Platform"}
            </h4>
            <nav className="flex flex-col gap-1.5">
              <Link href="/explore" className="text-text-subtle hover:text-accent-cyan transition-colors">
                {t.nav.explore}
              </Link>
              <Link href="/fingerprint" className="text-text-subtle hover:text-accent-cyan transition-colors">
                {t.nav.fingerprint}
              </Link>
              <Link href="/trends" className="text-text-subtle hover:text-accent-cyan transition-colors">
                {t.nav.trendDetective}
              </Link>
              <Link href="/compare" className="text-text-subtle hover:text-accent-cyan transition-colors">
                {t.nav.comparison}
              </Link>
              <Link href="/alerts" className="text-text-subtle hover:text-accent-cyan transition-colors">
                {t.nav.alerts}
              </Link>
              <Link href="/datasets" className="text-text-subtle hover:text-accent-cyan transition-colors">
                {t.nav.datasets}
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-text-secondary font-mono font-bold uppercase tracking-widest text-[10px]">
              {lang === "am" ? "ግብዓቶች" : "Resources"}
            </h4>
            <nav className="flex flex-col gap-1.5">
              <Link href="/data" className="text-text-subtle hover:text-accent-cyan transition-colors">
                {t.nav.data}
              </Link>
              <Link href="/methodology" className="text-text-subtle hover:text-accent-cyan transition-colors">
                {t.nav.methodology}
              </Link>
              <a href="https://www.spaceappschallenge.org/" target="_blank" rel="noreferrer" className="text-text-subtle hover:text-accent-cyan transition-colors flex items-center gap-1">
                Space Apps <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a href="https://earthdata.nasa.gov/" target="_blank" rel="noreferrer" className="text-text-subtle hover:text-accent-cyan transition-colors flex items-center gap-1">
                NASA Earthdata <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </nav>
          </div>

          {/* Data Sources */}
          <div className="space-y-3">
            <h4 className="text-text-secondary font-mono font-bold uppercase tracking-widest text-[10px]">
              {lang === "am" ? "የናሳ መረጃ ምንጮች" : "NASA Data Sources"}
            </h4>
            <div className="space-y-2 text-[11px] text-text-subtle">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>FLDAS Noah LSM (0.1°)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                <span>GPM IMERG V07 (0.1°)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>MODIS MOD13A2 NDVI (1km)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-panel-border/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-text-subtle">
          <span>{lang === "am" ? "ኢትዮ-ድርቅ — ከዝናብ ባሻገር | የ2026 የናሳ ስፔስ አፕስ ውድድር" : "ETHIODROUGHT — Beyond Rainfall | 2026 NASA Space Apps Challenge"}</span>
          <span>{lang === "am" ? "ኢትዮጵያ | የቦረና ዞን ጥናት | ክፍት ሳይንስ" : "Ethiopia | Borena Zone Case Study | Open Science"}</span>
        </div>
      </div>
    </footer>
  );
};
