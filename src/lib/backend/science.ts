export type DataQuality = 'good' | 'partial' | 'limited' | 'insufficient';

export interface BaselineSummary {
  available: boolean;
  count: number;
  missingCount: number;
  mean: number | null;
  median: number | null;
  standardDeviation: number | null;
  percentiles: { p10: number | null; p25: number | null; p75: number | null; p90: number | null };
  method: 'arithmetic_mean_sample_standard_deviation_linear_percentiles';
}

export interface TrendResult {
  n: number;
  S: number;
  variance: number;
  zScore: number;
  pValue: number;
  tau: number;
  senSlope: number | null;
  intercept: number | null;
  trend: 'increasing' | 'decreasing' | 'no_trend';
  significant: boolean;
  alpha: number;
  pValueMethod: 'exact_permutation' | 'normal_approximation' | 'insufficient';
  serialCorrelation: 'not_adjusted';
  limitations: string[];
}

export interface FingerprintIndicator {
  value: number | null;
  baseline: number | null;
  anomaly: number | null;
  unit: string;
  observationPeriod: string | null;
  sourceDataset: string;
  quality: DataQuality;
}

export type FingerprintPattern =
  | 'multiple_indicators_stressed'
  | 'rainfall_recovered_soil_stressed'
  | 'rainfall_recovered_vegetation_stressed'
  | 'soil_declining_with_normal_rainfall'
  | 'vegetation_deteriorating_after_rainfall_improvement'
  | 'multiple_indicators_recovering'
  | 'insufficient_data'
  | 'no_configured_pattern';

