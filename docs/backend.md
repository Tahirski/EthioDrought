# ETHIODROUGHT backend (API v1)

## Current implementation and limits

The backend runs in the existing Next.js 15 application. There is no separate Python service or SQL database. API state for sample alerts, SMS and email drafts, contacts, ingestion logs, uploaded observations, and audit entries is stored atomically in a local JSON file (default `.local/ethiodrought-state.json`; override with `ETHIODROUGHT_STATE_FILE`). This is suitable for a single local Node process, not multi-instance production deployment. Back up and restrict access to that file.

The application retrieves NASA POWER monthly MERRA-2 data on demand for a representative point inside Borena. `GET /api/v1/observations/borena` returns corrected precipitation rate (converted from mm/day to monthly accumulation) and unitless root-zone wetness from 2001 through the latest complete year. The response includes source metadata, a matching-month 2001–2020 baseline, anomalies, and explicit limitations. This is a point-based reanalysis, not a zone-wide average or a direct satellite/station measurement; root-zone wetness is not FLDAS volumetric soil moisture. Requests are cached in process for one hour.

The 2000–2024 series used by the other existing analysis views remain deterministic synthetic demonstrations. They are marked `isDemonstration: true`; API results identify the synthetic source and prohibit scientific interpretation. The Data page has a separate live NASA POWER browser and does not silently substitute this reanalysis for the demo series. There is no operational GPM IMERG ingestion adapter, FLDAS time series, MODIS NDVI, or verified zonal monthly feed. A user-supplied national-box IMERG series is used only by the experimental rainfall predictor described below. The main investigation map continues to show the Borena boundary only. The Data page additionally displays all 72 supplied Ethiopia ADM2 zone boundaries with spatial summaries from the supplied soil-wetness and surface-temperature grid files. These are static, approximate spatial summaries—not current conditions, drought classifications, or model inputs.

The map is deliberately fail-closed: indicator-layer selection changes the investigation topic but does not create an observation overlay. It displays `Insufficient data` and omits synthetic drought classifications, station markers, anomaly values, observation dates, and retrieval dates. Historical playback, regional comparison, and map reports are not backed by verified observations.

## Supplied 72-zone data overlay and forecast readiness

The supplied zone GeoJSON is stored at `public/zone-data/ethiopia_zones.geojson` and declares EPSG:4326. Source CSVs are stored in `data/source/`; the combined reference CSV is excluded from processing because it repeats long-term spatial averages against daily rainfall dates.

`node scripts/build_zone_overlay.js` regenerates `src/data/ethiopiaZoneDatasetOverlay.json`. It assigns each unique grid-cell center to a polygon using point-in-polygon (respecting polygon holes), then reports an unweighted mean of assigned centers per zone. The supplied soil-wetness grid has values in 56 of 72 zones (298 assigned centers); the surface-temperature grid has values in 42 of 72 zones (93 assigned centers). Zones without a center are left unavailable. This is not a fractional-cell or area-weighted zonal statistic.

The soil-wetness file is NASA MERRA-2 GWETTOP, unitless and averaged across 2000-06-01 to 2025-05-31. The temperature file is daytime AIRS surface temperature in °C, time-averaged across 2002-08-31 to 2016-09-24; it is not near-surface air temperature. Both support spatial context only and do not contain monthly observations.

The rainfall CSV has 9,131 daily values from 2000-06-01 to 2025-05-31, each a mean over an Ethiopia bounding box, not a zone or grid-cell value. Its units are unstated. It cannot be spatially joined to the zone polygons or used as a verified zone-level rainfall target. It is used only for the separate exploratory national-box rainfall model below. Zone-specific drought-model training remains blocked until there are quality-screened, paired monthly rainfall and soil-moisture observations per zone with documented units, product versions, dates, and extraction provenance.

### Experimental rainfall predictor

The Predictor page and `GET /api/v1/predictions/rainfall` use a first-draft Gaussian Process Regression trained only on the supplied 9,131 daily national-box rainfall values. `npm run train:rainfall` aggregates these to monthly means (at least 90% daily coverage required), applies `log1p`, standardizes within each training fold, and uses a combined annual-periodic and temporal RBF kernel. Hyperparameters are selected from 18 candidates by training-fold log marginal likelihood. The saved forecast artifact is `src/data/experimentalRainfallGpr.json`.

