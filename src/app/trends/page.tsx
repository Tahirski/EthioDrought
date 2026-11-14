"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { TrendDetectivePage } from "@/components/pages/TrendDetectivePage";

export default function TrendsRoute() {
  const { lang } = useApp();

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 lg:px-8 py-6">
      <TrendDetectivePage lang={lang} />
    </div>
  );
}
