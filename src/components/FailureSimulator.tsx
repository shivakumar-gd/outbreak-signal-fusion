import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  Database,
  FlaskConical,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { FailureScenarioType, JourneyScenarioType } from '../types';

interface FailureSimulatorProps {
  scenario: FailureScenarioType;
  onSelectScenario: (sc: FailureScenarioType) => void;
  onSelectJourney: (jn: JourneyScenarioType) => void;
}

export const FailureSimulator: React.FC<FailureSimulatorProps> = ({
  scenario,
  onSelectScenario,
  onSelectJourney,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-teal-400" />
            <span>Failure & Resiliency Test Harness (3 Mandatory Test Cases)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Verify system resilience against real-world data pipeline degradation and conflicting signals
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Failure Case 1 */}
        <div
          className={`p-3 rounded-lg border transition-all text-xs flex flex-col justify-between ${
            scenario === 'MISSING_CLINIC'
              ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/40'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>Test 1: Missing Data Feed</span>
              </span>
              <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-800 text-slate-300 font-mono">
                Zone B
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Scenario:</strong> Clinic transmission network fails (Days 54–58).
              <br />
              <strong>Expected Behavior:</strong> Never coerced to 0 cases. Marked <code>⚪ MISSING</code>.
              Effective clinic weight drops to 0; weights redistributed to Pharmacy and Citizen streams. Confidence score penalized.
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => onSelectScenario(scenario === 'MISSING_CLINIC' ? 'STANDARD' : 'MISSING_CLINIC')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                scenario === 'MISSING_CLINIC'
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {scenario === 'MISSING_CLINIC' ? 'Active (Revert)' : 'Simulate Missing Feed'}
            </button>
          </div>
        </div>

        {/* Failure Case 2 */}
        <div
          className={`p-3 rounded-lg border transition-all text-xs flex flex-col justify-between ${
            scenario === 'STALE_LAB'
              ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/40'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Test 2: Stale Data Feed</span>
              </span>
              <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-800 text-slate-300 font-mono">
                Zone D
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Scenario:</strong> Laboratory culture batches delayed &gt;144 hours (SLA: 96h).
              <br />
              <strong>Expected Behavior:</strong> Marked <code>🔴 STALE</code>. Freshness penalty factor (0.35x)
              applied to lab anomaly weight. Warns analyst that gold-standard confirmation is lagging.
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => onSelectScenario(scenario === 'STALE_LAB' ? 'STANDARD' : 'STALE_LAB')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                scenario === 'STALE_LAB'
                  ? 'bg-rose-500 text-white font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {scenario === 'STALE_LAB' ? 'Active (Revert)' : 'Simulate Stale Feed'}
            </button>
          </div>
        </div>

        {/* Failure Case 3 */}
        <div
          className={`p-3 rounded-lg border transition-all text-xs flex flex-col justify-between ${
            scenario === 'CONFLICTING_SIGNALS'
              ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500/40'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-purple-400" />
                <span>Test 3: Conflicting Signals</span>
              </span>
              <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-800 text-slate-300 font-mono">
                Zone C
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Scenario:</strong> Single clinic reports an anomalous spike (+280%), while citizen and pharmacy remain flat.
              <br />
              <strong>Expected Behavior:</strong> Baseline trips false alarm ($Z \ge 3.5\sigma$). Fusion refuses to declare
              Critical outbreak, caps score at Watch (0.58), flags conflict, and requests human review.
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => onSelectScenario(scenario === 'CONFLICTING_SIGNALS' ? 'STANDARD' : 'CONFLICTING_SIGNALS')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                scenario === 'CONFLICTING_SIGNALS'
                  ? 'bg-purple-500 text-white font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {scenario === 'CONFLICTING_SIGNALS' ? 'Active (Revert)' : 'Simulate Conflict'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
