import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileCheck,
  Info,
  Pill,
  ShieldAlert,
  TestTube2,
  Users,
  UserCheck,
} from 'lucide-react';
import { FusionResult, HumanReviewRecord, SourceType, ZoneDailySignals } from '../types';

interface AlertEvidenceDrawerProps {
  fusionResult: FusionResult;
  currentDayRecord: ZoneDailySignals;
  humanReview?: HumanReviewRecord;
  onOpenReviewModal: () => void;
}

const SOURCE_ICONS: Record<SourceType, React.ReactNode> = {
  citizen: <Users className="w-4 h-4 text-sky-400" />,
  pharmacy: <Pill className="w-4 h-4 text-emerald-400" />,
  clinic: <Building2 className="w-4 h-4 text-amber-400" />,
  laboratory: <TestTube2 className="w-4 h-4 text-purple-400" />,
};

export const AlertEvidenceDrawer: React.FC<AlertEvidenceDrawerProps> = ({
  fusionResult,
  currentDayRecord,
  humanReview,
  onOpenReviewModal,
}) => {
  const sources: SourceType[] = ['citizen', 'pharmacy', 'clinic', 'laboratory'];
  const res = fusionResult;

  const reviewStatusColors = {
    PENDING_REVIEW: 'bg-amber-950/60 text-amber-300 border-amber-800',
    UNDER_INVESTIGATION: 'bg-sky-950/60 text-sky-300 border-sky-800',
    ESCALATED: 'bg-rose-950/60 text-rose-300 border-rose-800',
    DISMISSED: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      {/* Evidence Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Alert Evidence & Attribution — {res.zone}
            </h3>
            <span className="text-xs text-slate-400">
              (Day {res.dayIndex} • {res.date})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent breakdown of why this fusion score was generated and which feeds contributed
          </p>
        </div>

        {/* Human Review Status Badge & Trigger */}
        <div className="flex items-center gap-2">
          {humanReview && (
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded border ${
                reviewStatusColors[humanReview.status]
              }`}
            >
              {humanReview.status.replace('_', ' ')}
            </span>
          )}

          <button
            onClick={onOpenReviewModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium rounded-md shadow transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{humanReview ? 'Update Review' : 'Perform Human Review'}</span>
          </button>
        </div>
      </div>

      {/* Primary Alert Summary Banner */}
      <div className="mt-3.5 bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
        <div className="mt-0.5">
          {res.alertLevel === 'CRITICAL' ? (
            <AlertOctagon className="w-5 h-5 text-rose-400" />
          ) : res.alertLevel === 'ALERT' ? (
            <ShieldAlert className="w-5 h-5 text-orange-400" />
          ) : res.alertLevel === 'WATCH' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-white">
              Status: {res.alertLevel} (Score: {(res.fusionScore * 100).toFixed(0)}% • Confidence:{' '}
              {(res.confidenceScore * 100).toFixed(0)}%)
            </span>
            <span className="text-[11px] text-slate-400">
              Clinic Baseline Z: {res.baselineZScore >= 0 ? '+' : ''}
              {res.baselineZScore.toFixed(1)}σ ({res.baselineTriggered ? 'Triggered' : 'Normal'})
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">{res.evidenceSummary}</p>
        </div>
      </div>

      {/* Detailed Signal Contributions Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium">
              <th className="py-2 px-2">Surveillance Source</th>
              <th className="py-2 px-2">Current Value</th>
              <th className="py-2 px-2">14d Baseline</th>
              <th className="py-2 px-2">Z-Score Deviation</th>
              <th className="py-2 px-2">Normalized Index ($A_s$)</th>
              <th className="py-2 px-2">Effective Weight ($W_s$)</th>
              <th className="py-2 px-2 text-right">Weighted Contribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sources.map((s) => {
              const an = res.sourceAnomalies?.[s];
              if (!an) return null;
              const isDriver = res.primaryDriver === s;

              let rawDisplay = '—';
              if (an.isMissing) {
                rawDisplay = 'MISSING';
              } else if (s === 'laboratory') {
                rawDisplay = `${((an.rawValue ?? 0) * 100).toFixed(1)}% Positivity`;
              } else if (s === 'pharmacy') {
                rawDisplay = `${an.rawValue} Units`;
              } else if (s === 'citizen') {
                rawDisplay = `${an.rawValue} Reports`;
              } else {
                rawDisplay = `${an.rawValue} Suspected`;
              }

              return (
                <tr
                  key={s}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isDriver ? 'bg-teal-950/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-2 flex items-center gap-2">
                    {SOURCE_ICONS[s]}
                    <span className="capitalize font-medium text-white">{s}</span>
                    {isDriver && (
                      <span className="px-1 py-0.5 text-[9px] bg-teal-900 text-teal-300 rounded">
                        Driver
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 font-mono text-slate-200">
                    <span
                      className={
                        an.isMissing
                          ? 'text-rose-400 font-bold'
                          : isDriver
                          ? 'text-teal-300 font-semibold'
                          : ''
                      }
                    >
                      {rawDisplay}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-mono text-slate-400">
                    {s === 'laboratory'
                      ? `${(an.baselineMean * 100).toFixed(1)}% (±${(an.baselineStdDev * 100).toFixed(1)}%)`
                      : `${an.baselineMean} (±${an.baselineStdDev})`}
                  </td>
                  <td className="py-2.5 px-2 font-mono">
                    <span
                      className={`font-semibold ${
                        an.zScore >= 2.5
                          ? 'text-rose-400'
                          : an.zScore >= 1.5
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {an.zScore >= 0 ? '+' : ''}
                      {an.zScore.toFixed(1)}σ
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-mono text-slate-300">
                    {an.normalizedAnomaly.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2 font-mono text-slate-300">
                    {(an.weight * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold text-white">
                    {an.weightedContribution.toFixed(3)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Ethical & Public Health Governance Notice */}
      <div className="mt-4 p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg flex items-start gap-2.5 text-xs text-amber-300/90">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300">Surveillance Governance Rule:</strong> AI and automated
          anomaly fusion algorithms produce <em>statistical decision-support signals only</em>. An
          alert is NOT a confirmed clinical diagnosis or official outbreak declaration. Mandatory
          human review by a designated health analyst is strictly required before issuing municipal
          health advisories or allocating clinical interventions.
        </div>
      </div>
    </div>
  );
};
