# Experiment Methodology: Time-to-Detect (TTD)

## 1. Objective
Determine whether multi-source signal fusion reduces the time required to detect localized abnormal disease clusters compared with a clinic-only baseline method.

## 2. Experimental Setup
- **Surveillance Horizon**: 90 consecutive synthetic days across 5 municipal health districts (Zones A through E).
- **Outbreak Cluster 1 (Zone B)**:
  - Injected on Day 52 ($T_0 = 52$).
  - Sequence: Citizen spike (Day 52) $\to$ Pharmacy surge (Day 54) $\to$ Clinic rise (Day 57) $\to$ Lab confirmation (Day 61).
- **Outbreak Cluster 2 (Zone D)**:
  - Injected on Day 65 ($T_0 = 65$).
  - Characterized by high citizen reporting, moderate pharmacy sales, but delayed/muted clinic attendance.

## 3. Evaluated Methods
- **Method A (Baseline Detector)**: Clinic-only rolling 14-day Z-score:
  $$Z_{clinic}(t, z) = \frac{\text{Cases}_{t, z} - \mu_{clinic}}{\max(\sigma_{clinic}, 1.0)}, \quad \text{Alert if } Z \ge 2.0\sigma$$
- **Method B (Multi-Source Fusion Detector)**: Standardized sigmoid anomaly indices combined with dynamic reliability weighting and freshness penalties:
  $$F(t, z) = \sum W_{s, t} \cdot A_{s, t, z}, \quad \text{Alert if } F \ge 0.60$$

## 4. Empirical Results
| Cluster | Ground Truth $T_0$ | Baseline ($T_{\text{baseline}}$) | Fusion ($T_{\text{fusion}}$) | Lead-Time Gain ($\Delta T$) | Baseline FPs | Fusion FPs |
|---|---|---|---|---|---|---|
| **Cluster 1 (Zone B)** | Day 52 | Day 59 ($+7$d lag) | Day 54 ($+2$d lag) | **$+5$ Days Earlier** | 1 | 0 |
| **Cluster 2 (Zone D)** | Day 65 | Day 74 ($+9$d lag) | Day 68 ($+3$d lag) | **$+6$ Days Earlier** | 0 | 0 |

## 5. Key Findings & Discussion
- **Clinical Lag**: Primary care clinics lag real community spread by 5 to 7 days due to patient incubation periods, delay in seeking care, and EHR reporting batches.
- **Syndromic Precedence**: Citizen mobile reports and pharmacy antipyretic sales surge within 24–48 hours of infection onset, providing reliable early indicators when corroborated by multi-source fusion.
- **Reliability Weighting**: Eliminates false positives by penalizing noisy or uncorroborated spikes during baseline surveillance periods.
