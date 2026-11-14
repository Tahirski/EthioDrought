"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppProvider } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#040507] text-text-primary flex flex-col font-sans">
        {!isHome && <Navbar />}
        <main className="flex-1">{children}</main>
        {!isHome && <Footer />}
      </div>
    </AppProvider>
  );
};
