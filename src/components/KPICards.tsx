import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  Database,
  MapPin,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { FusionResult, SourceReliability, ZoneId } from '../types';

interface KPICardsProps {
  zoneResults: Record<ZoneId, FusionResult>;
  sourceReliabilities: Record<string, SourceReliability>;
  onSelectZone: (zone: ZoneId) => void;
  leadTimeAdvantage: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  zoneResults,
  sourceReliabilities,
  onSelectZone,
  leadTimeAdvantage,
}) => {
  const results = Object.values(zoneResults) as FusionResult[];

  const criticalCount = results.filter((r) => r.alertLevel === 'CRITICAL').length;
  const alertCount = results.filter((r) => r.alertLevel === 'ALERT').length;
  const watchCount = results.filter((r) => r.alertLevel === 'WATCH').length;
  const activeAlerts = criticalCount + alertCount;

  // Stale or missing count across sources
  const reliabilities = Object.values(sourceReliabilities) as SourceReliability[];
  const staleCount = reliabilities.filter((r) => r.freshness === 'STALE').length;
  const missingCount = reliabilities.filter((r) => r.freshness === 'MISSING').length;
  const feedsOnline = reliabilities.filter((r) => r.freshness !== 'MISSING').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Active Alerts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Active Warning Signals</span>
          <span
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              criticalCount > 0
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : alertCount > 0
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : watchCount > 0
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {criticalCount > 0 ? (
              <AlertOctagon className="w-4 h-4" />
            ) : alertCount > 0 ? (
              <ShieldAlert className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">{activeAlerts}</span>
          <span className="text-xs text-slate-400">
            {activeAlerts === 0 ? 'All zones in baseline' : `${activeAlerts} zones require review`}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
          <span className="text-rose-400 font-medium">{criticalCount} Critical</span>
          <span className="text-slate-600">•</span>
          <span className="text-orange-400 font-medium">{alertCount} Alert</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400 font-medium">{watchCount} Watch</span>
        </div>
      </div>

      {/* Monitored Districts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Municipal Health Districts</span>
          <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">5</span>
          <span className="text-xs text-slate-400">Active Surveillance Zones</span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
          {(['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'] as ZoneId[]).map((z) => {
            const level = zoneResults[z]?.alertLevel || 'NORMAL';
            const color =
              level === 'CRITICAL'
                ? 'bg-rose-500'
                : level === 'ALERT'
                ? 'bg-orange-500'
                : level === 'WATCH'
                ? 'bg-amber-500'
                : 'bg-emerald-500';
            return (
              <button
                key={z}
                onClick={() => onSelectZone(z)}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700/60 transition-colors"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
                <span className="text-[10px] font-mono">{z.replace('Zone ', '')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed Health & Freshness */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Surveillance Feeds Health</span>
          <span
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              missingCount > 0
                ? 'bg-slate-700 text-slate-300 border border-slate-600'
                : staleCount > 0
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            <Database className="w-4 h-4" />
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">{feedsOnline}/4</span>
          <span className="text-xs text-slate-400">Streams Online</span>
        </div>

        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
          {missingCount > 0 ? (
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
              {missingCount} Feed Missing (Not 0 cases)
            </span>
          ) : staleCount > 0 ? (
            <span className="text-rose-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {staleCount} Feed Stale (&gt; SLA)
            </span>
          ) : (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              All 4 Feeds within SLAs
            </span>
          )}
        </div>
      </div>

      {/* Lead-Time Performance Advantage */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Early Warning Lead-Time</span>
          <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-teal-400">
            +{leadTimeAdvantage > 0 ? leadTimeAdvantage : 5}d
          </span>
          <span className="text-xs text-slate-400">Earlier vs Clinic Baseline</span>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 truncate">
          Syndromic citizen & OTC sales precede clinical confirmation
        </div>
      </div>
    </div>
  );
};
