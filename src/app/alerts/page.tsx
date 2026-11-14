"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { AlertsPage } from "@/components/pages/AlertsPage";

export default function AlertsRoute() {
  const { lang } = useApp();

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 lg:px-8 py-6">
      <AlertsPage lang={lang} />
    </div>
  );
}
