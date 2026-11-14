/**
 * Drought Fingerprint Engine - Multi-indicator Agreement & Decoupling Logic
 * Combines Rainfall (GPM/FLDAS), Soil Moisture (FLDAS), and Vegetation Health (MODIS NDVI)
 */

export type DroughtPhase =
  | 'compound_drought' // All 3 stressed
  | 'meteorological_onset' // Only rainfall stressed
  | 'soil_moisture_deficit' // Soil moisture stressed, root zone depleted
  | 'vegetation_impact' // Vegetation stressed (agricultural damage)
  | 'false_recovery' // Rainfall positive but root soil desiccated
  | 'vegetation_lag' // Rain & soil stressed, vegetation not yet showing damage
  | 'normal' // Balanced conditions
  | 'abnormally_wet' // Positive anomalies
  | 'insufficient_data';

export interface FingerprintDiagnosis {
  phase: DroughtPhase;
  title: string;
  titleAmharic: string;
  severity: 'extreme' | 'severe' | 'moderate' | 'mild' | 'none';
  droughtType: 'Agricultural & Meteorological' | 'Meteorological Only' | 'Hydrological / Soil' | 'Agricultural Lag' | 'None';
  summary: string;
  summaryAmharic: string;
  scientificExplanation: string;
  agriculturalImplication: string;
  indicators: {
    rainfall: { z: number; status: 'stressed' | 'normal' | 'wet'; label: string };
    soilMoisture: { z: number; status: 'stressed' | 'normal' | 'wet'; label: string };
    vegetation: { z: number; status: 'stressed' | 'normal' | 'wet'; label: string };
  };
  exploratoryCompositeIndex: number; // Transparent weighted combination
  thresholdUsed: number;
}