The model has 300 monthly means from 2000-06 through 2025-05. It produces a one-step forecast for 2025-06, with mean 2.41291 and 95% model interval [1.19448, 4.07096] in the unverified source-value scale. A 12-month expanding-window walk-forward check (2024-06 through 2025-05) yielded GPR MAE 0.45985 and RMSE 0.54950; the same-month-previous-year baseline had MAE 0.68663 and RMSE 0.92253. The GPR interval contained 11 of the 12 held-out values (91.7%). This single annual holdout is too small to establish forecast skill.

The forecast date is historical relative to the current date, the source units are not stated in the CSV, and the spatial values are national bounding-box averages. This experimental model is not a Borena or 72-zone forecast, does not predict soil moisture, and must not be used for drought alerts or operational decisions. Re-run the training script only after updating the source CSV and confirming its units and product metadata.

The registry distinguishes the integrated NASA POWER MERRA-2 point series from planned primary products. GPM IMERG, FLDAS, and MOD13A2 remain planned. SMAP is a planned alternative and is not harmonized with FLDAS. NOAA station availability in Borena has not been established. Giovanni, AppEEARS, GES DISC hydrology time series, and KNMI Climate Explorer are exploration/extraction resources, not observed data integrations. SWOT, RADARSAT Constellation Mission, and GEO.ca are not integrated. NASA POWER is public and does not require credentials.

Environmental alerts are not automated from this series: the latest monthly data are historical (through the previous year), only two variables are returned, and the API response lacks product QA flags and zonal aggregation. The Alerts page remains a sample workflow. Email is only available for explicitly approved sample drafts under the current routes; SMS remains simulation-only. A current, quality-controlled multi-indicator source and a selected SMS provider/verified destination are prerequisites before operational notification logic can be enabled.

## Run and configuration

The Next.js process serves both frontend and API; see the [launch commands](./launch.md).

`SMS_MODE` defaults to `sample`; any other value disables message generation/simulation and the mock provider refuses dispatch. An HTTP payload cannot alter this server-side setting. There is no live SMS provider or live dispatch endpoint. Do not expose the admin token to browser code.

Optional settings: `ETHIODROUGHT_STATE_FILE`, `BASELINE_START_YEAR` (default 2000), `BASELINE_END_YEAR` (default 2020), and `MIN_BASELINE_OBSERVATIONS` (default 10). Contact management, review, simulation, status, and history require both admin environment variables and a matching `Authorization: Bearer ...` token. An authenticated identity is taken from `ADMIN_REVIEWER_ID`, not the request body. Contacts in this version cannot have phone numbers or be marked verified.

Email is disabled unless `EMAIL_MODE=smtp`. The default recipient is `ezraambaw@gmail.com`; `ALERT_EMAIL_RECIPIENT` changes it. Gmail SMTP defaults to `smtp.gmail.com:465`; override the host, port, secure flag, user, password, and sender with `EMAIL_SMTP_HOST`, `EMAIL_SMTP_PORT`, `EMAIL_SMTP_SECURE`, `EMAIL_SMTP_USER`, `EMAIL_SMTP_PASS`, and `EMAIL_FROM_ADDRESS`. SMTP credentials are server-only. Email generation, approval, sending, and history all require admin authorization. Only sample-workflow alerts can generate email in this version.

## Routes

All routes are under `/api/v1`. JSON errors use `{ "error": "stable_error_code" }`. Non-public notification history/status and contact mutation require admin authorization.

