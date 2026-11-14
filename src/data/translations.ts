export type Language = 'en' | 'am';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  taglineSecondary: string;
  nav: {
    overview: string;
    droughtMap: string;
    fingerprint: string;
    trendDetective: string;
    comparison: string;
    methodology: string;
    about: string;
  };
  hero: {
    boranaZone: string;
    oromiaRegion: string;
    observationPeriod: string;
    dataSource: string;
    verifiedData: string;
    exploreTrends: string;
    satelliteActive: string;
  };
  metrics: {
    rainfallAnomaly: string;
    soilMoistureAnomaly: string;
    vegetationHealth: string;
    droughtFingerprint: string;
    observedValue: string;
    baselineAverage: string;
    anomalyZ: string;
    standardDev: string;
    historicalTrend: string;
  };
  insights: {
    heading: string;
    fingerprintCardTitle: string;
    environmentalTrendTitle: string;
    regionalObservationTitle: string;
    scientificExplanationTitle: string;
    rainfallSignal: string;
    soilSignal: string;
    vegetationSignal: string;
    combinedInterpretation: string;
  };
  panels: {
    environmentalHistory: string;
    droughtIndicators: string;
    regionalComparison: string;
    dataSources: string;
    rainfall: string;
    soilMoisture: string;
    ndvi: string;
  };
  commandBar: {
    placeholder: string;
    actionSearch: string;
    shortcuts: string;
  };
  trendDetective: {
    title: string;
    subtitle: string;
    variableSelect: string;
    regionSelect: string;
    periodSelect: string;
    aggregation: string;
    monthly: string;
    annual: string;
    sensSlope: string;
    mannKendall: string;
    pValue: string;
    statisticalSignificance: string;
    methodologyNote: string;
  };
  comparison: {
    title: string;
    region1: string;
    region2: string;
    selectRegions: string;
    crossLag: string;
    correlation: string;
  };
  methodology: {
    title: string;
    subtitle: string;
    fldasTitle: string;
    gpmTitle: string;
    modisTitle: string;
  };
  about: {
    title: string;
    whyEthiopia: string;
    nasaRelevance: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: "ETHIODROUGHT",
    tagline: "BEYOND RAINFALL",
    taglineSecondary: "Turning NASA Earth observations into understandable environmental intelligence for Ethiopia.",
    nav: {
      overview: "Overview",
      droughtMap: "Drought Map",
      fingerprint: "Drought Fingerprint",
      trendDetective: "Trend Detective",
      comparison: "Regional Comparison",
      methodology: "Methodology",
      about: "About ETHIODROUGHT",
    },
    hero: {
      boranaZone: "BORANA ZONE",
      oromiaRegion: "OROMIA REGION, ETHIOPIA",
      observationPeriod: "LATEST OBSERVATION: NOV 2024",
      dataSource: "NASA FLDAS • GPM • MODIS",
      verifiedData: "VERIFIED SATELLITE ARCHIVE",
      exploreTrends: "EXPLORE SIGNALS",
      satelliteActive: "ACTIVE CONSTELLATION OVER ETHIOPIA",
    },
    metrics: {
      rainfallAnomaly: "Rainfall Anomaly",
      soilMoistureAnomaly: "Soil Moisture Anomaly",
      vegetationHealth: "Vegetation Health (NDVI)",
      droughtFingerprint: "Drought Fingerprint",
      observedValue: "Observed Value",
      baselineAverage: "Monthly Baseline (μ)",
      anomalyZ: "Standardized Anomaly (Z)",
      standardDev: "Std Deviation (σ)",
      historicalTrend: "Historical Trend",
    },
    insights: {
      heading: "DROUGHT INSIGHTS",
      fingerprintCardTitle: "Drought Fingerprint",
      environmentalTrendTitle: "Environmental Trend (2000–2024)",
      regionalObservationTitle: "Regional Observation Target",
      scientificExplanationTitle: "Scientific Explanation",
      rainfallSignal: "Rainfall Signal",
      soilSignal: "Soil Moisture Signal",
      vegetationSignal: "Vegetation Signal",
      combinedInterpretation: "Combined Interpretation",
    },
    panels: {
      environmentalHistory: "Environmental History",
      droughtIndicators: "Drought Indicators Breakdown",
      regionalComparison: "Regional Contrast",
      dataSources: "NASA Data Provenance",
      rainfall: "Rainfall (GPM)",
      soilMoisture: "Soil Moisture (FLDAS)",
      ndvi: "Vegetation (MODIS)",
    },
    commandBar: {
      placeholder: "Search an Ethiopian region or ask about environmental trends...",
      actionSearch: "Analyze",
      shortcuts: "Quick Query",
    },
    trendDetective: {
      title: "Earth System Trend Detective",
      subtitle: "Investigating 24-year environmental trends across Ethiopia with Mann-Kendall and Sen's Slope",
      variableSelect: "Environmental Variable",
      regionSelect: "Geographic Target",
      periodSelect: "Observation Window",
      aggregation: "Aggregation Mode",
      monthly: "Monthly Anomalies",
      annual: "Annual Mean",
      sensSlope: "Sen's Slope",
      mannKendall: "Mann-Kendall Test",
      pValue: "p-value",
      statisticalSignificance: "Statistical Significance",
      methodologyNote: "Non-parametric robust estimation against seasonal outliers and non-normal distributions.",
    },
    comparison: {
      title: "Regional Agro-Ecological Comparison",
      region1: "Primary Region",
      region2: "Comparison Region",
      selectRegions: "Compare Two Ethiopian Zones",
      crossLag: "Hydrological Lag Analysis",
      correlation: "Correlation Matrix",
    },
    methodology: {
      title: "Scientific Methodology & Data Provenance",
      subtitle: "Mathematical rigor, satellite sensor specifications, and Earth observation limitations",
      fldasTitle: "NASA FLDAS Noah Land Surface Model (0.1°)",
      gpmTitle: "NASA GPM IMERG Precipitation (0.1°)",
      modisTitle: "NASA MODIS MOD13A2 / MYD13A2 NDVI (1km / 0.05°)",
    },
    about: {
      title: "About ETHIODROUGHT",
      whyEthiopia: "Why Ethiopia? Pastoral Rangelands & Climate Stress",
      nasaRelevance: "NASA Space Apps 2026: Be An Earth System Trend Detective",
    },
  },
  am: {
    appName: "ኢትዮ-ድርቅ (ETHIODROUGHT)",
    tagline: "ከዝናብ ባሻገር (BEYOND RAINFALL)",
    taglineSecondary: "የናሳ ሳተላይት መረጃዎችን ወደ ግልጽ የአካባቢና የድርቅ ሳይንሳዊ ግንዛቤ መቀየር።",
    nav: {
      overview: "አጠቃላይ እይታ",
      droughtMap: "የድርቅ ካርታ",
      fingerprint: "የድርቅ ምልክት ሞተር",
      trendDetective: "የለውጥ መርማሪ",
      comparison: "የዞኖች ንፅፅር",
      methodology: "ሳይንሳዊ ዘዴ",
      about: "ስለ ኢትዮ-ድርቅ",
    },
    hero: {
      boranaZone: "ቦረና ዞን",
      oromiaRegion: "ኦሮሚያ ክልል፣ ኢትዮጵያ",
      observationPeriod: "የቅርብ ጊዜ መረጃ: ኅዳር 2024",
      dataSource: "ናሳ FLDAS • GPM • MODIS",
      verifiedData: "የተረጋገጠ የሳተላይት ማህደር",
      exploreTrends: "ምልክቶችን መርምር",
      satelliteActive: "ሳተላይቶች በኢትዮጵያ ምህዋር ላይ ይገኛሉ",
    },
    metrics: {
      rainfallAnomaly: "የዝናብ መጠን ልዩነት",
      soilMoistureAnomaly: "የአፈር እርጥበት ልዩነት",
      vegetationHealth: "የዕፅዋት ጤና (NDVI)",
      droughtFingerprint: "የድርቅ ምልክት መለያ",
      observedValue: "የተመዘገበ ዋጋ",
      baselineAverage: "የወር መደበኛ አማካይ (μ)",
      anomalyZ: "የተስተካከለ ልዩነት (Z)",
      standardDev: "መደበኛ ልዩነት (σ)",
      historicalTrend: "ታሪካዊ የለውጥ ሂደት",
    },
    insights: {
      heading: "የድርቅ ሳይንሳዊ ግንዛቤ",
      fingerprintCardTitle: "የድርቅ ምልክት መለያ",
      environmentalTrendTitle: "የ24 ዓመታት የአካባቢ ለውጥ (2000–2024)",
      regionalObservationTitle: "የተመረጠው የጥናት አካባቢ",
      scientificExplanationTitle: "ሳይንሳዊ ማብራሪያ",
      rainfallSignal: "የዝናብ ምልክት",
      soilSignal: "የአፈር እርጥበት ምልክት",
      vegetationSignal: "የዕፅዋት ምልክት",
      combinedInterpretation: "የተቀናጀ ድምዳሜ",
    },
    panels: {
      environmentalHistory: "የአካባቢ ታሪካዊ ሂደት",
      droughtIndicators: "የሦስቱ ጠቋሚዎች ዝርዝር",
      regionalComparison: "የአካባቢዎች ንፅፅር",
      dataSources: "የናሳ ሳተላይት መረጃ ምንጮች",
      rainfall: "ዝናብ (GPM)",
      soilMoisture: "የአፈር እርጥበት (FLDAS)",
      ndvi: "የዕፅዋት ሽፋን (MODIS)",
    },
    commandBar: {
      placeholder: "የኢትዮጵያ ዞንን ይፈልጉ ወይም ስለ ድርቅ ሁኔታ ጥያቄ ይጠይቁ...",
      actionSearch: "ተንትን",
      shortcuts: "ፈጣን ጥያቄዎች",
    },
    trendDetective: {
      title: "የምድር ስነ-ምህዳር ለውጥ መርማሪ",
      subtitle: "የ24 ዓመታት የኢትዮጵያን የአካባቢ ለውጥ በ Mann-Kendall እና Sen's Slope ስሌት መመርመር",
      variableSelect: "የአካባቢ መለኪያ",
      regionSelect: "የጂኦግራፊ አካባቢ",
      periodSelect: "የጊዜ መስኮት",
      aggregation: "የመረጃ ስብስብ",
      monthly: "ወርሃዊ ልዩነቶች",
      annual: "ዓመታዊ አማካይ",
      sensSlope: "የለውጥ ፍጥነት (Sen's Slope)",
      mannKendall: "የ Mann-Kendall ፈተና",
      pValue: "p-እሴት",
      statisticalSignificance: "ሳይንሳዊ አስተማማኝነት",
      methodologyNote: "ወቅታዊ ያልተለመዱ ሁኔታዎችን ያማከለ አስተማማኝ ስታትስቲካዊ ስሌት።",
    },
    comparison: {
      title: "የአግሮ-ኢኮሎጂካል ዞኖች ንፅፅር",
      region1: "ዋና ክልል/ዞን",
      region2: "የንፅፅር ክልል/ዞን",
      selectRegions: "ሁለት የኢትዮጵያ ዞኖችን ያነፃፅሩ",
      crossLag: "የዝናብና የዕፅዋት መዘግየት ትንተና",
      correlation: "የተዛምዶ ማትሪክስ",
    },
    methodology: {
      title: "ሳይንሳዊ ስነ-ዘዴና የመረጃ ምንጮች",
      subtitle: "የሒሳብ ቀመሮች፣ የሳተላይት መለኪያዎች እና የሳተላይት መረጃ ውስንነቶች",
      fldasTitle: "ናሳ FLDAS ኖህ የመሬት ሞዴል (0.1°)",
      gpmTitle: "ናሳ GPM IMERG የዝናብ መጠን (0.1°)",
      modisTitle: "ናሳ MODIS MOD13A2 የዕፅዋት ሽፋን (1km / 0.05°)",
    },
    about: {
      title: "ስለ ኢትዮ-ድርቅ (ETHIODROUGHT)",
      whyEthiopia: "ለምን ኢትዮጵያ? የአርብቶ አደር አካባቢዎችና የአየር ንብረት ጫና",
      nasaRelevance: "የናሳ ስፔስ አፕስ 2026 ውድድር ተሳትፎ",
    },
  },
};