export function evaluateDroughtFingerprint(
  zRain: number,
  zSoil: number,
  zVeg: number,
  threshold: number = -1.0
): FingerprintDiagnosis {
  if (isNaN(zRain) || isNaN(zSoil) || isNaN(zVeg)) {
    return {
      phase: 'insufficient_data',
      title: 'Insufficient Observation Data',
      titleAmharic: 'በቂ የመረጃ ስብስብ አልተገኘም',
      severity: 'none',
      droughtType: 'None',
      summary: 'One or more satellite indicators lack valid observation data for this time step.',
      summaryAmharic: 'ለዚህ ወቅት ከሳተላይት የተሟላ መረጃ አልተገኘም።',
      scientificExplanation: 'Requires simultaneous valid observations from NASA GPM, FLDAS Noah LSM, and MODIS NDVI.',
      agriculturalImplication: 'Cannot evaluate agricultural stress without complete environmental signals.',
      indicators: {
        rainfall: { z: zRain, status: 'normal', label: 'No Data' },
        soilMoisture: { z: zSoil, status: 'normal', label: 'No Data' },
        vegetation: { z: zVeg, status: 'normal', label: 'No Data' },
      },
      exploratoryCompositeIndex: 0,
      thresholdUsed: threshold,
    };
  }

  const rainStressed = zRain <= threshold;
  const soilStressed = zSoil <= threshold;
  const vegStressed = zVeg <= threshold;

  const rainStatus = rainStressed ? 'stressed' : zRain > 0.8 ? 'wet' : 'normal';
  const soilStatus = soilStressed ? 'stressed' : zSoil > 0.8 ? 'wet' : 'normal';
  const vegStatus = vegStressed ? 'stressed' : zVeg > 0.8 ? 'wet' : 'normal';

  // Exploratory composite index (transparent formula: 35% rain + 35% soil + 30% veg)
  const exploratoryCompositeIndex = Number((0.35 * zRain + 0.35 * zSoil + 0.30 * zVeg).toFixed(2));

  let phase: DroughtPhase = 'normal';
  let title = 'Equilibrium / No Significant Stress';
  let titleAmharic = 'መደበኛ የአካባቢ ሁኔታ (ምንም ድርቅ የለም)';
  let severity: FingerprintDiagnosis['severity'] = 'none';
  let droughtType: FingerprintDiagnosis['droughtType'] = 'None';
  let summary = 'Environmental indicators are within normal seasonal variation across Borena rangelands.';
  let summaryAmharic = 'ሁሉም የአካባቢ ጠቋሚዎች በመደበኛ ወቅት አማካይ ውስጥ ይገኛሉ።';
  let scientificExplanation = 'Rainfall, soil moisture, and NDVI anomalies fluctuate within the expected climatological standard deviation.';
  let agriculturalImplication = 'Adequate forage and water points expected for livestock and seasonal pasture regeneration.';

  if (rainStressed && soilStressed && vegStressed) {
    // All 3 stressed
    phase = 'compound_drought';
    title = 'Severe Compound Agricultural Drought';
    titleAmharic = 'ከፍተኛ የተቀናጀ የግብርና እና የአርብቶ አደር ድርቅ';
    severity = (zRain < -1.8 || zSoil < -1.8 || zVeg < -1.8) ? 'extreme' : 'severe';
    droughtType = 'Agricultural & Meteorological';
    summary = 'Atmospheric precipitation deficit has cascaded through root-zone moisture depletion into severe vegetation collapse.';
    summaryAmharic = 'የዝናብ እጥረት ወደ አፈር እርጥበት መድረቅና የሣር እንዲሁም ዕፅዋት መጥፋት ተሸጋግሯል።';
    scientificExplanation = `Unanimous negative agreement: Rainfall anomaly (${zRain.toFixed(2)}σ), Soil moisture (${zSoil.toFixed(2)}σ), and MODIS NDVI (${zVeg.toFixed(2)}σ) all exceed the severe deficit threshold of ${threshold}σ.`;
    agriculturalImplication = 'Extreme risk to pastoral livestock herds; extensive pasture exhaustion, dry watering ponds (ellas/haros), and emergency fodder intervention required.';
  } else if (rainStressed && !soilStressed && !vegStressed) {
    // Meteorological only
    phase = 'meteorological_onset';
    title = 'Meteorological Deficit (Early Warning)';
    titleAmharic = 'የዝናብ እጥረት ጅምር (ቅድመ ማስጠንቀቂያ)';
    severity = 'moderate';
    droughtType = 'Meteorological Only';
    summary = 'Rainfall is significantly below normal, but soil moisture and rangeland vegetation are currently buffered by residual moisture.';
    summaryAmharic = 'ዝናብ በእጅጉ ቢቀንስም አፈሩና ዕፅዋቱ አሁንም ያለፈውን እርጥበት ጠብቀው ይገኛሉ።';
    scientificExplanation = `Meteorological anomaly (${zRain.toFixed(2)}σ) is decoupled from soil storage (${zSoil.toFixed(2)}σ) and canopy greenness (${zVeg.toFixed(2)}σ). Typical lag of 30–60 days before root-zone and canopy stress manifest.`;
    agriculturalImplication = 'Pastures remain viable in the near term; however, continuous monitoring is critical as soil reserves will deplete without subsequent showers.';
  } else if (soilStressed && !vegStressed) {
    // Soil moisture deficit preceding vegetation decline
    phase = 'vegetation_lag';
    title = 'Root-Zone Desiccation (Vegetation Lag)';
    titleAmharic = 'የስር አፈር መድረቅ (የዕፅዋት መዘግየት)';
    severity = 'moderate';
    droughtType = 'Hydrological / Soil';
    summary = 'Soil moisture has dropped to drought levels. Vegetation remains green for now, but canopy collapse is imminent within weeks.';
    summaryAmharic = 'የአፈር እርጥበት ደርቋል። ዕፅዋቱ ገና አረንጓዴ ቢመስሉም በጥቂት ሳምንታት ውስጥ ይደርቃሉ።';
    scientificExplanation = `FLDAS Noah 0-100cm moisture anomaly (${zSoil.toFixed(2)}σ) reveals root-zone exhaustion. MODIS NDVI (${zVeg.toFixed(2)}σ) lags behind soil desiccation because woody shrubs and deep root systems retain greenness temporarily.`;
    agriculturalImplication = 'Deep water tables and shallow watering ponds are dropping. Pastoralists should prepare for impending grazing pressure.';
  } else if (!rainStressed && soilStressed && vegStressed) {
    // False recovery or green-up mirage
    phase = 'false_recovery';
    title = 'Ephemeral Green-up Mirage / Subsurface Drought';
    titleAmharic = 'የውሸት ማገገም (የላይኛ ዝናብ ከስር ድርቅ ጋር)';
    severity = 'severe';
    droughtType = 'Agricultural & Meteorological';
    summary = 'Recent rains have arrived, but subsurface root-zone moisture and perennial vegetation remain severely compromised.';
    summaryAmharic = 'ጊዜያዊ ዝናብ ቢዘንብም ሥር ያለው ጥልቅ አፈርና ቋሚ ሳሮች አሁንም በከፍተኛ ድርቅ ውስጥ ናቸው።';
    scientificExplanation = `GPM rainfall is near/above normal (${zRain.toFixed(2)}σ), but FLDAS root-zone moisture (${zSoil.toFixed(2)}σ) and MODIS NDVI (${zVeg.toFixed(2)}σ) confirm deep hydrological drought persistence. Single rain showers do not recharge depleted aquifers.`;
    agriculturalImplication = 'Superficial weed greening must not be mistaken for drought termination. Livestock carrying capacity remains severely depressed.';
  } else if (!rainStressed && !soilStressed && vegStressed) {
    // Vegetation stress only (pests, degradation, delayed season)
    phase = 'vegetation_impact';
    title = 'Canopy Degradation / Delayed Green-up';
    titleAmharic = 'የዕፅዋት ሽፋን መጎዳት';
    severity = 'mild';
    droughtType = 'Agricultural Lag';
    summary = 'Rainfall and soil moisture are acceptable, yet vegetation greenness remains suppressed, indicating land degradation or late germination.';
    summaryAmharic = 'ዝናብና የአፈር እርጥበት ደህና ቢሆንም የዕፅዋት ሽፋን ዝቅተኛ ሆኖ ቆይቷል።';
    scientificExplanation = `NDVI anomaly (${zVeg.toFixed(2)}σ) is suppressed despite positive hydrologic forcing (Rain: ${zRain.toFixed(2)}σ, Soil: ${zSoil.toFixed(2)}σ). Potential causes: overgrazing, invasive bush encroachment, or seasonal phenological shift.`;
    agriculturalImplication = 'Requires rangeland health inspection; pastoralists face delayed pasture regeneration despite rainfall presence.';
  } else if (zRain > 1.2 && zSoil > 1.2) {
    phase = 'abnormally_wet';
    title = 'Surplus Moisture / Flood & Surge Risk';
    titleAmharic = 'ከፍተኛ የውሃና የጎርፍ መጠን';
    severity = 'none';
    droughtType = 'None';
    summary = 'Both rainfall and soil moisture are significantly above historical norms, offering pasture recharge but elevated flash flood hazard.';
    summaryAmharic = 'ዝናቡና እርጥበቱ ከመደበኛው በላይ በመሆኑ ለግጦሽ መልካም ቢሆንም የጎርፍ አደጋ ሊያስከትል ይችላል።';
    scientificExplanation = `Anomalies exceed +1.2σ. Favorable for deep aquifer recharge in arid pastoral basins, but risks flash floods in low-lying woredas (e.g., Moyale, Dillo).`;
    agriculturalImplication = 'Abundant grazing biomass; potential for waterborne livestock disease and infrastructure disruption.';
  }

  return {
    phase,
    title,
    titleAmharic,
    severity,
    droughtType,
    summary,
    summaryAmharic,
    scientificExplanation,
    agriculturalImplication,
    indicators: {
      rainfall: { z: zRain, status: rainStatus, label: `${zRain > 0 ? '+' : ''}${zRain.toFixed(2)} σ` },
      soilMoisture: { z: zSoil, status: soilStatus, label: `${zSoil > 0 ? '+' : ''}${zSoil.toFixed(2)} σ` },
      vegetation: { z: zVeg, status: vegStatus, label: `${zVeg > 0 ? '+' : ''}${zVeg.toFixed(2)} σ` },
    },
    exploratoryCompositeIndex,
    thresholdUsed: threshold,
  };
}
