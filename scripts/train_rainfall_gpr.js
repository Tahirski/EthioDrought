const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { parseCsv } = require('./build_zone_overlay.js');

const ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(ROOT, 'data', 'source', 'ethiopia_rainfall_clean.csv');
const OUTPUT = path.join(ROOT, 'src', 'data', 'experimentalRainfallGpr.json');
const MIN_MONTHLY_COMPLETENESS = 0.9;
const VALIDATION_MONTHS = 12;
const PERIODIC_WEIGHT = 0.75;

function monthlyIndex(date) {
  const [year, month] = date.split('-').map(Number);
  return year * 12 + month - 1;
}

function nextMonth(date) {
  const [year, month] = date.split('-').map(Number);
  const next = new Date(Date.UTC(year, month, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`;
}

function loadMonthlySeries(csvText) {
  const rows = parseCsv(csvText);
  const requiredHeaders = ['date', 'precipitation_value'];
  for (const header of requiredHeaders) {
    if (!Object.hasOwn(rows[0], header)) throw new TypeError(`Rainfall CSV is missing required column "${header}".`);
  }

  const days = new Map();
  for (const row of rows) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) throw new TypeError(`Invalid daily date "${row.date}".`);
    const parsedDate = new Date(`${row.date}T00:00:00.000Z`);
    if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== row.date) {
      throw new TypeError(`Invalid daily date "${row.date}".`);
    }
    if (days.has(row.date)) throw new TypeError(`Duplicate rainfall date "${row.date}".`);
    const value = Number(row.precipitation_value);
    if (!Number.isFinite(value) || value < 0) throw new TypeError(`Invalid precipitation value for ${row.date}.`);
    days.set(row.date, { date: row.date, value });
  }
  const orderedDays = [...days.values()].sort((first, second) => first.date.localeCompare(second.date));
  const grouped = new Map();
  for (const item of orderedDays) {
    const month = item.date.slice(0, 7);
    const group = grouped.get(month) ?? { sum: 0, dailyCount: 0 };
    group.sum += item.value;
    group.dailyCount++;
    grouped.set(month, group);
  }

  const monthly = [...grouped].sort(([first], [second]) => first.localeCompare(second)).map(([month, group], index) => {
    const [year, monthNumber] = month.split('-').map(Number);
    const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    if (group.dailyCount / daysInMonth < MIN_MONTHLY_COMPLETENESS) {
      throw new TypeError(`Month ${month} has only ${group.dailyCount}/${daysInMonth} daily values.`);
    }
    return {
      date: month,
      index,
      sourceValue: group.sum / group.dailyCount,
      dailyCount: group.dailyCount,
      daysInMonth,
    };
  });
  if (monthly.length < 60) throw new TypeError(`At least 60 complete monthly observations are required; found ${monthly.length}.`);
  for (let index = 1; index < monthly.length; index++) {
    if (monthlyIndex(monthly[index].date) - monthlyIndex(monthly[index - 1].date) !== 1) {
      throw new TypeError(`Monthly rainfall series has a gap between ${monthly[index - 1].date} and ${monthly[index].date}.`);
    }
  }
  return { orderedDays, monthly };
}

function kernel(firstTime, secondTime, parameters) {
  const delta = firstTime - secondTime;
  const seasonalDistance = Math.sin(Math.PI * delta / 12);
  const periodic = Math.exp(-2 * seasonalDistance ** 2 / parameters.periodicLengthScale ** 2);
  const temporal = Math.exp(-0.5 * delta ** 2 / parameters.temporalLengthScale ** 2);
  return PERIODIC_WEIGHT * periodic + (1 - PERIODIC_WEIGHT) * temporal;
}

function cholesky(matrix, size) {
  const lower = new Float64Array(size * size);
  for (let row = 0; row < size; row++) {
    for (let column = 0; column <= row; column++) {
      let value = matrix[row * size + column];
      for (let inner = 0; inner < column; inner++) {
        value -= lower[row * size + inner] * lower[column * size + inner];
      }
      if (row === column) {
        if (!(value > 0) || !Number.isFinite(value)) throw new RangeError('GPR covariance matrix is not positive definite.');
        lower[row * size + column] = Math.sqrt(value);
      } else {
        lower[row * size + column] = value / lower[column * size + column];
      }
    }
  }
  return lower;
}

function solveLower(lower, vector, size) {
  const solution = new Float64Array(size);
  for (let row = 0; row < size; row++) {
    let value = vector[row];
    for (let column = 0; column < row; column++) value -= lower[row * size + column] * solution[column];
    solution[row] = value / lower[row * size + row];
  }
  return solution;
}

function solveUpperFromLower(lower, vector, size) {
  const solution = new Float64Array(size);
  for (let row = size - 1; row >= 0; row--) {
    let value = vector[row];
    for (let column = row + 1; column < size; column++) value -= lower[column * size + row] * solution[column];
    solution[row] = value / lower[row * size + row];
  }
  return solution;
}

function prepareTargets(records) {
  const transformed = records.map((record) => Math.log1p(record.sourceValue));
  const mean = transformed.reduce((sum, value) => sum + value, 0) / transformed.length;
  const variance = transformed.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (transformed.length - 1);
  const standardDeviation = Math.sqrt(variance);
  if (!(standardDeviation > 0) || !Number.isFinite(standardDeviation)) {
    throw new TypeError('Rainfall target has no usable variation for model training.');
  }
  return { mean, standardDeviation, values: transformed.map((value) => (value - mean) / standardDeviation) };
}

function fitGaussianProcess(records, parameters) {
  const size = records.length;
  const targets = prepareTargets(records);
  const covariance = new Float64Array(size * size);
  const noiseVariance = parameters.noiseStandardDeviation ** 2;
  for (let row = 0; row < size; row++) {
    for (let column = 0; column <= row; column++) {
      const value = kernel(records[row].index, records[column].index, parameters);
      covariance[row * size + column] = value;
      covariance[column * size + row] = value;
    }
    covariance[row * size + row] += noiseVariance + 1e-8;
  }

  const lower = cholesky(covariance, size);
  const intermediate = solveLower(lower, targets.values, size);
  const alpha = solveUpperFromLower(lower, intermediate, size);
  const quadratic = targets.values.reduce((sum, value, index) => sum + value * alpha[index], 0);
  const logDeterminantHalf = Array.from({ length: size }, (_, index) =>
    Math.log(lower[index * size + index]),
  ).reduce((sum, value) => sum + value, 0);
  const logMarginalLikelihood = -0.5 * quadratic - logDeterminantHalf - 0.5 * size * Math.log(2 * Math.PI);
  return { records, parameters, targets, lower, alpha, logMarginalLikelihood, size };
}

function predictGaussianProcess(model, targetIndex) {
  const covariance = model.records.map((record) => kernel(targetIndex, record.index, model.parameters));
  const predictiveMeanStandardized = covariance.reduce((sum, value, index) => sum + value * model.alpha[index], 0);
  const projected = solveLower(model.lower, covariance, model.size);
  const latentVariance = Math.max(0, 1 - projected.reduce((sum, value) => sum + value ** 2, 0));
  const predictiveVarianceStandardized = latentVariance + model.parameters.noiseStandardDeviation ** 2;
  const logMean = model.targets.mean + model.targets.standardDeviation * predictiveMeanStandardized;
  const logStandardDeviation = model.targets.standardDeviation * Math.sqrt(predictiveVarianceStandardized);
  return {
    mean: Math.max(0, Math.expm1(logMean + 0.5 * logStandardDeviation ** 2)),
    lower95: Math.max(0, Math.expm1(logMean - 1.96 * logStandardDeviation)),
    upper95: Math.max(0, Math.expm1(logMean + 1.96 * logStandardDeviation)),
  };
}

function selectHyperparameters(records) {
  const candidates = [];
  for (const periodicLengthScale of [0.45, 0.8]) {
    for (const temporalLengthScale of [3, 9, 24]) {
      for (const noiseStandardDeviation of [0.1, 0.2, 0.4]) {
        candidates.push({ periodicLengthScale, temporalLengthScale, noiseStandardDeviation });
      }
    }
  }
  let best = null;
  for (const parameters of candidates) {
    const candidate = fitGaussianProcess(records, parameters);
    if (!best || candidate.logMarginalLikelihood > best.logMarginalLikelihood) best = candidate;
  }
  return { ...best.parameters, logMarginalLikelihood: best.logMarginalLikelihood, candidatesEvaluated: candidates.length };
}

function summarizeMetrics(predictions) {
  const errors = predictions.map((item) => item.prediction.mean - item.observed);
  const absoluteError = errors.reduce((sum, error) => sum + Math.abs(error), 0) / errors.length;
  const rootMeanSquaredError = Math.sqrt(errors.reduce((sum, error) => sum + error ** 2, 0) / errors.length);
  return {
    count: predictions.length,
    mae: absoluteError,
    rmse: rootMeanSquaredError,
  };
}

function intervalCoverage(predictions) {
  return predictions.filter((item) =>
    item.observed >= item.prediction.lower95 && item.observed <= item.prediction.upper95,
  ).length / predictions.length;
}

function roundedMetrics(metrics) {
  const result = {
    ...metrics,
    mae: Number(metrics.mae.toFixed(5)),
    rmse: Number(metrics.rmse.toFixed(5)),
  };
  if (Number.isFinite(metrics.intervalCoverage95)) {
    result.intervalCoverage95 = Number(metrics.intervalCoverage95.toFixed(3));
  }
  return result;
}

function trainRainfallGpr({ csvText, generatedAt = new Date().toISOString(), checksumSha256 }) {
  const { orderedDays, monthly } = loadMonthlySeries(csvText);
  const splitIndex = monthly.length - VALIDATION_MONTHS;
  const parameterSelection = selectHyperparameters(monthly.slice(0, splitIndex));
  const parameters = {
    periodicLengthScale: parameterSelection.periodicLengthScale,
    temporalLengthScale: parameterSelection.temporalLengthScale,
    noiseStandardDeviation: parameterSelection.noiseStandardDeviation,
  };

  const backtest = [];
  for (let index = splitIndex; index < monthly.length; index++) {
    const model = fitGaussianProcess(monthly.slice(0, index), parameters);
    const prediction = predictGaussianProcess(model, monthly[index].index);
    backtest.push({
      date: monthly[index].date,
      observed: monthly[index].sourceValue,
      prediction,
      seasonalNaive: monthly[index - 12].sourceValue,
    });
  }
  const gprMetrics = {
    ...summarizeMetrics(backtest),
    intervalCoverage95: intervalCoverage(backtest),
  };
  const seasonalNaiveMetrics = summarizeMetrics(backtest.map((item) => ({
    observed: item.observed,
    prediction: { mean: item.seasonalNaive, lower95: Number.NEGATIVE_INFINITY, upper95: Number.POSITIVE_INFINITY },
  })));

  const finalModel = fitGaussianProcess(monthly, parameters);
  const finalPrediction = predictGaussianProcess(finalModel, monthly.length);
  const lastDate = monthly[monthly.length - 1].date;
  const forecastDate = nextMonth(lastDate);
  const unitNote = 'Unverified source units; value is the monthly mean of supplied daily precipitation values.';
  const sourceRow = parseCsv(csvText)[0];
  const roundedPrediction = {
    mean: Number(finalPrediction.mean.toFixed(5)),
    lower95: Number(finalPrediction.lower95.toFixed(5)),
    upper95: Number(finalPrediction.upper95.toFixed(5)),
  };

  return {
    model: {
      name: 'Experimental Gaussian Process Regression',
      status: 'experimental_not_for_operational_use',
      target: 'Monthly mean of daily precipitation source values',
      horizonMonths: 1,
      kernel: '0.75 annual periodic kernel + 0.25 temporal RBF kernel; Gaussian observation noise',
      targetTransform: 'log1p, standardized using each training fold only',
      hyperparameterSelection: 'Maximum log marginal likelihood over a fixed 18-candidate grid using only the pre-validation training period.',
      parameters,
      candidatesEvaluated: parameterSelection.candidatesEvaluated,
      validation: {
        method: '12-month expanding-window walk-forward; each prediction uses only earlier months.',
        start: monthly[splitIndex].date,
        end: monthly[monthly.length - 1].date,
        gpr: roundedMetrics(gprMetrics),
        seasonalNaiveBaseline: roundedMetrics(seasonalNaiveMetrics),
      },
    },
    source: {
      provider: 'NASA Giovanni (user-supplied export)',
      product: 'GPM_3IMERGDE_07',
      measurementDescription: sourceRow.measurement_description,
      spatialScope: sourceRow.spatial_scope,
      units: sourceRow.units,
      unitNote,
      dailyInputCount: orderedDays.length,
      monthlyObservationCount: monthly.length,
      monthlyCompletenessThreshold: MIN_MONTHLY_COMPLETENESS,
      observationPeriod: { start: monthly[0].date, end: lastDate },
      lastObservationDate: orderedDays[orderedDays.length - 1].date,
      checksumSha256,
      limitations: [
        'The data are one Ethiopia bounding-box average, not separate zone observations.',
        'The input CSV does not state precipitation units; outputs remain in the unverified source-value scale.',
        'The series ends in 2025-05; the next-step forecast is historical and not a forecast for the current date.',
        'This is a small prototype backtest with one annual validation cycle; results do not establish operational skill.',
      ],
    },
    forecast: {
      date: forecastDate,
      generatedAt,
      basedOnObservationThrough: lastDate,
      horizonMonths: 1,
      ...roundedPrediction,
      intervalLevel: 0.95,
      units: 'unverified source-value scale',
      isHistoricalForCurrentDate: forecastDate < generatedAt.slice(0, 7),
      interpretation: 'Exploratory forecast of the supplied national-box rainfall series only; not zone-specific, not current, and not an alert.',
    },
    history: monthly.map((record) => ({
      date: record.date,
      value: Number(record.sourceValue.toFixed(6)),
      dailyCount: record.dailyCount,
    })),
    trainingStatus: 'trained_experimental_national_box_rainfall_only',
  };
}

function trainFromFile(inputPath = INPUT, outputPath = OUTPUT) {
  const csvText = fs.readFileSync(inputPath, 'utf8');
  const checksumSha256 = crypto.createHash('sha256').update(csvText, 'utf8').digest('hex');
  const result = trainRainfallGpr({ csvText, checksumSha256 });
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  return result;
}

if (require.main === module) {
  try {
    const result = trainFromFile(process.argv[2] ? path.resolve(process.argv[2]) : INPUT,
      process.argv[3] ? path.resolve(process.argv[3]) : OUTPUT);
    console.log(JSON.stringify({
      output: process.argv[3] ? path.resolve(process.argv[3]) : OUTPUT,
      trainingStatus: result.trainingStatus,
      historyMonths: result.source.monthlyObservationCount,
      forecastDate: result.forecast.date,
      forecast: result.forecast.mean,
      interval95: [result.forecast.lower95, result.forecast.upper95],
      validation: result.model.validation,
      sourceUnits: result.source.units,
    }, null, 2));
  } catch (error) {
    console.error(`Rainfall GPR training failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  fitGaussianProcess,
  loadMonthlySeries,
  predictGaussianProcess,
  selectHyperparameters,
  trainFromFile,
  trainRainfallGpr,
};
