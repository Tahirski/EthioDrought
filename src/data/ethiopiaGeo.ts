import borenaBoundary from './borenaBoundary.json';

export interface GeoRegion {
  id: string;
  name: string;
  nameAmharic: string;
  type: 'zone' | 'region' | 'national';
  parentRegion?: string;
  center: [number, number];
  zoom: number;
  areaKm2: number | null;
  agroEcology: string;
  boundarySource: string;
  coordinates: [number, number][][];
}

const borenaCoordinates: [number, number][][] = borenaBoundary.geometry.coordinates.map((ring) =>
  ring.map(([longitude, latitude]) => [latitude, longitude]),
);

export const BORENA_ZONE_GEOJSON: GeoRegion = {
  id: 'borena',
  name: 'Borena Zone',
  nameAmharic: 'ቦረና ዞን',
  type: 'zone',
  parentRegion: 'Oromia',
  center: [4.55, 38.3],
  zoom: 8,
  areaKm2: null,
  agroEcology: 'Arid & Semi-Arid Pastoral Rangeland (Bimodal Gu/Genna & Deyr)',
  boundarySource: 'geoBoundaries Ethiopia ADM2, 2020; source: CSA and BoFED via HDX',
  coordinates: borenaCoordinates,
};

export const ETHIOPIA_REGIONS_GEOJSON: GeoRegion[] = [BORENA_ZONE_GEOJSON];
