# Test Cases & Failure Mode Protocol

## Mandatory Failure Mode Validations

### Test Case 1: Missing Data Feed
- **Precondition**: Clinic reporting stream drops out completely in Zone B (Days 54–58) due to network downtime.
- **Pass Criteria**:
  1. System does NOT treat missing records as 0 cases (which would erroneously suppress an outbreak signal).
  2. UI displays `⚪ MISSING` badge for Clinic source.
  3. Clinic effective weight $W_{clinic}$ is dropped to 0, and weights are automatically redistributed to active Pharmacy and Citizen streams.
  4. Confidence score is visibly penalized, and an analyst warning is displayed.

### Test Case 2: Stale Data Feed
- **Precondition**: Laboratory PCR feed in Zone D experiences severe pipeline delay (&gt;144h vs SLA 96h).
- **Pass Criteria**:
  1. UI displays `🔴 STALE` badge with actual lag in hours.
  2. Freshness penalty factor $P_{lab} = 0.35$ is applied to discount the aged lab data.
  3. Evidence panel highlights that confirmatory laboratory testing is lagging behind community syndromic indicators.

### Test Case 3: Conflicting Signals (Single-Source Spike)
- **Precondition**: Clinic in Zone C reports an isolated case spike ($Z = +3.8\sigma$), while Citizen and Pharmacy streams remain completely normal.
- **Pass Criteria**:
  1. Baseline detector triggers a false positive alert ($Z \ge 2.0$).
  2. Fusion detector detects signal discordance and suppresses unwarranted Critical escalation, capping the score at Watch ($F = 0.58$).
  3. UI flags: *"Conflicting Signals: Isolated clinic surge unsupported by community feeds. Data audit required."*

---

## Demonstrable Patient / Surveillance Journeys

### Journey A — High Urgency (Zone B Cluster)
- **Day 52**: Citizen reports jump (+300%).
- **Day 54**: Pharmacy sales jump (+168%). Fusion enters **Alert** state.
- **Day 57**: Clinic suspected cases jump.
- **Day 61**: Laboratory positivity climbs to 26.8%. Fusion enters **Critical** state.
- **Analyst Action**: Analyst investigates evidence and escalates to Supervisor for emergency clinical mobile units.

### Journey B — Lower Urgency (Zone D Sub-acute Watch)
- **Day 65**: Citizen reports rise moderately.
- **Day 68**: Fusion registers a **Watch** state (0.52).
- **Analyst Action**: Analyst marks "Under Investigation", requests targeted monitoring without declaring immediate crisis.
