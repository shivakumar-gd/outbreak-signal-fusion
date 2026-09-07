# Outbreak Signal Fusion Dashboard — Phase 1 (35% Prototype)

A public health early-warning infectious disease surveillance prototype for municipal health departments, designed to test whether **multi-source signal fusion can reduce the time required to detect localized abnormal disease clusters compared with a clinic-only baseline method**.

---

## 1. Project Overview & Problem Statement
Signals concerning seasonal infectious disease outbreaks arrive from heterogeneous sources at disparate speeds and formats:
1. **Citizen Syndromic Reports** (Telehealth / mobile apps): ~6–24 hours lag. Earliest symptom indicator, moderate specificity.
2. **Pharmacy OTC Sales** (Antipyretics, cough & cold medicines): ~24–48 hours lag. Symptomatic self-medication surge.
3. **Primary Care Clinics** (Suspected & physician-diagnosed cases): ~48–96 hours lag. Clinical attendance and administrative transmission.
4. **Diagnostic Laboratories** (PCR confirmatory assays & positivity rate): ~96–168 hours lag. High specificity confirmatory gold standard.

Single-source clinic surveillance suffers from inherent visit delays and reporting lag. This project combines heterogeneous signals, calculates dynamic source reliability, applies freshness penalties, detects localized clusters, and produces auditable alert evidence for human health officials.

---

## 2. Core Architecture
- **Ingestion & Data Quality Pipeline**: Normalizes dates, canonicalizes zones (Zones A–E), detects missing feeds explicitly (never coerced to zero), and computes source freshness states (🟢 Fresh, 🟡 Aging, 🔴 Stale, ⚪ Missing).
- **Source Reliability Engine**: Computes interpretable scores $R_s \in [0.00, 1.00]$ decomposing into Completeness (30%), Timeliness (30%), Data Quality (20%), and Historical Peer Agreement (20%).
- **Dual-Detection Engine**:
  - **Method A (Baseline)**: Clinic-only rolling 14-day Z-score ($Z \ge 2.0 \to \text{Alert}$).
  - **Method B (Fusion)**: Sigmoid-transformed anomaly indices ($A_s$), weighted by domain priority, source reliability, and freshness penalties.
- **Human Review Decision Support**: Enforces the strict governance rule: **Automation Alert ≠ Medical Diagnosis / Outbreak Declaration**. Human analyst review with audit note logging is required.

---

## 3. Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion
- **Visualizations**: Recharts (multi-source synchronized time series, threshold overlays, cluster reference areas)
- **Icons**: Lucide React
- **Runtime & Server**: Node.js + Express + TypeScript (`tsx`), Port 3000

---

## 4. Setup & Running Locally
```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build
```

---

## 5. Privacy & Synthetic Data Statement
All data used in this prototype is strictly synthetic, generated algorithmically in-memory. No real patient identities, medical record numbers (MRNs), or private health information (PHI) are accessed, processed, or stored.
