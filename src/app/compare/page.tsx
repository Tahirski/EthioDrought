"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { ComparisonPage } from "@/components/pages/ComparisonPage";

export default function CompareRoute() {
  const { lang } = useApp();

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 lg:px-8 py-6">
      <ComparisonPage lang={lang} />
    </div>
  );
}
