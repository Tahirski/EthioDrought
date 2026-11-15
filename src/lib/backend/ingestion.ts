export type UploadedIndicator = 'rainfall' | 'soil_moisture' | 'vegetation';

export interface CsvUploadMetadata {
  csv: string;
  regionId: string;
  datasetId: string;
  provider: string;
  productId: string;
  datasetVersion: string;
}

export interface ParsedUploadedObservation {
  rowNumber: number;
  date: string;
  indicator: UploadedIndicator;
  value: number;
  units: string;
  qualityFlag: string;
}

export interface CsvIngestionValidation {
  records: ParsedUploadedObservation[];
  rejectedRows: Array<{ rowNumber: number; reason: string }>;
  rowsReceived: number;
}

const REQUIRED_HEADERS = ['date', 'indicator', 'value', 'units', 'quality_flag'];
const MAX_CSV_ROWS = 5000;
const DATASET_INDICATORS: Record<string, UploadedIndicator[]> = {
  'gpm-imerg': ['rainfall'],
  fldas: ['soil_moisture'],
  'smap-soil-moisture': ['soil_moisture'],
  'modis-mod13a2': ['vegetation'],
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let quoteClosed = false;

  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index++;
        } else {
          quoted = false;
          quoteClosed = true;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === ',' ) {
      row.push(field);
      field = '';
      quoteClosed = false;
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index++;
      row.push(field);
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      field = '';
      quoteClosed = false;
      if (rows.length > MAX_CSV_ROWS + 1) throw new RangeError(`CSV exceeds the ${MAX_CSV_ROWS}-row limit.`);
    } else if (character === '"') {
      if (field !== '' || quoteClosed) throw new SyntaxError('CSV contains a quote in an invalid position.');
      quoted = true;
    } else {
      if (quoteClosed) throw new SyntaxError('CSV has characters after a closing quote.');
      field += character;
    }
  }

  if (quoted) throw new SyntaxError('CSV contains an unclosed quoted field.');
  row.push(field);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  if (rows.length > MAX_CSV_ROWS + 1) throw new RangeError(`CSV exceeds the ${MAX_CSV_ROWS}-row limit.`);
  return rows;
}

function canonicalIndicator(value: string): UploadedIndicator | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'rainfall' || normalized === 'rainfall_mm') return 'rainfall';
  if (normalized === 'soil_moisture' || normalized === 'soil_moisture_m3m3') return 'soil_moisture';
  if (normalized === 'vegetation' || normalized === 'ndvi') return 'vegetation';
  return null;
}

export function validateCsvUpload(input: CsvUploadMetadata): CsvIngestionValidation {
  if (typeof input.csv !== 'string' || input.csv.length === 0) throw new TypeError('csv must be a non-empty string.');
  if ([input.regionId, input.datasetId, input.provider, input.productId, input.datasetVersion]
    .some((value) => typeof value !== 'string' || value.trim() === '')) {
    throw new TypeError('regionId, datasetId, provider, productId, and datasetVersion are required.');
  }
  if ([input.provider, input.productId, input.datasetVersion].some((value) => value.trim().length > 200)) {
    throw new RangeError('Provider, productId, and datasetVersion must be 200 characters or fewer.');
  }
  if (!Object.prototype.hasOwnProperty.call(DATASET_INDICATORS, input.datasetId)) {
    throw new TypeError('datasetId must be a registered rainfall, soil moisture, or vegetation product.');
  }

  const rows = parseCsv(input.csv);
  if (rows.length < 2) throw new TypeError('CSV requires a header and at least one observation row.');
  const headers = rows[0].map((header) => header.trim().toLowerCase());
  if (new Set(headers).size !== headers.length || REQUIRED_HEADERS.some((header) => !headers.includes(header))) {
    throw new TypeError(`CSV headers must include each of: ${REQUIRED_HEADERS.join(', ')} (no duplicates).`);
  }
  if (rows.length - 1 > MAX_CSV_ROWS) throw new RangeError(`CSV exceeds the ${MAX_CSV_ROWS}-row limit.`);

  const column = Object.fromEntries(headers.map((header, index) => [header, index]));
  const records: ParsedUploadedObservation[] = [];
  const rejectedRows: Array<{ rowNumber: number; reason: string }> = [];
  const allowedIndicators = DATASET_INDICATORS[input.datasetId];

  for (const [index, row] of rows.slice(1).entries()) {
    const rowNumber = index + 2;
    if (row.length !== headers.length) {
      rejectedRows.push({ rowNumber, reason: 'column_count_mismatch' });
      continue;
    }
    const date = row[column.date].trim();
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(date)) {
      rejectedRows.push({ rowNumber, reason: 'invalid_month_format' });
      continue;
    }

    const indicator = canonicalIndicator(row[column.indicator]);
    if (!indicator || !allowedIndicators.includes(indicator)) {
      rejectedRows.push({ rowNumber, reason: 'indicator_not_supported_by_dataset' });
      continue;
    }

    const valueText = row[column.value].trim();
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(valueText)) {
      rejectedRows.push({ rowNumber, reason: 'invalid_numeric_value' });
      continue;
    }
    const value = Number(valueText);
    if (!Number.isFinite(value)) {
      rejectedRows.push({ rowNumber, reason: 'non_finite_value' });
      continue;
    }

    const units = row[column.units].trim();
    const expectedUnits = indicator === 'rainfall' ? 'mm/month' : indicator === 'soil_moisture' ? 'm3/m3' : 'NDVI';
    if (units !== expectedUnits) {
      rejectedRows.push({ rowNumber, reason: `units_must_be_${expectedUnits}` });
      continue;
    }
    if ((indicator === 'rainfall' && value < 0) ||
        (indicator === 'soil_moisture' && (value < 0 || value > 1)) ||
        (indicator === 'vegetation' && (value < -1 || value > 1))) {
      rejectedRows.push({ rowNumber, reason: 'value_outside_supported_range' });
      continue;
    }

    const qualityFlag = row[column.quality_flag].trim() || 'unknown';
    if (qualityFlag.length > 128) {
      rejectedRows.push({ rowNumber, reason: 'quality_flag_too_long' });
      continue;
    }
    if (qualityFlag.toLowerCase() === 'invalid') {
      rejectedRows.push({ rowNumber, reason: 'source_quality_flag_invalid' });
      continue;
    }
    records.push({ rowNumber, date, indicator, value, units, qualityFlag });
  }

  return { records, rejectedRows: rejectedRows.slice(0, 100), rowsReceived: rows.length - 1 };
}