| Method and route | Behavior / response |
|---|---|
| `GET /health`, `GET /metadata` | Service and configuration status; NASA POWER point retrieval is available, but primary drought products and verified zonal observations are not integrated. |
| `GET /observations/borena` | Fetches NASA POWER monthly MERRA-2 `PRECTOTCORR` and `GWETROOT` at the Borena representative point. Returns raw/derived units, 2001–2020 matching-month standardized anomalies, retrieval time, and limitations; errors return 502. |
| `GET /predictions/rainfall` | Returns the stored experimental national-box rainfall GPR one-month forecast, walk-forward metrics, model details, and source limitations. The forecast is historical and not operational. |
| `GET /regions` | `{ regions: [{ id, name, administrativeLevel, parentId, geometry, geometryStatus, geometrySource, datasetCoverage }] }`. Only Borena currently has verified public boundary geometry; other regions return `null` geometry. |
| `GET /regions/{id}` | Region record; unknown IDs return 404. |
| `GET /regions/{id}/children` | Empty list with reason until verified subordinate boundaries (e.g. Borena woredas) are configured. |
| `GET /regions/{id}/indicators` | Rainfall, soil moisture, and vegetation objects with latest values, matching-month baseline summary, time-series points, units, source, quality, and limitations. |
| `GET /regions/{id}/indicators/{rainfall\|soil-moisture\|vegetation}` | Same contract for one variable. |
| `GET /regions/{id}/fingerprint` | Individual indicator values and pattern slots. Composite is null while source quality is insufficient. |
| `GET /regions/{id}/fingerprint/timeline` | Monthly demonstration anomaly series; every point is explicitly marked sample-only. |
| `GET /regions/{id}/recovery` | Recovery status and threshold definition; results are not scientifically actionable for demo data. |
| `GET /regions/{id}/trends` | Mann–Kendall, Sen slope, p-value method and caveats. |
| `GET /rankings/environmental-priority` | Configured transparent ranking contract; score is null when source quality is insufficient. |
| `GET /datasets`, `GET /datasets/{id}` | Dataset registry with product, variable, units, resolution, access method, status, quality, and limitations. |
| `GET /references` | Provided resources categorized by dataset, exploration, extraction, validation, supplementary, methodology, context, or tutorial role. Listing is not evidence of ingestion or validation. |
| `GET /regions/{id}/data-quality` | Dataset-specific quality and source status; demo data remain insufficient. |
| `GET /compare?regions=borena,somali` | Synchronized indicator/trend/fingerprint response over the common monthly period. Invalid region IDs return 400. The current comparison is demonstration-only. |
| `POST /ingestions/csv` | Admin-only CSV parsing and validation. Creates provenance and ingestion logs; accepted observations remain quarantined and are not used in environmental analysis. |
| `GET /ingestions`, `GET /ingestions/{id}` | Admin-only upload history and paginated accepted records; uploader-declared source details remain explicitly unverified. |
| `GET /regions/{id}/report` | JSON report with observations distinguished from calculations, statistics, interpretations, limitations, and references. |
| `GET /regions/{id}/report?format=pdf` | 501 `pdf_not_implemented`. |
| `GET /alerts`, `GET /alerts/{id}` | Locally recorded sample workflow alerts; none imply environmental detection. |
| `POST /alerts/evaluate` | `{ "regionId": "borena" }` fails closed as `insufficient_data`. `{ "regionId": "borena", "sampleMode": true }` creates a workflow-only record explicitly stating that no observations were analyzed. |
| `POST /alerts/{id}/generate-message` | Creates an English `SAMPLE` draft only for a stored sample workflow record. No contact is selected. |
| `POST /alerts/{id}/generate-email` | Admin-only; creates one `SAMPLE` email draft for the configured recipient. |
| `GET /email-alerts`, `GET /email-alerts/{id}` | Admin-only email drafts and delivery records. |
| `POST /email-alerts/{id}/approve`, `POST /email-alerts/{id}/reject` | Admin-only review with an audited reviewer ID. |
| `POST /email-alerts/{id}/send` | Admin-only, approved-draft-only SMTP delivery. Disabled by default; records `sent` or `failed`. |
| `GET /authority-contacts`, `GET /authority-contacts/{id}` | Placeholder registry; telephone numbers are always null. |
| `POST /authority-contacts`, `PATCH /authority-contacts/{id}` | Admin-only placeholder management. Telephone numbers and self-asserted verification are rejected. |
| `POST /notifications/{id}/approve`, `POST /notifications/{id}/reject` | Admin-only review with server-configured reviewer ID; decision and timestamp are audited. |
| `POST /notifications/{id}/simulate` | Admin-only, approved-message-only dispatch through `MockSmsProvider`; writes simulated status, never contacts a gateway. |
| `GET /notifications/history`, `GET /notifications/{id}/status` | Admin-only audit/status endpoints. Historical message content is redacted in history. |

