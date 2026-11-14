"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { GeoRegion, WoredaStation, BORENA_ZONE_GEOJSON, ETHIOPIA_REGIONS_GEOJSON, BORENA_WOREDAS } from "@/data/ethiopiaGeo";

export type MapLayerType = "fingerprint" | "rainfall" | "soil" | "ndvi" | "soilMoisture" | "vegetation";

interface LeafletMapInnerProps {
  selectedLayer: MapLayerType;
  selectedWoreda: WoredaStation | null;
  onSelectWoreda: (woreda: WoredaStation) => void;
  selectedRegionId: string;
  onSelectRegion: (regionId: string) => void;
  currentRainfallZ: number;
  currentSoilZ: number;
  currentVegZ: number;
}

export default function LeafletMapInner({
  selectedLayer,
  selectedWoreda,
  onSelectWoreda,
  selectedRegionId,
  onSelectRegion,
  currentRainfallZ,
  currentSoilZ,
  currentVegZ,
}: LeafletMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonsGroupRef = useRef<L.FeatureGroup | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);

  const [tileError, setTileError] = React.useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Ethiopia / Borena Zone
    const map = L.map(mapContainerRef.current, {
      center: [7.2, 39.5],
      zoom: 6.2,
      minZoom: 5,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Standard OpenStreetMap Tiles (No API key required)
    const osmLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      crossOrigin: true,
    });

    osmLayer.on("tileerror", () => {
      setTileError(true);
    });

    osmLayer.on("load", () => {
      setTileError(false);
    });

    osmLayer.addTo(map);

    polygonsGroupRef.current = L.featureGroup().addTo(map);
    markersGroupRef.current = L.featureGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Polygons & Markers when layer or selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !polygonsGroupRef.current || !markersGroupRef.current) return;

    polygonsGroupRef.current.clearLayers();
    markersGroupRef.current.clearLayers();

    // 1. Render Regional Boundaries
    ETHIOPIA_REGIONS_GEOJSON.forEach((region) => {
      const isBorena = region.id === "borena";
      const isSelected = selectedRegionId === region.id;

      // Color coding according to active layer
      let fillColor = "#253352";
      let fillOpacity = 0.25;
      let strokeColor = "#41619F";
      let weight = 1.5;

      if (isBorena) {
        weight = 2.5;
        if (selectedLayer === "rainfall") {
          fillColor = currentRainfallZ < -1.5 ? "#EF4444" : currentRainfallZ < -0.8 ? "#F59E0B" : "#28D7C5";
        } else if (selectedLayer === "soil" || selectedLayer === "soilMoisture") {
          fillColor = currentSoilZ < -1.5 ? "#EF4444" : currentSoilZ < -0.8 ? "#F59E0B" : "#38BDF8";
        } else if (selectedLayer === "ndvi" || selectedLayer === "vegetation") {
          fillColor = currentVegZ < -1.5 ? "#EF4444" : currentVegZ < -0.8 ? "#F59E0B" : "#10B981";
        } else {
          // Compound Fingerprint
          fillColor = (currentRainfallZ < -1 && currentSoilZ < -1 && currentVegZ < -1) ? "#EF4444" : "#F59E0B";
        }
        fillOpacity = 0.45;
        strokeColor = "#28D7C5";
      } else if (isSelected) {
        fillColor = "#41619F";
        fillOpacity = 0.35;
        strokeColor = "#A8BFDC";
        weight = 2;
      }

      // GeoJSON polygon coordinates are [lat, lng]
      const latLngs = region.coordinates[0].map(([lat, lng]) => [lat, lng] as [number, number]);
      const polygon = L.polygon(latLngs, {
        color: strokeColor,
        weight: weight,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        dashArray: isBorena ? undefined : "4, 4",
      });

      polygon.bindTooltip(`
        <div class="px-2 py-1 text-xs font-mono font-bold text-text-primary bg-panel-dark border border-panel-border rounded shadow">
          ${region.name} (${region.nameAmharic})
          <div class="text-[10px] text-accent-light font-normal">${region.agroEcology}</div>
        </div>
      `, { sticky: true, opacity: 0.95 });

      polygon.on("click", () => {
        onSelectRegion(region.id);
        if (isBorena) {
          map.flyTo(region.center, 8, { duration: 1.2 });
        } else {
          map.flyTo(region.center, 6.5, { duration: 1.2 });
        }
      });

      polygon.addTo(polygonsGroupRef.current!);
    });

    // 2. Render Borena Woreda Monitoring Stations with futuristic glowing pulses
    BORENA_WOREDAS.forEach((station) => {
      const isSelected = selectedWoreda?.id === station.id;

      // Indicator value depending on active layer
      let metricVal = station.rainfallZ;
      if (selectedLayer === "soil" || selectedLayer === "soilMoisture") metricVal = station.soilMoistureZ;
      if (selectedLayer === "ndvi" || selectedLayer === "vegetation") metricVal = station.ndviZ;
      if (selectedLayer === "fingerprint") metricVal = (station.rainfallZ + station.soilMoistureZ + station.ndviZ) / 3;

      const markerColor = metricVal < -1.8 ? "#EF4444" : metricVal < -1.0 ? "#F59E0B" : "#28D7C5";

      const iconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-5 h-5 rounded-full flex items-center justify-center" style="background: rgba(22, 33, 56, 0.9); border: 2px solid ${markerColor}; box-shadow: 0 0 12px ${markerColor};">
            <div class="w-1.5 h-1.5 rounded-full" style="background: ${markerColor};"></div>
          </div>
          ${isSelected ? `<div class="absolute -inset-2 rounded-full border border-dashed border-accent-cyan animate-spin"></div>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-station-pin",
        html: iconHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker(station.coords, { icon: customIcon });

      marker.bindPopup(`
        <div class="p-2 space-y-1.5 text-xs font-mono">
          <div class="flex items-center justify-between border-b border-panel-border/40 pb-1">
            <span class="font-bold text-accent-cyan">${station.name}</span>
            <span class="text-[9px] px-1 py-0.5 rounded bg-panel-dark border border-panel-border text-text-secondary">${station.elevationM}m</span>
          </div>
          <div class="text-[11px] text-text-primary">${station.woreda}</div>
          <div class="text-[10px] text-text-secondary">${station.pastoralSystem}</div>
          <div class="grid grid-cols-3 gap-1 pt-1 text-center text-[10px]">
            <div class="bg-black/40 p-1 rounded">
              <span class="text-text-subtle block">Rain Z</span>
              <span class="font-bold ${station.rainfallZ < -1.5 ? 'text-red-400' : 'text-text-primary'}">${station.rainfallZ}σ</span>
            </div>
            <div class="bg-black/40 p-1 rounded">
              <span class="text-text-subtle block">Soil Z</span>
              <span class="font-bold ${station.soilMoistureZ < -1.5 ? 'text-red-400' : 'text-text-primary'}">${station.soilMoistureZ}σ</span>
            </div>
            <div class="bg-black/40 p-1 rounded">
              <span class="text-text-subtle block">NDVI Z</span>
              <span class="font-bold ${station.ndviZ < -1.5 ? 'text-red-400' : 'text-text-primary'}">${station.ndviZ}σ</span>
            </div>
          </div>
        </div>
      `);

      marker.on("click", () => {
        onSelectWoreda(station);
      });

      marker.addTo(markersGroupRef.current!);
    });

  }, [selectedLayer, selectedWoreda, selectedRegionId, currentRainfallZ, currentSoilZ, currentVegZ, onSelectRegion, onSelectWoreda]);

  return (
    <div className="relative w-full h-full min-h-[460px] lg:min-h-[580px]">
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px] lg:min-h-[580px]" />
      {tileError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-xl bg-panel-dark/95 backdrop-blur-md border border-accent-secondary/40 text-[11px] font-mono text-accent-light flex items-center gap-2 shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
          <span>Local Vector Mode: Ethiopian boundaries and NASA drought overlays active.</span>
        </div>
      )}
    </div>
  );
}

export { LeafletMapInner };
