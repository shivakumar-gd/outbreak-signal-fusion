import {
  BenchmarkRecord,
  FailureScenarioType,
  FusionResult,
  ZoneDailySignals,
  ZoneId,
} from '../../types';
import { groupSignalsByZone } from '../pipeline/processor';
import { evaluateZoneDay } from '../detection/detector';
import { generateSyntheticDataset } from '../synthetic/generator';

export function runEmpiricalExperiment(
  scenario: FailureScenarioType = 'STANDARD',
  existingDataset?: ZoneDailySignals[]
): {
  records: BenchmarkRecord[];
  allFusionResults: FusionResult[];
  dataset: ZoneDailySignals[];
} {
  const dataset = existingDataset || generateSyntheticDataset(scenario);
  const grouped = groupSignalsByZone(dataset);

  const allFusionResults: FusionResult[] = [];

  // Evaluate every day (from Day 15 to 90 so we have full 14-day lookback)
  for (const zone of (['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'] as ZoneId[])) {
    const history = grouped[zone];
    for (let day = 15; day <= 90; day++) {
      const result = evaluateZoneDay(history, day, zone);
      allFusionResults.push(result);
    }
  }

  // Evaluate Ground Truth Outbreaks
  const clusters = [
    {
      clusterId: 'Cluster 1',
      zone: 'Zone B' as ZoneId,
      groundTruthDay: 52,
      description: 'Acute Seasonal Respiratory Surge (Citizen -> Pharmacy -> Clinic -> Lab)',
    },
    {
      clusterId: 'Cluster 2',
      zone: 'Zone D' as ZoneId,
      groundTruthDay: 65,
      description: 'Sub-acute Community Cluster with Muted Early Clinic Attendance',
    },
  ];

  const records: BenchmarkRecord[] = clusters.map((cluster) => {
    const zoneResults = allFusionResults.filter((r) => r.zone === cluster.zone);

    // False positives: alert triggered before outbreak started (Days 15 to cluster.groundTruthDay - 1)
    const cleanPeriodResults = zoneResults.filter(
      (r) => r.dayIndex >= 15 && r.dayIndex < cluster.groundTruthDay
    );
    const baselineFalsePositives = cleanPeriodResults.filter((r) => r.baselineTriggered).length;
    const fusionFalsePositives = cleanPeriodResults.filter(
      (r) => r.alertLevel === 'ALERT' || r.alertLevel === 'CRITICAL'
    ).length;

    // Detection search during active cluster window
    const outbreakPeriodResults = zoneResults
      .filter((r) => r.dayIndex >= cluster.groundTruthDay)
      .sort((a, b) => a.dayIndex - b.dayIndex);

    const firstBaseline = outbreakPeriodResults.find((r) => r.baselineTriggered);
    const firstFusion = outbreakPeriodResults.find(
      (r) => r.alertLevel === 'ALERT' || r.alertLevel === 'CRITICAL'
    );

    const baselineDay = firstBaseline ? firstBaseline.dayIndex : null;
    const baselineDate = firstBaseline ? firstBaseline.date : null;
    const baselineDelay = baselineDay !== null ? baselineDay - cluster.groundTruthDay : null;

    const fusionDay = firstFusion ? firstFusion.dayIndex : null;
    const fusionDate = firstFusion ? firstFusion.date : null;
    const fusionDelay = fusionDay !== null ? fusionDay - cluster.groundTruthDay : null;

    let leadTimeAdvantage: number | null = null;
    if (baselineDay !== null && fusionDay !== null) {
      leadTimeAdvantage = baselineDay - fusionDay;
    }

    let detectionStatus: BenchmarkRecord['detectionStatus'] = 'NOT_DETECTED';
    if (baselineDay !== null && fusionDay !== null) {
      if (fusionDay < baselineDay) detectionStatus = 'FUSION_EARLIER';
      else if (fusionDay === baselineDay) detectionStatus = 'SIMULTANEOUS';
      else detectionStatus = 'BASELINE_EARLIER';
    } else if (fusionDay !== null) {
      detectionStatus = 'FUSION_EARLIER';
    }

    const gtDateRecord = zoneResults.find((r) => r.dayIndex === cluster.groundTruthDay);

    return {
      clusterId: cluster.clusterId,
      zone: cluster.zone,
      groundTruthStartDay: cluster.groundTruthDay,
      groundTruthStartDate: gtDateRecord ? gtDateRecord.date : `Day ${cluster.groundTruthDay}`,
      clusterDescription: cluster.description,
      baselineDetectionDay: baselineDay,
      baselineDetectionDate: baselineDate,
      baselineDelayDays: baselineDelay,
      fusionDetectionDay: fusionDay,
      fusionDetectionDate: fusionDate,
      fusionDelayDays: fusionDelay,
      leadTimeAdvantageDays: leadTimeAdvantage,
      baselineFalsePositives,
      fusionFalsePositives,
      detectionStatus,
    };
  });

  return { records, allFusionResults, dataset };
}