Email workflow: `POST /alerts/evaluate` with `{ "regionId": "borena", "sampleMode": true }`, then admin-authenticated `POST /alerts/{id}/generate-email`, `POST /email-alerts/{id}/approve` with `{ "comment": "review note" }`, and `POST /email-alerts/{id}/send` with `{}`. `GET /email-alerts` lists drafts and delivery records. Email generation and review are admin-only; sending additionally requires the explicit `EMAIL_MODE=smtp` opt-in and valid SMTP settings. Email content is explicitly marked `SAMPLE`; there are no verified environmental observations, so this workflow cannot send a real drought warning. Delivery errors are audited without storing SMTP credentials or returning provider error details to the client. There is no external retrieval adapter or PDF renderer.

SMS review bodies are JSON objects and accept `{ "decision": "approve"|"reject", "comment": "optional" }`. A sample SMS simulation reports status `simulated`, never `delivered` or `sent`.

### CSV upload contract

`POST /ingestions/csv` requires admin bearer authorization and JSON fields `regionId`, `datasetId`, `provider`, `productId`, `datasetVersion`, and `csv`. The long-form CSV header is:

```csv
date,indicator,value,units,quality_flag
2024-01,rainfall,42.5,mm/month,unknown
2024-02,rainfall,18,mm/month,good
```

Only one dataset/variable is accepted per upload: `gpm-imerg` + `rainfall` + `mm/month`; `fldas` or `smap-soil-moisture` + `soil_moisture` + `m3/m3`; `modis-mod13a2` + `vegetation` + `NDVI`. Values are range-checked and monthly dates must be `YYYY-MM`. Up to 5,000 rows and 2 MiB are accepted. A source flag equal to `invalid` rejects that row; other flags are retained verbatim but not trusted as QA. Duplicate observation keys (region, date, indicator, dataset, product, dataset version) are not inserted again. Upload metadata is user-declared and unverified; accepted rows have `quality: insufficient` and `analysisStatus: quarantined_pending_source_review`. The file checksum and rejected-row reasons are recorded. No unit conversion, provider verification, or analysis inclusion occurs.

The existing frontend upload modal is still client-side and does not call this API. Use the documented API directly until a separate frontend integration is requested.

## Scientific methods

- Baselines group by matching calendar month over configurable baseline years. Mean, median, sample standard deviation, and linearly interpolated percentiles are withheld if there are fewer than the configured number of valid observations; missing values are counted, not substituted.
- Rainfall relative anomaly is `(observed - baseline) / baseline * 100`; zero or non-positive baselines return `null`. Soil moisture supports absolute difference and standardization when a positive standard deviation is available. Vegetation anomaly is the NDVI difference.
- Mann–Kendall uses tie-corrected variance and continuity-corrected Z. For up to 9 valid points, two-sided p-values use an exhaustive permutation distribution (including tied-value multiplicities); larger series use the normal approximation. Fewer than two valid values and constant series return p=1/no trend. Sen slope uses actual supplied time deltas; serial correlation is not adjusted and is reported as a limitation.
- Pattern and alert rules use an experimental standardized anomaly threshold of -1 and a 3-period persistence minimum. They are configurable in code, not official drought classifications. Alert detection refuses missing/insufficient quality. These functions are unit-tested but cannot currently issue an environmental alert from an operational dataset.
- Recovery means that all three standardized anomalies exceed -1; recovery is environmental only and does not establish crop, livestock, household, or community recovery.

## Tests

`npm run test:backend` runs synthetic, mathematically checked tests for baselines, anomalies, Mann–Kendall (monotonic, tied, flat, small, missing and irregular time), Sen slope, quality gating, patterns, recovery, priority, alert detection, CSV ingestion, sample-only SMS, and email configuration safeguards.

The same suite verifies zone GeoJSON validation, point-in-polygon behavior (including holes and multipolygons), CSV parsing, generated per-zone spatial coverage counts, blocked zone-level training readiness, and monthly aggregation, chronological validation, and forecast intervals for the experimental rainfall-only GPR.
