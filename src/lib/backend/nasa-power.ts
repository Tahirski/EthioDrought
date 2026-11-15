const NASA_POWER_MONTHLY_ENDPOINT = 'https://power.larc.nasa.gov/api/temporal/monthly/point';
const BORENA_CENTROID = { latitude: 4.4630211794, longitude: 38.2678243293 };
const BASELINE_START_YEAR = 2001;
const BASELINE_END_YEAR = 2020;
const MIN_BASELINE_OBSERVATIONS = 10;
const CACHE_DURATION_MS = 60 * 60 * 1000;

export interface NasaPowerObservation {
  date: string;
  rainfallMm: number | null;
  rainfallZ: number | null;
  precipitationRateMmPerDay: number | null;
  rootZoneWetness: number | null;
  rootZoneWetnessZ: number | null;
}

export interface NasaPowerObservations {
  regionId: 'borena';
  source: {
    provider: 'NASA POWER';
    product: 'MERRA-2';
    apiVersion: string;
    endpoint: string;
    temporalResolution: 'monthly';
    spatialMethod: 'representative_point';
    coordinateMethod: string;
    coordinates: { latitude: number; longitude: number; elevationMeters: number | null };
    precipitation: {
      parameter: 'PRECTOTCORR';
      description: string;
      sourceUnits: 'mm/day';
      displayedUnits: 'mm/month';
      conversion: 'Monthly mean daily rate multiplied by calendar days in month';
    };
    soilMoisture: {
      parameter: 'GWETROOT';
      description: string;
      units: '1';
    };
    timeStandard: string;
    retrievedAt: string;
  };
  baselinePeriod: { start: string; end: string; minimumObservations: number };
  dataQuality: 'limited';
  limitations: string[];
  records: NasaPowerObservation[];
}

interface PowerResponse {
  geometry: { coordinates: unknown[] };
  header: {
    api?: { version?: string };
    sources?: unknown;
    fill_value?: unknown;
    time_standard?: unknown;
  };
  properties: { parameter: Record<string, unknown> };
  parameters: Record<string, { longname?: unknown; units?: unknown }>;
}

let cache: { expiresAt: number; value: NasaPowerObservations } | null = null;
let pendingRequest: Promise<NasaPowerObservations> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPowerResponse(payload: unknown): payload is PowerResponse {
  return isRecord(payload) &&
    isRecord(payload.header) &&
    isRecord(payload.properties) &&
    isRecord(payload.properties.parameter) &&
    isRecord(payload.parameters) &&
    isRecord(payload.geometry) &&
    Array.isArray(payload.geometry.coordinates);
}

function parsePowerResponse(payload: unknown, retrievedAt: string, endYear: number): NasaPowerObservations {
  if (!isPowerResponse(payload)) {
    throw new TypeError('NASA POWER returned an unexpected response structure.');
  }

  const response = payload;
  const sources = Array.isArray(response.header.sources) ? response.header.sources : [];
  if (!sources.includes('MERRA2')) {
    throw new TypeError('NASA POWER response did not identify MERRA-2 as its source.');
  }
  const rainMetadata = response.parameters.PRECTOTCORR;
  const soilMetadata = response.parameters.GWETROOT;
  if (!rainMetadata || rainMetadata.units !== 'mm/day' ||
      !soilMetadata || soilMetadata.units !== '1') {
    throw new TypeError('NASA POWER returned unexpected units for the requested parameters.');
  }

  const coordinates = response.geometry.coordinates;
  const longitude = typeof coordinates[0] === 'number' ? coordinates[0] : null;
  const latitude = typeof coordinates[1] === 'number' ? coordinates[1] : null;
  const elevationMeters = typeof coordinates[2] === 'number' ? coordinates[2] : null;
  if (longitude === null || latitude === null ||
      Math.abs(longitude - BORENA_CENTROID.longitude) > 0.01 ||
      Math.abs(latitude - BORENA_CENTROID.latitude) > 0.01) {
    throw new TypeError('NASA POWER response coordinates did not match the requested Borena point.');
  }

  const fillValue = typeof response.header.fill_value === 'number' ? response.header.fill_value : -999;
  const rainValues = monthlyValues(response.properties.parameter.PRECTOTCORR, fillValue, endYear, (value) => value >= 0);
  const soilValues = monthlyValues(response.properties.parameter.GWETROOT, fillValue, endYear, (value) => value >= 0 && value <= 1);
  const dates = Array.from(new Set([...rainValues.keys(), ...soilValues.keys()])).sort();
  const monthlyData = dates.map((date) => {
    const [yearText, monthText] = date.split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    const rate = rainValues.get(date) ?? null;
    const rainfallMm = rate === null ? null : Number((rate * new Date(Date.UTC(year, month, 0)).getUTCDate()).toFixed(2));
    const rawWetness = soilValues.get(date) ?? null;
    const rootZoneWetness = rawWetness !== null && rawWetness >= 0 && rawWetness <= 1 ? rawWetness : null;
    return { date, year, month, rate, rainfallMm, rootZoneWetness };
  });
  const records = monthlyData.map((item): NasaPowerObservation => {
    const rainBaseline = monthlyData
      .filter((record) => record.year >= BASELINE_START_YEAR && record.year <= BASELINE_END_YEAR &&
        record.month === item.month && record.rainfallMm !== null)
      .flatMap((record) => record.rainfallMm === null ? [] : [record.rainfallMm]);
    const soilBaseline = monthlyData
      .filter((record) => record.year >= BASELINE_START_YEAR && record.year <= BASELINE_END_YEAR &&
        record.month === item.month && record.rootZoneWetness !== null)
      .flatMap((record) => record.rootZoneWetness === null ? [] : [record.rootZoneWetness]);
    return {
      date: item.date,
      rainfallMm: item.rainfallMm,
      rainfallZ: standardizedAnomaly(item.year, rainBaseline, item.rainfallMm),
      precipitationRateMmPerDay: item.rate,
      rootZoneWetness: item.rootZoneWetness,
      rootZoneWetnessZ: standardizedAnomaly(item.year, soilBaseline, item.rootZoneWetness),
    };
  });

  return {
    regionId: 'borena',
    source: {
      provider: 'NASA POWER',
      product: 'MERRA-2',
      apiVersion: response.header.api?.version || 'not reported',
      endpoint: NASA_POWER_MONTHLY_ENDPOINT,
      temporalResolution: 'monthly',
      spatialMethod: 'representative_point',
      coordinateMethod: 'Planar area centroid of the stored Borena Zone polygon',
      coordinates: { latitude, longitude, elevationMeters },
      precipitation: {
        parameter: 'PRECTOTCORR',
        description: typeof rainMetadata.longname === 'string' ? rainMetadata.longname : 'Precipitation Corrected',
        sourceUnits: 'mm/day',
        displayedUnits: 'mm/month',
        conversion: 'Monthly mean daily rate multiplied by calendar days in month',
      },
      soilMoisture: {
        parameter: 'GWETROOT',
        description: typeof soilMetadata.longname === 'string' ? soilMetadata.longname : 'Root Zone Soil Wetness',
        units: '1',
      },
      timeStandard: typeof response.header.time_standard === 'string' ? response.header.time_standard : 'not reported',
      retrievedAt,
    },
    baselinePeriod: {
      start: `${BASELINE_START_YEAR}-01`,
      end: `${BASELINE_END_YEAR}-12`,
      minimumObservations: MIN_BASELINE_OBSERVATIONS,
    },
    dataQuality: 'limited',
    limitations: [
      'MERRA-2 is a model-based reanalysis, not a direct satellite or ground-station measurement.',
      'Values represent one point inside Borena Zone, not a zonal spatial average.',
      'Root Zone Soil Wetness is unitless and is not interchangeable with FLDAS volumetric soil moisture.',
      'NASA POWER monthly precipitation is a mean daily rate converted to monthly accumulation using calendar month length.',
      'NASA POWER MERRA-2 monthly meteorological data are only available through the previous calendar year; this series is not near-real-time and cannot support an operational early warning.',
      'NASA POWER does not provide NDVI in this response; no vegetation or three-indicator drought fingerprint is inferred.',
      'The API does not provide product quality flags for these monthly point values.',
    ],
    records,
  };
}

