"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { MethodologyPage } from "@/components/pages/MethodologyPage";

export default function MethodologyRoute() {
  const { lang } = useApp();

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 lg:px-8 py-6">
      <MethodologyPage lang={lang} />
    </div>
  );
}
