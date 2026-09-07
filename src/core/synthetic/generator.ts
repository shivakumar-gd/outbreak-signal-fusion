import {
  ClinicSignal,
  PharmacySignal,
  CitizenSignal,
  LaboratorySignal,
  ZoneDailySignals,
  ZoneId,
  ZONES,
  FailureScenarioType,
} from '../../types';

// Seedable pseudo-random generator for reproducible synthetic data
class PRNG {
  private s: number;
  constructor(seed = 123456789) {
    this.s = seed;
  }
  next(): number {
    this.s = (this.s * 1664525 + 1013904223) % 4294967296;
    return this.s / 4294967296;
  }
  normal(mean = 0, std = 1): number {
    const u1 = Math.max(1e-7, this.next());
    const u2 = this.next();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z * std;
  }
  poisson(lambda: number): number {
    if (lambda <= 0) return 0;
    // Knuth's algorithm
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= this.next();
    } while (p > L);
    return Math.max(0, k - 1);
  }
}

export function generateSyntheticDataset(scenario: FailureScenarioType = 'STANDARD'): ZoneDailySignals[] {
  const prng = new PRNG(42);
  const totalDays = 90;
  const startDate = new Date('2026-06-10T00:00:00Z');

  const zoneBaselines: Record<ZoneId, { clinic: number; pharmacy: number; citizen: number; labTests: number; labPosRate: number }> = {
    'Zone A': { clinic: 14, pharmacy: 95, citizen: 18, labTests: 45, labPosRate: 0.04 },
    'Zone B': { clinic: 16, pharmacy: 110, citizen: 22, labTests: 50, labPosRate: 0.045 }, // Target for Cluster 1
    'Zone C': { clinic: 12, pharmacy: 80, citizen: 15, labTests: 40, labPosRate: 0.035 },
    'Zone D': { clinic: 15, pharmacy: 100, citizen: 20, labTests: 48, labPosRate: 0.04 },  // Target for Cluster 2
    'Zone E': { clinic: 10, pharmacy: 70, citizen: 12, labTests: 35, labPosRate: 0.03 },
  };

  const allRecords: ZoneDailySignals[] = [];

  for (let day = 1; day <= totalDays; day++) {
    const currentDate = new Date(startDate.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getUTCDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isMonday = dayOfWeek === 1;

    // Day of week multiplier for reporting artifacts
    const clinicDOW = isWeekend ? 0.65 : isMonday ? 1.35 : 1.0;
    const labDOW = isWeekend ? 0.6 : isMonday ? 1.4 : 1.0;
    const citizenDOW = isWeekend ? 1.15 : 1.0; // Citizens report slightly more on weekends at home
    const pharmacyDOW = isWeekend ? 1.2 : 0.95;

    // Seasonal sinusoidal baseline (mild seasonal curve over 90 days)
    const seasonalFactor = 1.0 + 0.15 * Math.sin((2 * Math.PI * (day + 15)) / 180);

    for (const zone of ZONES) {
      const base = zoneBaselines[zone];

      // Default normal variations
      let clinicSuspected = Math.round(prng.poisson(base.clinic * seasonalFactor * clinicDOW));
      let clinicConfirmed = Math.round(clinicSuspected * (0.4 + prng.next() * 0.15));
      let clinicDelay = Math.round(prng.normal(48, 8)); // ~48 hours
      let clinicCompleteness = Math.min(1.0, Math.max(0.8, 0.95 + prng.normal(0, 0.03)));
      let clinicMissing = false;

      let pharmacySales = Math.round(prng.poisson(base.pharmacy * seasonalFactor * pharmacyDOW));
      const pharmacyBase = Math.round(base.pharmacy * seasonalFactor);
      let pharmacyDelay = Math.round(prng.normal(24, 4)); // ~24 hours
      let pharmacyMissing = false;

      let citizenReports = Math.round(prng.poisson(base.citizen * seasonalFactor * citizenDOW));
      let citizenDelay = Math.round(prng.normal(8, 2)); // ~8 hours (real-time app)
      let citizenMissing = false;

      let labTests = Math.round(prng.poisson(base.labTests * seasonalFactor * labDOW));
      let labPosRate = Math.max(0.01, base.labPosRate + prng.normal(0, 0.008));
      let labPositives = Math.round(labTests * labPosRate);
      let labDelay = Math.round(prng.normal(96, 12)); // ~96 hours (4 days)
      let labMissing = false;

      // -------------------------------------------------------------
      // INJECT CLUSTER 1: Zone B (Acute Respiratory Spike, Days 52-68)
      // Ground Truth starts on Day 52
      // Sequence: Citizen (d52) -> Pharmacy (d54) -> Clinic (d57) -> Lab (d61)
      // -------------------------------------------------------------
      if (zone === 'Zone B' && day >= 52 && day <= 68) {
        const clusterDay = day - 52; // 0 to 16

        // Citizen surge: fast ramp from Day 52 to Day 59, then slowly decreases
        if (clusterDay >= 0) {
          const citizenMultiplier = 1.0 + Math.min(3.2, clusterDay * 0.55);
          citizenReports = Math.round(citizenReports * citizenMultiplier);
        }

        // Pharmacy surge: starts Day 54 (+2 days after citizen symptom onset)
        if (clusterDay >= 2) {
          const pharmacyMultiplier = 1.0 + Math.min(2.5, (clusterDay - 2) * 0.45);
          pharmacySales = Math.round(pharmacySales * pharmacyMultiplier);
        }

        // Clinic surge: starts Day 57 (+5 days after citizen onset, doctor visits)
        if (clusterDay >= 5) {
          const clinicMultiplier = 1.0 + Math.min(3.4, (clusterDay - 5) * 0.5);
          clinicSuspected = Math.round(clinicSuspected * clinicMultiplier);
          clinicConfirmed = Math.round(clinicSuspected * 0.55);
        }

        // Lab confirmation: starts Day 61 (+9 days after citizen onset, specimen sequencing)
        if (clusterDay >= 9) {
          labPosRate = Math.min(0.28, base.labPosRate + (clusterDay - 9) * 0.035);
          labPositives = Math.round(labTests * labPosRate);
        }
      }

      // -------------------------------------------------------------
      // INJECT CLUSTER 2: Zone D (Sub-acute Community Cluster, Days 65-80)
      // Ground Truth starts on Day 65
      // Muted clinic signal due to clinic access barriers; strong citizen/pharmacy early
      // -------------------------------------------------------------
      if (zone === 'Zone D' && day >= 65 && day <= 80) {
        const clusterDay = day - 65; // 0 to 15

        // Strong citizen signal (Day 65)
        if (clusterDay >= 0) {
          const citizenMultiplier = 1.0 + Math.min(2.8, clusterDay * 0.5);
          citizenReports = Math.round(citizenReports * citizenMultiplier);
        }

        // Moderate pharmacy signal (Day 67)
        if (clusterDay >= 2) {
          const pharmacyMultiplier = 1.0 + Math.min(1.8, (clusterDay - 2) * 0.3);
          pharmacySales = Math.round(pharmacySales * pharmacyMultiplier);
        }

        // Weak/delayed clinic signal (Starts Day 72, smaller magnitude)
        if (clusterDay >= 7) {
          const clinicMultiplier = 1.0 + Math.min(1.7, (clusterDay - 7) * 0.2);
          clinicSuspected = Math.round(clinicSuspected * clinicMultiplier);
          clinicConfirmed = Math.round(clinicSuspected * 0.4);
        }

        // Lab confirmations arrive late (Day 74)
        if (clusterDay >= 9) {
          labPosRate = Math.min(0.22, base.labPosRate + (clusterDay - 9) * 0.025);
          labPositives = Math.round(labTests * labPosRate);
        }
      }

      // -------------------------------------------------------------
      // INJECT FAILURE CASES BASED ON ACTIVE SIMULATION SCENARIO
      // -------------------------------------------------------------
      if (scenario === 'MISSING_CLINIC' && zone === 'Zone B' && day >= 54 && day <= 58) {
        // Failure Case 1: Clinic feed drops out completely during early outbreak window
        clinicMissing = true;
        clinicSuspected = 0; // Notice: isMissing=true means downstream treats as null, not zero cases
        clinicConfirmed = 0;
        clinicCompleteness = 0.0;
        clinicDelay = 120;
      }

      if (scenario === 'STALE_LAB' && zone === 'Zone D' && day >= 70 && day <= 76) {
        // Failure Case 2: Lab feed suffers extreme latency (>144 hours, over 6 days delay)
        labDelay = 156;
      }

      if (scenario === 'CONFLICTING_SIGNALS' && zone === 'Zone C' && day >= 45 && day <= 48) {
        // Failure Case 3: Isolated clinic spike with NO community pharmacy or citizen corroboration
        clinicSuspected = Math.round(base.clinic * 3.8); // +280% spike
        clinicConfirmed = Math.round(clinicSuspected * 0.6);
        // Citizen and Pharmacy remain completely normal baseline
      }

      const pharmacyDev = pharmacyBase > 0 ? ((pharmacySales - pharmacyBase) / pharmacyBase) * 100 : 0;

      const clinicSignal: ClinicSignal = {
        date: dateStr,
        dayIndex: day,
        zone,
        suspectedCases: clinicMissing ? null : clinicSuspected,
        confirmedCases: clinicMissing ? null : clinicConfirmed,
        reportingDelayHours: clinicDelay,
        completeness: clinicCompleteness,
        isMissing: clinicMissing,
      };

      const pharmacySignal: PharmacySignal = {
        date: dateStr,
        dayIndex: day,
        zone,
        productCategory: 'Antipyretics',
        salesCount: pharmacyMissing ? null : pharmacySales,
        baselineSales: pharmacyBase,
        deviationPercentage: Number(pharmacyDev.toFixed(1)),
        reportingDelayHours: pharmacyDelay,
        isMissing: pharmacyMissing,
      };

      const citizenSignal: CitizenSignal = {
        date: dateStr,
        dayIndex: day,
        zone,
        symptomCategory: 'Respiratory',
        reportCount: citizenMissing ? null : citizenReports,
        uniqueReporters: citizenMissing ? 0 : Math.round(citizenReports * 0.85),
        reportingDelayHours: citizenDelay,
        isMissing: citizenMissing,
      };

      const laboratorySignal: LaboratorySignal = {
        date: dateStr,
        dayIndex: day,
        zone,
        testsConducted: labMissing ? null : labTests,
        positiveCases: labMissing ? null : labPositives,
        positivityRate: labMissing || labTests === 0 ? null : Number((labPositives / labTests).toFixed(4)),
        reportingDelayHours: labDelay,
        isMissing: labMissing,
      };

      allRecords.push({
        date: dateStr,
        dayIndex: day,
        zone,
        clinic: clinicSignal,
        pharmacy: pharmacySignal,
        citizen: citizenSignal,
        laboratory: laboratorySignal,
      });
    }
  }

  return allRecords;
}
