# ETHIODROUGHT backend — audit and implementation plan

## 1. Audit of the existing repository (Tahirski/EthioDrought, 3 commits)
| Item | Finding |
|---|---|
| Framework | Next.js 14 / React 18 / TypeScript / Tailwind / Leaflet / Recharts. **No backend, no API routes, no database, no env config.** |
| Scientific code | `src/lib/stats.ts` (Mann-Kendall, Sen, z-score, A&S normal CDF), `src/lib/droughtEngine.ts` (z-threshold phase classifier + 0.35/0.35/0.30 composite). Runs in the browser. |
| NASA integrations | **None.** All "observations" are in `src/data/monthlyObservations.ts`. |
| Tests | One ad-hoc script `scripts/test_stats.js`; no test runner. |
| Frontend contracts | TS types in `src/types/alerts.ts` (alerts, contacts, recovery, ranking, dataset quality), `DatasetCatalogItem`, `MonthlyRecord`. Alerts/contacts/ranking are hard-coded sample data in `src/data/alertsData.ts`. |

### Integrity issues found (need frontend/data follow-up; backend must not inherit them)
1. **The "satellite archive" is synthetic.** `generateBorenaRecords()` builds 2000-2024 by multiplying hard-coded climatology by hand-picked "event factors" and a sine wave. Records are flagged `isDemonstration: false` and regions are labelled `"Verified Satellite Archive"`. Baseline mean/std are hard-coded constants, not computed from data. This is fabricated data presented as NASA observations; it should be relabelled as demonstration data or replaced by real ingestion.
2. `datasetsData.ts` marks GPM IMERG, FLDAS, MODIS as `Integrated`; no integration exists.
3. `droughtEngine.ts` text makes claims the spec forbids: "aquifer depletion", "livestock herds", "canopy collapse imminent within weeks", "30-60 day lag" (unsupported), "Single rain showers do not recharge depleted aquifers".
4. `stats.ts`: minimum n=4 (small-sample results returned), results rounded before use, fixed-index Sen slope (gaps collapsed), no serial-correlation diagnostics. Core formulas are otherwise correct.
5. Missing baseline month returns mean 0 / sd 1 (missing treated as a value).

## 2. Decision
Add a **separate Python/FastAPI service in `backend/`**; leave the Next.js app untouched. Python gives access to scipy/pymannkendall as independent reference implementations.

## 3. Stages
1. **Scientific core + tests** — DONE (this commit): baselines, anomalies, MOD13A2 decoding, quality, Mann-Kendall/Sen, fingerprint, recovery, ranking.
2. Database + dataset registry + provenance + `/api/v1` read endpoints.
3. Alerts, mock SMS (server-enforced sample mode), contacts, approval, audit.
4. Ingestion adapters (IMERG, FLDAS, MOD13A2) with mocked providers — cannot be run against live NASA services from this sandbox.
5. Reports (JSON/PDF), API docs, final implementation report.

## 4. Stage 1 status (tested)
45 pytest tests pass, including hand-computed values and comparison against `pymannkendall` (8 random series + tied data) and `scipy.stats.norm`.
