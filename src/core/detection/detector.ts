import {
  AlertLevel,
  FusionResult,
  SourceAnomaly,
  SourceType,
  ZoneDailySignals,
  ZoneId,
} from '../../types';
import { calculateRollingStats, getFreshnessPenalty, SOURCE_SLAS } from '../pipeline/processor';
import { calculateSourceReliability } from '../reliability/scorer';

// Sigmoid transformation: maps Z-score [-2, +6] smoothly to [0, 1]
// Z = 0 -> 0.095, Z = 1.5 -> 0.50, Z = 2.0 -> 0.68, Z = 3.0 -> 0.89, Z = 4.0 -> 0.97
function sigmoidAnomaly(z: number): number {
  return 1 / (1 + Math.exp(-1.5 * (z - 1.5)));
}

export function evaluateZoneDay(
  zoneHistory: ZoneDailySignals[],
  targetDay: number,
  zone: ZoneId,
  alertThresholds = { watch: 0.40, alert: 0.60, critical: 0.80 }
): FusionResult {
  const currentRecord = zoneHistory.find((r) => r.dayIndex === targetDay);
  if (!currentRecord) {
    throw new Error(`Record for day ${targetDay} not found in zone ${zone}`);
  }

  // Lookback window: up to 14 previous days [targetDay - 14, targetDay - 1]
  const baselineStart = Math.max(1, targetDay - 14);
  const baselineRecords = zoneHistory.filter(
    (r) => r.dayIndex >= baselineStart && r.dayIndex < targetDay
  );

  // 1. BASELINE DETECTION (Clinic-Only Method)
  const clinicBaselineValues = baselineRecords
    .map((r) => r.clinic.suspectedCases)
    .filter((v): v is number => v !== null && !isNaN(v));
  const clinicStats = calculateRollingStats(clinicBaselineValues);

  const currentClinicVal = currentRecord.clinic.suspectedCases;
  let clinicZ = 0;
  if (currentClinicVal !== null && clinicStats.count >= 3) {
    clinicZ = (currentClinicVal - clinicStats.mean) / clinicStats.stdDev;
  }
  const baselineTriggered = clinicZ >= 2.0;

  // 2. MULTI-SOURCE FUSION DETECTION
  // Gather baseline stats for each source
  const pharmacyBaselineValues = baselineRecords
    .map((r) => r.pharmacy.salesCount)
    .filter((v): v is number => v !== null && !isNaN(v));
  const pharmacyStats = calculateRollingStats(pharmacyBaselineValues);

  const citizenBaselineValues = baselineRecords
    .map((r) => r.citizen.reportCount)
    .filter((v): v is number => v !== null && !isNaN(v));
  const citizenStats = calculateRollingStats(citizenBaselineValues);

  const labBaselineValues = baselineRecords
    .map((r) => r.laboratory.positivityRate)
    .filter((v): v is number => v !== null && !isNaN(v));
  const labStats = calculateRollingStats(labBaselineValues);

  // Compute Z-scores for each source
  const currentPharmacyVal = currentRecord.pharmacy.salesCount;
  const pharmacyZ =
    currentPharmacyVal !== null && pharmacyStats.count >= 3
      ? (currentPharmacyVal - pharmacyStats.mean) / pharmacyStats.stdDev
      : 0;

  const currentCitizenVal = currentRecord.citizen.reportCount;
  const citizenZ =
    currentCitizenVal !== null && citizenStats.count >= 3
      ? (currentCitizenVal - citizenStats.mean) / citizenStats.stdDev
      : 0;

  const currentLabVal = currentRecord.laboratory.positivityRate;
  const labZ =
    currentLabVal !== null && labStats.count >= 3
      ? (currentLabVal - labStats.mean) / Math.max(0.01, labStats.stdDev)
      : 0;

  // Base domain weights
  const domainBaseWeights: Record<SourceType, number> = {
    laboratory: 0.35, // High confirmatory specificity
    clinic: 0.30,     // High clinical authority
    pharmacy: 0.20,   // Rapid OTC indicator
    citizen: 0.15,    // Earliest syndromic signal
  };

  // Compute reliabilities & freshness penalties
  const reliabilities: Record<SourceType, ReturnType<typeof calculateSourceReliability>> = {
    clinic: calculateSourceReliability(zoneHistory, targetDay, 'clinic'),
    pharmacy: calculateSourceReliability(zoneHistory, targetDay, 'pharmacy'),
    citizen: calculateSourceReliability(zoneHistory, targetDay, 'citizen'),
    laboratory: calculateSourceReliability(zoneHistory, targetDay, 'laboratory'),
  };

  // Effective unnormalized weights
  const sources: SourceType[] = ['clinic', 'pharmacy', 'citizen', 'laboratory'];
  const effectiveWeights: Record<SourceType, number> = {
    clinic: 0,
    pharmacy: 0,
    citizen: 0,
    laboratory: 0,
  };

  let totalEffectiveWeight = 0;
  for (const s of sources) {
    const rel = reliabilities[s];
    const penalty = getFreshnessPenalty(rel.freshness);
    const weight = domainBaseWeights[s] * rel.score * penalty;
    effectiveWeights[s] = weight;
    totalEffectiveWeight += weight;
  }

  // Normalized weights (sum to 1.0)
  const finalWeights: Record<SourceType, number> = {
    clinic: 0.25,
    pharmacy: 0.25,
    citizen: 0.25,
    laboratory: 0.25,
  };

  if (totalEffectiveWeight > 0.001) {
    for (const s of sources) {
      finalWeights[s] = effectiveWeights[s] / totalEffectiveWeight;
    }
  }

  // Build source anomaly details
  const sourceAnomalies: Record<SourceType, SourceAnomaly> = {
    clinic: {
      source: 'clinic',
      rawValue: currentRecord.clinic.suspectedCases,
      baselineMean: Number(clinicStats.mean.toFixed(1)),
      baselineStdDev: Number(clinicStats.stdDev.toFixed(1)),
      zScore: Number(clinicZ.toFixed(2)),
      normalizedAnomaly: Number(sigmoidAnomaly(clinicZ).toFixed(3)),
      weight: Number(finalWeights.clinic.toFixed(3)),
      weightedContribution: Number((sigmoidAnomaly(clinicZ) * finalWeights.clinic).toFixed(3)),
      freshness: reliabilities.clinic.freshness,
      isMissing: currentRecord.clinic.isMissing,
      statusNote: currentRecord.clinic.isMissing
        ? 'Feed missing'
        : `${clinicZ >= 0 ? '+' : ''}${clinicZ.toFixed(1)}σ from 14d baseline`,
    },
    pharmacy: {
      source: 'pharmacy',
      rawValue: currentRecord.pharmacy.salesCount,
      baselineMean: Number(pharmacyStats.mean.toFixed(1)),
      baselineStdDev: Number(pharmacyStats.stdDev.toFixed(1)),
      zScore: Number(pharmacyZ.toFixed(2)),
      normalizedAnomaly: Number(sigmoidAnomaly(pharmacyZ).toFixed(3)),
      weight: Number(finalWeights.pharmacy.toFixed(3)),
      weightedContribution: Number((sigmoidAnomaly(pharmacyZ) * finalWeights.pharmacy).toFixed(3)),
      freshness: reliabilities.pharmacy.freshness,
      isMissing: currentRecord.pharmacy.isMissing,
      statusNote: currentRecord.pharmacy.isMissing
        ? 'Feed missing'
        : `${pharmacyZ >= 0 ? '+' : ''}${pharmacyZ.toFixed(1)}σ from 14d baseline`,
    },
    citizen: {
      source: 'citizen',
      rawValue: currentRecord.citizen.reportCount,
      baselineMean: Number(citizenStats.mean.toFixed(1)),
      baselineStdDev: Number(citizenStats.stdDev.toFixed(1)),
      zScore: Number(citizenZ.toFixed(2)),
      normalizedAnomaly: Number(sigmoidAnomaly(citizenZ).toFixed(3)),
      weight: Number(finalWeights.citizen.toFixed(3)),
      weightedContribution: Number((sigmoidAnomaly(citizenZ) * finalWeights.citizen).toFixed(3)),
      freshness: reliabilities.citizen.freshness,
      isMissing: currentRecord.citizen.isMissing,
      statusNote: currentRecord.citizen.isMissing
        ? 'Feed missing'
        : `${citizenZ >= 0 ? '+' : ''}${citizenZ.toFixed(1)}σ from 14d baseline`,
    },
    laboratory: {
      source: 'laboratory',
      rawValue: currentRecord.laboratory.positivityRate,
      baselineMean: Number(labStats.mean.toFixed(3)),
      baselineStdDev: Number(labStats.stdDev.toFixed(3)),
      zScore: Number(labZ.toFixed(2)),
      normalizedAnomaly: Number(sigmoidAnomaly(labZ).toFixed(3)),
      weight: Number(finalWeights.laboratory.toFixed(3)),
      weightedContribution: Number((sigmoidAnomaly(labZ) * finalWeights.laboratory).toFixed(3)),
      freshness: reliabilities.laboratory.freshness,
      isMissing: currentRecord.laboratory.isMissing,
      statusNote: currentRecord.laboratory.isMissing
        ? 'Feed missing'
        : `${labZ >= 0 ? '+' : ''}${labZ.toFixed(1)}σ from 14d baseline`,
    },
  };

  // Check for Conflicting Signals (Failure Case 3):
  // E.g., Clinic spikes strongly (Z >= 2.5), but Citizen and Pharmacy are completely flat (Z < 0.5)
  const hasConflict =
    (clinicZ >= 2.5 && citizenZ < 0.5 && pharmacyZ < 0.5) ||
    (citizenZ >= 3.0 && clinicZ < 0.2 && pharmacyZ < 0.5);

  // Compute composite fusion score
  let fusionScore = 0;
  for (const s of sources) {
    fusionScore += sourceAnomalies[s].weightedContribution;
  }
  fusionScore = Math.max(0.0, Math.min(1.0, Number(fusionScore.toFixed(3))));

  // If there's a strong conflict with only 1 isolated feed surging and others normal,
  // cap score below Critical to prevent unwarranted panic
  if (hasConflict && fusionScore > 0.65) {
    fusionScore = 0.58; // Cap at Watch level to mandate human validation
  }

  // Determine Alert Tier
  let alertLevel: AlertLevel = 'NORMAL';
  if (fusionScore >= alertThresholds.critical) {
    alertLevel = 'CRITICAL';
  } else if (fusionScore >= alertThresholds.alert) {
    alertLevel = 'ALERT';
  } else if (fusionScore >= alertThresholds.watch) {
    alertLevel = 'WATCH';
  }

  // Determine primary driver
  let highestContrib = -1;
  let primaryDriver: SourceType = 'clinic';
  for (const s of sources) {
    if (sourceAnomalies[s].weightedContribution > highestContrib) {
      highestContrib = sourceAnomalies[s].weightedContribution;
      primaryDriver = s;
    }
  }

  // Confidence is reduced if any active source is missing or stale
  const missingOrStaleCount = sources.filter(
    (s) => reliabilities[s].freshness === 'MISSING' || reliabilities[s].freshness === 'STALE'
  ).length;
  const confidenceScore = Math.max(0.2, 1.0 - missingOrStaleCount * 0.25);

  // Build evidence summary text
  let evidenceSummary = '';
  if (alertLevel === 'NORMAL') {
    evidenceSummary = 'All signals within normal seasonal baseline parameters.';
  } else {
    const driverName = SOURCE_SLAS[primaryDriver].name;
    evidenceSummary = `Elevated ${alertLevel.toLowerCase()} primarily driven by ${driverName} (${sourceAnomalies[primaryDriver].statusNote}).`;
    if (hasConflict) {
      evidenceSummary += ' NOTE: Significant signal discordance detected; single-source surge uncorroborated by community feeds.';
    }
    if (missingOrStaleCount > 0) {
      evidenceSummary += ` Warning: ${missingOrStaleCount} data stream(s) are missing or stale, reducing detection certainty.`;
    }
  }

  return {
    date: currentRecord.date,
    dayIndex: targetDay,
    zone,
    fusionScore,
    alertLevel,
    baselineZScore: Number(clinicZ.toFixed(2)),
    baselineTriggered,
    sourceAnomalies,
    primaryDriver,
    confidenceScore: Number(confidenceScore.toFixed(2)),
    reviewRequired: alertLevel !== 'NORMAL',
    evidenceSummary,
    hasConflict,
  };
}
