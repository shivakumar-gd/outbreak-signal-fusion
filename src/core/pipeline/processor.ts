import {
  FreshnessState,
  SourceType,
  ZoneDailySignals,
  ZoneId,
} from '../../types';

export const SOURCE_SLAS: Record<SourceType, { slaHours: number; agingHours: number; name: string }> = {
  citizen: { slaHours: 24, agingHours: 48, name: 'Citizen Syndromic Reports' },
  pharmacy: { slaHours: 48, agingHours: 72, name: 'Pharmacy OTC Sales' },
  clinic: { slaHours: 72, agingHours: 96, name: 'Clinic Suspected/Confirmed' },
  laboratory: { slaHours: 120, agingHours: 144, name: 'Laboratory PCR Confirmations' },
};

export function determineFreshness(
  source: SourceType,
  delayHours: number,
  isMissing: boolean
): FreshnessState {
  if (isMissing) return 'MISSING';
  const sla = SOURCE_SLAS[source];
  if (delayHours <= sla.slaHours) return 'FRESH';
  if (delayHours <= sla.agingHours) return 'AGING';
  return 'STALE';
}

export function getFreshnessPenalty(state: FreshnessState): number {
  switch (state) {
    case 'FRESH':
      return 1.0;
    case 'AGING':
      return 0.8;
    case 'STALE':
      return 0.35;
    case 'MISSING':
      return 0.0;
  }
}

export interface RollingStats {
  mean: number;
  stdDev: number;
  count: number;
}

export function calculateRollingStats(values: number[]): RollingStats {
  const valid = values.filter((v) => v !== null && !isNaN(v) && isFinite(v));
  if (valid.length === 0) {
    return { mean: 0, stdDev: 1, count: 0 };
  }
  const sum = valid.reduce((acc, v) => acc + v, 0);
  const mean = sum / valid.length;
  if (valid.length === 1) {
    return { mean, stdDev: 1, count: 1 };
  }
  const variance =
    valid.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (valid.length - 1);
  return {
    mean,
    stdDev: Math.max(0.5, Math.sqrt(variance)),
    count: valid.length,
  };
}

// Group dataset by zone
export function groupSignalsByZone(
  dataset: ZoneDailySignals[]
): Record<ZoneId, ZoneDailySignals[]> {
  const map: Record<ZoneId, ZoneDailySignals[]> = {
    'Zone A': [],
    'Zone B': [],
    'Zone C': [],
    'Zone D': [],
    'Zone E': [],
  };
  for (const record of dataset) {
    map[record.zone].push(record);
  }
  // Ensure sorted by dayIndex
  for (const zone in map) {
    map[zone as ZoneId].sort((a, b) => a.dayIndex - b.dayIndex);
  }
  return map;
}
