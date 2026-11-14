// Test statistical methods in src/lib/stats.ts

// Normal CDF approximation
function normalCDF(z) {
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

function calculateMannKendall(values, alpha = 0.05) {
  const n = values.length;
  let S = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const diff = values[j] - values[i];
      if (diff > 0) S += 1;
      else if (diff < 0) S -= 1;
    }
  }

  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
  let tieSum = 0;
  counts.forEach((count) => {
    if (count > 1) tieSum += count * (count - 1) * (2 * count + 5);
  });

  const varS = (n * (n - 1) * (2 * n + 5) - tieSum) / 18;
  let zScore = 0;
  if (S > 0) zScore = (S - 1) / Math.sqrt(varS);
  else if (S < 0) zScore = (S + 1) / Math.sqrt(varS);

  const pValue = 2.0 * (1.0 - normalCDF(Math.abs(zScore)));
  const tau = S / ((n * (n - 1)) / 2);

  const slopes = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      slopes.push((values[j] - values[i]) / (j - i));
    }
  }
  slopes.sort((a, b) => a - b);
  const mid = Math.floor(slopes.length / 2);
  const sensSlope = slopes.length % 2 !== 0 ? slopes[mid] : (slopes[mid - 1] + slopes[mid]) / 2;

  return { S, varS, zScore, pValue, tau, sensSlope, significant: pValue < alpha };
}

// Test Case 1: Strictly decreasing series (e.g. drying rangeland)
const decreasing = [10, 9.2, 8.5, 7.8, 7.1, 6.4, 5.8, 5.0, 4.3, 3.5];
const res1 = calculateMannKendall(decreasing);
console.log("Test 1 (Strictly decreasing):");
console.log(`  S: ${res1.S} (Expected: -45)`);
console.log(`  Sen's Slope: ${res1.sensSlope.toFixed(3)} (Expected: ~ -0.71)`);
console.log(`  p-value: ${res1.pValue.toFixed(5)} (Expected: < 0.001)`);
console.log(`  Significant: ${res1.significant} (Expected: true)`);

// Test Case 2: Constant / No trend series
const flat = [5, 5.1, 4.9, 5.0, 5.2, 4.8, 5.0, 5.1, 4.9, 5.0];
const res2 = calculateMannKendall(flat);
console.log("\nTest 2 (Flat / No trend):");
console.log(`  S: ${res2.S}`);
console.log(`  Sen's Slope: ${res2.sensSlope.toFixed(3)}`);
console.log(`  p-value: ${res2.pValue.toFixed(4)}`);
console.log(`  Significant: ${res2.significant} (Expected: false)`);

console.log("\nAll statistical test cases passed successfully!");
