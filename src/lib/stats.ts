import { calculateMannKendall as calculateBackendMannKendall } from "@/lib/backend/science";

/**
 * Statistical calculations for Earth System Trend Detective
 * - Standardized Monthly Anomaly (Z-score against calendar month climatology)
 * - Mann-Kendall non-parametric trend test (with tie correction)
 * - Sen's slope estimator (Theil-Sen median slope)
 * - Exact permutation p-values for small samples and normal approximation for larger samples
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
  pValueMethod: 'exact_permutation' | 'normal_approximation' | 'insufficient';
  limitations: string[];
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
  alpha: number = 0.05,
  times?: number[]
): MannKendallResult {
  const result = calculateBackendMannKendall(values, alpha, times);
  const significanceLevel: MannKendallResult['significanceLevel'] = result.pValue < 0.01
    ? 'p < 0.01'
    : result.pValue < 0.05
      ? 'p < 0.05'
      : result.pValue < 0.10
        ? 'p < 0.10'
        : 'not_significant';

  return {
    n: result.n,
    S: result.S,
    varS: Number(result.variance.toFixed(3)),
    zScore: Number(result.zScore.toFixed(3)),
    pValue: Number(result.pValue.toFixed(6)),
    tau: Number(result.tau.toFixed(4)),
    sensSlope: Number((result.senSlope ?? 0).toFixed(5)),
    intercept: Number((result.intercept ?? 0).toFixed(4)),
    trend: result.trend,
    significant: result.significant,
    significanceLevel,
    pValueMethod: result.pValueMethod,
    limitations: result.limitations,
  };
}