export function summarizeBaseline(
  input: Array<number | null | undefined>,
  minimumObservations = 10
): BaselineSummary {
  if (!Number.isInteger(minimumObservations) || minimumObservations < 1) {
    throw new RangeError('minimumObservations must be a positive integer.');
  }
  const values = input.filter((value): value is number => typeof value === 'number' && Number.isFinite(value)).sort((a, b) => a - b);
  const missingCount = input.length - values.length;
  const emptyPercentiles = { p10: null, p25: null, p75: null, p90: null };
  if (values.length < minimumObservations) {
    return {
      available: false,
      count: values.length,
      missingCount,
      mean: null,
      median: null,
      standardDeviation: null,
      percentiles: emptyPercentiles,
      method: 'arithmetic_mean_sample_standard_deviation_linear_percentiles',
    };
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  const quantile = (probability: number) => {
    const position = (values.length - 1) * probability;
    const lower = Math.floor(position);
    const upper = Math.ceil(position);
    return values[lower] + (values[upper] - values[lower]) * (position - lower);
  };

  return {
    available: true,
    count: values.length,
    missingCount,
    mean,
    median: quantile(0.5),
    standardDeviation: Math.sqrt(variance),
    percentiles: { p10: quantile(0.1), p25: quantile(0.25), p75: quantile(0.75), p90: quantile(0.9) },
    method: 'arithmetic_mean_sample_standard_deviation_linear_percentiles',
  };
}

export function rainfallAnomalyPercent(observed: number, baseline: number, epsilon = 1e-6): number | null {
  if (!Number.isFinite(observed) || !Number.isFinite(baseline) || baseline <= epsilon) return null;
  return ((observed - baseline) / baseline) * 100;
}

export function soilMoistureAnomaly(observed: number, baseline: number, standardDeviation?: number) {
  if (![observed, baseline].every(Number.isFinite)) {
    return { difference: null, standardized: null, percentile: null };
  }
  const difference = observed - baseline;
  return {
    difference,
    standardized: standardDeviation !== undefined && Number.isFinite(standardDeviation) && standardDeviation > 0
      ? difference / standardDeviation
      : null,
    percentile: null as number | null,
  };
}

export function vegetationAnomaly(observed: number, baseline: number): number | null {
  if (![observed, baseline].every(Number.isFinite)) return null;
  return observed - baseline;
}

export function assessDataQuality(validCount: number, missingCount: number, hasTrustedSource: boolean): DataQuality {
  if (!hasTrustedSource || !Number.isFinite(validCount) || !Number.isFinite(missingCount) || validCount <= 0 || missingCount < 0) {
    return 'insufficient';
  }
  const total = validCount + missingCount;
  if (total === 0) return 'insufficient';
  const missingFraction = missingCount / total;
  if (validCount >= 10 && missingFraction <= 0.1) return 'good';
  if (validCount >= 5 && missingFraction <= 0.3) return 'partial';
  return 'limited';
}

export function detectFingerprintPatterns(
  indicators: { rainfall: FingerprintIndicator; soilMoisture: FingerprintIndicator; vegetation: FingerprintIndicator },
  previous?: { rainfall: number | null; soilMoisture: number | null; vegetation: number | null },
  threshold = -1
): FingerprintPattern[] {
  const entries = [indicators.rainfall, indicators.soilMoisture, indicators.vegetation];
  if (entries.some((entry) => entry.anomaly === null || !Number.isFinite(entry.anomaly) ||
      entry.quality === 'insufficient' || entry.quality === 'limited')) return ['insufficient_data'];

  const [rain, soil, vegetation] = entries.map((entry) => entry.anomaly as number);
  const patterns: FingerprintPattern[] = [];
  if ([rain, soil, vegetation].filter((value) => value <= threshold).length >= 2) {
    patterns.push('multiple_indicators_stressed');
  }
  if (rain > threshold && soil <= threshold) patterns.push('rainfall_recovered_soil_stressed');
  if (rain > threshold && vegetation <= threshold) patterns.push('rainfall_recovered_vegetation_stressed');
  if (previous && previous.rainfall !== null && previous.soilMoisture !== null &&
      rain > threshold && previous.soilMoisture > soil) {
    patterns.push('soil_declining_with_normal_rainfall');
  }
  if (previous && previous.rainfall !== null && previous.vegetation !== null &&
      rain > previous.rainfall && vegetation < previous.vegetation) {
    patterns.push('vegetation_deteriorating_after_rainfall_improvement');
  }
  if (rain > threshold && soil > threshold && vegetation > threshold &&
      previous && previous.rainfall !== null && previous.soilMoisture !== null && previous.vegetation !== null &&
      (rain > previous.rainfall || soil > previous.soilMoisture || vegetation > previous.vegetation)) {
    patterns.push('multiple_indicators_recovering');
  }
  return patterns.length ? patterns : ['no_configured_pattern'];
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function normalCdf(value: number): number {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * x);
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t -
    0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
}

function exactPermutationP(values: number[], observedAbsS: number): number {
  let total = 0;
  let asExtreme = 0;
  const used = new Array(values.length).fill(false);
  const permutation: number[] = [];

  const visit = () => {
    if (permutation.length === values.length) {
      let statistic = 0;
      for (let i = 0; i < permutation.length - 1; i++) {
        for (let j = i + 1; j < permutation.length; j++) {
          if (permutation[j] > permutation[i]) statistic++;
          else if (permutation[j] < permutation[i]) statistic--;
        }
      }
      total++;
      if (Math.abs(statistic) >= observedAbsS) asExtreme++;
      return;
    }
    for (let i = 0; i < values.length; i++) {
      if (!used[i]) {
        used[i] = true;
        permutation.push(values[i]);
        visit();
        permutation.pop();
        used[i] = false;
      }
    }
  };

  visit();
  return total ? asExtreme / total : 1;
}

export function calculateMannKendall(
  inputValues: number[],
  alpha = 0.05,
  inputTimes?: number[]
): TrendResult {
  if (!(alpha > 0 && alpha < 1)) throw new RangeError('alpha must be between 0 and 1.');
  if (inputTimes && inputTimes.length !== inputValues.length) {
    throw new RangeError('times and values must have the same length.');
  }
  const pairs = inputValues
    .map((value, index) => ({ value, time: inputTimes ? inputTimes[index] : index }))
    .filter((pair) => Number.isFinite(pair.value) && Number.isFinite(pair.time));
  if (inputTimes && pairs.some((pair, index) => index > 0 && pair.time <= pairs[index - 1].time)) {
    throw new RangeError('valid times must be strictly increasing.');
  }
  const values = pairs.map((pair) => pair.value);
  const times = pairs.map((pair) => pair.time);
  const n = values.length;
  const insufficient = n < 2;
  const limitations = ['Serial correlation is not adjusted and may affect significance.', 'Trend association does not establish causation.'];
  let S = 0;
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const difference = values[j] - values[i];
      if (difference > 0) S++;
      else if (difference < 0) S--;
      if (times[j] !== times[i]) slopes.push(difference / (times[j] - times[i]));
    }
  }

  const tieCounts = new Map<number, number>();
  values.forEach((value) => tieCounts.set(value, (tieCounts.get(value) ?? 0) + 1));
  let tieCorrection = 0;
  tieCounts.forEach((count) => {
    if (count > 1) tieCorrection += count * (count - 1) * (2 * count + 5);
  });
  const variance = n < 2 ? 0 : (n * (n - 1) * (2 * n + 5) - tieCorrection) / 18;
  const zScore = variance <= 0 || S === 0 ? 0 : (S - Math.sign(S)) / Math.sqrt(variance);
  const pValueMethod = insufficient ? 'insufficient' : n <= 9 ? 'exact_permutation' : 'normal_approximation';
  const pValue = insufficient || variance <= 0
    ? 1
    : n <= 9
      ? exactPermutationP(values, Math.abs(S))
      : Math.min(1, 2 * (1 - normalCdf(Math.abs(zScore))));
  const tau = n < 2 ? 0 : S / (n * (n - 1) / 2);
  const senSlope = slopes.length ? median(slopes) : null;
  const intercept = senSlope === null ? null : median(values.map((value, index) => value - senSlope * times[index]));
  const significant = pValue < alpha;

  return {
    n,
    S,
    variance,
    zScore,
    pValue,
    tau,
    senSlope,
    intercept,
    trend: significant ? (S > 0 ? 'increasing' : S < 0 ? 'decreasing' : 'no_trend') : 'no_trend',
    significant,
    alpha,
    pValueMethod,
    serialCorrelation: 'not_adjusted',
    limitations,
  };
}

