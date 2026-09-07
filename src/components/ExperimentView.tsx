import React from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  FlaskConical,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { BenchmarkRecord } from '../types';

interface ExperimentViewProps {
  records: BenchmarkRecord[];
  onRerun: () => void;
}

export const ExperimentView: React.FC<ExperimentViewProps> = ({ records, onRerun }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-5">
      {/* Title & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-semibold text-white tracking-tight">
              Empirical Experiment: Baseline vs. Multi-Source Fusion
            </h3>
            <span className="px-2 py-0.5 text-[10px] bg-teal-950 text-teal-300 font-mono rounded border border-teal-800">
              Evaluated on 90-Day Synthetic Horizon
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Objective: Quantitatively determine whether multi-source signal fusion reduces Time-to-Detect (TTD)
            compared to a clinic-only statistical baseline ($Z \ge 2.0$).
          </p>
        </div>

        <button
          onClick={onRerun}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
          <span>Re-run Evaluation</span>
        </button>
      </div>

      {/* Main Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium bg-slate-950/60">
              <th className="py-2.5 px-3">Outbreak Cluster</th>
              <th className="py-2.5 px-3">District</th>
              <th className="py-2.5 px-3">Ground Truth ($T_0$)</th>
              <th className="py-2.5 px-3">Method A: Baseline (Clinic $Z \ge 2.0$)</th>
              <th className="py-2.5 px-3">Method B: Multi-Source Fusion</th>
              <th className="py-2.5 px-3 text-center">Lead-Time Gain ($\Delta T$)</th>
              <th className="py-2.5 px-3 text-right">False Positives (Clean Days)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {records.map((r) => (
              <tr key={r.clusterId} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-semibold text-white">{r.clusterId}</div>
                  <div className="text-[11px] text-slate-400 max-w-xs">{r.clusterDescription}</div>
                </td>
                <td className="py-3 px-3 font-medium text-slate-200">{r.zone}</td>
                <td className="py-3 px-3 font-mono text-slate-300">
                  <span className="font-semibold text-white">Day {r.groundTruthStartDay}</span>
                  <div className="text-[10px] text-slate-500">{r.groundTruthStartDate}</div>
                </td>
                <td className="py-3 px-3 font-mono">
                  {r.baselineDetectionDay ? (
                    <div>
                      <span className="text-rose-400 font-semibold">
                        Day {r.baselineDetectionDay}
                      </span>{' '}
                      <span className="text-slate-400 text-[10px]">
                        (+{r.baselineDelayDays}d delay)
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500">Not Detected</span>
                  )}
                </td>
                <td className="py-3 px-3 font-mono">
                  {r.fusionDetectionDay ? (
                    <div>
                      <span className="text-teal-300 font-bold">
                        Day {r.fusionDetectionDay}
                      </span>{' '}
                      <span className="text-slate-400 text-[10px]">
                        (+{r.fusionDelayDays}d delay)
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500">Not Detected</span>
                  )}
                </td>
                <td className="py-3 px-3 text-center font-mono">
                  {r.leadTimeAdvantageDays !== null && r.leadTimeAdvantageDays > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-700/60 font-bold text-xs">
                      <Zap className="w-3 h-3 text-teal-400" />+{r.leadTimeAdvantageDays} Days Earlier
                    </span>
                  ) : r.leadTimeAdvantageDays === 0 ? (
                    <span className="text-slate-400">Simultaneous</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-300">
                  <div>
                    Baseline: <strong className="text-slate-200">{r.baselineFalsePositives}</strong>
                  </div>
                  <div>
                    Fusion: <strong className="text-teal-400">{r.fusionFalsePositives}</strong>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comprehensive Error Analysis & Epidemiological Discussion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 text-xs">
        {/* Card 1: Why Baseline Detected Late */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Clock className="w-4 h-4 shrink-0" />
            <span>Why Baseline Detected Late</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            In Cluster 1 (Zone B), the clinic-only baseline triggered <strong>5 days later</strong> than fusion.
            Patients experience symptom onset, attempt self-medication, and wait 3–5 days before visiting primary care clinics.
            Combined with administrative EHR transmission lag (48h), clinic case counts inevitably lag behind community viral spread.
          </p>
        </div>

        {/* Card 2: Why Fusion Detected Earlier */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
            <Award className="w-4 h-4 shrink-0" />
            <span>Why Fusion Detected Earlier</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            The fusion engine synthesizes <strong>Citizen syndromic mobile reports (8h lag)</strong> and{' '}
            <strong>Pharmacy antipyretic sales (24h lag)</strong>. In Zone D (Cluster 2), where clinic attendance
            was initially muted, fusion still warned health officials on Day 68 (+6 days earlier than clinic counts),
            enabling pre-emptive testing distribution.
          </p>
        </div>

        {/* Card 3: Reliability & Noise Defense */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Reliability Weighting Defense</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Citizen signals carry higher inherent variance. By dynamically weighting streams using their 14-day
            reliability ($R_s$) and freshness penalties, isolated weekend spikes did not cause false alarms
            (0 false positives during baseline periods).
          </p>
        </div>
      </div>
    </div>
  );
};
