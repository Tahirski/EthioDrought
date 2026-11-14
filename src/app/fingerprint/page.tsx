"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { FingerprintPage } from "@/components/pages/FingerprintPage";

export default function FingerprintRoute() {
  const { lang, currentRecord, activeRecords } = useApp();

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 lg:px-8 py-6">
      <FingerprintPage
        lang={lang}
        currentRecord={currentRecord}
        records={activeRecords}
      />
    </div>
  );
}
