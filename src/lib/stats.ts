/**
 * Statistical calculations for Earth System Trend Detective
 * - Standardized Monthly Anomaly (Z-score against calendar month climatology)
 * - Mann-Kendall non-parametric trend test (with tie correction)
 * - Sen's slope estimator (Theil-Sen median slope)
 * - Two-tailed p-value via high-precision normal CDF approximation
 */

export interface AnomalyResult {
  observed: number;
  monthlyMean: number;
  monthlyStdDev: number;
  anomalyZ: number; // Z-score
  departure: number; // raw difference (observed - mean)
}

export interface MannKendallResult {
  n: number;
  S: number;
  varS: number;
  zScore: number;
  pValue: number;
  tau: number;
  sensSlope: number; // change per unit time
  intercept: number;
  trend: 'increasing' | 'decreasing' | 'no_trend';
  significant: boolean; // at alpha = 0.05
  significanceLevel: 'p < 0.01' | 'p < 0.05' | 'p < 0.10' | 'not_significant';
}

/**
 * Standard Normal Cumulative Distribution Function (Abramowitz and Stegun 26.2.17)
 * Accurate to |error| < 7.5e-8
 */
export function normalCDF(z: number): number {
  if (isNaN(z)) return 0.5;
  const p = 0.2316419;
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;

  const absZ = Math.abs(z);
  const t = 1.0 / (1.0 + p * absZ);
  const pdf = (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * absZ * absZ);
  const cdf = 1.0 - pdf * (b1 * t + b2 * Math.pow(t, 2) + b3 * Math.pow(t, 3) + b4 * Math.pow(t, 4) + b5 * Math.pow(t, 5));

  return z >= 0 ? cdf : 1.0 - cdf;
}

/**
 * Compute Standardized Anomaly: Z = (X - mu) / sigma
 * Uses calendar month baseline (1-12)
 */
export function calculateMonthlyClimatology(
  historicalData: { month: number; value: number }[]
): Map<number, { mean: number; stdDev: number; count: number }> {
  const byMonth = new Map<number, number[]>();
  for (let m = 1; m <= 12; m++) {
    byMonth.set(m, []);
  }

  for (const item of historicalData) {
    if (typeof item.value === 'number' && !isNaN(item.value)) {
      byMonth.get(item.month)?.push(item.value);
    }
  }

  const climatology = new Map<number, { mean: number; stdDev: number; count: number }>();
  for (let m = 1; m <= 12; m++) {
    const vals = byMonth.get(m) || [];
    const count = vals.length;
    if (count === 0) {
      climatology.set(m, { mean: 0, stdDev: 1, count: 0 });
      continue;
    }
    const sum = vals.reduce((acc, v) => acc + v, 0);
    const mean = sum / count;
    const variance = count > 1
      ? vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (count - 1)
      : 0;
    const stdDev = Math.sqrt(variance);
    climatology.set(m, { mean, stdDev: stdDev > 1e-6 ? stdDev : 1e-6, count });
  }

  return climatology;
}

export function computeStandardizedAnomaly(
  observed: number,
  month: number,
  climatology: Map<number, { mean: number; stdDev: number }>
): AnomalyResult {
  const clim = climatology.get(month) || { mean: 0, stdDev: 1 };
  const departure = observed - clim.mean;
  const anomalyZ = clim.stdDev > 1e-6 ? departure / clim.stdDev : 0;

  return {
    observed,
    monthlyMean: clim.mean,
    monthlyStdDev: clim.stdDev,
    anomalyZ: Number(anomalyZ.toFixed(3)),
    departure: Number(departure.toFixed(3))
  };
}

/**
 * Mann-Kendall Trend Test with Sen's Slope
 * Rigorous statistical implementation conforming to PyMannKendall / SciPy
 */
export function calculateMannKendall(
  values: number[],
  alpha: number = 0.05
): MannKendallResult {
  const n = values.length;
  if (n < 4) {
    return {
      n,
      S: 0,
      varS: 0,
      zScore: 0,
      pValue: 1,
      tau: 0,
      sensSlope: 0,
      intercept: values[0] || 0,
      trend: 'no_trend',
      significant: false,
      significanceLevel: 'not_significant'
    };
  }

  // 1. Calculate Mann-Kendall S statistic
  let S = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const diff = values[j] - values[i];
      if (diff > 0) S += 1;
      else if (diff < 0) S -= 1;
    }
  }

  // 2. Account for tied groups in variance calculation
  const counts = new Map<number, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  let tieSum = 0;
  counts.forEach((count) => {
    if (count > 1) {
      tieSum += count * (count - 1) * (2 * count + 5);
    }
  });

  const varS = (n * (n - 1) * (2 * n + 5) - tieSum) / 18;

  // 3. Calculate Z score with continuity correction
  let zScore = 0;
  if (S > 0) {
    zScore = (S - 1) / Math.sqrt(varS);
  } else if (S < 0) {
    zScore = (S + 1) / Math.sqrt(varS);
  } else {
    zScore = 0;
  }

  // 4. Two-tailed p-value
  const pValue = 2.0 * (1.0 - normalCDF(Math.abs(zScore)));

  // 5. Kendall's Tau
  const tau = S / ((n * (n - 1)) / 2);

  // 6. Sen's Slope calculation (median of all pairwise slopes)
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      slopes.push((values[j] - values[i]) / (j - i));
    }
  }
  slopes.sort((a, b) => a - b);
  const mid = Math.floor(slopes.length / 2);
  const sensSlope = slopes.length % 2 !== 0
    ? slopes[mid]
    : (slopes[mid - 1] + slopes[mid]) / 2;

  // 7. Calculate intercept (median of y_i - slope * x_i)
  const intercepts: number[] = [];
  for (let i = 0; i < n; i++) {
    intercepts.push(values[i] - sensSlope * i);
  }
  intercepts.sort((a, b) => a - b);
  const midInt = Math.floor(intercepts.length / 2);
  const intercept = intercepts.length % 2 !== 0
    ? intercepts[midInt]
    : (intercepts[midInt - 1] + intercepts[midInt]) / 2;

  // 8. Determine trend classification and significance
  const significant = pValue < alpha;
  let trend: 'increasing' | 'decreasing' | 'no_trend' = 'no_trend';
  if (significant) {
    if (S > 0) trend = 'increasing';
    else if (S < 0) trend = 'decreasing';
  }

  let significanceLevel: 'p < 0.01' | 'p < 0.05' | 'p < 0.10' | 'not_significant' = 'not_significant';
  if (pValue < 0.01) significanceLevel = 'p < 0.01';
  else if (pValue < 0.05) significanceLevel = 'p < 0.05';
  else if (pValue < 0.10) significanceLevel = 'p < 0.10';

  return {
    n,
    S,
    varS: Number(varS.toFixed(3)),
    zScore: Number(zScore.toFixed(3)),
    pValue: Number(pValue.toFixed(4)),
    tau: Number(tau.toFixed(4)),
    sensSlope: Number(sensSlope.toFixed(5)),
    intercept: Number(intercept.toFixed(4)),
    trend,
    significant,
    significanceLevel
  };
}