export function classifyRecovery(
  observations: Array<{ date: string; rainfall: number | null; soilMoisture: number | null; vegetation: number | null }>,
  threshold = -1
) {
  if (!observations.length || observations.some((item) =>
    [item.rainfall, item.soilMoisture, item.vegetation].some((value) => value === null || !Number.isFinite(value)))) {
    return { status: 'insufficient_data' as const, recoveryStart: null, durationPeriods: null, remainingAnomalies: null };
  }
  const recovered = (item: typeof observations[number]) =>
    (item.rainfall as number) > threshold &&
    (item.soilMoisture as number) > threshold &&
    (item.vegetation as number) > threshold;
  const latest = observations[observations.length - 1];
  const recoveredIndicators = [latest.rainfall, latest.soilMoisture, latest.vegetation]
    .filter((value) => value !== null && value > threshold).length;
  let recoveryStart: string | null = null;
  let durationPeriods = 0;
  for (let index = observations.length - 1; index >= 0 && recovered(observations[index]); index--) {
    recoveryStart = observations[index].date;
    durationPeriods++;
  }
  const allStressed = [latest.rainfall, latest.soilMoisture, latest.vegetation]
    .every((value) => value !== null && value <= threshold);
  return {
    status: recoveredIndicators === 3 ? 'recovery_across_indicators' as const
      : recoveredIndicators > 0 ? 'partial_recovery' as const
        : allStressed ? 'persistent_stress' as const : 'incomplete_recovery' as const,
    recoveryStart,
    durationPeriods: durationPeriods || null,
    remainingAnomalies: { rainfall: latest.rainfall, soilMoisture: latest.soilMoisture, vegetation: latest.vegetation },
  };
}

export function calculateEnvironmentalPriority(input: {
  anomalies: Array<number | null>;
  persistencePeriods: number;
  trend: 'increasing' | 'decreasing' | 'no_trend';
  quality: DataQuality;
}) {
  if (input.quality === 'insufficient' || input.quality === 'limited' ||
      input.anomalies.some((value) => value === null || !Number.isFinite(value))) {
    return { score: null, label: 'insufficient_data' as const };
  }
  const stressed = input.anomalies.filter((value) => (value as number) <= -1).length;
  const magnitude = input.anomalies.reduce<number>((sum, value) => sum + Math.min(3, Math.max(0, -(value as number))), 0);
  const qualityFactor = input.quality === 'good' ? 1 : input.quality === 'partial' ? 0.75 : 0.5;
  const persistence = Math.min(1, Math.max(0, input.persistencePeriods) / 6);
  const worseningFactor = input.trend === 'decreasing' ? 1 : input.trend === 'increasing' ? 0 : 0.5;
  const score = Math.round(100 * qualityFactor * (
    0.4 * stressed / 3 + 0.3 * magnitude / 9 + 0.2 * persistence + 0.1 * worseningFactor
  ));
  return { score, label: score >= 70 ? 'high_priority' as const : score >= 35 ? 'medium_priority' as const : 'routine_monitoring' as const };
}

export function detectEnvironmentalAlert(input: {
  anomalies: Array<number | null>;
  persistencePeriods: number;
  worseningTrend: boolean;
  quality: DataQuality;
}) {
  if (input.quality === 'insufficient' || input.quality === 'limited' ||
      input.anomalies.some((value) => value === null || !Number.isFinite(value))) {
    return { classification: 'insufficient_data' as const, triggered: false, ruleVersion: '1.0.0' };
  }
  const negativeCount = input.anomalies.filter((value) => (value as number) <= -1).length;
  const persistent = input.persistencePeriods >= 3;
  if (negativeCount >= 2 && persistent) {
    return { classification: 'elevated_environmental_concern' as const, triggered: true, ruleVersion: '1.0.0' };
  }
  if (negativeCount >= 1 && persistent || input.worseningTrend) {
    return { classification: 'watch' as const, triggered: true, ruleVersion: '1.0.0' };
  }
  return { classification: 'informational' as const, triggered: false, ruleVersion: '1.0.0' };
}
