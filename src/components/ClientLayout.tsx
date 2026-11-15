"use client";

import React from "react";
import { AppProvider } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#040507] text-text-primary flex flex-col font-sans">
        <Navbar />
        <div role="status" className="border-b border-amber-500/30 bg-amber-950/60 px-4 py-2 text-center text-[10px] sm:text-[11px] font-mono text-amber-200">
          NASA POWER / MERRA-2 point data and static 72-zone grid summaries are available on the Data page. The experimental Predictor is historical, national-box rainfall only; other built-in analysis series remain synthetic, and monthly zonal GPM / FLDAS / MODIS observations are not available.
        </div>
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AppProvider>
  );
};
