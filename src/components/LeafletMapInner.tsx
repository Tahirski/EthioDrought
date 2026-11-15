"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { ETHIOPIA_REGIONS_GEOJSON } from "@/data/ethiopiaGeo";

export type MapLayerType = "fingerprint" | "rainfall" | "soilMoisture" | "vegetation";

interface LeafletMapInnerProps {
  selectedRegionId: string;
  onSelectRegion: (regionId: string) => void;
}

export default function LeafletMapInner({ selectedRegionId, onSelectRegion }: LeafletMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonsGroupRef = useRef<L.FeatureGroup | null>(null);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [7.2, 39.5],
      zoom: 6.2,
      minZoom: 5,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const osmLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      crossOrigin: true,
    });

    osmLayer.on("tileerror", () => setTileError(true));
    osmLayer.on("load", () => setTileError(false));
    osmLayer.addTo(map);

    polygonsGroupRef.current = L.featureGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const polygons = polygonsGroupRef.current;
    if (!map || !polygons) return;

    polygons.clearLayers();
    ETHIOPIA_REGIONS_GEOJSON.forEach((region) => {
      const isSelected = selectedRegionId === region.id;
      const polygon = L.polygon(
        region.coordinates.map((ring) => ring.map(([lat, lng]) => [lat, lng] as [number, number])),
        {
          color: isSelected ? "#28D7C5" : "#7397BD",
          weight: isSelected ? 2.5 : 1,
          fillColor: isSelected ? "#28D7C5" : "#253352",
          fillOpacity: isSelected ? 0.18 : 0.06,
        },
      );

      polygon.bindTooltip(`${region.name} — ${region.boundarySource}`, {
        sticky: true,
        opacity: 0.95,
      });
      polygon.on("click", () => {
        onSelectRegion(region.id);
        map.flyTo(region.center, region.id === "borena" ? 8 : 6.5, { duration: 1.2 });
      });
      polygon.addTo(polygons);
    });
  }, [selectedRegionId, onSelectRegion]);

  return (
    <div className="relative w-full h-full min-h-[460px] lg:min-h-[580px]">
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px] lg:min-h-[580px]" />
      <div className="absolute bottom-3 left-3 z-[500] max-w-[calc(100%-1.5rem)] rounded-xl border border-amber-500/40 bg-panel-dark/95 px-3 py-2 text-[10px] font-mono text-amber-200 shadow-xl">
        <strong className="block tracking-wide">NO VERIFIED OBSERVATION OVERLAY</strong>
        <span>Borena boundary: 2020 geoBoundaries humanitarian (CSA + BoFED via HDX; CC BY 3.0 IGO). Other zones are not shown.</span>
      </div>
      {tileError && (
        <div className="absolute top-3 right-3 z-[500] rounded-xl border border-panel-border/50 bg-panel-dark/95 px-3 py-2 text-[10px] font-mono text-text-secondary shadow-xl">
          Basemap tiles unavailable. No environmental overlay is loaded.
        </div>
      )}
    </div>
  );
}

export { LeafletMapInner };
