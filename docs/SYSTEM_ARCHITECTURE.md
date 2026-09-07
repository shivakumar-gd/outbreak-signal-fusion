# System Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SYNTHETIC SURVEILLANCE DATA INGESTION                 │
│  [Clinics]                [Pharmacies]          [Citizens]        [Labs]    │
│  Suspected/Confirmed      OTC Antipyretics      Symptom Reports   Positivity│
│  Delay: 48-72h            Delay: 24-48h         Delay: 8-24h      Delay: 96h│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATA PROCESSING & QUALITY PIPELINE                       │
│  • Timestamp Normalization (Daily Bins, ISO 8601)                           │
│  • Geographic Zone Canonicalization (Zones A, B, C, D, E)                   │
│  • Null / Anomaly Filtering (Zero Cases ≠ Missing Data)                     │
│  • Freshness Classifier: 🟢 Fresh | 🟡 Aging | 🔴 Stale | ⚪ Missing         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                   ┌───────────────────┴───────────────────┐
                   ▼                                       ▼
┌──────────────────────────────────────┐ ┌────────────────────────────────────┐
│      SOURCE RELIABILITY ENGINE       │ │     DUAL-DETECTION PIPELINE        │
│  • Completeness (14d window)         │ │  [A] Clinic-Only Baseline Detector │
│  • Latency & Reporting Delay SLA     │ │      (14-day Rolling Z-Score)      │
│  • Historical Data Quality / Nulls   │ │  [B] Multi-Source Fusion Detector  │
│  • Inter-Signal Agreement            │ │      (Standardized Deviations,     │
│  Output: Dynamic R_s ∈ [0, 1]        │ │       Reliability-Weighted Fusion) │
└──────────────────┬───────────────────┘ └─────────────────┬──────────────────┘
                   │                                       │
                   └───────────────────┬───────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DECISION SUPPORT & REVIEW CORE                        │
│  • Fusion Score & Alert Tiers: Normal | Watch | Alert | Critical            │
│  • Evidence Attribution (Signal Weights, Z-scores, Delay Penalties)         │
│  • Human Review State (Pending Review | Under Investigation | Escalate)     │
│  • Strict Ethical Rule: Automation Alert ≠ Medical Diagnosis / Outbreak Dec.│
└──────────────────────────────────────┬──────────────────────────────────────┘
```

## User Roles & Operational Boundaries
1. **Health Department Analyst**: Primary role for Phase 1. Operates the active dashboard, investigates signal evidence, analyzes source reliability, and records review decisions.
2. **Public Health Supervisor**: Receives escalated alerts and coordinates inter-agency response.
3. **Data / Operations Officer**: Monitors feed latency, sensor health, and SLA violations.
