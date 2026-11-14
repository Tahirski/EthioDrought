/**
 * Scientific Narrative Explainer & Trend Synthesis
 * Deterministic, mathematically grounded translation of calculated satellite indicators
 * into peer-reviewed research insights and humanitarian policy briefings.
 */

import { MannKendallResult } from './stats';
import { FingerprintDiagnosis } from './droughtEngine';

export interface ExplanationPayload {
  regionName: string;
  variableName: string;
  dateStr: string;
  rainfallZ: number;
  soilZ: number;
  vegZ: number;
  diagnosis: FingerprintDiagnosis;
  trendResult?: MannKendallResult;
  periodLabel: string;
}

export function generateScientificExplanation(
  payload: ExplanationPayload,
  mode: 'research' | 'policy' = 'research'
): { english: string; amharic: string } {
  const { regionName, variableName, dateStr, rainfallZ, soilZ, vegZ, diagnosis, trendResult, periodLabel } = payload;

  if (mode === 'policy') {
    // Humanitarian and Pastoral Briefing
    const en = `Pastoral Advisory for ${regionName} (${dateStr}):
${diagnosis.title.toUpperCase()} is detected. Standardized satellite metrics indicate rainfall anomaly at ${rainfallZ >= 0 ? '+' : ''}${rainfallZ.toFixed(2)}σ, root-zone soil moisture at ${soilZ >= 0 ? '+' : ''}${soilZ.toFixed(2)}σ, and rangeland vegetation health at ${vegZ >= 0 ? '+' : ''}${vegZ.toFixed(2)}σ.
${diagnosis.summary}
Recommended Action: ${diagnosis.agriculturalImplication}`;

    const am = `የአርብቶ አደርና እርዳታ አስቸኳይ መግለጫ ለ${regionName} (${dateStr})፡
${diagnosis.titleAmharic} ተመዝግቧል። የሳተላይት መረጃዎች እንደሚያሳዩት የዝናብ ልዩነት ${rainfallZ >= 0 ? '+' : ''}${rainfallZ.toFixed(2)}σ፣ የአፈር እርጥበት ${soilZ >= 0 ? '+' : ''}${soilZ.toFixed(2)}σ፣ እንዲሁም የዕፅዋት ሽፋን ${vegZ >= 0 ? '+' : ''}${vegZ.toFixed(2)}σ ነው።
${diagnosis.summaryAmharic}
የሚመከር እርምጃ፡ ${diagnosis.agriculturalImplication}`;

    return { english: en, amharic: am };
  }

  // Academic / Remote Sensing Research Mode
  let trendSectionEn = "";
  let trendSectionAm = "";
  if (trendResult) {
    const trendWord = trendResult.trend === 'increasing' ? 'positive upward' : trendResult.trend === 'decreasing' ? 'statistically significant declining' : 'neutral, non-monotonic';
    trendSectionEn = `\nLong-term trend detection across ${periodLabel} indicates a ${trendWord} trajectory for ${variableName} (Theil-Sen slope Q = ${trendResult.sensSlope > 0 ? '+' : ''}${trendResult.sensSlope.toFixed(5)} units/step, Mann-Kendall score S = ${trendResult.S}, standardized Z = ${trendResult.zScore.toFixed(2)}, two-tailed p = ${trendResult.pValue.toFixed(4)}, α = 0.05). ${trendResult.significant ? 'The null hypothesis of no trend is rejected at 95% confidence.' : 'Trend lacks statistical significance at the 95% confidence interval.'}`;

    const trendWordAm = trendResult.trend === 'increasing' ? 'እያደገ የሚሄድ' : trendResult.trend === 'decreasing' ? 'ቀጣይነት ያለው ቅናሽ የሚያሳይ' : 'የተረጋጋ ወይም ጉልህ ለውጥ የሌለው';
    trendSectionAm = `\nበ${periodLabel} የጊዜ መስኮት ውስጥ የ${variableName} የለውጥ ሂደት ${trendWordAm} አዝማሚያ እንዳለው ያሳያል (የለውጥ ፍጥነት Sen's slope Q = ${trendResult.sensSlope.toFixed(5)}፣ የ Mann-Kendall እሴት S = ${trendResult.S}፣ Z = ${trendResult.zScore.toFixed(2)}፣ p = ${trendResult.pValue.toFixed(4)})።`;
  }

  const en = `Earth Observation Diagnostic (${regionName}, ${dateStr}):
Multivariate anomaly convergence evaluates to ${diagnosis.title} (Phase: ${diagnosis.phase}).
${diagnosis.scientificExplanation}
Observed standardized departures: GPM Precipitation Z = ${rainfallZ.toFixed(2)}σ, FLDAS Noah Root-Zone Moisture Z = ${soilZ.toFixed(2)}σ, MODIS MOD13A2 NDVI Z = ${vegZ.toFixed(2)}σ against 2000–2020 monthly baselines.${trendSectionEn}`;

  const am = `የሳተላይት ምልከታ ሳይንሳዊ ምርመራ (${regionName}፣ ${dateStr})፡
የተቀናጀ የጠቋሚዎች ትንተና ${diagnosis.titleAmharic} ያሳያል።
${diagnosis.scientificExplanation}
የሳተላይት መዛነፎች፡ የ GPM ዝናብ Z = ${rainfallZ.toFixed(2)}σ፣ የ FLDAS አፈር እርጥበት Z = ${soilZ.toFixed(2)}σ፣ የ MODIS NDVI Z = ${vegZ.toFixed(2)}σ።${trendSectionAm}`;

  return { english: en, amharic: am };
}