function monthlyValues(
  input: unknown,
  fillValue: number,
  endYear: number,
  isValidValue: (value: number) => boolean,
): Map<string, number> {
  if (!isRecord(input)) throw new TypeError('NASA POWER response omitted a requested monthly parameter.');
  const values = new Map<string, number>();
  for (const [key, rawValue] of Object.entries(input)) {
    const match = /^(\d{4})(\d{2})$/.exec(key);
    if (!match) continue;
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (year < BASELINE_START_YEAR || year > endYear || month < 1 || month > 12) continue;
    if (typeof rawValue !== 'number' || !Number.isFinite(rawValue) ||
        rawValue === fillValue || !isValidValue(rawValue)) continue;
    values.set(`${match[1]}-${match[2]}`, rawValue);
  }
  return values;
}

function standardizedAnomaly(year: number, values: number[], observed: number | null): number | null {
  if (year >= BASELINE_START_YEAR && year <= BASELINE_END_YEAR) return null;
  if (observed === null || values.length < MIN_BASELINE_OBSERVATIONS) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const sumSquaredDifferences = values.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  const standardDeviation = Math.sqrt(sumSquaredDifferences / (values.length - 1));
  if (standardDeviation <= 0) return null;
  return Number(((observed - mean) / standardDeviation).toFixed(3));
}

export function parseNasaPowerResponse(
  payload: unknown,
  retrievedAt = new Date().toISOString(),
  endYear = new Date().getUTCFullYear() - 1,
): NasaPowerObservations {
  return parsePowerResponse(payload, retrievedAt, endYear);
}

export async function fetchBorenaNasaPowerObservations(): Promise<NasaPowerObservations> {
  if (cache && cache.expiresAt > Date.now()) return cache.value;
  if (pendingRequest) return pendingRequest;

  pendingRequest = (async () => {
    const endYear = new Date().getUTCFullYear() - 1;
    const url = new URL(NASA_POWER_MONTHLY_ENDPOINT);
    url.search = new URLSearchParams({
      parameters: 'PRECTOTCORR,GWETROOT',
      community: 'AG',
      longitude: String(BORENA_CENTROID.longitude),
      latitude: String(BORENA_CENTROID.latitude),
      start: String(BASELINE_START_YEAR),
      end: String(endYear),
      format: 'JSON',
    }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(20_000), cache: 'no-store' });
    if (!response.ok) throw new Error(`NASA POWER request failed with HTTP ${response.status}.`);
    const payload: unknown = await response.json();
    const result = parseNasaPowerResponse(payload, new Date().toISOString(), endYear);
    if (result.records.length === 0) throw new Error('NASA POWER returned no usable monthly Borena records.');
    cache = { expiresAt: Date.now() + CACHE_DURATION_MS, value: result };
    return result;
  })();

  try {
    return await pendingRequest;
  } finally {
    pendingRequest = null;
  }
}
