import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ETHIODROUGHT — Beyond Rainfall | NASA Space Apps Challenge 2026",
  description: "A drought investigation framework for Ethiopia. NASA POWER point data and a historical experimental rainfall predictor are available; zonal GPM, FLDAS, and MODIS time series are not integrated.",
  keywords: ["Ethiopia", "Borena", "Drought", "NASA Space Apps 2026", "FLDAS", "GPM IMERG", "MODIS", "Mann-Kendall", "Earth Observation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-background text-text-primary antialiased selection:bg-accent-blue selection:text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

// Client wrapper for AppProvider + Navbar + Footer
import { ClientLayout } from "@/components/ClientLayout";
