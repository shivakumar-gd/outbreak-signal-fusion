export type ZoneId = 'Zone A' | 'Zone B' | 'Zone C' | 'Zone D' | 'Zone E';

export const ZONES: ZoneId[] = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];

export type FreshnessState = 'FRESH' | 'AGING' | 'STALE' | 'MISSING';

export type AlertLevel = 'NORMAL' | 'WATCH' | 'ALERT' | 'CRITICAL';

export type SourceType = 'clinic' | 'pharmacy' | 'citizen' | 'laboratory';

export interface ClinicSignal {
  date: string;
  dayIndex: number;
  zone: ZoneId;
  suspectedCases: number | null;
  confirmedCases: number | null;
  reportingDelayHours: number;
  completeness: number; // 0.0 - 1.0
  isMissing: boolean;
}

export interface PharmacySignal {
  date: string;
  dayIndex: number;
  zone: ZoneId;
  productCategory: 'Antipyretics' | 'Cough_Cold' | 'Thermometers';
  salesCount: number | null;
  baselineSales: number;
  deviationPercentage: number;
  reportingDelayHours: number;
  isMissing: boolean;
}

export interface CitizenSignal {
  date: string;
  dayIndex: number;
  zone: ZoneId;
  symptomCategory: 'Respiratory' | 'Fever_Chills' | 'Fatigue';
  reportCount: number | null;
  uniqueReporters: number;
  reportingDelayHours: number;
  isMissing: boolean;
}

export interface LaboratorySignal {
  date: string;
  dayIndex: number;
  zone: ZoneId;
  testsConducted: number | null;
  positiveCases: number | null;
  positivityRate: number | null; // positive / tests
  reportingDelayHours: number;
  isMissing: boolean;
}

export interface SourceReliability {
  source: SourceType;
  sourceName: string;
  score: number; // 0.00 - 1.00
  components: {
    completeness: number; // 0.00 - 1.00
    timeliness: number;   // 0.00 - 1.00
    quality: number;      // 0.00 - 1.00
    agreement: number;    // 0.00 - 1.00
  };
  averageDelayHours: number;
  expectedDelayHours: number;
  lastUpdateDate: string;
  freshness: FreshnessState;
  explanation: string;
}

export interface ZoneDailySignals {
  date: string;
  dayIndex: number;
  zone: ZoneId;
  clinic: ClinicSignal;
  pharmacy: PharmacySignal;
  citizen: CitizenSignal;
  laboratory: LaboratorySignal;
}

export interface SourceAnomaly {
  source: SourceType;
  rawValue: number | null;
  baselineMean: number;
  baselineStdDev: number;
  zScore: number;
  normalizedAnomaly: number; // 0.00 - 1.00
  weight: number;            // 0.00 - 1.00
  weightedContribution: number;
  freshness: FreshnessState;
  isMissing: boolean;
  statusNote: string;
}

export interface FusionResult {
  date: string;
  dayIndex: number;
  zone: ZoneId;
  fusionScore: number; // 0.00 - 1.00
  alertLevel: AlertLevel;
  baselineZScore: number;
  baselineTriggered: boolean;
  sourceAnomalies: Record<SourceType, SourceAnomaly>;
  primaryDriver: SourceType;
  confidenceScore: number; // Penalized if sources are missing/stale
  reviewRequired: boolean;
  evidenceSummary: string;
  hasConflict: boolean;
}

export type ReviewStatus = 'PENDING_REVIEW' | 'UNDER_INVESTIGATION' | 'ESCALATED' | 'DISMISSED';

export interface HumanReviewRecord {
  id: string;
  zone: ZoneId;
  dayIndex: number;
  date: string;
  alertLevel: AlertLevel;
  status: ReviewStatus;
  reviewerName?: string;
  reviewedAt?: string;
  decisionNotes?: string;
  escalatedTo?: string;
}

export type FailureScenarioType =
  | 'STANDARD'
  | 'MISSING_CLINIC'
  | 'STALE_LAB'
  | 'CONFLICTING_SIGNALS';

export type JourneyScenarioType = 'NONE' | 'JOURNEY_A' | 'JOURNEY_B';

export interface BenchmarkRecord {
  clusterId: string;
  zone: ZoneId;
  groundTruthStartDay: number;
  groundTruthStartDate: string;
  clusterDescription: string;
  baselineDetectionDay: number | null;
  baselineDetectionDate: string | null;
  baselineDelayDays: number | null;
  fusionDetectionDay: number | null;
  fusionDetectionDate: string | null;
  fusionDelayDays: number | null;
  leadTimeAdvantageDays: number | null;
  baselineFalsePositives: number;
  fusionFalsePositives: number;
  detectionStatus: 'FUSION_EARLIER' | 'SIMULTANEOUS' | 'BASELINE_EARLIER' | 'NOT_DETECTED';
}
