# Data Dictionary & Schema Specifications

## 1. `clinic_signals`
- `date` (string, ISO 8601 YYYY-MM-DD): Observation calendar date.
- `dayIndex` (integer, 1–90): Simulation day index.
- `zone` (string): Surveillance district (`Zone A` through `Zone E`).
- `suspectedCases` (integer | null): Early reported clinical volume. `null` if feed is missing.
- `confirmedCases` (integer | null): Confirmed physician diagnosis count.
- `reportingDelayHours` (integer): Time elapsed between patient consult and database entry (SLA: 72h).
- `completeness` (float, 0.0–1.0): Percentage of clinics within the zone that submitted daily logs.
- `isMissing` (boolean): Flag indicating data ingestion failure (distinct from 0 reported cases).

## 2. `pharmacy_signals`
- `date` (string): Calendar date.
- `dayIndex` (integer, 1–90): Day index.
- `zone` (string): Surveillance district.
- `productCategory` (string): Syndromic category (`Antipyretics`, `Cough_Cold`, `Thermometers`).
- `salesCount` (integer | null): Daily unit sales volume across reporting retail chains.
- `baselineSales` (integer): Trailing 30-day moving median sales.
- `deviationPercentage` (float): Percentage deviation from moving baseline.
- `reportingDelayHours` (integer): Aggregation and point-of-sale transmission delay (SLA: 48h).
- `isMissing` (boolean): Ingestion failure indicator.

## 3. `citizen_signals`
- `date` (string): Calendar date.
- `dayIndex` (integer, 1–90): Day index.
- `zone` (string): Surveillance district.
- `symptomCategory` (string): Self-reported symptoms (`Respiratory`, `Fever_Chills`, `Fatigue`).
- `reportCount` (integer | null): Total verified mobile app & telehealth logs.
- `uniqueReporters` (integer): Household de-duplicated reporter count.
- `reportingDelayHours` (integer): Ingestion latency (SLA: 24h).
- `isMissing` (boolean): Ingestion failure indicator.

## 4. `laboratory_signals`
- `date` (string): Calendar date.
- `dayIndex` (integer, 1–90): Day index.
- `zone` (string): Surveillance district.
- `testsConducted` (integer | null): Total diagnostic PCR/Antigen tests processed.
- `positiveCases` (integer | null): Laboratory confirmed positive specimens.
- `positivityRate` (float, 0.0–1.0): `positiveCases / testsConducted`.
- `reportingDelayHours` (integer): Specimen batch assay & sequencing delay (SLA: 120h).
- `isMissing` (boolean): Ingestion failure indicator.

## 5. `source_reliability`
- `source` (`clinic` | `pharmacy` | `citizen` | `laboratory`).
- `score` (float, 0.00–1.00): Composite reliability:
  $$R_s = 0.30 \cdot C_s + 0.30 \cdot T_s + 0.20 \cdot Q_s + 0.20 \cdot A_s$$
- `components`: Breakdown of Completeness ($C_s$), Timeliness ($T_s$), Quality ($Q_s$), Agreement ($A_s$).
- `freshness`: Categorical state (`FRESH` | `AGING` | `STALE` | `MISSING`).
