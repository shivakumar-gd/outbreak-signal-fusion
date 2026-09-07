import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ExternalLink,
  Info,
  Pill,
  ShieldAlert,
  TestTube2,
  Users,
} from 'lucide-react';
import { AlertLevel, FusionResult, SourceType, ZoneId, ZONES } from '../types';

interface ZoneMapGridProps {
  selectedZone: ZoneId;
  onSelectZone: (zone: ZoneId) => void;
  zoneResults: Record<ZoneId, FusionResult>;
}

const DRIVER_ICONS: Record<SourceType, React.ReactNode> = {
  citizen: <Users className="w-3.5 h-3.5 text-sky-400" />,
  pharmacy: <Pill className="w-3.5 h-3.5 text-emerald-400" />,
  clinic: <Building2 className="w-3.5 h-3.5 text-amber-400" />,
  laboratory: <TestTube2 className="w-3.5 h-3.5 text-purple-400" />,
};

const ALERT_CONFIG: Record<
  AlertLevel,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  NORMAL: {
    label: 'Normal Baseline',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    border: 'border-emerald-800/50',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  },
  WATCH: {
    label: 'Watch Required',
    bg: 'bg-amber-950/40',
    text: 'text-amber-400',
    border: 'border-amber-700/60',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  },
  ALERT: {
    label: 'Escalated Alert',
    bg: 'bg-orange-950/40',
    text: 'text-orange-400',
    border: 'border-orange-600/70',
    icon: <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />,
  },
  CRITICAL: {
    label: 'Critical Surge',
    bg: 'bg-rose-950/50',
    text: 'text-rose-400',
    border: 'border-rose-500/80',
    icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />,
  },
};

export const ZoneMapGrid: React.FC<ZoneMapGridProps> = ({
  selectedZone,
  onSelectZone,
  zoneResults,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Geographic Surveillance Districts</span>
            <span className="text-[11px] font-normal text-slate-400">
              (Click zone to investigate signals & evidence)
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Watch
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> Alert
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {ZONES.map((zone) => {
          const res = zoneResults[zone];
          if (!res) return null;
          const isSelected = selectedZone === zone;
          const alertConfig = ALERT_CONFIG[res.alertLevel];

          return (
            <button
              key={zone}
              onClick={() => onSelectZone(zone)}
              className={`text-left p-3 rounded-lg border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/95 border-teal-400 ring-2 ring-teal-500/30 shadow-md'
                  : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-white">{zone}</span>
                  <div className="flex items-center gap-1">
                    {res.hasConflict && (
                      <span
                        className="px-1 py-0.5 text-[9px] bg-amber-900/60 text-amber-300 rounded border border-amber-700/60"
                        title="Conflict: Uncorroborated single-stream spike"
                      >
                        Conflict
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-medium rounded flex items-center gap-1 border ${alertConfig.bg} ${alertConfig.text} ${alertConfig.border}`}
                    >
                      {alertConfig.icon}
                      <span>{res.alertLevel}</span>
                    </span>
                  </div>
                </div>

                {/* Score meters */}
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Fusion Score:</span>
                    <span className="font-mono font-bold text-white">
                      {(res.fusionScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        res.alertLevel === 'CRITICAL'
                          ? 'bg-rose-500'
                          : res.alertLevel === 'ALERT'
                          ? 'bg-orange-500'
                          : res.alertLevel === 'WATCH'
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, res.fusionScore * 100))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Baseline Clinic Z:</span>
                    <span
                      className={`font-mono font-medium ${
                        res.baselineTriggered ? 'text-rose-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      {res.baselineZScore >= 0 ? '+' : ''}
                      {res.baselineZScore.toFixed(1)}σ
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer info: primary driver & feed freshness */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-slate-300" title="Primary contributing source">
                  {DRIVER_ICONS[res.primaryDriver]}
                  <span className="capitalize">{res.primaryDriver}</span>
                </div>

                {/* 4 source freshness dots: clinic, pharmacy, citizen, lab */}
                <div className="flex items-center gap-1" title="Feed Freshness (Clinic, Pharmacy, Citizen, Lab)">
                  {(['clinic', 'pharmacy', 'citizen', 'laboratory'] as SourceType[]).map((s) => {
                    const an = res.sourceAnomalies?.[s];
                    const freshness = an?.freshness ?? 'FRESH';
                    const dotColor =
                      freshness === 'FRESH'
                        ? 'bg-emerald-400'
                        : freshness === 'AGING'
                        ? 'bg-amber-400'
                        : freshness === 'STALE'
                        ? 'bg-rose-500'
                        : 'bg-slate-400';
                    return <span key={s} className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />;
                  })}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
