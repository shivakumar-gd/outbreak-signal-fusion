import React from 'react';
import {
  Activity,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  FlaskConical,
  Play,
  RotateCcw,
  Shield,
  UserCheck,
} from 'lucide-react';
import { FailureScenarioType, JourneyScenarioType } from '../types';

interface HeaderProps {
  currentDay: number;
  currentDate: string;
  onDayChange: (day: number) => void;
  scenario: FailureScenarioType;
  onScenarioChange: (scenario: FailureScenarioType) => void;
  journey: JourneyScenarioType;
  onJourneySelect: (journey: JourneyScenarioType) => void;
  onOpenDocs: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDay,
  currentDate,
  onDayChange,
  scenario,
  onScenarioChange,
  journey,
  onJourneySelect,
  onOpenDocs,
  isPlaying,
  onTogglePlay,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-white">
                City Health Department
              </h1>
              <span className="px-2 py-0.5 text-xs font-medium bg-teal-900/60 text-teal-300 rounded border border-teal-700/50">
                Seasonal Outbreak Surveillance
              </span>
              <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-slate-800 text-slate-400 rounded">
                Phase 1 Prototype
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-Source Infectious Disease Signal Fusion & Early Warning System
            </p>
          </div>
        </div>

        {/* Role & Docs */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 rounded-md border border-slate-700 text-xs text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Role: <strong className="text-white font-medium">Health Analyst</strong></span>
          </div>

          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-md transition-colors"
            title="Open architecture, data dictionary & system documentation"
          >
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>Documentation</span>
          </button>
        </div>
      </div>

      {/* Control & Timeline Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Timeline Scrubber */}
        <div className="flex items-center gap-3 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700">
          <div className="flex items-center gap-1 text-xs text-slate-300 font-mono">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-semibold text-white">{currentDate}</span>
            <span className="text-slate-500">|</span>
            <span>Day {currentDay}/90</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onDayChange(Math.max(1, currentDay - 1))}
              disabled={currentDay <= 1}
              className="p-1 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-slate-300 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className={`p-1 rounded transition-colors ${
                isPlaying ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-slate-700 text-slate-300'
              }`}
              title={isPlaying ? 'Pause Simulation' : 'Auto Play Simulation'}
            >
              {isPlaying ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onDayChange(Math.min(90, currentDay + 1))}
              disabled={currentDay >= 90}
              className="p-1 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-slate-300 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <input
            type="range"
            min="1"
            max="90"
            value={currentDay}
            onChange={(e) => onDayChange(parseInt(e.target.value, 10))}
            className="w-28 sm:w-44 accent-teal-400 cursor-pointer"
          />
        </div>

        {/* Failure Scenarios & Fast Walkthroughs */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Simulation Mode Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
            <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Simulation:</span>
            <select
              value={scenario}
              onChange={(e) => onScenarioChange(e.target.value as FailureScenarioType)}
              className="bg-transparent text-white font-medium outline-none cursor-pointer text-xs"
            >
              <option value="STANDARD" className="bg-slate-800 text-white">Standard Outbreak Clusters</option>
              <option value="MISSING_CLINIC" className="bg-slate-800 text-amber-300">Failure 1: Missing Clinic Feed</option>
              <option value="STALE_LAB" className="bg-slate-800 text-amber-300">Failure 2: Stale Lab Feed (&gt;144h)</option>
              <option value="CONFLICTING_SIGNALS" className="bg-slate-800 text-amber-300">Failure 3: Conflicting Spike</option>
            </select>
          </div>

          {/* Preset Demonstrations */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-md border border-slate-700">
            <span className="px-2 text-slate-400">Walkthrough:</span>
            <button
              onClick={() => onJourneySelect('JOURNEY_A')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                journey === 'JOURNEY_A'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-medium'
                  : 'hover:bg-slate-700 text-slate-300'
              }`}
              title="Journey A: Acute outbreak in Zone B (Day 54)"
            >
              Journey A (Zone B Surge)
            </button>
            <button
              onClick={() => onJourneySelect('JOURNEY_B')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                journey === 'JOURNEY_B'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                  : 'hover:bg-slate-700 text-slate-300'
              }`}
              title="Journey B: Low urgency watch in Zone D (Day 68)"
            >
              Journey B (Zone D Watch)
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
