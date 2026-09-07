import React from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  HelpCircle,
  Pill,
  ShieldCheck,
  TestTube2,
  Users,
} from 'lucide-react';
import { FreshnessState, SourceReliability, SourceType } from '../types';

interface SourceReliabilityPanelProps {
  reliabilities: Record<SourceType, SourceReliability>;
}

const SOURCE_ICONS: Record<SourceType, React.ReactNode> = {
  citizen: <Users className="w-4 h-4 text-sky-400" />,
  pharmacy: <Pill className="w-4 h-4 text-emerald-400" />,
  clinic: <Building2 className="w-4 h-4 text-amber-400" />,
  laboratory: <TestTube2 className="w-4 h-4 text-purple-400" />,
};

const FRESHNESS_BADGES: Record<
  FreshnessState,
  { label: string; bg: string; text: string; dot: string }
> = {
  FRESH: {
    label: '🟢 Fresh',
    bg: 'bg-emerald-950/40 border-emerald-800/50',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
  },
  AGING: {
    label: '🟡 Aging',
    bg: 'bg-amber-950/40 border-amber-800/50',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
  },
  STALE: {
    label: '🔴 Stale (> SLA)',
    bg: 'bg-rose-950/50 border-rose-800/60',
    text: 'text-rose-300',
    dot: 'bg-rose-500',
  },
  MISSING: {
    label: '⚪ Missing',
    bg: 'bg-slate-800 border-slate-700',
    text: 'text-slate-300',
    dot: 'bg-slate-400',
  },
};

export const SourceReliabilityPanel: React.FC<SourceReliabilityPanelProps> = ({
  reliabilities,
}) => {
  const sources: SourceType[] = ['clinic', 'pharmacy', 'citizen', 'laboratory'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Source Reliability & Freshness Audit</span>
          </h3>
          <p className="text-xs text-slate-400">
            Deconstructed 4-factor scoring: Completeness (30%), Timeliness (30%), Quality (20%), Agreement (20%)
          </p>
        </div>

        {/* Explainable Formula Pill */}
        <div className="text-[11px] font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
          R = 0.3·C + 0.3·T + 0.2·Q + 0.2·A
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {sources.map((source) => {
          const rel = reliabilities[source];
          const badge = FRESHNESS_BADGES[rel.freshness];

          return (
            <div
              key={source}
              className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between"
            >
              <div>
                {/* Source Title & Freshness */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {SOURCE_ICONS[source]}
                    <span className="font-semibold text-xs text-white capitalize">
                      {source}
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${badge.bg} ${badge.text}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Score Big Display */}
                <div className="flex items-baseline justify-between mb-2.5">
                  <span className="text-[11px] text-slate-400">Reliability Score</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {(rel.score * 100).toFixed(0)}%
                  </span>
                </div>

                {/* 4 Factor Breakdown Bars */}
                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-400">
                      <span>Completeness (30%):</span>
                      <span className="text-slate-200 font-mono">
                        {(rel.components.completeness * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                      <div
                        className="bg-teal-400 h-full"
                        style={{ width: `${rel.components.completeness * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400">
                      <span>Timeliness (30%):</span>
                      <span className="text-slate-200 font-mono">
                        {(rel.components.timeliness * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                      <div
                        className="bg-emerald-400 h-full"
                        style={{ width: `${rel.components.timeliness * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400">
                      <span>Data Quality (20%):</span>
                      <span className="text-slate-200 font-mono">
                        {(rel.components.quality * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                      <div
                        className="bg-sky-400 h-full"
                        style={{ width: `${rel.components.quality * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400">
                      <span>Peer Agreement (20%):</span>
                      <span className="text-slate-200 font-mono">
                        {(rel.components.agreement * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                      <div
                        className="bg-purple-400 h-full"
                        style={{ width: `${rel.components.agreement * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Latency Footnote */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  Avg Lag: <strong className="text-slate-300">{rel.averageDelayHours}h</strong>
                </span>
                <span>SLA: {rel.expectedDelayHours}h</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
